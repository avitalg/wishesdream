import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { i18nReady } from './i18n/index.js';
import './styles/index.css';
import { initGoogleAnalytics } from './lib/googleAnalytics.js';
import App from './App.tsx';

void i18nReady.then(() => {
  initGoogleAnalytics();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
