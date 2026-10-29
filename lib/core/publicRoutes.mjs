export const PUBLIC_ROUTES = new Set(['/', '/privacy', '/tos', '/changelog', '/download']);

export function isPublicRoute(path) {
  const pathname = path.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  return PUBLIC_ROUTES.has(pathname);
}
