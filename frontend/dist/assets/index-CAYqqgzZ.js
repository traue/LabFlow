(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function r(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=r(a);fetch(a.href,o)}})();const re="";function K(){return localStorage.getItem("labflow_token")}function se(e,t){localStorage.setItem("labflow_token",e),t&&localStorage.setItem("labflow_token_exp",Date.now()+t*1e3)}function z(){localStorage.removeItem("labflow_token"),localStorage.removeItem("labflow_token_exp"),localStorage.removeItem("labflow_user")}function A(){if(!K())return!1;const t=localStorage.getItem("labflow_token_exp");return t&&Date.now()>Number(t)?(z(),!1):!0}function I(){try{return JSON.parse(localStorage.getItem("labflow_user"))}catch{return null}}function _(e){localStorage.setItem("labflow_user",JSON.stringify(e))}function oe(e){try{const r=e.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(r))}catch{return null}}async function f(e,t={}){const r=K(),s={...t.headers};t.body&&(s["Content-Type"]="application/json"),r&&(s.Authorization=`Bearer ${r}`);let a;try{a=await fetch(`${re}${e}`,{...t,headers:s})}catch{throw new Error("Erro de conexão com o servidor. Verifique sua rede.")}if(a.status===401)throw z(),window.location.hash="#/login",new Error("Sessão expirada. Faça login novamente.");if(a.status===403)throw new Error("Acesso negado. Você não tem permissão para esta ação.");if(a.status===204)return null;const o=await a.json().catch(()=>null);if(!a.ok)throw new Error((o==null?void 0:o.message)||`Erro ${a.status}`);return o}const b={login:e=>f("/api/auth/login",{method:"POST",body:JSON.stringify(e)}),register:e=>f("/api/auth/register",{method:"POST",body:JSON.stringify(e)}),getMyProfile:()=>f("/api/profiles/me"),getProfileByUserId:e=>f(`/api/profiles/${e}`),updateMyProfile:e=>f("/api/profiles/me",{method:"PUT",body:JSON.stringify(e)}),getUsers:()=>f("/api/users"),getUser:e=>f(`/api/users/${e}`),updateUser:(e,t)=>f(`/api/users/${e}/profile`,{method:"PUT",body:JSON.stringify(t)}),updateUserRole:(e,t)=>f(`/api/users/${e}/role`,{method:"PATCH",body:JSON.stringify({role:t})}),searchUsers:e=>f(`/api/users/search?q=${encodeURIComponent(e)}`),getUsersByIds:e=>f(`/api/users/batch?ids=${e.join(",")}`),createUser:e=>f("/api/users",{method:"POST",body:JSON.stringify(e)}),importUsers:e=>f("/api/users/import",{method:"POST",body:JSON.stringify(e)}),getCourses:(e={})=>{const t=new URLSearchParams(e).toString();return f(`/api/courses${t?"?"+t:""}`)},getCourse:e=>f(`/api/courses/${e}`),createCourse:e=>f("/api/courses",{method:"POST",body:JSON.stringify(e)}),getCourseProjects:e=>f(`/api/courses/${e}/projects`),createCourseProject:(e,t)=>f(`/api/courses/${e}/projects`,{method:"POST",body:JSON.stringify(t)}),getProject:e=>f(`/api/projects/${e}`),getMyProjects:()=>f("/api/projects/my"),updateProject:(e,t)=>f(`/api/projects/${e}`,{method:"PUT",body:JSON.stringify(t)}),deleteProject:e=>f(`/api/projects/${e}`,{method:"DELETE"}),getProjectMembers:e=>f(`/api/projects/${e}/members`),addProjectMember:(e,t)=>f(`/api/projects/${e}/members`,{method:"POST",body:JSON.stringify(t)}),removeProjectMember:(e,t)=>f(`/api/projects/${e}/members/${t}`,{method:"DELETE"}),getProjectSubmissions:e=>f(`/api/projects/${e}/submissions`),createSubmission:(e,t)=>f(`/api/projects/${e}/submissions`,{method:"POST",body:JSON.stringify(t)}),getSubmissionReviews:e=>f(`/api/submissions/${e}/reviews`),getReview:e=>f(`/api/reviews/${e}`),createReview:e=>f("/api/reviews",{method:"POST",body:JSON.stringify(e)}),updateReview:(e,t)=>f(`/api/reviews/${e}`,{method:"PUT",body:JSON.stringify(t)}),deleteReview:e=>f(`/api/reviews/${e}`,{method:"DELETE"})};function d(e,t="info",r=4e3){const s=document.getElementById("toast-container"),a=document.createElement("div");a.className=`toast toast-${t}`,a.textContent=e,s.appendChild(a),setTimeout(()=>{a.style.transition="opacity .3s ease",a.style.opacity="0",setTimeout(()=>a.remove(),300)},r)}function x({title:e,body:t,footer:r,onClose:s}){ne();const a=document.createElement("div");return a.className="modal-backdrop",a.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${e}</h3>
        <button class="modal-close" aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${t}</div>
      ${r?`<div class="modal-footer">${r}</div>`:""}
    </div>
  `,a.querySelector(".modal-close").onclick=()=>{a.remove(),s==null||s()},a.addEventListener("click",o=>{o.target===a&&(a.remove(),s==null||s())}),document.body.appendChild(a),a}function ne(){document.querySelectorAll(".modal-backdrop").forEach(e=>e.remove())}function D({title:e="Confirmar",message:t,confirmText:r="Confirmar",danger:s=!1}){return new Promise(a=>{const o=x({title:e,body:`<div class="confirm-body">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <p>${t}</p>
      </div>`,footer:`
        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
        <button class="btn ${s?"btn-danger":"btn-primary"}" data-action="confirm">${r}</button>
      `});o.querySelector('[data-action="cancel"]').onclick=()=>{o.remove(),a(!1)},o.querySelector('[data-action="confirm"]').onclick=()=>{o.remove(),a(!0)}})}function ie(){const e=localStorage.getItem("labflow_theme")||"light";document.documentElement.setAttribute("data-theme",e)}function F(){const t=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("labflow_theme",t)}function q(){return document.documentElement.getAttribute("data-theme")}function l(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function W(e){return e?new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function R(e){return{ROLE_ADMIN:"Admin",ROLE_PROF:"Professor",ROLE_TA:"Monitor",ROLE_STUDENT:"Estudante"}[e]||e}function N(e){return`<span class="badge ${{ROLE_ADMIN:"badge-danger",ROLE_PROF:"badge-primary",ROLE_TA:"badge-warning",ROLE_STUDENT:"badge-info"}[e]||"badge-info"}">${R(e)}</span>`}function Q(e){return e?e.split(" ").map(t=>t[0]).slice(0,2).join("").toUpperCase():"?"}const X=[];let H=null;function j(e,t){const r=[],s=new RegExp("^"+e.replace(/:(\w+)/g,(a,o)=>(r.push(o),"([^/]+)"))+"$");X.push({regex:s,keys:r,handler:t})}function le(e){H=e}function E(e){window.location.hash="#"+e}function Y(){return window.location.hash.slice(1)||"/"}function ce(e){for(const t of X){const r=e.match(t.regex);if(r){const s={};return t.keys.forEach((a,o)=>{s[a]=decodeURIComponent(r[o+1])}),{handler:t.handler,params:s}}}return null}function G(){const e=Y(),t=ce(e);t?t.handler(t.params):H&&H()}function de(){window.addEventListener("hashchange",G),G()}const $=(e,t=24)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`,c={home:$('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),book:$('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'),folder:$('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>'),fileText:$('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13H8"/><path d="M16 17H8"/><path d="M16 13h-2"/>'),star:$('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),users:$('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),user:$('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),settings:$('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),logout:$('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),plus:$('<path d="M5 12h14"/><path d="M12 5v14"/>'),edit:$('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>'),trash:$('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'),x:$('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),eye:$('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),upload:$('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),download:$('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),menu:$('<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>'),chevronR:$('<path d="m9 18 6-6-6-6"/>'),userPlus:$('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>'),userMinus:$('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>'),sun:$('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),moon:$('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>')};function ue(){const e=q(),t=document.getElementById("app");t.innerHTML=`
    <div class="auth-layout">
      <div class="auth-card">
        <div style="position:absolute;top:1rem;right:1rem">
          <button class="theme-toggle" id="btn-theme-auth" title="Alternar tema">
            ${e==="dark"?c.sun:c.moon}
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
  `,t.querySelector(".auth-card").style.position="relative",document.getElementById("btn-theme-auth").addEventListener("click",()=>{F(),document.getElementById("btn-theme-auth").innerHTML=q()==="dark"?c.sun:c.moon}),document.getElementById("login-form").addEventListener("submit",async r=>{r.preventDefault();const s=document.getElementById("btn-login");s.disabled=!0,s.innerHTML='<span class="spinner"></span> Entrando...';try{const a=document.getElementById("username").value.trim(),o=document.getElementById("password").value,i=await b.login({username:a,password:o});se(i.accessToken,i.expiresIn);const n=oe(i.accessToken),m=n==null?void 0:n.sub,v=(n==null?void 0:n.roles)||[];try{const y=await b.getMyProfile();_({id:m,username:(n==null?void 0:n.username)||a,role:v[0]||"ROLE_STUDENT",profile:y})}catch{_({id:m,username:(n==null?void 0:n.username)||a,role:v[0]||"ROLE_STUDENT",profile:null})}d("Login realizado com sucesso!","success"),E("/dashboard")}catch(a){d(a.message||"Erro ao fazer login","error"),s.disabled=!1,s.textContent="Entrar"}})}function me(){const e=q(),t=document.getElementById("app");t.innerHTML=`
    <div class="auth-layout">
      <div class="auth-card" style="position:relative">
        <div style="position:absolute;top:1rem;right:1rem">
          <button class="theme-toggle" id="btn-theme-auth" title="Alternar tema">
            ${e==="dark"?c.sun:c.moon}
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
  `,document.getElementById("btn-theme-auth").addEventListener("click",()=>{F(),document.getElementById("btn-theme-auth").innerHTML=q()==="dark"?c.sun:c.moon}),document.getElementById("register-form").addEventListener("submit",async r=>{r.preventDefault();const s=document.getElementById("btn-register");s.disabled=!0,s.innerHTML='<span class="spinner"></span> Criando...';try{const a={username:document.getElementById("username").value.trim(),email:document.getElementById("email").value.trim(),password:document.getElementById("password").value};await b.register(a),d("Conta criada com sucesso! Faça login.","success"),E("/login")}catch(a){d(a.message||"Erro ao criar conta","error"),s.disabled=!1,s.textContent="Criar Conta"}})}function M(e,t){var S;const r=I(),s=Q((r==null?void 0:r.username)||((S=r==null?void 0:r.profile)==null?void 0:S.fullName)),a=(r==null?void 0:r.role)||"",o=q(),i=[{path:"/dashboard",icon:c.home,label:"Dashboard"},{path:"/courses",icon:c.book,label:"Cursos"},{path:"/projects",icon:c.folder,label:"Projetos"}],n=[{path:"/users",icon:c.users,label:"Usuários"}],m=Y(),v=document.getElementById("app");v.innerHTML=`
    <div class="app-layout">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">LF</div>
          <span class="sidebar-title">LabFlow</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Principal</div>
          ${i.map(w=>`
            <a class="nav-item ${m===w.path?"active":""}" href="#${w.path}">
              ${w.icon}
              <span>${w.label}</span>
            </a>
          `).join("")}

          ${a==="ROLE_ADMIN"?`
            <div class="nav-section-title" style="margin-top:.5rem">Administração</div>
            ${n.map(w=>`
              <a class="nav-item ${m===w.path?"active":""}" href="#${w.path}">
                ${w.icon}
                <span>${w.label}</span>
              </a>
            `).join("")}
          `:""}

          <div class="nav-section-title" style="margin-top:.5rem">Conta</div>
          <a class="nav-item ${m==="/profile"?"active":""}" href="#/profile">
            ${c.user}
            <span>Meu Perfil</span>
          </a>
          <a class="nav-item" href="#" id="btn-logout">
            ${c.logout}
            <span>Sair</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${s}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${(r==null?void 0:r.username)||"Usuário"}</div>
              <div class="sidebar-user-role">${R(a)}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-content">
        <header class="main-header">
          <div class="main-header-left">
            <button class="hamburger" id="btn-hamburger">${c.menu}</button>
            <h1 class="page-title">${e}</h1>
          </div>
          <div class="main-header-right">
            <button class="theme-toggle" id="btn-theme" title="Alternar tema">
              ${o==="dark"?c.sun:c.moon}
            </button>
          </div>
        </header>
        <div class="page-content" id="page-content">
          ${t}
        </div>
      </div>
    </div>
  `,document.getElementById("btn-logout").addEventListener("click",w=>{w.preventDefault(),z(),E("/login")}),document.getElementById("btn-theme").addEventListener("click",()=>{F();const w=document.getElementById("btn-theme");w.innerHTML=q()==="dark"?c.sun:c.moon});const y=document.getElementById("btn-hamburger"),p=document.getElementById("sidebar"),h=document.getElementById("sidebar-overlay");y.addEventListener("click",()=>{p.classList.toggle("open"),h.classList.toggle("visible")}),h.addEventListener("click",()=>{p.classList.remove("open"),h.classList.remove("visible")}),p.querySelectorAll(".nav-item").forEach(w=>{w.addEventListener("click",()=>{p.classList.remove("open"),h.classList.remove("visible")})})}async function pe(){M("Dashboard",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const e=I(),t=(e==null?void 0:e.role)||"";let r=[],s={};try{r=await b.getCourses(),s.courses=r.length;let i=[];for(const n of r.slice(0,10))try{const m=await b.getCourseProjects(n.id);i=i.concat(m)}catch{}s.projects=i.length}catch{s.courses=0,s.projects=0}const a=["ROLE_ADMIN","ROLE_PROF","ROLE_TA"].includes(t),o=`
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">${c.book}</div>
        <div>
          <div class="stat-value">${s.courses}</div>
          <div class="stat-label">Cursos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">${c.folder}</div>
        <div>
          <div class="stat-value">${s.projects}</div>
          <div class="stat-label">Projetos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">${c.user}</div>
        <div>
          <div class="stat-value">${(e==null?void 0:e.username)||"—"}</div>
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
            ${c.book}
            <span>Ver Cursos</span>
          </div>
          <div class="quick-action-card" data-goto="/projects">
            ${c.folder}
            <span>Ver Projetos</span>
          </div>
          ${a?`
            <div class="quick-action-card" data-goto="/courses">
              ${c.plus}
              <span>Novo Curso</span>
            </div>
          `:""}
          <div class="quick-action-card" data-goto="/profile">
            ${c.user}
            <span>Meu Perfil</span>
          </div>
        </div>
      </div>
    </div>

    ${r.length>0?`
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
                ${r.slice(0,5).map(i=>`
                  <tr>
                    <td><strong>${i.code}</strong></td>
                    <td>${i.title}</td>
                    <td><span class="badge badge-info">${i.term}</span></td>
                    <td>
                      <button class="btn btn-sm btn-ghost" data-goto="/courses/${i.id}">
                        Ver ${c.chevronR}
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `:""}
  `;document.getElementById("page-content").innerHTML=o,document.querySelectorAll("[data-goto]").forEach(i=>{i.addEventListener("click",()=>E(i.dataset.goto))})}async function ee(){M("Cursos",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const e=I(),t=["ROLE_ADMIN","ROLE_PROF"].includes(e==null?void 0:e.role);let r=[];try{r=await b.getCourses()}catch(i){d(i.message,"error")}const s=`
    <div class="section-header">
      <h2>Todos os Cursos</h2>
      ${t?`<button class="btn btn-primary" id="btn-new-course">${c.plus} Novo Curso</button>`:""}
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar cursos..." id="search-courses" />
    </div>

    ${r.length===0?`
      <div class="empty-state">
        ${c.book}
        <h3>Nenhum curso encontrado</h3>
        <p>Ainda não há cursos cadastrados no sistema.</p>
      </div>
    `:`
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
            ${r.map(i=>`
              <tr data-search="${(i.code+" "+i.title+" "+i.term).toLowerCase()}">
                <td><strong>${l(i.code)}</strong></td>
                <td>${l(i.title)}</td>
                <td><span class="badge badge-info">${l(i.term)}</span></td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost" data-goto="/courses/${i.id}" title="Ver detalhes">
                    ${c.eye}
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}
  `;document.getElementById("page-content").innerHTML=s;const a=document.getElementById("search-courses");a&&a.addEventListener("input",i=>{const n=i.target.value.toLowerCase();document.querySelectorAll("#courses-table tbody tr").forEach(m=>{m.style.display=m.dataset.search.includes(n)?"":"none"})}),document.querySelectorAll("[data-goto]").forEach(i=>{i.addEventListener("click",()=>E(i.dataset.goto))});const o=document.getElementById("btn-new-course");o&&o.addEventListener("click",()=>be())}async function te({id:e}){M("Curso",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const t=I(),r=["ROLE_ADMIN","ROLE_PROF","ROLE_TA"].includes(t==null?void 0:t.role);let s,a=[];try{[s,a]=await Promise.all([b.getCourse(e),b.getCourseProjects(e)])}catch(n){d(n.message,"error"),E("/courses");return}const o=`
    <div class="section-header">
      <div>
        <a href="#/courses" class="btn btn-sm btn-ghost" style="margin-bottom:.5rem">&larr; Voltar aos cursos</a>
        <h2>${l(s.code)} — ${l(s.title)}</h2>
        <span class="badge badge-info" style="margin-top:.25rem">${l(s.term)}</span>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-header">
        <h3 class="card-title">Projetos do Curso</h3>
        ${r?`<button class="btn btn-sm btn-primary" id="btn-new-project">${c.plus} Novo Projeto</button>`:""}
      </div>
      <div class="card-body" style="padding:0">
        ${a.length===0?`
          <div class="empty-state">
            ${c.folder}
            <h3>Nenhum projeto</h3>
            <p>Este curso ainda não possui projetos.</p>
          </div>
        `:`
          <table class="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${a.map(n=>`
                <tr>
                  <td><strong>${l(n.title)}</strong></td>
                  <td>${l(n.description||"—")}</td>
                  <td class="table-actions">
                    <button class="btn btn-sm btn-ghost" data-goto="/projects/${n.id}" title="Ver projeto">
                      ${c.eye}
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;document.getElementById("page-content").innerHTML=o,document.querySelectorAll("[data-goto]").forEach(n=>{n.addEventListener("click",()=>E(n.dataset.goto))});const i=document.getElementById("btn-new-project");i&&i.addEventListener("click",()=>ve(e))}function be(){const e=x({title:"Novo Curso",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-course">Salvar</button>
    `});e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector("#btn-save-course").addEventListener("click",async()=>{const t=e.querySelector("#btn-save-course");t.disabled=!0,t.innerHTML='<span class="spinner"></span>';try{await b.createCourse({code:e.querySelector("#course-code").value.trim(),title:e.querySelector("#course-title").value.trim(),term:e.querySelector("#course-term").value.trim()}),d("Curso criado com sucesso!","success"),e.remove(),ee()}catch(r){d(r.message,"error"),t.disabled=!1,t.textContent="Salvar"}})}function ve(e){const t=x({title:"Novo Projeto",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-project">Salvar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-project").addEventListener("click",async()=>{const r=t.querySelector("#btn-save-project");r.disabled=!0,r.innerHTML='<span class="spinner"></span>';try{await b.createCourseProject(e,{title:t.querySelector("#project-title").value.trim(),description:t.querySelector("#project-desc").value.trim(),courseId:Number(e)}),d("Projeto criado com sucesso!","success"),t.remove(),te({id:e})}catch(s){d(s.message,"error"),r.disabled=!1,r.textContent="Salvar"}})}async function he(){M("Projetos",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const e=I(),t=(e==null?void 0:e.role)||"",r=["ROLE_ADMIN","ROLE_PROF","ROLE_TA"].includes(t);let s=[];try{if(r){const n=await b.getCourses();for(const m of n)try{const v=await b.getCourseProjects(m.id);s=s.concat(v.map(y=>({...y,courseCode:m.code,courseTitle:m.title})))}catch{}}else s=await b.getMyProjects()}catch(n){d(n.message,"error")}const o=`
    <div class="section-header">
      <h2>${r?"Todos os Projetos":"Meus Projetos"}</h2>
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar projetos..." id="search-projects" />
    </div>

    ${s.length===0?`
      <div class="empty-state">
        ${c.folder}
        <h3>Nenhum projeto encontrado</h3>
        <p>${r?"Crie projetos dentro de um curso.":"Você ainda não faz parte de nenhum projeto."}</p>
      </div>
    `:`
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
            ${s.map(n=>`
              <tr data-search="${(n.title+" "+(n.courseCode||"")+" "+(n.description||"")).toLowerCase()}">
                <td><strong>${l(n.title)}</strong></td>
                <td><span class="badge badge-primary">${l(n.courseCode||"")}</span></td>
                <td>${l(n.description||"—")}</td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost" data-goto="/projects/${n.id}" title="Ver projeto">
                    ${c.eye}
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}
  `;document.getElementById("page-content").innerHTML=o;const i=document.getElementById("search-projects");i&&i.addEventListener("input",n=>{const m=n.target.value.toLowerCase();document.querySelectorAll("#projects-table tbody tr").forEach(v=>{v.style.display=v.dataset.search.includes(m)?"":"none"})}),document.querySelectorAll("[data-goto]").forEach(n=>{n.addEventListener("click",()=>E(n.dataset.goto))})}async function T({id:e}){M("Projeto",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const t=I(),r=(t==null?void 0:t.role)||"",s=["ROLE_ADMIN","ROLE_PROF","ROLE_TA"].includes(r),a=["ROLE_ADMIN","ROLE_PROF"].includes(r);let o,i=[],n=[];try{o=await b.getProject(e),[i,n]=await Promise.all([b.getProjectMembers(e).catch(()=>[]),b.getProjectSubmissions(e).catch(()=>[])])}catch(u){d(u.message,"error"),E("/projects");return}const m=[...new Set([...i.map(u=>u.userId),...n.map(u=>u.submitterUserId)])];let v={};if(m.length>0)try{(await b.getUsersByIds(m)).forEach(g=>{v[g.id]=g})}catch{}function y(u){var L;const g=v[u];return g?((L=g.profile)==null?void 0:L.fullName)||g.username:`#${u}`}function p(u){var J,Z;const g=v[u];if(!g)return`<span style="color:var(--text-tertiary)">#${u}</span>`;const L=(J=g.profile)!=null&&J.fullName?`<strong>${l(g.profile.fullName)}</strong>`:`<strong>${l(g.username)}</strong>`,k=`<span style="color:var(--text-tertiary);font-size:.85rem;margin-left:.4rem">${l(g.email)}</span>`,B=(Z=g.profile)!=null&&Z.fullName?`<br><span style="color:var(--text-secondary);font-size:.85rem">@${l(g.username)}</span>`:"";return`<div>${L}${k}${B}</div>`}const h=`
    <div class="section-header">
      <div>
        <a href="#/projects" class="btn btn-sm btn-ghost" style="margin-bottom:.5rem">&larr; Voltar aos projetos</a>
        <h2>${l(o.title)}</h2>
        ${o.courseCode?`<span class="badge badge-primary" style="margin-top:.25rem">${l(o.courseCode)}</span>`:""}
      </div>
      <div style="display:flex;gap:.5rem">
        ${s?`<button class="btn btn-sm btn-secondary" id="btn-edit-project">${c.edit} Editar</button>`:""}
        ${a?`<button class="btn btn-sm btn-danger" id="btn-delete-project">${c.trash} Excluir</button>`:""}
      </div>
    </div>

    ${o.description?`
      <div class="card" style="margin-bottom:1.5rem">
        <div class="card-body">
          <p style="color:var(--text-secondary)">${l(o.description)}</p>
        </div>
      </div>
    `:""}

    <!-- Tabs -->
    <div class="tabs" id="project-tabs">
      <div class="tab-item active" data-tab="members">Membros (${i.length})</div>
      <div class="tab-item" data-tab="submissions">Submissões (${n.length})</div>
    </div>

    <!-- Members Tab -->
    <div id="tab-members">
      <div class="section-header">
        <span></span>
        ${s?`<button class="btn btn-sm btn-primary" id="btn-add-member">${c.userPlus} Adicionar Membro</button>`:""}
      </div>
      ${i.length===0?`
        <div class="empty-state">
          ${c.users}
          <h3>Nenhum membro</h3>
          <p>Adicione membros a este projeto.</p>
        </div>
      `:`
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Papel no Projeto</th>
                ${s?"<th>Ações</th>":""}
              </tr>
            </thead>
            <tbody>
              ${i.map(u=>`
                <tr>
                  <td>${p(u.userId)}</td>
                  <td><span class="badge badge-info">${l(u.roleInProject)}</span></td>
                  ${s?`
                    <td class="table-actions">
                      <button class="btn btn-sm btn-ghost btn-remove-member" data-user-id="${u.userId}" data-user-name="${l(y(u.userId))}" title="Remover membro">
                        ${c.userMinus}
                      </button>
                    </td>
                  `:""}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Submissions Tab -->
    <div id="tab-submissions" style="display:none">
      <div class="section-header">
        <span></span>
        <button class="btn btn-sm btn-primary" id="btn-new-submission">${c.upload} Nova Submissão</button>
      </div>
      ${n.length===0?`
        <div class="empty-state">
          ${c.fileText}
          <h3>Nenhuma submissão</h3>
          <p>Envie a primeira submissão para este projeto.</p>
        </div>
      `:`
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
              ${n.map(u=>{const g=u.fileUrl&&u.fileUrl.trim(),L=u.content&&u.content.trim();let k="—";return g&&L?k=`<a href="${l(u.fileUrl)}" target="_blank" rel="noopener">${c.download} Link</a>
                    <br><span style="color:var(--text-secondary);font-size:.85rem">${l(u.content.substring(0,100))}${u.content.length>100?"…":""}</span>`:g?k=`<a href="${l(u.fileUrl)}" target="_blank" rel="noopener">${l(u.fileUrl)}</a>`:L&&(k=`<span style="color:var(--text-secondary);font-size:.9rem">${l(u.content.substring(0,150))}${u.content.length>150?"…":""}</span>`),`
                <tr>
                  <td>${u.id}</td>
                  <td>${y(u.submitterUserId)}</td>
                  <td style="max-width:300px">${k}</td>
                  <td>${W(u.createdAt)}</td>
                  <td class="table-actions">
                    <button class="btn btn-sm btn-ghost btn-view-reviews" data-submission-id="${u.id}" title="Ver reviews">
                      ${c.star}
                    </button>
                  </td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;document.getElementById("page-content").innerHTML=h,document.querySelectorAll(".tab-item").forEach(u=>{u.addEventListener("click",()=>{document.querySelectorAll(".tab-item").forEach(L=>L.classList.remove("active")),u.classList.add("active");const g=u.dataset.tab;document.getElementById("tab-members").style.display=g==="members"?"":"none",document.getElementById("tab-submissions").style.display=g==="submissions"?"":"none"})});const S=document.getElementById("btn-edit-project");S&&S.addEventListener("click",()=>fe(o));const w=document.getElementById("btn-delete-project");w&&w.addEventListener("click",async()=>{if(await D({title:"Excluir Projeto",message:`Tem certeza que deseja excluir o projeto "${o.title}"? Esta ação não pode ser desfeita.`,confirmText:"Excluir",danger:!0}))try{await b.deleteProject(e),d("Projeto excluído com sucesso!","success"),E("/projects")}catch(g){d(g.message,"error")}});const O=document.getElementById("btn-add-member");O&&O.addEventListener("click",()=>ye(e)),document.querySelectorAll(".btn-remove-member").forEach(u=>{u.addEventListener("click",async()=>{const g=u.dataset.userId,L=u.dataset.userName||g;if(await D({title:"Remover Membro",message:`Remover ${L} do projeto?`,confirmText:"Remover",danger:!0}))try{await b.removeProjectMember(e,g),d("Membro removido!","success"),T({id:e})}catch(B){d(B.message,"error")}})});const V=document.getElementById("btn-new-submission");V&&V.addEventListener("click",()=>ge(e)),document.querySelectorAll(".btn-view-reviews").forEach(u=>{u.addEventListener("click",()=>{E(`/submissions/${u.dataset.submissionId}/reviews`)})})}function fe(e){const t=x({title:"Editar Projeto",body:`
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Título</label>
          <input class="form-input" id="edit-title" value="${l(e.title)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-input form-textarea" id="edit-desc">${l(e.description||"")}</textarea>
        </div>
      </form>
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-edit">Salvar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-edit").addEventListener("click",async()=>{const r=t.querySelector("#btn-save-edit");r.disabled=!0;try{await b.updateProject(e.id,{title:t.querySelector("#edit-title").value.trim(),description:t.querySelector("#edit-desc").value.trim(),courseId:e.courseId}),d("Projeto atualizado!","success"),t.remove(),T({id:e.id})}catch(s){d(s.message,"error"),r.disabled=!1}})}function ye(e){let t=null,r=null;const s=x({title:"Adicionar Membro",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-member" disabled>Adicionar</button>
    `}),a=s.querySelector("#member-search"),o=s.querySelector("#search-results"),i=s.querySelector("#selected-user"),n=s.querySelector("#selected-user-card"),m=s.querySelector("#btn-save-member");function v(y){var p;t=y,a.value="",o.style.display="none",n.innerHTML=`
      <div style="flex:1">
        <strong>${l(y.username)}</strong>
        <span style="color:var(--text-secondary);margin-left:.5rem">${l(y.email)}</span>
        ${(p=y.profile)!=null&&p.fullName?`<br><span style="color:var(--text-tertiary);font-size:.85rem">${l(y.profile.fullName)}</span>`:""}
      </div>
      ${N(y.role)}
      <button class="btn btn-sm btn-ghost" id="btn-clear-user" title="Remover seleção">${c.x}</button>
    `,i.style.display="",m.disabled=!1,s.querySelector("#btn-clear-user").addEventListener("click",()=>{t=null,i.style.display="none",m.disabled=!0,a.focus()})}a.addEventListener("input",()=>{clearTimeout(r);const y=a.value.trim();if(y.length<2){o.style.display="none";return}r=setTimeout(async()=>{try{const p=await b.searchUsers(y);p.length===0?o.innerHTML='<div style="padding:.75rem;color:var(--text-tertiary);text-align:center">Nenhum usuário encontrado</div>':(o.innerHTML=p.map(h=>{var S;return`
            <div class="search-result-item" data-user-id="${h.id}"
                 style="padding:.6rem .75rem;cursor:pointer;border-bottom:1px solid var(--border);
                        transition:background .15s">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
                <div>
                  <strong>${l(h.username)}</strong>
                  <span style="color:var(--text-secondary);font-size:.85rem;margin-left:.4rem">${l(h.email)}</span>
                  ${(S=h.profile)!=null&&S.fullName?`<br><span style="color:var(--text-tertiary);font-size:.8rem">${l(h.profile.fullName)}</span>`:""}
                </div>
                ${N(h.role)}
              </div>
            </div>
          `}).join(""),o.querySelectorAll(".search-result-item").forEach(h=>{h.addEventListener("mouseenter",()=>h.style.background="var(--bg-tertiary)"),h.addEventListener("mouseleave",()=>h.style.background=""),h.addEventListener("click",()=>{const S=Number(h.dataset.userId),w=p.find(O=>O.id===S);w&&v(w)})})),o.style.display=""}catch(p){o.innerHTML=`<div style="padding:.75rem;color:var(--danger)">${l(p.message)}</div>`,o.style.display=""}},300)}),s.addEventListener("click",y=>{!a.contains(y.target)&&!o.contains(y.target)&&(o.style.display="none")}),s.querySelector('[data-action="cancel"]').onclick=()=>s.remove(),m.addEventListener("click",async()=>{if(t){m.disabled=!0;try{await b.addProjectMember(e,{userId:t.id,roleInProject:s.querySelector("#member-role").value}),d(`${t.username} adicionado ao projeto!`,"success"),s.remove(),T({id:e})}catch(y){d(y.message,"error"),m.disabled=!1}}})}function ge(e){const t=x({title:"Nova Submissão",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-sub">Enviar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-sub").addEventListener("click",async()=>{const r=t.querySelector("#btn-save-sub"),s=t.querySelector("#sub-file-url").value.trim(),a=t.querySelector("#sub-content").value.trim();if(!s&&!a){d("Preencha pelo menos a URL ou o conteúdo de texto.","error");return}r.disabled=!0;try{await b.createSubmission(e,{projectId:Number(e),fileUrl:s||null,content:a||null}),d("Submissão enviada!","success"),t.remove(),T({id:e})}catch(o){d(o.message,"error"),r.disabled=!1}})}async function U({submissionId:e}){M("Reviews",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const t=I(),r=(t==null?void 0:t.role)||"",s=["ROLE_ADMIN","ROLE_PROF","ROLE_TA"].includes(r),a=["ROLE_PROF","ROLE_ADMIN"].includes(r);let o=[];try{o=await b.getSubmissionReviews(e)}catch(p){d(p.message,"error")}let i={};const n=[...new Set(o.map(p=>p.reviewerUserId).filter(Boolean))];if(n.length>0)try{(await b.getUsersByIds(n)).forEach(h=>{i[h.id]=h})}catch{}const m=p=>{const h=i[p];return h?`<strong>${l(h.fullName||h.username)}</strong><br><span style="color:var(--text-tertiary);font-size:.8rem">@${l(h.username)}</span>`:`#${p}`},v=`
    <div class="section-header">
      <div>
        <button class="btn btn-sm btn-ghost" onclick="history.back()" style="margin-bottom:.5rem">&larr; Voltar</button>
        <h2>Reviews da Submissão #${e}</h2>
      </div>
      ${s?`<button class="btn btn-primary" id="btn-new-review">${c.plus} Nova Review</button>`:""}
    </div>

    ${o.length===0?`
      <div class="empty-state">
        ${c.star}
        <h3>Nenhuma review</h3>
        <p>Esta submissão ainda não foi avaliada.</p>
      </div>
    `:`
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
            ${o.map(p=>`
              <tr>
                <td>${p.id}</td>
                <td>${m(p.reviewerUserId)}</td>
                <td>${l(p.comment||"—")}</td>
                <td>
                  ${p.score!=null?`
                    <div class="score-display">
                      <span class="score-value">${p.score}</span>
                      <span class="score-max">/ ${p.maxScore||100}</span>
                    </div>
                  `:"—"}
                </td>
                <td>${W(p.createdAt)}</td>
                <td class="table-actions">
                  ${s?`
                    <button class="btn btn-sm btn-ghost btn-edit-review" data-review-id="${p.id}" title="Editar">
                      ${c.edit}
                    </button>
                  `:""}
                  ${a?`
                    <button class="btn btn-sm btn-ghost btn-delete-review" data-review-id="${p.id}" title="Excluir">
                      ${c.trash}
                    </button>
                  `:""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}
  `;document.getElementById("page-content").innerHTML=v;const y=document.getElementById("btn-new-review");y&&y.addEventListener("click",()=>$e(e)),document.querySelectorAll(".btn-edit-review").forEach(p=>{p.addEventListener("click",async()=>{try{const h=await b.getReview(p.dataset.reviewId);we(h,e)}catch(h){d(h.message,"error")}})}),document.querySelectorAll(".btn-delete-review").forEach(p=>{p.addEventListener("click",async()=>{if(await D({title:"Excluir Review",message:"Tem certeza que deseja excluir esta review?",confirmText:"Excluir",danger:!0}))try{await b.deleteReview(p.dataset.reviewId),d("Review excluída!","success"),U({submissionId:e})}catch(S){d(S.message,"error")}})})}function $e(e){const t=x({title:"Nova Review",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-review">Salvar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-review").addEventListener("click",async()=>{const r=t.querySelector("#btn-save-review");r.disabled=!0;const s=t.querySelector("#review-score").value,a=t.querySelector("#review-max-score").value;try{await b.createReview({submissionId:Number(e),comment:t.querySelector("#review-comment").value.trim(),score:s?Number(s):null,maxScore:a?Number(a):100}),d("Review criada com sucesso!","success"),t.remove(),U({submissionId:e})}catch(o){d(o.message,"error"),r.disabled=!1}})}function we(e,t){const r=x({title:"Editar Review",body:`
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Comentário</label>
          <textarea class="form-input form-textarea" id="review-comment">${l(e.comment||"")}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nota</label>
            <input class="form-input" id="review-score" type="number" step="0.01" min="0" value="${e.score??""}" />
          </div>
          <div class="form-group">
            <label class="form-label">Nota Máxima</label>
            <input class="form-input" id="review-max-score" type="number" step="0.01" min="0" value="${e.maxScore??100}" />
          </div>
        </div>
      </form>
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-review">Salvar</button>
    `});r.querySelector('[data-action="cancel"]').onclick=()=>r.remove(),r.querySelector("#btn-save-review").addEventListener("click",async()=>{const s=r.querySelector("#btn-save-review");s.disabled=!0;const a=r.querySelector("#review-score").value,o=r.querySelector("#review-max-score").value;try{await b.updateReview(e.id,{submissionId:e.submissionId,comment:r.querySelector("#review-comment").value.trim(),score:a?Number(a):null,maxScore:o?Number(o):100}),d("Review atualizada!","success"),r.remove(),U({submissionId:t})}catch(i){d(i.message,"error"),s.disabled=!1}})}async function Ee(){M("Meu Perfil",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const e=I();let t=null;try{t=await b.getMyProfile()}catch{}const s=`
    <div class="profile-header">
      <div class="profile-avatar-lg">${Q((t==null?void 0:t.fullName)||(e==null?void 0:e.username))}</div>
      <div class="profile-info">
        <h2>${l((e==null?void 0:e.username)||"Usuário")}</h2>
        <p>${N(e==null?void 0:e.role)}</p>
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
            <input class="form-input" id="profile-fullname" value="${l((t==null?void 0:t.fullName)||"")}" placeholder="Seu nome completo" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-input" id="profile-phone" value="${l((t==null?void 0:t.phone)||"")}" placeholder="(11) 99999-0000" />
            </div>
            <div class="form-group">
              <label class="form-label">Afiliação</label>
              <input class="form-input" id="profile-affiliation" value="${l((t==null?void 0:t.affiliation)||"")}" placeholder="Universidade / Instituição" />
            </div>
          </div>
        </form>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" id="btn-save-profile">Salvar Alterações</button>
      </div>
    </div>
  `;document.getElementById("page-content").innerHTML=s,document.getElementById("btn-save-profile").addEventListener("click",async()=>{const a=document.getElementById("btn-save-profile");a.disabled=!0,a.innerHTML='<span class="spinner"></span> Salvando...';try{const o=await b.updateMyProfile({fullName:document.getElementById("profile-fullname").value.trim(),phone:document.getElementById("profile-phone").value.trim(),affiliation:document.getElementById("profile-affiliation").value.trim()}),i=I();i.profile=o,_(i),d("Perfil atualizado com sucesso!","success"),a.disabled=!1,a.textContent="Salvar Alterações"}catch(o){d(o.message,"error"),a.disabled=!1,a.textContent="Salvar Alterações"}})}async function C(){M("Usuários",'<div class="loading-center"><div class="spinner spinner-lg"></div></div>');const e=I(),t=(e==null?void 0:e.role)==="ROLE_ADMIN";let r=[];try{r=await b.getUsers()}catch(n){d(n.message,"error")}const s=`
    <div class="section-header">
      <h2>Gerenciar Usuários</h2>
      ${t?`
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn btn-primary" id="btn-add-user">${c.plus} Adicionar Usuário</button>
          <button class="btn btn-secondary" id="btn-import-csv">${c.upload||"⬆"} Importar CSV</button>
        </div>
      `:""}
    </div>

    <div class="toolbar">
      <input class="form-input search-input" type="text" placeholder="Buscar por nome, e-mail ou usuário..." id="search-users" />
    </div>

    ${r.length===0?`
      <div class="empty-state">
        ${c.users}
        <h3>Nenhum usuário</h3>
      </div>
    `:`
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
            ${r.map(n=>{var m,v;return`
              <tr data-search="${(n.username+" "+n.email+" "+(((m=n.profile)==null?void 0:m.fullName)||"")).toLowerCase()}">
                <td>${n.id}</td>
                <td><strong>${l(n.username)}</strong></td>
                <td>${l(n.email)}</td>
                <td>${N(n.role)}</td>
                <td>${(v=n.profile)!=null&&v.fullName?l(n.profile.fullName):'<span style="color:var(--text-tertiary)">—</span>'}</td>
                <td class="table-actions">
                  <button class="btn btn-sm btn-ghost btn-change-role" data-user-id="${n.id}" data-username="${l(n.username)}" data-role="${n.role}" title="Alterar papel">
                    ${c.settings}
                  </button>
                  <button class="btn btn-sm btn-ghost btn-edit-user" data-user-id="${n.id}" title="Editar perfil">
                    ${c.edit}
                  </button>
                </td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    `}
  `;document.getElementById("page-content").innerHTML=s;const a=document.getElementById("search-users");a&&a.addEventListener("input",n=>{const m=n.target.value.toLowerCase();document.querySelectorAll("#users-table tbody tr").forEach(v=>{v.style.display=v.dataset.search.includes(m)?"":"none"})}),document.querySelectorAll(".btn-change-role").forEach(n=>{n.addEventListener("click",()=>{xe(n.dataset.userId,n.dataset.username,n.dataset.role)})}),document.querySelectorAll(".btn-edit-user").forEach(n=>{n.addEventListener("click",async()=>{const m=n.dataset.userId;try{const v=await b.getUser(m);Se(v)}catch(v){d(v.message,"error")}})});const o=document.getElementById("btn-add-user");o&&o.addEventListener("click",()=>Le());const i=document.getElementById("btn-import-csv");i&&i.addEventListener("click",()=>je())}function xe(e,t,r){const s=["ROLE_ADMIN","ROLE_PROF","ROLE_TA","ROLE_STUDENT"],a=x({title:`Alterar Papel — ${t}`,body:`
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Papel atual</label>
          <div style="margin-bottom:.75rem">${N(r)}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Novo papel</label>
          <select class="form-input form-select" id="new-role">
            ${s.map(o=>`
              <option value="${o}" ${o===r?"selected":""}>${R(o)}</option>
            `).join("")}
          </select>
        </div>
      </form>
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-role">Salvar</button>
    `});a.querySelector('[data-action="cancel"]').onclick=()=>a.remove(),a.querySelector("#btn-save-role").addEventListener("click",async()=>{const o=a.querySelector("#btn-save-role"),i=a.querySelector("#new-role").value;if(i===r){a.remove();return}o.disabled=!0;try{await b.updateUserRole(e,i),d(`Papel de ${t} alterado para ${R(i)}!`,"success"),a.remove(),C()}catch(n){d(n.message,"error"),o.disabled=!1}})}function Se(e){var r,s,a;const t=x({title:`Editar Perfil — ${e.username}`,body:`
      <form class="auth-form">
        <div class="form-group">
          <label class="form-label">Nome Completo</label>
          <input class="form-input" id="edit-fullname" value="${l(((r=e.profile)==null?void 0:r.fullName)||"")}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input class="form-input" id="edit-phone" value="${l(((s=e.profile)==null?void 0:s.phone)||"")}" />
          </div>
          <div class="form-group">
            <label class="form-label">Afiliação</label>
            <input class="form-input" id="edit-affiliation" value="${l(((a=e.profile)==null?void 0:a.affiliation)||"")}" />
          </div>
        </div>
      </form>
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-user">Salvar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-user").addEventListener("click",async()=>{const o=t.querySelector("#btn-save-user");o.disabled=!0;try{await b.updateUser(e.id,{fullName:t.querySelector("#edit-fullname").value.trim(),phone:t.querySelector("#edit-phone").value.trim(),affiliation:t.querySelector("#edit-affiliation").value.trim()}),d("Perfil atualizado!","success"),t.remove(),C()}catch(i){d(i.message,"error"),o.disabled=!1}})}function Le(){const t=x({title:"Adicionar Usuário",body:`
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
            ${["ROLE_STUDENT","ROLE_TA","ROLE_PROF","ROLE_ADMIN"].map(r=>`<option value="${r}">${R(r)}</option>`).join("")}
          </select>
        </div>
      </form>
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-new-user">Criar</button>
    `});t.querySelector('[data-action="cancel"]').onclick=()=>t.remove(),t.querySelector("#btn-save-new-user").addEventListener("click",async()=>{const r=t.querySelector("#btn-save-new-user"),s=t.querySelector("#new-username").value.trim(),a=t.querySelector("#new-email").value.trim(),o=t.querySelector("#new-password").value,i=t.querySelector("#new-role").value;if(!s||!a||!o){d("Preencha todos os campos obrigatórios.","error");return}if(o.length<6){d("A senha deve ter pelo menos 6 caracteres.","error");return}r.disabled=!0;try{await b.createUser({username:s,email:a,password:o,role:i}),d(`Usuário "${s}" criado com sucesso!`,"success"),t.remove(),C()}catch(n){d(n.message,"error"),r.disabled=!1}})}function je(){const e=x({title:"Importar Usuários via CSV",body:`
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
    `,footer:`
      <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-run-import" disabled>Importar</button>
    `});e.querySelector('[data-action="cancel"]').onclick=()=>e.remove();let t=[];e.querySelector("#btn-download-sample").addEventListener("click",()=>{const r=`username,email,password,role
jsilva,joao.silva@uni.br,senha123,ROLE_STUDENT
maria,maria.souza@uni.br,senha456,ROLE_TA
profa.ana,ana.prof@uni.br,prof789,ROLE_PROF
`,s=new Blob([r],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(s),o=document.createElement("a");o.href=a,o.download="labflow_usuarios_exemplo.csv",o.click(),URL.revokeObjectURL(a)}),e.querySelector("#csv-file-input").addEventListener("change",r=>{const s=r.target.files[0];if(!s)return;const a=new FileReader;a.onload=o=>{const i=o.target.result;if(t=Ie(i),t.length===0){d("Nenhum registro encontrado no CSV.","error"),e.querySelector("#btn-run-import").disabled=!0;return}const n=e.querySelector("#csv-preview");n.style.display="block";const m=e.querySelector("#csv-preview-content");m.innerHTML=`
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
            ${t.map(v=>`
              <tr>
                <td style="padding:2px 6px">${l(v.username||"")}</td>
                <td style="padding:2px 6px">${l(v.email||"")}</td>
                <td style="padding:2px 6px">${v.password?"••••":'<em style="color:var(--text-tertiary)">auto</em>'}</td>
                <td style="padding:2px 6px">${l(v.role||"ROLE_STUDENT")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="margin:.5rem 0 0;font-size:.78rem;color:var(--text-tertiary)">${t.length} registro(s) encontrado(s)</p>
      `,e.querySelector("#btn-run-import").disabled=!1},a.readAsText(s)}),e.querySelector("#btn-run-import").addEventListener("click",async()=>{const r=e.querySelector("#btn-run-import");r.disabled=!0,r.textContent="Importando...";try{const s=await b.importUsers(t),a=s.filter(i=>i.success).length,o=s.filter(i=>!i.success).length;if(e.remove(),o===0)d(`${a} usuário(s) importado(s) com sucesso!`,"success");else{const i=x({title:"Resultado da Importação",body:`
            <p style="margin-bottom:.75rem">
              <strong style="color:var(--success)">${a} sucesso</strong> · 
              <strong style="color:var(--error)">${o} erro(s)</strong>
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
                  ${s.map(n=>`
                    <tr style="border-bottom:1px solid var(--border)">
                      <td style="padding:4px 8px">${l(n.username||"—")}</td>
                      <td style="padding:4px 8px">${n.success?'<span style="color:var(--success)">✓</span>':'<span style="color:var(--error)">✗</span>'}</td>
                      <td style="padding:4px 8px;font-size:.8rem">${l(n.message||"")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `,footer:'<button class="btn btn-primary" data-action="cancel">Fechar</button>'});i.querySelector('[data-action="cancel"]').onclick=()=>i.remove()}C()}catch(s){d(s.message,"error"),r.disabled=!1,r.textContent="Importar"}})}function Ie(e){const t=e.split(/\r?\n/).filter(n=>n.trim());if(t.length<2)return[];const r=t[0].toLowerCase(),s=r.includes(";")?";":",",a=r.split(s).map(n=>n.trim().replace(/^"(.*)"$/,"$1")),o={username:a.indexOf("username"),email:a.indexOf("email"),password:a.indexOf("password"),role:a.indexOf("role")};if(o.username===-1)return d('Coluna "username" não encontrada no CSV.',"error"),[];const i=[];for(let n=1;n<t.length;n++){const m=t[n].split(s).map(y=>y.trim().replace(/^"(.*)"$/,"$1")),v=m[o.username]||"";v&&i.push({username:v,email:o.email!==-1&&m[o.email]||"",password:o.password!==-1&&m[o.password]||"",role:o.role!==-1&&m[o.role]||""})}return i}ie();function P(e){return t=>{if(!A()){E("/login");return}e(t)}}function ae(e){return t=>{if(A()){E("/dashboard");return}e(t)}}j("/login",ae(ue));j("/register",ae(me));j("/dashboard",P(pe));j("/courses",P(ee));j("/courses/:id",P(te));j("/projects",P(he));j("/projects/:id",P(T));j("/submissions/:submissionId/reviews",P(U));j("/profile",P(Ee));j("/users",P(C));j("/",()=>{E(A()?"/dashboard":"/login")});le(()=>{E(A()?"/dashboard":"/login")});de();
