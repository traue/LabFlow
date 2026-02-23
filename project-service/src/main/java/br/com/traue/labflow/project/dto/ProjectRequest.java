package br.com.traue.labflow.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private Long courseId;
}
