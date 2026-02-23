package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.entity.*;
import br.com.traue.labflow.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CourseRepository courseRepository;
    private final ProjectMemberRepository memberRepository;

    public List<ProjectResponse> findAll() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findByMemberUserId(Long userId) {
        List<Long> projectIds = memberRepository.findByUserId(userId).stream()
                .map(m -> m.getProject().getId())
                .toList();
        if (projectIds.isEmpty()) return List.of();
        return projectRepository.findAllById(projectIds).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponse findById(@NonNull Long id) {
        return toResponse(projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id)));
    }

    public List<ProjectResponse> findByCourseId(Long courseId) {
        return projectRepository.findByCourseId(courseId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProjectResponse create(@NonNull ProjectRequest request, @NonNull Long userId) {
        Course course = courseRepository.findById(Objects.requireNonNull(request.getCourseId()))
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .createdByUserId(userId)
                .build();
        return toResponse(projectRepository.save(Objects.requireNonNull(project)));
    }

    @Transactional
    public ProjectResponse createInCourse(@NonNull Long courseId, @NonNull ProjectRequest request, @NonNull Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .createdByUserId(userId)
                .build();
        return toResponse(projectRepository.save(Objects.requireNonNull(project)));
    }

    @Transactional
    public ProjectResponse update(@NonNull Long id, @NonNull ProjectRequest request, @NonNull Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
        if (!isAdmin && !userId.equals(project.getCreatedByUserId())) {
            throw new AccessDeniedException("Somente o criador do projeto pode editá-lo");
        }

        Course course = courseRepository.findById(Objects.requireNonNull(request.getCourseId()))
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setCourse(course);
        return toResponse(projectRepository.save(Objects.requireNonNull(project)));
    }

    @Transactional
    public void delete(@NonNull Long id, @NonNull Long userId, boolean isAdmin) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
        if (!isAdmin && !userId.equals(project.getCreatedByUserId())) {
            throw new AccessDeniedException("Somente o criador do projeto pode excluí-lo");
        }
        projectRepository.delete(Objects.requireNonNull(project));
    }

    private ProjectResponse toResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .courseId(p.getCourse().getId())
                .courseCode(p.getCourse().getCode())
                .createdByUserId(p.getCreatedByUserId())
                .build();
    }
}
