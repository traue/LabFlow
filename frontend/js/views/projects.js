import { api, getCurrentUser } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { toast, openModal, confirm, escapeHtml, formatDate, roleBadge } from '../ui.js';
import { navigate } from '../router.js';

// ─── Projects List ───
export async function renderProjects() {
  renderAppLayout('Projetos', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const role = user?.role || '';
  const isPrivileged = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA'].includes(role);

  let allProjects = [];
  try {
    if (isPrivileged) {
      // Privileged users see all projects from all courses
      const courses = await api.getCourses();
      for (const c of courses) {
        try {
          const projects = await api.getCourseProjects(c.id);
          allProjects = allProjects.concat(projects.map(p => ({ ...p, courseCode: c.code, courseTitle: c.title })));
        } catch { /* ignore */ }
      }
    } else {
      // Students see only projects they are enrolled in
      allProjects = await api.getMyProjects();
    }
  } catch (err) {
    toast(err.message, 'error');
  }

  const heading = isPrivileged ? 'Todos os Projetos' : 'Meus Projetos';

  const content = `
    <div class="section-header">
      <h2>${heading}</h2>
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar projetos..." id="search-projects" />
    </div>

    ${allProjects.length === 0 ? `
      <div class="empty-state">
        ${icons.folder}
        <h3>Nenhum projeto encontrado</h3>
        <p>${isPrivileged ? 'Crie projetos dentro de um curso.' : 'Você ainda não faz parte de nenhum projeto.'}</p>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table" id="projects-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Curso</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${allProjects.map(p => `
              <tr data-search="${(p.title + ' ' + (p.courseCode || '') + ' ' + (p.description || '')).toLowerCase()}">
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td><span class="badge badge-primary">${escapeHtml(p.courseCode || '')}</span></td>
                <td>${escapeHtml(p.description || '—')}</td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost" data-goto="/projects/${p.id}" title="Ver projeto">
                    ${icons.eye}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  document.getElementById('page-content').innerHTML = content;

  const searchInput = document.getElementById('search-projects');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('#projects-table tbody tr').forEach(row => {
        row.style.display = row.dataset.search.includes(term) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.goto));
  });
}

// ─── Project Detail ───
export async function renderProjectDetail({ id }) {
  renderAppLayout('Projeto', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const role = user?.role || '';
  const isPrivileged = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA'].includes(role);
  const canDelete = ['ROLE_ADMIN', 'ROLE_PROF'].includes(role);

  let project, members = [], submissions = [];
  try {
    project = await api.getProject(id);
    [members, submissions] = await Promise.all([
      api.getProjectMembers(id).catch(() => []),
      api.getProjectSubmissions(id).catch(() => []),
    ]);
  } catch (err) {
    toast(err.message, 'error');
    navigate('/projects');
    return;
  }

  // Resolve user details for members and submissions
  const allUserIds = [...new Set([
    ...members.map(m => m.userId),
    ...submissions.map(s => s.submitterUserId),
  ])];
  let userMap = {};
  if (allUserIds.length > 0) {
    try {
      const users = await api.getUsersByIds(allUserIds);
      users.forEach(u => { userMap[u.id] = u; });
    } catch { /* fallback to IDs only */ }
  }

  function userName(uid) {
    const u = userMap[uid];
    if (!u) return `#${uid}`;
    return u.profile?.fullName || u.username;
  }

  function userDetail(uid) {
    const u = userMap[uid];
    if (!u) return `<span style="color:var(--text-tertiary)">#${uid}</span>`;
    const name = u.profile?.fullName
      ? `<strong>${escapeHtml(u.profile.fullName)}</strong>`
      : `<strong>${escapeHtml(u.username)}</strong>`;
    const email = `<span style="color:var(--text-tertiary);font-size:.85rem;margin-left:.4rem">${escapeHtml(u.email)}</span>`;
    const uname = u.profile?.fullName
      ? `<br><span style="color:var(--text-secondary);font-size:.85rem">@${escapeHtml(u.username)}</span>`
      : '';
    return `<div>${name}${email}${uname}</div>`;
  }

  const content = `
    <div class="section-header">
      <div>
        <a href="#/projects" class="btn btn-sm btn-ghost" style="margin-bottom:.5rem">&larr; Voltar aos projetos</a>
        <h2>${escapeHtml(project.title)}</h2>
        ${project.courseCode ? `<span class="badge badge-primary" style="margin-top:.25rem">${escapeHtml(project.courseCode)}</span>` : ''}
      </div>
      <div style="display:flex;gap:.5rem">
        ${isPrivileged ? `<button class="btn btn-sm btn-secondary" id="btn-edit-project">${icons.edit} Editar</button>` : ''}
        ${canDelete ? `<button class="btn btn-sm btn-danger" id="btn-delete-project">${icons.trash} Excluir</button>` : ''}
      </div>
    </div>

    ${project.description ? `
      <div class="card" style="margin-bottom:1.5rem">
        <div class="card-body">
          <p style="color:var(--text-secondary)">${escapeHtml(project.description)}</p>
        </div>
      </div>
    ` : ''}

    <!-- Tabs -->
    <div class="tabs" id="project-tabs">
      <div class="tab-item active" data-tab="members">Membros (${members.length})</div>
      <div class="tab-item" data-tab="submissions">Submissões (${submissions.length})</div>
    </div>

    <!-- Members Tab -->
    <div id="tab-members">
      <div class="section-header">
        <span></span>
        ${isPrivileged ? `<button class="btn btn-sm btn-primary" id="btn-add-member">${icons.userPlus} Adicionar Membro</button>` : ''}
      </div>
      ${members.length === 0 ? `
        <div class="empty-state">
          ${icons.users}
          <h3>Nenhum membro</h3>
          <p>Adicione membros a este projeto.</p>
        </div>
      ` : `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Papel no Projeto</th>
                ${isPrivileged ? '<th>Ações</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td>${userDetail(m.userId)}</td>
                  <td><span class="badge badge-info">${escapeHtml(m.roleInProject)}</span></td>
                  ${isPrivileged ? `
                    <td class="table-actions">
                      <button class="btn btn-sm btn-ghost btn-remove-member" data-user-id="${m.userId}" data-user-name="${escapeHtml(userName(m.userId))}" title="Remover membro">
                        ${icons.userMinus}
                      </button>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Submissions Tab -->
    <div id="tab-submissions" style="display:none">
      <div class="section-header">
        <span></span>
        <button class="btn btn-sm btn-primary" id="btn-new-submission">${icons.upload} Nova Submissão</button>
      </div>
      ${submissions.length === 0 ? `
        <div class="empty-state">
          ${icons.fileText}
          <h3>Nenhuma submissão</h3>
          <p>Envie a primeira submissão para este projeto.</p>
        </div>
      ` : `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Autor</th>
                <th>Conteúdo</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(s => {
                const hasUrl = s.fileUrl && s.fileUrl.trim();
                const hasContent = s.content && s.content.trim();
                let contentCell = '—';
                if (hasUrl && hasContent) {
                  contentCell = `<a href="${escapeHtml(s.fileUrl)}" target="_blank" rel="noopener">${icons.download} Link</a>
                    <br><span style="color:var(--text-secondary);font-size:.85rem">${escapeHtml(s.content.substring(0, 100))}${s.content.length > 100 ? '…' : ''}</span>`;
                } else if (hasUrl) {
                  contentCell = `<a href="${escapeHtml(s.fileUrl)}" target="_blank" rel="noopener">${escapeHtml(s.fileUrl)}</a>`;
                } else if (hasContent) {
                  contentCell = `<span style="color:var(--text-secondary);font-size:.9rem">${escapeHtml(s.content.substring(0, 150))}${s.content.length > 150 ? '…' : ''}</span>`;
                }
                return `
                <tr>
                  <td>${s.id}</td>
                  <td>${userName(s.submitterUserId)}</td>
                  <td style="max-width:300px">${contentCell}</td>
                  <td>${formatDate(s.createdAt)}</td>
                  <td class="table-actions">
                    <button class="btn btn-sm btn-ghost btn-view-reviews" data-submission-id="${s.id}" title="Ver reviews">
                      ${icons.star}
                    </button>
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  document.getElementById('page-content').innerHTML = content;

  // Tabs
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('tab-members').style.display = tabName === 'members' ? '' : 'none';
      document.getElementById('tab-submissions').style.display = tabName === 'submissions' ? '' : 'none';
    });
  });

  // Edit project
  const btnEdit = document.getElementById('btn-edit-project');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => openEditProjectModal(project));
  }

  // Delete project
  const btnDelete = document.getElementById('btn-delete-project');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      const ok = await confirm({
        title: 'Excluir Projeto',
        message: `Tem certeza que deseja excluir o projeto "${project.title}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        danger: true,
      });
      if (ok) {
        try {
          await api.deleteProject(id);
          toast('Projeto excluído com sucesso!', 'success');
          navigate('/projects');
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });
  }

  // Add member
  const btnAddMember = document.getElementById('btn-add-member');
  if (btnAddMember) {
    btnAddMember.addEventListener('click', () => openAddMemberModal(id));
  }

  // Remove member
  document.querySelectorAll('.btn-remove-member').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      const name = btn.dataset.userName || userId;
      const ok = await confirm({
        title: 'Remover Membro',
        message: `Remover ${name} do projeto?`,
        confirmText: 'Remover',
        danger: true,
      });
      if (ok) {
        try {
          await api.removeProjectMember(id, userId);
          toast('Membro removido!', 'success');
          renderProjectDetail({ id });
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });
  });

  // New submission
  const btnNewSub = document.getElementById('btn-new-submission');
  if (btnNewSub) {
    btnNewSub.addEventListener('click', () => openSubmissionModal(id));
  }

  // View reviews
  document.querySelectorAll('.btn-view-reviews').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(`/submissions/${btn.dataset.submissionId}/reviews`);
    });
  });
}

