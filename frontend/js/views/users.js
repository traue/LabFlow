import { api, getCurrentUser } from '../api.js';
import { icons } from '../icons.js';
import { renderAppLayout } from './layout.js';
import { toast, openModal, escapeHtml, roleBadge, roleName } from '../ui.js';

export async function renderUsers() {
  renderAppLayout('Usuários', '<div class="loading-center"><div class="spinner spinner-lg"></div></div>');

  const user = getCurrentUser();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  let users = [];
  try {
    users = await api.getUsers();
  } catch (err) {
    toast(err.message, 'error');
  }

  const content = `
    <div class="section-header">
      <h2>Gerenciar Usuários</h2>
      ${isAdmin ? `
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn btn-primary" id="btn-add-user">${icons.plus} Adicionar Usuário</button>
          <button class="btn btn-secondary" id="btn-import-csv">${icons.upload || '⬆'} Importar CSV</button>
        </div>
      ` : ''}
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar por nome, e-mail ou usuário..." id="search-users" />
    </div>

    ${users.length === 0 ? `
      <div class="empty-state">
        ${icons.users}
        <h3>Nenhum usuário</h3>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table" id="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr data-search="${(u.username + ' ' + u.email + ' ' + (u.profile?.fullName || '')).toLowerCase()}">
                <td>${u.id}</td>
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td>${roleBadge(u.role)}</td>
                <td>${u.profile?.fullName ? escapeHtml(u.profile.fullName) : '<span style="color:var(--text-tertiary)">—</span>'}</td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost btn-change-role" data-user-id="${u.id}" data-username="${escapeHtml(u.username)}" data-role="${u.role}" title="Alterar papel">
                    ${icons.settings}
                  </button>
                  <button class="btn btn-sm btn-ghost btn-edit-user" data-user-id="${u.id}" title="Editar perfil">
                    ${icons.edit}
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

  const searchInput = document.getElementById('search-users');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('#users-table tbody tr').forEach(row => {
        row.style.display = row.dataset.search.includes(term) ? '' : 'none';
      });
    });
  }

  // Change role buttons
  document.querySelectorAll('.btn-change-role').forEach(btn => {
    btn.addEventListener('click', () => {
      openChangeRoleModal(btn.dataset.userId, btn.dataset.username, btn.dataset.role);
    });
  });

  // Edit profile buttons
  document.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      try {
        const user = await api.getUser(userId);
        openEditUserModal(user);
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });

  // Add user button
  const btnAdd = document.getElementById('btn-add-user');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openAddUserModal());
  }

  // Import CSV button
  const btnImport = document.getElementById('btn-import-csv');
  if (btnImport) {
    btnImport.addEventListener('click', () => openImportCsvModal());
  }
}

