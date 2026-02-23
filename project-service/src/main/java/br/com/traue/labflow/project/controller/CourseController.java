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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<CourseResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROF','ADMIN')")
    @Operation(summary = "Create a course (PROF/ADMIN)")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request));
    }

    @GetMapping("/{courseId}/projects")
    @Operation(summary = "List projects of a course")
    public ResponseEntity<List<ProjectResponse>> findProjectsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(projectService.findByCourseId(courseId));
    }

    @PostMapping("/{courseId}/projects")
    @PreAuthorize("hasAnyRole('PROF','TA','ADMIN')")
    @Operation(summary = "Create a project in a course (PROF/TA/ADMIN)")
    public ResponseEntity<ProjectResponse> createProject(@PathVariable Long courseId,
                                                          @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createInCourse(courseId, request));
    }
}
