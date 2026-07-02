import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface UnclaimItemInput {
  publicId: string;
  itemId: number;
}

export function useUnclaimItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, itemId }: UnclaimItemInput) => api.unclaimItem(publicId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(variables.publicId) });
    },
  });
}
