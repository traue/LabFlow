package br.com.traue.labflow.project.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseResponse {
    private Long id;
    private String code;
    private String title;
    private String term;
    private Long createdByUserId;
}
