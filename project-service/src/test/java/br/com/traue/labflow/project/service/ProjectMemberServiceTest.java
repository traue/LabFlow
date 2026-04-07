package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.ProjectMemberRequest;
import br.com.traue.labflow.project.dto.ProjectMemberResponse;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.entity.Project;
import br.com.traue.labflow.project.entity.ProjectMember;
import br.com.traue.labflow.project.repository.ProjectMemberRepository;
import br.com.traue.labflow.project.repository.ProjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectMemberService — testes unitários")
class ProjectMemberServiceTest {

    @Mock private ProjectMemberRepository memberRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectMemberService projectMemberService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Project project(Long id) {
        Course c = Course.builder().id(1L).code("CS101").title("Curso").term("2025.1").build();
        return Project.builder().id(id).title("Projeto").course(c).createdByUserId(1L).build();
    }

    private ProjectMember member(Long id, Project project, Long userId) {
        return ProjectMember.builder().id(id).project(project).userId(userId).roleInProject("CONTRIBUTOR").build();
    }

    // ── findByProjectId ──────────────────────────────────────────────────────

    @Test
    @DisplayName("findByProjectId: deve retornar membros do projeto")
    void findByProjectId_shouldReturnMembers() {
        Project p = project(1L);
        when(memberRepository.findByProjectId(1L)).thenReturn(List.of(member(1L, p, 10L)));

        List<ProjectMemberResponse> result = projectMemberService.findByProjectId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(10L);
    }

    // ── findByUserId ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByUserId: deve retornar as filiações do usuário")
    void findByUserId_shouldReturnMemberships() {
        Project p = project(1L);
        when(memberRepository.findByUserId(10L)).thenReturn(List.of(member(1L, p, 10L)));

        List<ProjectMemberResponse> result = projectMemberService.findByUserId(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProjectId()).isEqualTo(1L);
    }

    // ── addMember ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("addMember: usuário novo no projeto deve ser adicionado com sucesso")
    void addMember_newUser_shouldSucceed() {
        Project p = project(1L);
        when(memberRepository.existsByProjectIdAndUserId(1L, 10L)).thenReturn(false);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(p));
        when(memberRepository.save(any(ProjectMember.class))).thenAnswer(inv -> {
            ProjectMember m = inv.getArgument(0);
            m.setId(99L);
            return m;
        });

        ProjectMemberRequest req = ProjectMemberRequest.builder().userId(10L).roleInProject("DEVELOPER").build();
        ProjectMemberResponse response = projectMemberService.addMember(1L, req);

        assertThat(response.getUserId()).isEqualTo(10L);
        assertThat(response.getRoleInProject()).isEqualTo("DEVELOPER");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("addMember: sem role deve usar CONTRIBUTOR como padrão")
    void addMember_withoutRole_shouldDefaultToContributor() {
        Project p = project(1L);
        when(memberRepository.existsByProjectIdAndUserId(1L, 20L)).thenReturn(false);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(p));
        when(memberRepository.save(any(ProjectMember.class))).thenAnswer(inv -> {
            ProjectMember m = inv.getArgument(0);
            m.setId(100L);
            return m;
        });

        ProjectMemberRequest req = ProjectMemberRequest.builder().userId(20L).build();
        ProjectMemberResponse response = projectMemberService.addMember(1L, req);

        assertThat(response.getRoleInProject()).isEqualTo("CONTRIBUTOR");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("addMember: usuário já membro deve lançar IllegalArgumentException")
    void addMember_duplicate_shouldThrow() {
        when(memberRepository.existsByProjectIdAndUserId(1L, 10L)).thenReturn(true);

        ProjectMemberRequest req = ProjectMemberRequest.builder().userId(10L).build();

        assertThatThrownBy(() -> projectMemberService.addMember(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("addMember: projeto inexistente deve lançar IllegalArgumentException")
    void addMember_projectNotFound_shouldThrow() {
        when(memberRepository.existsByProjectIdAndUserId(99L, 10L)).thenReturn(false);
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        ProjectMemberRequest req = ProjectMemberRequest.builder().userId(10L).build();

        assertThatThrownBy(() -> projectMemberService.addMember(99L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── removeMember ─────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("removeMember: deve chamar deleteById no repositório")
    void removeMember_shouldCallDeleteById() {
        projectMemberService.removeMember(5L);

        verify(memberRepository).deleteById(5L);
    }
}
