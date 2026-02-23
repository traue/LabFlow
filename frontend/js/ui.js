// ─── Toast Notifications ───
export function toast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ─── Modal ───
export function openModal({ title, body, footer, onClose }) {
  closeAllModals();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  backdrop.querySelector('.modal-close').onclick = () => {
    backdrop.remove();
    onClose?.();
  };
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.remove();
      onClose?.();
    }
  });

  document.body.appendChild(backdrop);
  return backdrop;
}

export function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach((m) => m.remove());
}

// ─── Confirm Dialog ───
export function confirm({ title = 'Confirmar', message, confirmText = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    const modal = openModal({
      title,
      body: `<div class="confirm-body">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <p>${message}</p>
      </div>`,
      footer: `
        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmText}</button>
      `,
    });

    modal.querySelector('[data-action="cancel"]').onclick = () => {
      modal.remove();
      resolve(false);
    };
    modal.querySelector('[data-action="confirm"]').onclick = () => {
      modal.remove();
      resolve(true);
    };
  });
}

// ─── Theme Toggle ───
export function initTheme() {
  const saved = localStorage.getItem('labflow_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('labflow_theme', next);
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme');
}

// ─── Utility ───
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function roleName(role) {
  const map = {
    ROLE_ADMIN: 'Admin',
    ROLE_PROF: 'Professor',
    ROLE_TA: 'Monitor',
    ROLE_STUDENT: 'Estudante',
  };
  return map[role] || role;
}

export function roleBadge(role) {
  const cls = {
    ROLE_ADMIN: 'badge-danger',
    ROLE_PROF: 'badge-primary',
    ROLE_TA: 'badge-warning',
    ROLE_STUDENT: 'badge-info',
  };
  return `<span class="badge ${cls[role] || 'badge-info'}">${roleName(role)}</span>`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
