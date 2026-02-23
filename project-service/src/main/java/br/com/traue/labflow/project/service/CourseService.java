package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
            courseRepository.findByCode(code).ifPresentOrElse(
                    c -> {}, () -> {});
            courses = courseRepository.findByCode(code).map(List::of).orElse(List.of());
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream().map(this::toResponse).toList();
    }

    public CourseResponse findById(Long id) {
        return toResponse(courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id)));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course course = Course.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .term(request.getTerm())
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setTerm(request.getTerm());
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long id) {
        courseRepository.deleteById(id);
    }

    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .term(c.getTerm())
                .build();
    }
}
