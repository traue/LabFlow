package br.com.traue.labflow.auth.controller;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.service.AuthService;
import br.com.traue.labflow.auth.service.ProfileService;
import br.com.traue.labflow.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User and profile management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final ProfileService profileService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "List all users (ADMIN only)")
    public ResponseEntity<List<UserResponse>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/batch")
    @Operation(summary = "Get users by list of IDs (any authenticated user)")
    public ResponseEntity<List<UserResponse>> findByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.findByIds(ids));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == authentication.principal")
    public ResponseEntity<UserResponse> findById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}/profile")
    @Operation(summary = "Update user profile")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == authentication.principal")
    public ResponseEntity<ProfileResponse> updateProfile(@PathVariable @NonNull Long id,
                                                          @Valid @RequestBody @NonNull ProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(id, request));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Update user role (ADMIN only)")
    public ResponseEntity<UserResponse> updateRole(@PathVariable @NonNull Long id,
                                                    @Valid @RequestBody @NonNull RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateRole(id, Objects.requireNonNull(request.getRole())));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_PROF','ROLE_TA')")
    @Operation(summary = "Search users by username, email or name")
    public ResponseEntity<List<UserResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(userService.search(q));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create a user (ADMIN only)")
    public ResponseEntity<RegisterResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Batch import users from CSV data (ADMIN only)")
    public ResponseEntity<List<ImportUserResult>> importUsers(@RequestBody List<RegisterRequest> requests) {
        return ResponseEntity.ok(userService.importUsers(requests));
    }
}
