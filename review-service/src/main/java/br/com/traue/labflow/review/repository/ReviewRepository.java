package br.com.traue.labflow.review.repository;

import br.com.traue.labflow.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findBySubmissionId(Long submissionId);
    List<Review> findByReviewerUserId(Long reviewerUserId);
}
