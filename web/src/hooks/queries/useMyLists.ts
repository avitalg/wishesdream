import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

export function useMyLists(enabled = true) {
  return useQuery({
    queryKey: listKeys.mine(),
    queryFn: () => api.getMyLists(),
    enabled,
    select: (data) => data.lists,
  });
}
