package br.com.traue.labflow.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewRequest {
    @NotNull
    private Long submissionId;
    private String comment;
    private BigDecimal score;
    private BigDecimal maxScore;
}
