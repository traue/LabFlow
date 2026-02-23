package br.com.traue.labflow.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionRequest {
    @NotNull
    private Long projectId;
    private String fileUrl;
    private String content;
}
