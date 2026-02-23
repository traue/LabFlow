package br.com.traue.labflow.review.service;

import br.com.traue.labflow.review.dto.*;
import br.com.traue.labflow.review.entity.*;
import br.com.traue.labflow.review.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final GradeRepository gradeRepository;

    public List<ReviewResponse> findBySubmissionId(Long submissionId) {
        return reviewRepository.findBySubmissionId(submissionId).stream().map(this::toResponse).toList();
    }

    public ReviewResponse findById(Long id) {
        return toResponse(reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + id)));
    }

    public List<ReviewResponse> findByReviewer(Long reviewerUserId) {
        return reviewRepository.findByReviewerUserId(reviewerUserId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReviewResponse create(Long reviewerUserId, ReviewRequest request) {
        Review review = Review.builder()
                .submissionId(request.getSubmissionId())
                .reviewerUserId(reviewerUserId)
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);

        if (request.getScore() != null) {
            Grade grade = Grade.builder()
                    .review(review)
                    .score(request.getScore())
                    .maxScore(request.getMaxScore() != null ? request.getMaxScore() : new BigDecimal("100.00"))
                    .build();
            gradeRepository.save(grade);
            review.setGrade(grade);
        }

        return toResponse(review);
    }

    @Transactional
    public ReviewResponse update(Long id, ReviewRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + id));

        if (request.getComment() != null) review.setComment(request.getComment());
        review = reviewRepository.save(review);

        if (request.getScore() != null) {
            Grade grade = gradeRepository.findByReviewId(id).orElse(Grade.builder().review(review).build());
            grade.setScore(request.getScore());
            grade.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : grade.getMaxScore());
            gradeRepository.save(grade);
            review.setGrade(grade);
        }

        return toResponse(review);
    }

    @Transactional
    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse.ReviewResponseBuilder builder = ReviewResponse.builder()
                .id(r.getId())
                .submissionId(r.getSubmissionId())
                .reviewerUserId(r.getReviewerUserId())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt());

        if (r.getGrade() != null) {
            builder.score(r.getGrade().getScore());
            builder.maxScore(r.getGrade().getMaxScore());
        }

        return builder.build();
    }
}
