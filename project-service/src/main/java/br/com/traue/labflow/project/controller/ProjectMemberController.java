package br.com.traue.labflow.project.controller;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
@Tag(name = "Project Members", description = "Manage project membership")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class ProjectMemberController {

    private final ProjectMemberService memberService;

    @GetMapping
    @Operation(summary = "List members of a project")
    public ResponseEntity<List<ProjectMemberResponse>> findByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(memberService.findByProjectId(projectId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Add member to project (PROF/TA/ADMIN)")
    public ResponseEntity<ProjectMemberResponse> addMember(@PathVariable @NonNull Long projectId,
                                                            @Valid @RequestBody @NonNull ProjectMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.addMember(projectId, request));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Remove member from project (PROF/TA/ADMIN)")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId,
                                              @PathVariable Long userId) {
        memberService.removeMemberByProjectAndUser(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}
