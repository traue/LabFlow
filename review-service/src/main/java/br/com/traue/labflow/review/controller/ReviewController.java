package br.com.traue.labflow.review.controller;

import br.com.traue.labflow.review.dto.*;
import br.com.traue.labflow.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Submission reviews and grading")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/submissions/{submissionId}/reviews")
    @Operation(summary = "List reviews for a submission")
    public ResponseEntity<List<ReviewResponse>> findBySubmission(@PathVariable Long submissionId) {
        return ResponseEntity.ok(reviewService.findBySubmissionId(submissionId));
    }

    @GetMapping("/api/reviews/{id}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ReviewResponse> findById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(reviewService.findById(id));
    }

    @PostMapping("/api/reviews")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Create a review (PROF/TA/ADMIN)")
    public ResponseEntity<ReviewResponse> create(Authentication authentication,
                                                  @Valid @RequestBody @NonNull ReviewRequest request) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(userId, request));
    }

    @PutMapping("/api/reviews/{id}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Update a review (author or ADMIN)")
    public ResponseEntity<ReviewResponse> update(@PathVariable @NonNull Long id,
                                                  @Valid @RequestBody @NonNull ReviewRequest request,
                                                  Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return ResponseEntity.ok(reviewService.update(id, request, userId, isAdmin));
    }

    @DeleteMapping("/api/reviews/{id}")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Delete a review (author or ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id, Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        reviewService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
