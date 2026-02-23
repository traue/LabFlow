package br.com.traue.labflow.project.controller;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.service.CourseService;
import br.com.traue.labflow.project.service.ProjectService;
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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course and project management")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;
    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List courses (optional filters: term, code)")
    public ResponseEntity<List<CourseResponse>> findAll(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String code) {
        return ResponseEntity.ok(courseService.findAll(term, code));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public ResponseEntity<CourseResponse> findById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROF','ADMIN')")
    @Operation(summary = "Create a course (PROF/ADMIN)")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody @NonNull CourseRequest request,
                                                  Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','ADMIN')")
    @Operation(summary = "Update a course (creator or ADMIN)")
    public ResponseEntity<CourseResponse> update(@PathVariable @NonNull Long id,
                                                  @Valid @RequestBody @NonNull CourseRequest request,
                                                  Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return ResponseEntity.ok(courseService.update(id, request, userId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROF','ADMIN')")
    @Operation(summary = "Delete a course (creator or ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id, Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        courseService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/projects")
    @Operation(summary = "List projects of a course")
    public ResponseEntity<List<ProjectResponse>> findProjectsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(projectService.findByCourseId(courseId));
    }

    @PostMapping("/{courseId}/projects")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Create a project in a course (PROF/TA/ADMIN)")
    public ResponseEntity<ProjectResponse> createProject(@PathVariable @NonNull Long courseId,
                                                          @Valid @RequestBody @NonNull ProjectRequest request,
                                                          Authentication authentication) {
        Long userId = Objects.requireNonNull((Long) authentication.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createInCourse(courseId, request, userId));
    }
}
