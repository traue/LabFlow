package br.com.traue.labflow.project.controller;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Project submissions")
@SecurityRequirement(name = "bearerAuth")
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/api/projects/{projectId}/submissions")
    @Operation(summary = "List submissions for a project")
    public ResponseEntity<List<SubmissionResponse>> findByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(submissionService.findByProjectId(projectId));
    }

    @PostMapping("/api/projects/{projectId}/submissions")
    @Operation(summary = "Create a submission")
    public ResponseEntity<SubmissionResponse> create(@PathVariable @NonNull Long projectId,
                                                      Authentication authentication,
                                                      @Valid @RequestBody @NonNull SubmissionRequest request) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionService.create(projectId, userId, request));
    }
}