// ─── Change Role Modal ───
function openChangeRoleModal(userId, username, currentRole) {
  const roles = ['ROLE_ADMIN', 'ROLE_PROF', 'ROLE_TA', 'ROLE_STUDENT'];

  const modal = openModal({
    title: `Alterar Papel — ${username}`,
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Papel atual</label>
          <div style="margin-bottom:.75rem">${roleBadge(currentRole)}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Novo papel</label>
          <select class="form-input form-select" id="new-role">
            ${roles.map(r => `
              <option value="${r}" ${r === currentRole ? 'selected' : ''}>${roleName(r)}</option>
            `).join('')}
          </select>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-role">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-role').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-role');
    const newRole = modal.querySelector('#new-role').value;

    if (newRole === currentRole) {
      modal.remove();
      return;
    }

    btn.disabled = true;
    try {
      await api.updateUserRole(userId, newRole);
      toast(`Papel de ${username} alterado para ${roleName(newRole)}!`, 'success');
      modal.remove();
      renderUsers();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Edit Profile Modal ───
function openEditUserModal(user) {
  const modal = openModal({
    title: `Editar Perfil — ${user.username}`,
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Nome Completo</label>
          <input class="form-input" id="edit-fullname" value="${escapeHtml(user.profile?.fullName || '')}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input class="form-input" id="edit-phone" value="${escapeHtml(user.profile?.phone || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Afiliação</label>
            <input class="form-input" id="edit-affiliation" value="${escapeHtml(user.profile?.affiliation || '')}" />
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-user">Salvar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-user').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-user');
    btn.disabled = true;

    try {
      await api.updateUser(user.id, {
        fullName: modal.querySelector('#edit-fullname').value.trim(),
        phone: modal.querySelector('#edit-phone').value.trim(),
        affiliation: modal.querySelector('#edit-affiliation').value.trim(),
      });
      toast('Perfil atualizado!', 'success');
      modal.remove();
      renderUsers();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Add User Modal (Admin) ───
function openAddUserModal() {
  const roles = ['ROLE_STUDENT', 'ROLE_TA', 'ROLE_PROF', 'ROLE_ADMIN'];

  const modal = openModal({
    title: 'Adicionar Usuário',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Username *</label>
          <input class="form-input" id="new-username" placeholder="joao.silva" required />
        </div>
        <div class="form-group">
          <label class="form-label">E-mail *</label>
          <input class="form-input" id="new-email" type="email" placeholder="joao@universidade.br" required />
        </div>
        <div class="form-group">
          <label class="form-label">Senha *</label>
          <input class="form-input" id="new-password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div class="form-group">
          <label class="form-label">Papel</label>
          <select class="form-input form-select" id="new-role">
            ${roles.map(r => `<option value="${r}">${roleName(r)}</option>`).join('')}
          </select>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-new-user">Criar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  modal.querySelector('#btn-save-new-user').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-save-new-user');
    const username = modal.querySelector('#new-username').value.trim();
    const email = modal.querySelector('#new-email').value.trim();
    const password = modal.querySelector('#new-password').value;
    const role = modal.querySelector('#new-role').value;

    if (!username || !email || !password) {
      toast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    if (password.length < 6) {
      toast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    btn.disabled = true;
    try {
      await api.createUser({ username, email, password, role });
      toast(`Usuário "${username}" criado com sucesso!`, 'success');
      modal.remove();
      renderUsers();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

// ─── Import CSV Modal (Admin) ───
function openImportCsvModal() {
  const modal = openModal({
    title: 'Importar Usuários via CSV',
    body: `
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Arquivo CSV</label>
          <input class="form-input" id="csv-file-input" type="file" accept=".csv" style="padding:.5rem" />
        </div>
        <div class="form-group" style="margin-top:.25rem">
          <p style="font-size:.85rem;color:var(--text-secondary);margin:0 0 .5rem 0">
            O arquivo deve ter as colunas: <strong>username, email, password, role</strong><br>
            Se <em>password</em> estiver vazio, será usado <code>username + "123"</code>.<br>
            Se <em>role</em> estiver vazio, será <code>ROLE_STUDENT</code>.
          </p>
          <button type="button" class="btn btn-sm btn-ghost" id="btn-download-sample" style="text-decoration:underline;padding:0">
            ⬇ Baixar planilha de exemplo
          </button>
        </div>
        <div id="csv-preview" style="display:none;margin-top:.75rem">
          <label class="form-label">Pré-visualização</label>
          <div id="csv-preview-content" style="max-height:200px;overflow:auto;font-size:.8rem;border:1px solid var(--border);border-radius:var(--radius);padding:.5rem;background:var(--surface-alt)"></div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-run-import" disabled>Importar</button>
    `,
  });

  modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();

  let parsedRows = [];

  // Download sample CSV
  modal.querySelector('#btn-download-sample').addEventListener('click', () => {
    const sample = 'username,email,password,role\njsilva,joao.silva@uni.br,senha123,ROLE_STUDENT\nmaria,maria.souza@uni.br,senha456,ROLE_TA\nprofa.ana,ana.prof@uni.br,prof789,ROLE_PROF\n';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labflow_usuarios_exemplo.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // File input
  modal.querySelector('#csv-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      parsedRows = parseCsv(text);

      if (parsedRows.length === 0) {
        toast('Nenhum registro encontrado no CSV.', 'error');
        modal.querySelector('#btn-run-import').disabled = true;
        return;
      }

      // Show preview
      const previewDiv = modal.querySelector('#csv-preview');
      previewDiv.style.display = 'block';
      const previewContent = modal.querySelector('#csv-preview-content');
      previewContent.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:.78rem">
          <thead>
            <tr style="text-align:left;border-bottom:1px solid var(--border)">
              <th style="padding:2px 6px">Username</th>
              <th style="padding:2px 6px">E-mail</th>
              <th style="padding:2px 6px">Senha</th>
              <th style="padding:2px 6px">Papel</th>
            </tr>
          </thead>
          <tbody>
            ${parsedRows.map(r => `
              <tr>
                <td style="padding:2px 6px">${escapeHtml(r.username || '')}</td>
                <td style="padding:2px 6px">${escapeHtml(r.email || '')}</td>
                <td style="padding:2px 6px">${r.password ? '••••' : '<em style="color:var(--text-tertiary)">auto</em>'}</td>
                <td style="padding:2px 6px">${escapeHtml(r.role || 'ROLE_STUDENT')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin:.5rem 0 0;font-size:.78rem;color:var(--text-tertiary)">${parsedRows.length} registro(s) encontrado(s)</p>
      `;

      modal.querySelector('#btn-run-import').disabled = false;
    };
    reader.readAsText(file);
  });

  // Import button
  modal.querySelector('#btn-run-import').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-run-import');
    btn.disabled = true;
    btn.textContent = 'Importando...';

    try {
      const results = await api.importUsers(parsedRows);
      const ok = results.filter(r => r.success).length;
      const fail = results.filter(r => !r.success).length;

      modal.remove();

      if (fail === 0) {
        toast(`${ok} usuário(s) importado(s) com sucesso!`, 'success');
      } else {
        // Show detailed results
        const resultModal = openModal({
          title: 'Resultado da Importação',
          body: `
            <p style="margin-bottom:.75rem">
              <strong style="color:var(--success)">${ok} sucesso</strong> · 
              <strong style="color:var(--error)">${fail} erro(s)</strong>
            </p>
            <div style="max-height:250px;overflow:auto;font-size:.85rem">
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr style="text-align:left;border-bottom:1px solid var(--border)">
                    <th style="padding:4px 8px">Username</th>
                    <th style="padding:4px 8px">Status</th>
                    <th style="padding:4px 8px">Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  ${results.map(r => `
                    <tr style="border-bottom:1px solid var(--border)">
                      <td style="padding:4px 8px">${escapeHtml(r.username || '—')}</td>
                      <td style="padding:4px 8px">${r.success
                        ? '<span style="color:var(--success)">✓</span>'
                        : '<span style="color:var(--error)">✗</span>'}</td>
                      <td style="padding:4px 8px;font-size:.8rem">${escapeHtml(r.message || '')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `,
          footer: `<button class="btn btn-primary" data-action="cancel">Fechar</button>`,
        });
        resultModal.querySelector('[data-action="cancel"]').onclick = () => resultModal.remove();
      }

      renderUsers();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Importar';
    }
  });
}

// ─── CSV Parser ───
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0].toLowerCase();
  const sep = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(sep).map(h => h.trim().replace(/^"(.*)"$/, '$1'));

  const colIndex = {
    username: headers.indexOf('username'),
    email: headers.indexOf('email'),
    password: headers.indexOf('password'),
    role: headers.indexOf('role'),
  };

  if (colIndex.username === -1) {
    toast('Coluna "username" não encontrada no CSV.', 'error');
    return [];
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    const username = cols[colIndex.username] || '';
    if (!username) continue;

    rows.push({
      username,
      email: colIndex.email !== -1 ? (cols[colIndex.email] || '') : '',
      password: colIndex.password !== -1 ? (cols[colIndex.password] || '') : '',
      role: colIndex.role !== -1 ? (cols[colIndex.role] || '') : '',
    });
  }
  return rows;
}
