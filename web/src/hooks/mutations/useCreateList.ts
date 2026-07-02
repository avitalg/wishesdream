import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => api.createList(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.mine() });
    },
  });
}
