const DEFAULT_MEASUREMENT_ID = 'G-S6N20L9X1C';
const LOAD_AFTER_MS = 8000;

declare global {
  interface Window {
    dataLayer?: Array<IArguments | unknown[]>;
    gtag?: (...args: unknown[]) => void;
  }
}

function measurementId(): string {
  return (
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
    DEFAULT_MEASUREMENT_ID
  );
}

let scriptRequested = false;

function loadGoogleAnalyticsScript(id: string): void {
  if (scriptRequested) {
    return;
  }

  scriptRequested = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.fetchPriority = 'low';
  document.head.appendChild(script);
}

export function initGoogleAnalytics(): void {
  if (import.meta.env.DEV) {
    return;
  }

  const id = measurementId();
  if (!id) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];

  window.gtag = function gtag() {
    // The gtag snippet queues an Arguments object. A rest array is ignored.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });

  const events = ['pointerdown', 'keydown', 'touchstart'] as const;

  const start = () => {
    loadGoogleAnalyticsScript(id);
    for (const event of events) {
      window.removeEventListener(event, start);
    }
  };

  for (const event of events) {
    window.addEventListener(event, start, { passive: true });
  }

  const scheduleFallback = () => {
    window.setTimeout(start, LOAD_AFTER_MS);
  };

  if (document.readyState === 'complete') {
    scheduleFallback();
    return;
  }

  window.addEventListener('load', scheduleFallback, { once: true });
}

export function trackGaPageView(pagePath: string): void {
  trackGaEvent('page_view', { page_path: pagePath });
}

export function trackGaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (import.meta.env.DEV || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}
