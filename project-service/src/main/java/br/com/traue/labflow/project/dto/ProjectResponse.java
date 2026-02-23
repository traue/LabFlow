package br.com.traue.labflow.project.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private Long courseId;
    private String courseCode;
}
