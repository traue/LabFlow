import { api, getCurrentUser, parseJwt, getToken } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { toast, openModal, confirm, escapeHtml } from '../ui.js';
import { navigate } from '../router.js';

// ─── List Courses ───
export async function renderCourses() {
  renderAppLayout('Cursos', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const isPrivileged = ['ROLE_ADMIN', 'ROLE_PROF'].includes(user?.role);

  let courses = [];
  try {
    courses = await api.getCourses();
  } catch (err) {
    toast(err.message, 'error');
  }

  const content = `
    <div class="section-header">
      <h2>Todos os Cursos</h2>
      ${isPrivileged ? `<button class="btn btn-primary" id="btn-new-course">${icons.plus} Novo Curso</button>` : ''}
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar cursos..." id="search-courses" />
    </div>

    ${courses.length === 0 ? `
      <div class="empty-state">
        ${icons.book}
        <h3>Nenhum curso encontrado</h3>
        <p>Ainda não há cursos cadastrados no sistema.</p>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table" id="courses-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(c => `
              <tr data-search="${(c.code + ' ' + c.title + ' ' + c.term).toLowerCase()}">
                <td><strong>${escapeHtml(c.code)}</strong></td>
                <td>${escapeHtml(c.title)}</td>
                <td><span class="badge badge-info">${escapeHtml(c.term)}</span></td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost" data-goto="/courses/${c.id}" title="Ver detalhes">
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

  // Search filter
  const searchInput = document.getElementById('search-courses');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('#courses-table tbody tr').forEach(row => {
        row.style.display = row.dataset.search.includes(term) ? '' : 'none';
      });
    });
  }

  // Navigation
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.goto));
  });

  // New course
  const btnNew = document.getElementById('btn-new-course');
  if (btnNew) {
    btnNew.addEventListener('click', () => openCourseModal());
  }
}

// ─── Course Detail ───
export async function renderCourseDetail({ id }) {
  renderAppLayout('Curso', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const isPrivileged = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA'].includes(user?.role);

  let course, projects = [];
  try {
    [course, projects] = await Promise.all([
      api.getCourse(id),
      api.getCourseProjects(id),
    ]);
  } catch (err) {
    toast(err.message, 'error');
    navigate('/courses');
    return;
  }

  const content = `
    <div class="section-header">
      <div>
        <a href="#/courses" class="btn btn-sm btn-ghost" style="margin-bottom:.5rem">&larr; Voltar aos cursos</a>
        <h2>${escapeHtml(course.code)} — ${escapeHtml(course.title)}</h2>
        <span class="badge badge-info" style="margin-top:.25rem">${escapeHtml(course.term)}</span>
      </div>
      <div style="display:flex;gap:.5rem">
        ${canEditCourse(course, user) ? `<button class="btn btn-sm btn-secondary" id="btn-edit-course">${icons.edit} Editar</button>` : ''}
        ${canDeleteCourse(course, user) ? `<button class="btn btn-sm btn-danger" id="btn-delete-course">${icons.trash} Excluir</button>` : ''}
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-header">
        <h3 class="card-title">Projetos do Curso</h3>
        ${isPrivileged ? `<button class="btn btn-sm btn-primary" id="btn-new-project">${icons.plus} Novo Projeto</button>` : ''}
      </div>
      <div class="card-body" style="padding:0">
        ${projects.length === 0 ? `
          <div class="empty-state">
            ${icons.folder}
            <h3>Nenhum projeto</h3>
            <p>Este curso ainda não possui projetos.</p>
          </div>
        ` : `
          <table class="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => `
                <tr>
                  <td><strong>${escapeHtml(p.title)}</strong></td>
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
        `}
      </div>
    </div>
  `;

  document.getElementById('page-content').innerHTML = content;

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.goto));
  });

  // Edit course
  const btnEditCourse = document.getElementById('btn-edit-course');
  if (btnEditCourse) {
    btnEditCourse.addEventListener('click', () => openEditCourseModal(course));
  }

  // Delete course
  const btnDeleteCourse = document.getElementById('btn-delete-course');
  if (btnDeleteCourse) {
    btnDeleteCourse.addEventListener('click', async () => {
      const ok = await confirm({
        title: 'Excluir Curso',
        message: `Tem certeza que deseja excluir o curso "${course.code} — ${course.title}"? Todos os projetos e submissões associados serão removidos. Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        danger: true,
      });
      if (ok) {
        try {
          await api.deleteCourse(id);
          toast('Curso excluído com sucesso!', 'success');
          navigate('/courses');
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });
  }

  const btnNew = document.getElementById('btn-new-project');
  if (btnNew) {
    btnNew.addEventListener('click', () => openProjectModal(id));
  }
}

// ─── Course Modal ───
function openCourseModal() {
  const modal = openModal({
    title: 'Novo Curso',
    body: `
      <form id="course-form" class="auth-form">
        <div class="form-group">
          <label class="form-label">Código</label>
          <input class="form-input" id="course-code" required maxlength="20" placeholder="Ex: CS101" />
        </div>
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="course-title" required maxlength="200" placeholder="Nome do curso" />
        </div>
        <div class="form-group">
          <label class="form-label">Período</label>
          <input class="form-input" id="course-term" required maxlength="20" placeholder="Ex: 2025.1" />
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-course">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-course').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-course');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
      await api.createCourse({
        code: modal.querySelector('#course-code').value.trim(),
        title: modal.querySelector('#course-title').value.trim(),
        term: modal.querySelector('#course-term').value.trim(),
      });
      toast('Curso criado com sucesso!', 'success');
      modal.remove();
      renderCourses();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}

// ─── Project Modal (in course context) ───
function openProjectModal(courseId) {
  const modal = openModal({
    title: 'Novo Projeto',
    body: `
      <form id="project-form" class="auth-form">
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="project-title" required placeholder="Nome do projeto" />
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-input form-textarea" id="project-desc" placeholder="Descrição do projeto (opcional)"></textarea>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-project">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-project').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-project');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
      await api.createCourseProject(courseId, {
        title: modal.querySelector('#project-title').value.trim(),
        description: modal.querySelector('#project-desc').value.trim(),
        courseId: Number(courseId),
      });
      toast('Projeto criado com sucesso!', 'success');
      modal.remove();
      renderCourseDetail({ id: courseId });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}

// ─── Helper: Can user edit/delete course ───
function getCurrentUserId() {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload ? Number(payload.sub) : null;
}

function canEditCourse(course, user) {
  if (!user) return false;
  if (user.role === 'ROLE_ADMIN') return true;
  const uid = getCurrentUserId();
  return uid && course.createdByUserId === uid;
}

function canDeleteCourse(course, user) {
  if (!user) return false;
  if (user.role === 'ROLE_ADMIN') return true;
  const uid = getCurrentUserId();
  return uid && course.createdByUserId === uid;
}

// ─── Edit Course Modal ───
function openEditCourseModal(course) {
  const modal = openModal({
    title: 'Editar Curso',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Código</label>
          <input class="form-input" id="edit-course-code" required maxlength="20" value="${escapeHtml(course.code)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="edit-course-title" required maxlength="200" value="${escapeHtml(course.title)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Período</label>
          <input class="form-input" id="edit-course-term" required maxlength="20" value="${escapeHtml(course.term)}" />
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-edit-course">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-edit-course').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-edit-course');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
      await api.updateCourse(course.id, {
        code: modal.querySelector('#edit-course-code').value.trim(),
        title: modal.querySelector('#edit-course-title').value.trim(),
        term: modal.querySelector('#edit-course-term').value.trim(),
      });
      toast('Curso atualizado com sucesso!', 'success');
      modal.remove();
      renderCourseDetail({ id: course.id });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}
