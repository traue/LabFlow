package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseResponse> findAll(String term, String code) {
        List<Course> courses;
        if (term != null && code != null) {
            courses = courseRepository.findByTermAndCode(term, code);
        } else if (term != null) {
            courses = courseRepository.findByTerm(term);
        } else if (code != null) {
            courses = courseRepository.findByCode(code).map(List::of).orElse(List.of());
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream().map(this::toResponse).toList();
    }

    public CourseResponse findById(@NonNull Long id) {
        return toResponse(courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id)));
    }

    @Transactional
    public CourseResponse create(@NonNull CourseRequest request, @NonNull Long userId) {
        Course course = Course.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .term(request.getTerm())
                .createdByUserId(userId)
                .build();
        return toResponse(courseRepository.save(Objects.requireNonNull(course)));
    }

    @Transactional
    public CourseResponse update(@NonNull Long id, @NonNull CourseRequest request, @NonNull Long userId, boolean isAdmin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
        if (!isAdmin && !userId.equals(course.getCreatedByUserId())) {
            throw new AccessDeniedException("Somente o criador do curso pode editá-lo");
        }
        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setTerm(request.getTerm());
        return toResponse(courseRepository.save(Objects.requireNonNull(course)));
    }

    @Transactional
    public void delete(@NonNull Long id, @NonNull Long userId, boolean isAdmin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
        if (!isAdmin && !userId.equals(course.getCreatedByUserId())) {
            throw new AccessDeniedException("Somente o criador do curso pode excluí-lo");
        }
        courseRepository.delete(Objects.requireNonNull(course));
    }

    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .term(c.getTerm())
                .createdByUserId(c.getCreatedByUserId())
                .build();
    }
}
