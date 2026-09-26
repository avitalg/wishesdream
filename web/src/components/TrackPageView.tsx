import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackGaPageView } from '../lib/googleAnalytics.js';

export function TrackPageView() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackGaPageView(pathname);
  }, [pathname]);

  return null;
}
