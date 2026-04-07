package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.ProjectRequest;
import br.com.traue.labflow.project.dto.ProjectResponse;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.entity.Project;
import br.com.traue.labflow.project.entity.ProjectMember;
import br.com.traue.labflow.project.repository.CourseRepository;
import br.com.traue.labflow.project.repository.ProjectMemberRepository;
import br.com.traue.labflow.project.repository.ProjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService — testes unitários")
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private ProjectMemberRepository memberRepository;

    @InjectMocks
    private ProjectService projectService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Course course(Long id) {
        return Course.builder().id(id).code("CS" + id).title("Curso " + id).term("2025.1").build();
    }

    private Project project(Long id, Course course, Long createdBy) {
        return Project.builder()
                .id(id)
                .title("Projeto " + id)
                .description("Desc")
                .course(course)
                .createdByUserId(createdBy)
                .build();
    }

    // ── findAll ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll: deve retornar todos os projetos mapeados")
    void findAll_shouldReturnAll() {
        Course c = course(1L);
        when(projectRepository.findAll()).thenReturn(List.of(project(1L, c, 10L), project(2L, c, 10L)));

        List<ProjectResponse> result = projectService.findAll();

        assertThat(result).hasSize(2);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID existente deve retornar ProjectResponse")
    void findById_found_shouldReturnProject() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project(1L, course(1L), 10L)));

        ProjectResponse response = projectService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Projeto 1");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID inexistente deve lançar IllegalArgumentException")
    void findById_notFound_shouldThrow() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.findById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── findByCourseId ────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByCourseId: deve retornar projetos do curso")
    void findByCourseId_shouldReturnProjects() {
        Course c = course(1L);
        when(projectRepository.findByCourseId(1L)).thenReturn(List.of(project(1L, c, 10L)));

        List<ProjectResponse> result = projectService.findByCourseId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseId()).isEqualTo(1L);
    }

    // ── findByMemberUserId ────────────────────────────────────────────────────

    @Test
    @DisplayName("findByMemberUserId: sem filiações deve retornar lista vazia")
    void findByMemberUserId_noMemberships_shouldReturnEmpty() {
        when(memberRepository.findByUserId(5L)).thenReturn(List.of());

        List<ProjectResponse> result = projectService.findByMemberUserId(5L);

        assertThat(result).isEmpty();
        verifyNoInteractions(projectRepository);
    }

    @Test
    @DisplayName("findByMemberUserId: com filiações deve retornar os projetos correspondentes")
    void findByMemberUserId_withMemberships_shouldReturnProjects() {
        Course c = course(1L);
        Project p = project(1L, c, 10L);
        ProjectMember member = ProjectMember.builder().id(1L).project(p).userId(5L).roleInProject("CONTRIBUTOR").build();
        when(memberRepository.findByUserId(5L)).thenReturn(List.of(member));
        when(projectRepository.findAllById(List.of(1L))).thenReturn(List.of(p));

        List<ProjectResponse> result = projectService.findByMemberUserId(5L);

        assertThat(result).hasSize(1);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: curso existente deve salvar e retornar ProjectResponse")
    void create_shouldSaveAndReturn() {
        Course c = course(1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(c));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            p.setId(20L);
            return p;
        });

        ProjectRequest req = ProjectRequest.builder().title("Lab 1").description("Desc").courseId(1L).build();
        ProjectResponse response = projectService.create(req, 10L);

        assertThat(response.getId()).isEqualTo(20L);
        assertThat(response.getTitle()).isEqualTo("Lab 1");
        assertThat(response.getCreatedByUserId()).isEqualTo(10L);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: curso inexistente deve lançar IllegalArgumentException")
    void create_courseNotFound_shouldThrow() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        ProjectRequest req = ProjectRequest.builder().title("Lab 1").courseId(99L).build();

        assertThatThrownBy(() -> projectService.create(req, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── createInCourse ────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("createInCourse: deve criar projeto associado ao curso informado")
    void createInCourse_shouldSaveAndReturn() {
        Course c = course(2L);
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            p.setId(30L);
            return p;
        });

        ProjectRequest req = ProjectRequest.builder().title("Lab 2").courseId(2L).build();
        ProjectResponse response = projectService.createInCourse(2L, req, 10L);

        assertThat(response.getCourseId()).isEqualTo(2L);
        assertThat(response.getId()).isEqualTo(30L);
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: criador do projeto pode atualizar")
    void update_byOwner_shouldUpdate() {
        Course c = course(1L);
        Project existing = project(1L, c, 10L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(c));
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectRequest req = ProjectRequest.builder().title("Updated").courseId(1L).build();
        ProjectResponse response = projectService.update(1L, req, 10L, false);

        assertThat(response.getTitle()).isEqualTo("Updated");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: admin pode atualizar mesmo não sendo criador")
    void update_byAdmin_shouldUpdate() {
        Course c = course(1L);
        Project existing = project(1L, c, 99L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(c));
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectRequest req = ProjectRequest.builder().title("Admin Update").courseId(1L).build();
        ProjectResponse response = projectService.update(1L, req, 1L, true);

        assertThat(response.getTitle()).isEqualTo("Admin Update");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: usuário sem permissão deve lançar AccessDeniedException")
    void update_byOtherUser_shouldThrowAccessDenied() {
        Course c = course(1L);
        Project existing = project(1L, c, 99L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));

        ProjectRequest req = ProjectRequest.builder().title("Hack").courseId(1L).build();

        assertThatThrownBy(() -> projectService.update(1L, req, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: criador do projeto pode excluir")
    void delete_byOwner_shouldDelete() {
        Course c = course(1L);
        Project existing = project(1L, c, 10L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));

        projectService.delete(1L, 10L, false);

        verify(projectRepository).delete(existing);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: admin pode excluir mesmo não sendo criador")
    void delete_byAdmin_shouldDelete() {
        Course c = course(1L);
        Project existing = project(1L, c, 99L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));

        projectService.delete(1L, 1L, true);

        verify(projectRepository).delete(existing);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: usuário sem permissão deve lançar AccessDeniedException")
    void delete_byOtherUser_shouldThrowAccessDenied() {
        Course c = course(1L);
        Project existing = project(1L, c, 99L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> projectService.delete(1L, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }
}
