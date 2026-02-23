package br.com.traue.labflow.project.controller;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/my")
    @Operation(summary = "Get projects where the authenticated user is a member")
    public ResponseEntity<List<ProjectResponse>> findMyProjects(
            org.springframework.security.core.Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.ok(projectService.findByMemberUserId(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> findById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Update a project (creator or ADMIN)")
    public ResponseEntity<ProjectResponse> update(@PathVariable @NonNull Long id,
                                                    @Valid @RequestBody @NonNull ProjectRequest request,
                                                    Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return ResponseEntity.ok(projectService.update(id, request, userId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Delete a project (creator or ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id, Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        projectService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
