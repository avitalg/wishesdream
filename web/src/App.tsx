import { lazy, Suspense, useLayoutEffect, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollToTop } from './components/ScrollToTop.js';
import { TrackPageView } from './components/TrackPageView.js';
import { Layout } from './components/Layout.js';
import { AuthProvider } from './context/AuthProvider.js';
import { isHebrewBlogPath } from './content/blog.js';
import i18n, { ensureHebrewResources } from './i18n/index.js';
import { HomePage } from './pages/HomePage.js';

function lazyPage<P extends object>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  name: string,
) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}

function lazyQueriedPage<P extends object>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  name: string,
) {
  return lazy(async () => {
    const [pageModule, { QueryBoundary }] = await Promise.all([
      loader(),
      import('./components/QueryBoundary.js'),
    ]);
    const Page = pageModule[name];

    return {
      default: function QueriedPage(props: P) {
        return (
          <QueryBoundary>
            <Page {...props} />
          </QueryBoundary>
        );
      },
    };
  });
}

const DevQueryTools = import.meta.env.DEV
  ? lazy(() => import('./components/DevQueryTools.js'))
  : null;

const HowItWorksPage = lazyPage(() => import('./pages/HowItWorksPage.js'), 'HowItWorksPage');
const PrivacyPage = lazyPage(() => import('./pages/PrivacyPage.js'), 'PrivacyPage');
const CookiePolicyPage = lazyPage(() => import('./pages/CookiePolicyPage.js'), 'CookiePolicyPage');
const SitemapPage = lazyPage(() => import('./pages/SitemapPage.js'), 'SitemapPage');
const FaqPage = lazyPage(() => import('./pages/FaqPage.js'), 'FaqPage');
const GiftRegistryPage = lazyPage(() => import('./pages/GiftRegistryPage.js'), 'GiftRegistryPage');
const BabyShowerRegistryPage = lazyPage(
  () => import('./pages/BabyShowerRegistryPage.js'),
  'BabyShowerRegistryPage',
);
const BirthdayWishListPage = lazyPage(
  () => import('./pages/BirthdayWishListPage.js'),
  'BirthdayWishListPage',
);
const ComparePage = lazyPage(() => import('./pages/ComparePage.js'), 'ComparePage');
const BlogPage = lazyPage(() => import('./pages/BlogPage.js'), 'BlogPage');
const BlogArticlePage = lazyPage(() => import('./pages/BlogArticlePage.js'), 'BlogArticlePage');
const LoginPage = lazyPage(() => import('./pages/LoginPage.js'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/RegisterPage.js'), 'RegisterPage');
const DashboardPage = lazyQueriedPage(() => import('./pages/DashboardPage.js'), 'DashboardPage');
const CreatorManagePage = lazyQueriedPage(
  () => import('./pages/CreatorManagePage.js'),
  'CreatorManagePage',
);
const PublicListPage = lazyQueriedPage(() => import('./pages/PublicListPage.js'), 'PublicListPage');
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage.js'), 'NotFoundPage');

function RouteFallback() {
  const { t } = useTranslation();

  return (
    <Layout>
      <p className="loading-text content-page">{t('common.loading')}</p>
    </Layout>
  );
}

function HebrewBlogLanguage() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (isHebrewBlogPath(pathname) && !i18n.language.startsWith('he')) {
      void ensureHebrewResources().then(() => i18n.changeLanguage('he'));
    }
  }, [pathname]);

  return null;
}

function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <TrackPageView />
        <HebrewBlogLanguage />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/gift-registry" element={<GiftRegistryPage />} />
            <Route path="/baby-shower-registry" element={<BabyShowerRegistryPage />} />
            <Route path="/birthday-wish-list" element={<BirthdayWishListPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/he/blog" element={<BlogPage locale="he" />} />
            <Route path="/he/blog/:slug" element={<BlogArticlePage locale="he" />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lists/:listId/manage" element={<CreatorManagePage />} />
            <Route path="/lists/:listId" element={<PublicListPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

function MaybeDevQueryTools({ children }: { children: ReactNode }) {
  if (!DevQueryTools) {
    return children;
  }

  return (
    <Suspense fallback={null}>
      <DevQueryTools>{children}</DevQueryTools>
    </Suspense>
  );
}

export default function App() {
  return (
    <MaybeDevQueryTools>
      <AppRoutes />
    </MaybeDevQueryTools>
  );
}
