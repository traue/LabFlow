package br.com.traue.labflow.review.repository;

import br.com.traue.labflow.review.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByReviewId(Long reviewId);
}
