import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ensureGuestToken, setGuestToken } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface ClaimItemInput {
  publicId: string;
  item_id: number;
  guest_name: string;
  guest_token?: string;
  on_behalf?: boolean;
  viewAsGuest?: boolean;
}

export function useClaimItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, on_behalf, guest_token, ...payload }: ClaimItemInput) =>
      api.claimItem(publicId, {
        ...payload,
        on_behalf,
        guest_token: on_behalf ? guest_token : (guest_token ?? ensureGuestToken()),
      }),
    onSuccess: (data, variables) => {
      if (!variables.on_behalf) {
        setGuestToken(data.claim.guest_token);
      }

      const view = variables.viewAsGuest ? 'guest' : undefined;
      queryClient.setQueryData(listKeys.detail(variables.publicId, view), (current) => {
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
