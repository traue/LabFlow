package br.com.traue.labflow.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMemberRequest {
    @NotNull
    private Long userId;
    private String roleInProject;
}
