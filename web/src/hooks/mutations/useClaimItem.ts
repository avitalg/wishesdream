import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setGuestToken } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface ClaimItemInput {
  publicId: string;
  item_id: number;
  guest_name: string;
  guest_token?: string;
  on_behalf?: boolean;
}

export function useClaimItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, ...payload }: ClaimItemInput) => api.claimItem(publicId, payload),
    onSuccess: (data, variables) => {
      if (!variables.on_behalf) {
        setGuestToken(data.claim.guest_token);
      }

      queryClient.setQueryData(listKeys.detail(variables.publicId), (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          items: data.items,
        };
      });
    },
  });
}
