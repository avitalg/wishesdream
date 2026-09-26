import { useLayoutEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop.js';
import { TrackPageView } from './components/TrackPageView.js';
import { AuthProvider } from './context/AuthProvider.js';
import { isHebrewBlogPath } from './content/blog.js';
import { queryClient } from './lib/queryClient.js';
import i18n from './i18n/index.js';
import { HomePage } from './pages/HomePage.js';
import { HowItWorksPage } from './pages/HowItWorksPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { CookiePolicyPage } from './pages/CookiePolicyPage.js';
import { SitemapPage } from './pages/SitemapPage.js';
import { FaqPage } from './pages/FaqPage.js';
import { GiftRegistryPage } from './pages/GiftRegistryPage.js';
import { BabyShowerRegistryPage } from './pages/BabyShowerRegistryPage.js';
import { BirthdayWishListPage } from './pages/BirthdayWishListPage.js';
import { ComparePage } from './pages/ComparePage.js';
import { BlogPage } from './pages/BlogPage.js';
import { BlogArticlePage } from './pages/BlogArticlePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CreatorManagePage } from './pages/CreatorManagePage.js';
import { PublicListPage } from './pages/PublicListPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

function HebrewBlogLanguage() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (isHebrewBlogPath(pathname) && !i18n.language.startsWith('he')) {
      void i18n.changeLanguage('he');
    }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <TrackPageView />
          <HebrewBlogLanguage />
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
        </BrowserRouter>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
