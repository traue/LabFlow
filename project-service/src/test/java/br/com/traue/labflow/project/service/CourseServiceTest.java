package br.com.traue.labflow.project.service;

import br.com.traue.labflow.project.dto.CourseRequest;
import br.com.traue.labflow.project.dto.CourseResponse;
import br.com.traue.labflow.project.entity.Course;
import br.com.traue.labflow.project.repository.CourseRepository;
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
@DisplayName("CourseService — testes unitários")
class CourseServiceTest {

    @Mock private CourseRepository courseRepository;

    @InjectMocks
    private CourseService courseService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Course course(Long id, String code, String term, Long createdBy) {
        return Course.builder().id(id).code(code).title("Título " + code).term(term).createdByUserId(createdBy).build();
    }

    private CourseRequest request(String code, String title, String term) {
        return CourseRequest.builder().code(code).title(title).term(term).build();
    }

    // ── findAll ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll sem filtros: deve retornar todos os cursos")
    void findAll_noFilters_shouldReturnAll() {
        when(courseRepository.findAll()).thenReturn(List.of(
                course(1L, "CS101", "2025.1", 1L),
                course(2L, "CS102", "2025.1", 1L)
        ));

        List<CourseResponse> result = courseService.findAll(null, null);

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("findAll com term: deve filtrar pelo semestre")
    void findAll_withTerm_shouldFilterByTerm() {
        when(courseRepository.findByTerm("2025.1"))
                .thenReturn(List.of(course(1L, "CS101", "2025.1", 1L)));

        List<CourseResponse> result = courseService.findAll("2025.1", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTerm()).isEqualTo("2025.1");
    }

    @Test
    @DisplayName("findAll com code: deve filtrar pelo código")
    void findAll_withCode_shouldFilterByCode() {
        when(courseRepository.findByCode("CS101"))
                .thenReturn(Optional.of(course(1L, "CS101", "2025.1", 1L)));

        List<CourseResponse> result = courseService.findAll(null, "CS101");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("CS101");
    }

    @Test
    @DisplayName("findAll com term e code: deve usar ambos os filtros")
    void findAll_withTermAndCode_shouldUseBothFilters() {
        when(courseRepository.findByTermAndCode("2025.1", "CS101"))
                .thenReturn(List.of(course(1L, "CS101", "2025.1", 1L)));

        List<CourseResponse> result = courseService.findAll("2025.1", "CS101");

        assertThat(result).hasSize(1);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID existente deve retornar CourseResponse")
    void findById_found_shouldReturnCourse() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course(1L, "CS101", "2025.1", 1L)));

        CourseResponse response = courseService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getCode()).isEqualTo("CS101");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID inexistente deve lançar IllegalArgumentException")
    void findById_notFound_shouldThrow() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.findById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("create: deve salvar o curso com o userId do criador")
    void create_shouldSaveAndReturn() {
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        CourseResponse response = courseService.create(request("LES101", "Lab Eng Software", "2025.2"), 5L);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getCode()).isEqualTo("LES101");
        assertThat(response.getCreatedByUserId()).isEqualTo(5L);
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: criador do curso pode atualizar")
    void update_byOwner_shouldUpdate() {
        Course existing = course(1L, "OLD", "2024.1", 10L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CourseResponse response = courseService.update(1L, request("NEW", "Novo Título", "2025.1"), 10L, false);

        assertThat(response.getCode()).isEqualTo("NEW");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: admin pode atualizar mesmo não sendo criador")
    void update_byAdmin_shouldUpdate() {
        Course existing = course(1L, "OLD", "2024.1", 99L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CourseResponse response = courseService.update(1L, request("NEW", "Novo Título", "2025.1"), 1L, true);

        assertThat(response.getCode()).isEqualTo("NEW");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("update: outro usuário (não admin, não criador) deve lançar AccessDeniedException")
    void update_byOtherUser_shouldThrowAccessDenied() {
        Course existing = course(1L, "OLD", "2024.1", 99L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> courseService.update(1L, request("NEW", "Título", "2025.1"), 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: criador do curso pode excluir")
    void delete_byOwner_shouldDelete() {
        Course existing = course(1L, "CS101", "2025.1", 10L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));

        courseService.delete(1L, 10L, false);

        verify(courseRepository).delete(existing);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: admin pode excluir mesmo não sendo criador")
    void delete_byAdmin_shouldDelete() {
        Course existing = course(1L, "CS101", "2025.1", 99L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));

        courseService.delete(1L, 1L, true);

        verify(courseRepository).delete(existing);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("delete: usuário sem permissão deve lançar AccessDeniedException")
    void delete_byOtherUser_shouldThrowAccessDenied() {
        Course existing = course(1L, "CS101", "2025.1", 99L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> courseService.delete(1L, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }
}
