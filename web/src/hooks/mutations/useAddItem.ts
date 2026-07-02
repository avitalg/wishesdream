import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface AddItemInput {
  publicId: string;
  productUrl: string;
}

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, productUrl }: AddItemInput) => api.addItem(publicId, productUrl),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(variables.publicId) });
    },
  });
}
