package br.com.traue.labflow.auth.controller;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "Profiles", description = "User profile management")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ProfileResponse> myProfile(Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get profile by user ID")
    public ResponseEntity<ProfileResponse> getByUserId(@PathVariable @NonNull Long userId) {
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ProfileResponse> update(Authentication authentication,
                                                   @RequestBody @NonNull ProfileRequest request) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }
}
