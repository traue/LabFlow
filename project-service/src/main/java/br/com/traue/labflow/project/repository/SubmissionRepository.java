package br.com.traue.labflow.project.repository;

import br.com.traue.labflow.project.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByProjectId(Long projectId);
    List<Submission> findBySubmitterUserId(Long userId);
}
