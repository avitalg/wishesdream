import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface DeleteItemInput {
  publicId: string;
  itemId: number;
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, itemId }: DeleteItemInput) => api.deleteItem(publicId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(variables.publicId) });
    },
  });
}
