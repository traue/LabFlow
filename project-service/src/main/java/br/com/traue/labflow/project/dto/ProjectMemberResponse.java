package br.com.traue.labflow.project.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMemberResponse {
    private Long id;
    private Long projectId;
    private Long userId;
    private String roleInProject;
}
