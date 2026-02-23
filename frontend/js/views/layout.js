import { icons } from '../icons.js';
import { toggleTheme, getCurrentTheme, roleName, getInitials } from '../ui.js';
import { removeToken, getCurrentUser } from '../api.js';
import { navigate, getPath } from '../router.js';

export function renderAppLayout(pageTitle, content) {
  const user = getCurrentUser();
  const initials = getInitials(user?.username || user?.profile?.fullName);
  const role = user?.role || '';
  const theme = getCurrentTheme();

  const navItems = [
    { path: '/dashboard', icon: icons.home, label: 'Dashboard' },
    { path: '/courses', icon: icons.book, label: 'Cursos' },
    { path: '/projects', icon: icons.folder, label: 'Projetos' },
  ];

  const adminItems = [
    { path: '/users', icon: icons.users, label: 'Usuários' },
  ];

  const currentPath = getPath();

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-layout">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">LF</div>
          <span class="sidebar-title">LabFlow</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Principal</div>
          ${navItems.map(item => `
            <a class="nav-item ${currentPath === item.path ? 'active' : ''}" href="#${item.path}">
              ${item.icon}
              <span>${item.label}</span>
            </a>
          `).join('')}

          ${role === 'ROLE_ADMIN' ? `
            <div class="nav-section-title" style="margin-top:.5rem">Administração</div>
            ${adminItems.map(item => `
              <a class="nav-item ${currentPath === item.path ? 'active' : ''}" href="#${item.path}">
                ${item.icon}
                <span>${item.label}</span>
              </a>
            `).join('')}
          ` : ''}

          <div class="nav-section-title" style="margin-top:.5rem">Conta</div>
          <a class="nav-item ${currentPath === '/profile' ? 'active' : ''}" href="#/profile">
            ${icons.user}
            <span>Meu Perfil</span>
          </a>
          <a class="nav-item" href="#" id="btn-logout">
            ${icons.logout}
            <span>Sair</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${initials}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${user?.username || 'Usuário'}</div>
              <div class="sidebar-user-role">${roleName(role)}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-content">
        <header class="main-header">
          <div class="main-header-left">
            <button class="hamburger" id="btn-hamburger">${icons.menu}</button>
            <h1 class="page-title">${pageTitle}</h1>
          </div>
          <div class="main-header-right">
            <button class="theme-toggle" id="btn-theme" title="Alternar tema">
              ${theme === 'dark' ? icons.sun : icons.moon}
            </button>
          </div>
        </header>
        <div class="page-content" id="page-content">
          ${content}
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    removeToken();
    navigate('/login');
  });

  document.getElementById('btn-theme').addEventListener('click', () => {
    toggleTheme();
    const btn = document.getElementById('btn-theme');
    btn.innerHTML = getCurrentTheme() === 'dark' ? icons.sun : icons.moon;
  });

  const hamburger = document.getElementById('btn-hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  });

  // Close sidebar on nav click (mobile)
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  });
}
