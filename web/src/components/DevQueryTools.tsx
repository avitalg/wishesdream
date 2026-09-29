import type { ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryBoundary } from './QueryBoundary.js';

export default function DevQueryTools({ children }: { children: ReactNode }) {
  return (
    <QueryBoundary>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryBoundary>
  );
}
