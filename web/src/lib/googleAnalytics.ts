const DEFAULT_MEASUREMENT_ID = 'G-S6N20L9X1C';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initGoogleAnalytics(): void {
  if (import.meta.env.DEV) {
    return;
  }

  const measurementId =
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
    DEFAULT_MEASUREMENT_ID;

  if (!measurementId) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];

  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}
