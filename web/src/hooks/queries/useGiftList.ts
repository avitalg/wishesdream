import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

export function useGiftList(publicId: string | undefined) {
  return useQuery({
    queryKey: listKeys.detail(publicId ?? ''),
    queryFn: () => api.getList(publicId!),
    enabled: Boolean(publicId),
  });
}
