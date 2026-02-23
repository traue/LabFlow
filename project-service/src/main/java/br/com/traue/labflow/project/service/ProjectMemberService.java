package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.*;
import br.com.traue.labflow.project.entity.*;
import br.com.traue.labflow.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectMemberService {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;

    public List<ProjectMemberResponse> findByProjectId(Long projectId) {
        return memberRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public List<ProjectMemberResponse> findByUserId(Long userId) {
        return memberRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProjectMemberResponse addMember(Long projectId, ProjectMemberRequest request) {
        if (memberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new IllegalArgumentException("User already a member of this project");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(request.getUserId())
                .roleInProject(request.getRoleInProject() != null ? request.getRoleInProject() : "CONTRIBUTOR")
                .build();
        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    @Transactional
    public void removeMemberByProjectAndUser(Long projectId, Long userId) {
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    private ProjectMemberResponse toResponse(ProjectMember m) {
        return ProjectMemberResponse.builder()
                .id(m.getId())
                .projectId(m.getProject().getId())
                .userId(m.getUserId())
                .roleInProject(m.getRoleInProject())
                .build();
    }
}
