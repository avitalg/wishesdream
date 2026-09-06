export const INDEXABLE_PATHS = ['/', '/how-it-works', '/faq', '/privacy', '/cookies'] as const;

export const DISALLOWED_PATHS = ['/dashboard', '/login', '/register', '/lists/'] as const;

const EXACT_CLIENT_ROUTES = new Set([
  ...INDEXABLE_PATHS,
  '/login',
  '/register',
  '/dashboard',
]);

export function isKnownClientRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (EXACT_CLIENT_ROUTES.has(normalized)) {
    return true;
  }

  if (/^\/lists\/[^/]+\/manage$/.test(normalized)) {
    return true;
  }

  if (/^\/lists\/[^/]+$/.test(normalized)) {
    return true;
  }

  return false;
}
