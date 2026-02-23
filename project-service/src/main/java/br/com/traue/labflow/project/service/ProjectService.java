package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.entity.*;
import br.com.traue.labflow.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public ProjectResponse findById(Long id) {
        return toResponse(projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id)));
    }

    public List<ProjectResponse> findByCourseId(Long courseId) {
        return projectRepository.findByCourseId(courseId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .build();
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse createInCourse(Long courseId, ProjectRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .build();
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + request.getCourseId()));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setCourse(course);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    private ProjectResponse toResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .courseId(p.getCourse().getId())
                .courseCode(p.getCourse().getCode())
                .build();
    }
}