// ─── Edit Project Modal ───
function openEditProjectModal(project) {
  const modal = openModal({
    title: 'Editar Projeto',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="edit-title" value="${escapeHtml(project.title)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-input form-textarea" id="edit-desc">${escapeHtml(project.description || '')}</textarea>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-edit">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-edit').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-edit');
    btn.disabled = true;
    try {
      await api.updateProject(project.id, {
        title: modal.querySelector('#edit-title').value.trim(),
        description: modal.querySelector('#edit-desc').value.trim(),
        courseId: project.courseId,
      });
      toast('Projeto atualizado!', 'success');
      modal.remove();
      renderProjectDetail({ id: project.id });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Add Member Modal (with user search) ───
function openAddMemberModal(projectId) {
  let selectedUser = null;
  let searchTimeout = null;

  const modal = openModal({
    title: 'Adicionar Membro',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Buscar Usuário</label>
          <div style="position:relative">
            <input class="form-input" id="member-search" type="text" autocomplete="off"
                   placeholder="Digite nome, e-mail ou usuário..." />
            <div id="search-results" style="position:absolute;top:100%;left:0;right:0;z-index:100;
              background:var(--bg-primary);border:1px solid var(--border);border-radius:0 0 var(--radius) var(--radius);
              max-height:200px;overflow-y:auto;display:none;box-shadow:var(--shadow-lg)"></div>
          </div>
        </div>
        <div id="selected-user" style="display:none;margin-bottom:1rem">
          <label class="form-label">Usuário selecionado</label>
          <div id="selected-user-card" style="display:flex;align-items:center;gap:.75rem;padding:.75rem;
            background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Papel no Projeto</label>
          <select class="form-input form-select" id="member-role">
            <option value="CONTRIBUTOR">Contributor</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="LEAD">Lead</option>
          </select>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-member" disabled>Adicionar</button>
    `,
  });

  const searchInput = modal.querySelector('#member-search');
  const resultsDiv = modal.querySelector('#search-results');
  const selectedDiv = modal.querySelector('#selected-user');
  const selectedCard = modal.querySelector('#selected-user-card');
  const saveBtn = modal.querySelector('#btn-save-member');

  function selectUser(user) {
    selectedUser = user;
    searchInput.value = '';
    resultsDiv.style.display = 'none';
    selectedCard.innerHTML = `
      <div style="flex:1">
        <strong>${escapeHtml(user.username)}</strong>
        <span style="color:var(--text-secondary);margin-left:.5rem">${escapeHtml(user.email)}</span>
        ${user.profile?.fullName ? `<br><span style="color:var(--text-tertiary);font-size:.85rem">${escapeHtml(user.profile.fullName)}</span>` : ''}
      </div>
      ${roleBadge(user.role)}
      <button class="btn btn-sm btn-ghost" id="btn-clear-user" title="Remover seleção">${icons.x}</button>
    `;
    selectedDiv.style.display = '';
    saveBtn.disabled = false;

    modal.querySelector('#btn-clear-user').addEventListener('click', () => {
      selectedUser = null;
      selectedDiv.style.display = 'none';
      saveBtn.disabled = true;
      searchInput.focus();
    });
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }
    searchTimeout = setTimeout(async () => {
      try {
        const users = await api.searchUsers(q);
        if (users.length === 0) {
          resultsDiv.innerHTML = `<div style="padding:.75rem;color:var(--text-tertiary);text-align:center">Nenhum usuário encontrado</div>`;
        } else {
          resultsDiv.innerHTML = users.map(u => `
            <div class="search-result-item" data-user-id="${u.id}"
                 style="padding:.6rem .75rem;cursor:pointer;border-bottom:1px solid var(--border);
                        transition:background .15s">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
                <div>
                  <strong>${escapeHtml(u.username)}</strong>
                  <span style="color:var(--text-secondary);font-size:.85rem;margin-left:.4rem">${escapeHtml(u.email)}</span>
                  ${u.profile?.fullName ? `<br><span style="color:var(--text-tertiary);font-size:.8rem">${escapeHtml(u.profile.fullName)}</span>` : ''}
                </div>
                ${roleBadge(u.role)}
              </div>
            </div>
          `).join('');

          resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-tertiary)');
            item.addEventListener('mouseleave', () => item.style.background = '');
            item.addEventListener('click', () => {
              const uid = Number(item.dataset.userId);
              const user = users.find(u => u.id === uid);
              if (user) selectUser(user);
            });
          });
        }
        resultsDiv.style.display = '';
      } catch (err) {
        resultsDiv.innerHTML = `<div style="padding:.75rem;color:var(--danger)">${escapeHtml(err.message)}</div>`;
        resultsDiv.style.display = '';
      }
    }, 300);
  });

  // Close dropdown when clicking outside
  modal.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  saveBtn.addEventListener('click', async () => {
    if (!selectedUser) return;
    saveBtn.disabled = true;
    try {
      await api.addProjectMember(projectId, {
        userId: selectedUser.id,
        roleInProject: modal.querySelector('#member-role').value,
      });
      toast(`${selectedUser.username} adicionado ao projeto!`, 'success');
      modal.remove();
      renderProjectDetail({ id: projectId });
    } catch (err) {
      toast(err.message, 'error');
      saveBtn.disabled = false;
    }
  });
}

// ─── Submission Modal ───
function openSubmissionModal(projectId) {
  const modal = openModal({
    title: 'Nova Submissão',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">URL do Arquivo <span style="color:var(--text-tertiary);font-weight:normal">(opcional)</span></label>
          <input class="form-input" id="sub-file-url" placeholder="https://exemplo.com/arquivo.pdf" />
        </div>
        <div class="form-group">
          <label class="form-label">Conteúdo de Texto <span style="color:var(--text-tertiary);font-weight:normal">(opcional)</span></label>
          <textarea class="form-input form-textarea" id="sub-content" rows="5" placeholder="Escreva o conteúdo da submissão aqui..."></textarea>
        </div>
        <p style="font-size:.8rem;color:var(--text-tertiary);margin-top:.25rem">Preencha pelo menos um dos campos acima.</p>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-sub">Enviar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-sub').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-sub');
    const fileUrl = modal.querySelector('#sub-file-url').value.trim();
    const content = modal.querySelector('#sub-content').value.trim();

    if (!fileUrl && !content) {
      toast('Preencha pelo menos a URL ou o conteúdo de texto.', 'error');
      return;
    }

    btn.disabled = true;
    try {
      await api.createSubmission(projectId, {
        projectId: Number(projectId),
        fileUrl: fileUrl || null,
        content: content || null,
      });
      toast('Submissão enviada!', 'success');
      modal.remove();
      renderProjectDetail({ id: projectId });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}
