export const INDEXABLE_PATHS = [
  '/',
  '/how-it-works',
  '/faq',
  '/privacy',
  '/cookies',
  '/sitemap',
  '/gift-registry',
  '/baby-shower-registry',
  '/birthday-wish-list',
  '/blog',
  '/blog/gift-list',
  '/blog/wishlist',
  '/he/blog',
  '/he/blog/gift-list',
  '/he/blog/wishlist',
  '/compare',
] as const;

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
