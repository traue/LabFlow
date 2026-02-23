import { api, getCurrentUser } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { navigate } from '../router.js';

export async function renderDashboard() {
  renderAppLayout('Dashboard', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const role = user?.role || '';

  let courses = [], stats = {};

  try {
    courses = await api.getCourses();
    stats.courses = courses.length;

    // Gather projects from all courses
    let allProjects = [];
    for (const c of courses.slice(0, 10)) {
      try {
        const projects = await api.getCourseProjects(c.id);
        allProjects = allProjects.concat(projects);
      } catch { /* ignore */ }
    }
    stats.projects = allProjects.length;
  } catch {
    stats.courses = 0;
    stats.projects = 0;
  }

  const isPrivileged = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA'].includes(role);

  const content = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">${icons.book}</div>
        <div>
          <div class="stat-value">${stats.courses}</div>
          <div class="stat-label">Cursos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">${icons.folder}</div>
        <div>
          <div class="stat-value">${stats.projects}</div>
          <div class="stat-label">Projetos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">${icons.user}</div>
        <div>
          <div class="stat-value">${user?.username || '—'}</div>
          <div class="stat-label">Logado como</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Ações Rápidas</h3>
      </div>
      <div class="card-body">
        <div class="quick-actions">
          <div class="quick-action-card" data-goto="/courses">
            ${icons.book}
            <span>Ver Cursos</span>
          </div>
          <div class="quick-action-card" data-goto="/projects">
            ${icons.folder}
            <span>Ver Projetos</span>
          </div>
          ${isPrivileged ? `
            <div class="quick-action-card" data-goto="/courses">
              ${icons.plus}
              <span>Novo Curso</span>
            </div>
          ` : ''}
          <div class="quick-action-card" data-goto="/profile">
            ${icons.user}
            <span>Meu Perfil</span>
          </div>
        </div>
      </div>
    </div>

    ${courses.length > 0 ? `
      <div class="card" style="margin-top:1.5rem">
        <div class="card-header">
          <h3 class="card-title">Cursos Recentes</h3>
          <a href="#/courses" class="btn btn-sm btn-secondary">Ver todos</a>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-wrapper" style="border:none;border-radius:0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Período</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${courses.slice(0, 5).map(c => `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.title}</td>
                    <td><span class="badge badge-info">${c.term}</span></td>
                    <td>
                      <button class="btn btn-sm btn-ghost" data-goto="/courses/${c.id}">
                        Ver ${icons.chevronR}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  document.getElementById('page-content').innerHTML = content;

  // Quick action navigation
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.goto));
  });
}
