package br.com.traue.labflow.review.service;

import br.com.traue.labflow.review.dto.ReviewRequest;
import br.com.traue.labflow.review.dto.ReviewResponse;
import br.com.traue.labflow.review.entity.Grade;
import br.com.traue.labflow.review.entity.Review;
import br.com.traue.labflow.review.repository.GradeRepository;
import br.com.traue.labflow.review.repository.ReviewRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService — testes unitários")
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private GradeRepository gradeRepository;

    @InjectMocks
    private ReviewService reviewService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Review review(Long id, Long submissionId, Long reviewerId) {
        return Review.builder()
                .id(id)
                .submissionId(submissionId)
                .reviewerUserId(reviewerId)
                .comment("Bom trabalho")
                .createdAt(LocalDateTime.now())
                .build();
    }

    private Grade grade(Long id, Review review, BigDecimal score) {
        return Grade.builder()
                .id(id)
                .review(review)
                .score(score)
                .maxScore(new BigDecimal("100.00"))
                .build();
    }

    // ── findBySubmissionId ───────────────────────────────────────────────────

    @Test
    @DisplayName("findBySubmissionId: deve retornar todas as reviews da submissão")
    void findBySubmissionId_shouldReturnReviews() {
        when(reviewRepository.findBySubmissionId(100L))
                .thenReturn(List.of(review(1L, 100L, 5L), review(2L, 100L, 6L)));

        List<ReviewResponse> result = reviewService.findBySubmissionId(100L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ReviewResponse::getSubmissionId)
                .containsOnly(100L);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID existente deve retornar ReviewResponse")
    void findById_found_shouldReturnReview() {
        Review r = review(1L, 100L, 5L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        ReviewResponse response = reviewService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getComment()).isEqualTo("Bom trabalho");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID inexistente deve lançar IllegalArgumentException")
    void findById_notFound_shouldThrow() {
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.findById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── findByReviewer ────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByReviewer: deve retornar reviews criadas pelo revisor")
    void findByReviewer_shouldReturnReviews() {
        when(reviewRepository.findByReviewerUserId(5L))
                .thenReturn(List.of(review(1L, 100L, 5L)));

        List<ReviewResponse> result = reviewService.findByReviewer(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReviewerUserId()).isEqualTo(5L);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: com score deve persistir Grade e retornar nota no response")
    void create_withScore_shouldCreateGrade() {
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(1L);
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });
        when(gradeRepository.save(any(Grade.class))).thenAnswer(inv -> {
            Grade g = inv.getArgument(0);
            g.setId(1L);
            return g;
        });

        ReviewRequest req = ReviewRequest.builder()
                .submissionId(100L)
                .comment("Excelente")
                .score(new BigDecimal("90.00"))
                .maxScore(new BigDecimal("100.00"))
                .build();

        ReviewResponse response = reviewService.create(5L, req);

        assertThat(response.getScore()).isEqualByComparingTo("90.00");
        assertThat(response.getMaxScore()).isEqualByComparingTo("100.00");
        verify(gradeRepository).save(any(Grade.class));
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: sem score não deve criar Grade")
    void create_withoutScore_shouldNotCreateGrade() {
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(2L);
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });

        ReviewRequest req = ReviewRequest.builder()
                .submissionId(100L)
                .comment("Apenas comentário")
                .build();

        ReviewResponse response = reviewService.create(5L, req);

        assertThat(response.getScore()).isNull();
        verifyNoInteractions(gradeRepository);
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: autor da review pode atualizar comentário")
    void update_byAuthor_shouldUpdate() {
        Review r = review(1L, 100L, 5L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(gradeRepository.findByReviewId(1L)).thenReturn(Optional.empty());

        ReviewRequest req = ReviewRequest.builder()
                .submissionId(100L)
                .comment("Atualizado")
                .score(new BigDecimal("75.00"))
                .build();

        ReviewResponse response = reviewService.update(1L, req, 5L, false);

        assertThat(response.getComment()).isEqualTo("Atualizado");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: admin pode atualizar review mesmo não sendo autor")
    void update_byAdmin_shouldUpdate() {
        Review r = review(1L, 100L, 99L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(gradeRepository.findByReviewId(1L)).thenReturn(Optional.empty());

        ReviewRequest req = ReviewRequest.builder()
                .submissionId(100L)
                .comment("Admin update")
                .score(new BigDecimal("80.00"))
                .build();

        ReviewResponse response = reviewService.update(1L, req, 1L, true);

        assertThat(response.getComment()).isEqualTo("Admin update");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: outro usuário (não admin, não autor) deve lançar AccessDeniedException")
    void update_byOtherUser_shouldThrowAccessDenied() {
        Review r = review(1L, 100L, 99L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        ReviewRequest req = ReviewRequest.builder().submissionId(100L).comment("Tentativa").build();

        assertThatThrownBy(() -> reviewService.update(1L, req, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: review inexistente deve lançar IllegalArgumentException")
    void update_notFound_shouldThrow() {
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        ReviewRequest req = ReviewRequest.builder().submissionId(100L).build();

        assertThatThrownBy(() -> reviewService.update(99L, req, 1L, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: autor da review pode excluir")
    void delete_byAuthor_shouldDelete() {
        Review r = review(1L, 100L, 5L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        reviewService.delete(1L, 5L, false);

        verify(reviewRepository).delete(r);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: admin pode excluir mesmo não sendo autor")
    void delete_byAdmin_shouldDelete() {
        Review r = review(1L, 100L, 99L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        reviewService.delete(1L, 1L, true);

        verify(reviewRepository).delete(r);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: usuário sem permissão deve lançar AccessDeniedException")
    void delete_byOtherUser_shouldThrowAccessDenied() {
        Review r = review(1L, 100L, 99L);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        assertThatThrownBy(() -> reviewService.delete(1L, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }
}
