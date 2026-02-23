package br.com.traue.labflow.project.controller;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final br.com.traue.labflow.project.service.ProjectMemberService memberService;

    @GetMapping("/my")
    @Operation(summary = "Get projects where the authenticated user is a member")
    public ResponseEntity<List<ProjectResponse>> findMyProjects(
            org.springframework.security.core.Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(projectService.findByMemberUserId(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Update a project (PROF/TA/ADMIN)")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','ADMIN')")
    @Operation(summary = "Delete a project (PROF/ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
