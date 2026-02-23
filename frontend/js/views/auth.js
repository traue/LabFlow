import { api, setToken, setCurrentUser, parseJwt } from '../api.js';
import { toast, initTheme, toggleTheme, getCurrentTheme } from '../ui.js';
import { navigate } from '../router.js';
import { icons } from '../icons.js';

export function renderLogin() {
  const theme = getCurrentTheme();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card">
        <div style="position:absolute;top:1rem;right:1rem">
          <button class="theme-toggle" id="btn-theme-auth" title="Alternar tema">
            ${theme === 'dark' ? icons.sun : icons.moon}
          </button>
        </div>
        <div class="auth-brand">
          <div class="auth-brand-logo">LF</div>
          <h1>LabFlow</h1>
          <p>Faça login para continuar</p>
        </div>
        <form class="auth-form" id="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Usuário</label>
            <input class="form-input" id="username" type="text" placeholder="Digite seu usuário" required autofocus />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Senha</label>
            <input class="form-input" id="password" type="password" placeholder="Digite sua senha" required />
          </div>
          <button class="btn btn-primary" type="submit" id="btn-login">
            Entrar
          </button>
        </form>
        <div class="auth-footer">
          Não tem conta? <a href="#/register">Criar conta</a>
        </div>
      </div>
    </div>
  `;

  // Make auth-card position:relative for the theme toggle
  app.querySelector('.auth-card').style.position = 'relative';

  document.getElementById('btn-theme-auth').addEventListener('click', () => {
    toggleTheme();
    document.getElementById('btn-theme-auth').innerHTML =
      getCurrentTheme() === 'dark' ? icons.sun : icons.moon;
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Entrando...';

    try {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      const res = await api.login({ username, password });
      setToken(res.accessToken, res.expiresIn);

      // Decode token to get user info
      const payload = parseJwt(res.accessToken);
      const userId = payload?.sub;
      const roles = payload?.roles || [];

      // Fetch user profile
      try {
        const profile = await api.getMyProfile();
        setCurrentUser({
          id: userId,
          username: payload?.username || username,
          role: roles[0] || 'ROLE_STUDENT',
          profile,
        });
      } catch {
        setCurrentUser({
          id: userId,
          username: payload?.username || username,
          role: roles[0] || 'ROLE_STUDENT',
          profile: null,
        });
      }

      toast('Login realizado com sucesso!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.message || 'Erro ao fazer login', 'error');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

export function renderRegister() {
  const theme = getCurrentTheme();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card" style="position:relative">
        <div style="position:absolute;top:1rem;right:1rem">
          <button class="theme-toggle" id="btn-theme-auth" title="Alternar tema">
            ${theme === 'dark' ? icons.sun : icons.moon}
          </button>
        </div>
        <div class="auth-brand">
          <div class="auth-brand-logo">LF</div>
          <h1>Criar Conta</h1>
          <p>Preencha os dados para se cadastrar</p>
        </div>
        <form class="auth-form" id="register-form">
          <div class="form-group">
            <label class="form-label" for="username">Usuário</label>
            <input class="form-input" id="username" type="text" placeholder="Mínimo 3 caracteres" required minlength="3" maxlength="50" autofocus />
          </div>
          <div class="form-group">
            <label class="form-label" for="email">E-mail</label>
            <input class="form-input" id="email" type="email" placeholder="seu@email.com" required maxlength="120" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Senha</label>
            <input class="form-input" id="password" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
          </div>
          <button class="btn btn-primary" type="submit" id="btn-register">
            Criar Conta
          </button>
        </form>
        <div class="auth-footer">
          Já tem conta? <a href="#/login">Fazer login</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-theme-auth').addEventListener('click', () => {
    toggleTheme();
    document.getElementById('btn-theme-auth').innerHTML =
      getCurrentTheme() === 'dark' ? icons.sun : icons.moon;
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-register');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Criando...';

    try {
      const body = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      };

      await api.register(body);
      toast('Conta criada com sucesso! Faça login.', 'success');
      navigate('/login');
    } catch (err) {
      toast(err.message || 'Erro ao criar conta', 'error');
      btn.disabled = false;
      btn.textContent = 'Criar Conta';
    }
  });
}
