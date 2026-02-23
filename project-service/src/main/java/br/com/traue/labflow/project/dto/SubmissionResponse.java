package br.com.traue.labflow.project.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionResponse {
    private Long id;
    private Long projectId;
    private Long submitterUserId;
    private String fileUrl;
    private String content;
    private LocalDateTime createdAt;
}
