import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/client.js';

export function useParseUrl() {
  return useMutation({
    mutationFn: (url: string) => api.parseUrl(url),
  });
}
