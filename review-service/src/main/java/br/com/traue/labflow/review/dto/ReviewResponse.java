package br.com.traue.labflow.review.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewResponse {
    private Long id;
    private Long submissionId;
    private Long reviewerUserId;
    private String comment;
    private LocalDateTime createdAt;
    private BigDecimal score;
    private BigDecimal maxScore;
}
