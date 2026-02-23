// ─── API Configuration ───
const API_BASE = '';  // Same origin — NGINX proxy handles routing

const SERVICES = {
  auth:    '/api',
  project: '/api',
  review:  '/api',
};

// ─── Token Management ───
export function getToken() {
  return localStorage.getItem('labflow_token');
}

export function setToken(token, expiresIn) {
  localStorage.setItem('labflow_token', token);
  if (expiresIn) {
    // expiresIn comes in seconds from backend, convert to ms
    localStorage.setItem('labflow_token_exp', Date.now() + expiresIn * 1000);
  }
}

export function removeToken() {
  localStorage.removeItem('labflow_token');
  localStorage.removeItem('labflow_token_exp');
  localStorage.removeItem('labflow_user');
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  const exp = localStorage.getItem('labflow_token_exp');
  if (exp && Date.now() > Number(exp)) {
    removeToken();
    return false;
  }
  return true;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('labflow_user'));
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem('labflow_user', JSON.stringify(user));
}

// ─── JWT Decode (simple base64) ───
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ─── HTTP Client ───
async function request(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  // Only set Content-Type for requests with body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error('Erro de conexão com o servidor. Verifique sua rede.');
  }

  if (response.status === 401) {
    removeToken();
    window.location.hash = '#/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (response.status === 403) {
    throw new Error('Acesso negado. Você não tem permissão para esta ação.');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Erro ${response.status}`);
  }

  return data;
}

// ─── API Methods ───

// Auth
export const api = {
  // Auth
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Profile
  getMyProfile: () => request('/api/profiles/me'),
  getProfileByUserId: (userId) => request(`/api/profiles/${userId}`),
  updateMyProfile: (body) => request('/api/profiles/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Users (admin)
  getUsers: () => request('/api/users'),
  getUser: (id) => request(`/api/users/${id}`),
  updateUser: (id, body) => request(`/api/users/${id}/profile`, { method: 'PUT', body: JSON.stringify(body) }),
  updateUserRole: (id, role) => request(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  searchUsers: (q) => request(`/api/users/search?q=${encodeURIComponent(q)}`),
  getUsersByIds: (ids) => request(`/api/users/batch?ids=${ids.join(',')}`),
  createUser: (body) => request('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  importUsers: (body) => request('/api/users/import', { method: 'POST', body: JSON.stringify(body) }),

  // Courses
  getCourses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/courses${qs ? '?' + qs : ''}`);
  },
  getCourse: (id) => request(`/api/courses/${id}`),
  createCourse: (body) => request('/api/courses', { method: 'POST', body: JSON.stringify(body) }),
  updateCourse: (id, body) => request(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),
  getCourseProjects: (courseId) => request(`/api/courses/${courseId}/projects`),
  createCourseProject: (courseId, body) =>
    request(`/api/courses/${courseId}/projects`, { method: 'POST', body: JSON.stringify(body) }),

  // Projects
  getProject: (id) => request(`/api/projects/${id}`),
  getMyProjects: () => request('/api/projects/my'),
  updateProject: (id, body) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  // Project Members
  getProjectMembers: (projectId) => request(`/api/projects/${projectId}/members`),
  addProjectMember: (projectId, body) =>
    request(`/api/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(body) }),
  removeProjectMember: (projectId, userId) =>
    request(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),

  // Submissions
  getProjectSubmissions: (projectId) => request(`/api/projects/${projectId}/submissions`),
  createSubmission: (projectId, body) =>
    request(`/api/projects/${projectId}/submissions`, { method: 'POST', body: JSON.stringify(body) }),

  // Reviews
  getSubmissionReviews: (submissionId) => request(`/api/submissions/${submissionId}/reviews`),
  getReview: (id) => request(`/api/reviews/${id}`),
  createReview: (body) => request('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),
  updateReview: (id, body) => request(`/api/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
};
