package br.com.traue.labflow.project.repository;

import br.com.traue.labflow.project.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    List<Course> findByTerm(String term);
    List<Course> findByTermAndCode(String term, String code);
}
