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
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;

    public List<SubmissionResponse> findByProjectId(Long projectId) {
        return submissionRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public SubmissionResponse findById(Long id) {
        return toResponse(submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + id)));
    }

    public List<SubmissionResponse> findByUserId(Long userId) {
        return submissionRepository.findBySubmitterUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SubmissionResponse create(Long projectId, Long submitterUserId, SubmissionRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        Submission submission = Submission.builder()
                .project(project)
                .submitterUserId(submitterUserId)
                .fileUrl(request.getFileUrl())
                .content(request.getContent())
                .build();
        return toResponse(submissionRepository.save(submission));
    }

    @Transactional
    public SubmissionResponse create(Long submitterUserId, SubmissionRequest request) {
        return create(request.getProjectId(), submitterUserId, request);
    }

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .projectId(s.getProject().getId())
                .submitterUserId(s.getSubmitterUserId())
                .fileUrl(s.getFileUrl())
                .content(s.getContent())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
