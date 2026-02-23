package br.com.traue.labflow.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseRequest {
    @NotBlank @Size(max = 20)
    private String code;

    @NotBlank @Size(max = 200)
    private String title;

    @NotBlank @Size(max = 20)
    private String term;
}
