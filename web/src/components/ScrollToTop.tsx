import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;

    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('.site-footer')) {
      active.blur();
    }

    window.scrollTo(0, 0);
  }, [pathname, key, navigationType]);

  return null;
}
