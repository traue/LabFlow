import { isAuthenticated } from './api.js';
import { initTheme } from './ui.js';
import { addRoute, setNotFound, startRouter, navigate } from './router.js';

// Views
import { renderLogin, renderRegister } from './views/auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderCourses, renderCourseDetail } from './views/courses.js';
import { renderProjects, renderProjectDetail } from './views/projects.js';
import { renderSubmissionReviews } from './views/reviews.js';
import { renderProfile } from './views/profile.js';
import { renderUsers } from './views/users.js';

// ─── Init ───
initTheme();

// ─── Auth Guard ───
function requireAuth(handler) {
  return (params) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    handler(params);
  };
}

function guestOnly(handler) {
  return (params) => {
    if (isAuthenticated()) {
      navigate('/dashboard');
      return;
    }
    handler(params);
  };
}

// ─── Routes ───
addRoute('/login', guestOnly(renderLogin));
addRoute('/register', guestOnly(renderRegister));
addRoute('/dashboard', requireAuth(renderDashboard));
addRoute('/courses', requireAuth(renderCourses));
addRoute('/courses/:id', requireAuth(renderCourseDetail));
addRoute('/projects', requireAuth(renderProjects));
addRoute('/projects/:id', requireAuth(renderProjectDetail));
addRoute('/submissions/:submissionId/reviews', requireAuth(renderSubmissionReviews));
addRoute('/profile', requireAuth(renderProfile));
addRoute('/users', requireAuth(renderUsers));

addRoute('/', () => {
  navigate(isAuthenticated() ? '/dashboard' : '/login');
});

setNotFound(() => {
  navigate(isAuthenticated() ? '/dashboard' : '/login');
});

// ─── Start ───
startRouter();
