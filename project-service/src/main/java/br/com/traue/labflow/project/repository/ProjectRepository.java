package br.com.traue.labflow.project.repository;

import br.com.traue.labflow.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCourseId(Long courseId);
}
