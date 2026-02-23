import { api, getCurrentUser, parseJwt, getToken } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { toast, openModal, confirm, escapeHtml, formatDate } from '../ui.js';
import { navigate } from '../router.js';

// ─── Reviews for a Submission ───
export async function renderSubmissionReviews({ submissionId }) {
  renderAppLayout('Reviews', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const role = user?.role || '';
  const canCreate = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA'].includes(role);
  const isAdmin = role === 'ROLE_ADMIN';
  const currentUserId = getCurrentUserId();

  let reviews = [];
  try {
    reviews = await api.getSubmissionReviews(submissionId);
  } catch (err) {
    toast(err.message, 'error');
  }

  // Resolve reviewer names
  let userMap = {};
  const reviewerIds = [...new Set(reviews.map(r => r.reviewerUserId).filter(Boolean))];
  if (reviewerIds.length > 0) {
    try {
      const users = await api.getUsersByIds(reviewerIds);
      users.forEach(u => { userMap[u.id] = u; });
    } catch (_) { /* fall back to IDs */ }
  }
  const reviewerName = (uid) => {
    const u = userMap[uid];
    return u ? `<strong>${escapeHtml(u.fullName || u.username)}</strong><br><span style="color:var(--text-tertiary);font-size:.8rem">@${escapeHtml(u.username)}</span>` : `#${uid}`;
  };

  const content = `
    <div class="section-header">
      <div>
        <button class="btn btn-sm btn-ghost" onclick="history.back()" style="margin-bottom:.5rem">&larr; Voltar</button>
        <h2>Reviews da Submissão #${submissionId}</h2>
      </div>
      ${canCreate ? `<button class="btn btn-primary" id="btn-new-review">${icons.plus} Nova Review</button>` : ''}
    </div>

    ${reviews.length === 0 ? `
      <div class="empty-state">
        ${icons.star}
        <h3>Nenhuma review</h3>
        <p>Esta submissão ainda não foi avaliada.</p>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Revisor</th>
              <th>Comentário</th>
              <th>Nota</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${reviews.map(r => `
              <tr>
                <td>${r.id}</td>
                <td>${reviewerName(r.reviewerUserId)}</td>
                <td>${escapeHtml(r.comment || '—')}</td>
                <td>
                  ${r.score != null ? `
                    <div class="score-display">
                      <span class="score-value">${r.score}</span>
                      <span class="score-max">/ ${r.maxScore || 100}</span>
                    </div>
                  ` : '—'}
                </td>
                <td>${formatDate(r.createdAt)}</td>
                <td class="table-actions">
                  ${(isAdmin || r.reviewerUserId === currentUserId) ? `
                    <button class="btn btn-sm btn-ghost btn-edit-review" data-review-id="${r.id}" title="Editar">
                      ${icons.edit}
                    </button>
                  ` : ''}
                  ${(isAdmin || r.reviewerUserId === currentUserId) ? `
                    <button class="btn btn-sm btn-ghost btn-delete-review" data-review-id="${r.id}" title="Excluir">
                      ${icons.trash}
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  document.getElementById('page-content').innerHTML = content;

  // New review
  const btnNew = document.getElementById('btn-new-review');
  if (btnNew) {
    btnNew.addEventListener('click', () => openReviewModal(submissionId));
  }

  // Edit review
  document.querySelectorAll('.btn-edit-review').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const review = await api.getReview(btn.dataset.reviewId);
        openEditReviewModal(review, submissionId);
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });

  // Delete review
  document.querySelectorAll('.btn-delete-review').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirm({
        title: 'Excluir Review',
        message: 'Tem certeza que deseja excluir esta review?',
        confirmText: 'Excluir',
        danger: true,
      });
      if (ok) {
        try {
          await api.deleteReview(btn.dataset.reviewId);
          toast('Review excluída!', 'success');
          renderSubmissionReviews({ submissionId });
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });
  });
}

// ─── New Review Modal ───
function openReviewModal(submissionId) {
  const modal = openModal({
    title: 'Nova Review',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Comentário</label>
          <textarea class="form-input form-textarea" id="review-comment" placeholder="Sua avaliação..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nota</label>
            <input class="form-input" id="review-score" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Nota Máxima</label>
            <input class="form-input" id="review-max-score" type="number" step="0.01" min="0" value="100" />
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-review">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-review').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-review');
    btn.disabled = true;

    const score = modal.querySelector('#review-score').value;
    const maxScore = modal.querySelector('#review-max-score').value;

    try {
      await api.createReview({
        submissionId: Number(submissionId),
        comment: modal.querySelector('#review-comment').value.trim(),
        score: score ? Number(score) : null,
        maxScore: maxScore ? Number(maxScore) : 100,
      });
      toast('Review criada com sucesso!', 'success');
      modal.remove();
      renderSubmissionReviews({ submissionId });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Edit Review Modal ───
function openEditReviewModal(review, submissionId) {
  const modal = openModal({
    title: 'Editar Review',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Comentário</label>
          <textarea class="form-input form-textarea" id="review-comment">${escapeHtml(review.comment || '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nota</label>
            <input class="form-input" id="review-score" type="number" step="0.01" min="0" value="${review.score ?? ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Nota Máxima</label>
            <input class="form-input" id="review-max-score" type="number" step="0.01" min="0" value="${review.maxScore ?? 100}" />
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-review">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-review').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-review');
    btn.disabled = true;

    const score = modal.querySelector('#review-score').value;
    const maxScore = modal.querySelector('#review-max-score').value;

    try {
      await api.updateReview(review.id, {
        submissionId: review.submissionId,
        comment: modal.querySelector('#review-comment').value.trim(),
        score: score ? Number(score) : null,
        maxScore: maxScore ? Number(maxScore) : 100,
      });
      toast('Review atualizada!', 'success');
      modal.remove();
      renderSubmissionReviews({ submissionId });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Helper: Get current user ID from JWT ───
function getCurrentUserId() {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload ? Number(payload.sub) : null;
}
