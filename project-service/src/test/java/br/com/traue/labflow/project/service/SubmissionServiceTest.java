package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.SubmissionRequest;
import br.com.traue.labflow.project.dto.SubmissionResponse;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.entity.Project;
import br.com.traue.labflow.project.entity.Submission;
import br.com.traue.labflow.project.repository.ProjectRepository;
import br.com.traue.labflow.project.repository.SubmissionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubmissionService — testes unitários")
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks
    private SubmissionService submissionService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Project project(Long id) {
        Course c = Course.builder().id(1L).code("CS101").title("Curso").term("2025.1").build();
        return Project.builder().id(id).title("Projeto").course(c).createdByUserId(1L).build();
    }

    private Submission submission(Long id, Project project, Long submitterId) {
        return Submission.builder()
                .id(id)
                .project(project)
                .submitterUserId(submitterId)
                .fileUrl("http://link.com/file.pdf")
                .content("Conteúdo do trabalho")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ── findByProjectId ──────────────────────────────────────────────────────

    @Test
    @DisplayName("findByProjectId: deve retornar todas as submissões do projeto")
    void findByProjectId_shouldReturnSubmissions() {
        Project p = project(1L);
        when(submissionRepository.findByProjectId(1L))
                .thenReturn(List.of(submission(1L, p, 5L), submission(2L, p, 6L)));

        List<SubmissionResponse> result = submissionService.findByProjectId(1L);

        assertThat(result).hasSize(2);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID existente deve retornar SubmissionResponse")
    void findById_found_shouldReturnSubmission() {
        Project p = project(1L);
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission(1L, p, 5L)));

        SubmissionResponse response = submissionService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getSubmitterUserId()).isEqualTo(5L);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID inexistente deve lançar IllegalArgumentException")
    void findById_notFound_shouldThrow() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> submissionService.findById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── findByUserId ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByUserId: deve retornar as submissões do usuário")
    void findByUserId_shouldReturnSubmissions() {
        Project p = project(1L);
        when(submissionRepository.findBySubmitterUserId(5L))
                .thenReturn(List.of(submission(1L, p, 5L)));

        List<SubmissionResponse> result = submissionService.findByUserId(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSubmitterUserId()).isEqualTo(5L);
    }

    // ── create (with projectId) ───────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("create(projectId, userId, request): projeto existente deve salvar e retornar SubmissionResponse")
    void create_withProjectId_shouldSaveAndReturn() {
        Project p = project(1L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(p));
        when(submissionRepository.save(any(Submission.class))).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(50L);
            s.setCreatedAt(LocalDateTime.now());
            return s;
        });

        SubmissionRequest req = SubmissionRequest.builder()
                .projectId(1L).fileUrl("http://file.pdf").content("Work content").build();

        SubmissionResponse response = submissionService.create(1L, 5L, req);

        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getProjectId()).isEqualTo(1L);
        assertThat(response.getSubmitterUserId()).isEqualTo(5L);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: projeto inexistente deve lançar IllegalArgumentException")
    void create_projectNotFound_shouldThrow() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        SubmissionRequest req = SubmissionRequest.builder().projectId(99L).build();

        assertThatThrownBy(() -> submissionService.create(99L, 5L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── create (via request) ──────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("create(userId, request): deve delegar para create(projectId, userId, request)")
    void create_viaRequest_shouldDelegateToProjectIdMethod() {
        Project p = project(2L);
        when(projectRepository.findById(2L)).thenReturn(Optional.of(p));
        when(submissionRepository.save(any(Submission.class))).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(60L);
            s.setCreatedAt(LocalDateTime.now());
            return s;
        });

        SubmissionRequest req = SubmissionRequest.builder().projectId(2L).content("Delegated").build();

        SubmissionResponse response = submissionService.create(5L, req);

        assertThat(response.getId()).isEqualTo(60L);
        assertThat(response.getProjectId()).isEqualTo(2L);
    }
}
