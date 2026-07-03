import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface UseGiftListOptions {
  viewAsGuest?: boolean;
}

export function useGiftList(publicId: string | undefined, options?: UseGiftListOptions) {
  const view = options?.viewAsGuest ? 'guest' : undefined;

  return useQuery({
    queryKey: listKeys.detail(publicId ?? '', view),
    queryFn: () => api.getList(publicId!, { viewAsGuest: options?.viewAsGuest }),
    enabled: Boolean(publicId),
  });
}
