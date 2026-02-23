// ─── Simple Hash Router ───
const routes = [];
let notFoundHandler = null;

export function addRoute(pattern, handler) {
  // Convert '/courses/:id' → regex with named groups
  const keys = [];
  const regex = new RegExp(
    '^' +
    pattern
      .replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      }) +
    '$'
  );
  routes.push({ regex, keys, handler });
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

export function getPath() {
  return window.location.hash.slice(1) || '/';
}

function matchRoute(path) {
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      return { handler: route.handler, params };
    }
  }
  return null;
}

export function resolveRoute() {
  const path = getPath();
  const result = matchRoute(path);
  if (result) {
    result.handler(result.params);
  } else if (notFoundHandler) {
    notFoundHandler();
  }
}

export function startRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
