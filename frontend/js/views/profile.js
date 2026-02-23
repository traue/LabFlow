import { api, getCurrentUser, setCurrentUser } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { toast, escapeHtml, roleBadge, getInitials } from '../ui.js';

export async function renderProfile() {
  renderAppLayout('Meu Perfil', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  let profile = null;

  try {
    profile = await api.getMyProfile();
  } catch {
    // Profile might not exist yet
  }

  const initials = getInitials(profile?.fullName || user?.username);

  const content = `
    <div class="profile-header">
      <div class="profile-avatar-lg">${initials}</div>
      <div class="profile-info">
        <h2>${escapeHtml(user?.username || 'Usuário')}</h2>
        <p>${roleBadge(user?.role)}</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Informações do Perfil</h3>
      </div>
      <div class="card-body">
        <form class="auth-form" id="profile-form">
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input class="form-input" id="profile-fullname" value="${escapeHtml(profile?.fullName || '')}" placeholder="Seu nome completo" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-input" id="profile-phone" value="${escapeHtml(profile?.phone || '')}" placeholder="(11) 99999-0000" />
            </div>
            <div class="form-group">
              <label class="form-label">Afiliação</label>
              <input class="form-input" id="profile-affiliation" value="${escapeHtml(profile?.affiliation || '')}" placeholder="Universidade / Instituição" />
            </div>
          </div>
        </form>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" id="btn-save-profile">Salvar Alterações</button>
      </div>
    </div>
  `;

  document.getElementById('page-content').innerHTML = content;

  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-profile');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Salvando...';

    try {
      const updated = await api.updateMyProfile({
        fullName: document.getElementById('profile-fullname').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        affiliation: document.getElementById('profile-affiliation').value.trim(),
      });

      // Update cached user
      const u = getCurrentUser();
      u.profile = updated;
      setCurrentUser(u);

      toast('Perfil atualizado com sucesso!', 'success');
      btn.disabled = false;
      btn.textContent = 'Salvar Alterações';
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Salvar Alterações';
    }
  });
}
