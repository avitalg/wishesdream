import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface AddItemInput {
  publicId: string;
  productUrl: string;
  title?: string;
  imageUrl?: string | null;
  price?: string | null;
}

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, productUrl, title, imageUrl, price }: AddItemInput) =>
      api.addItem(publicId, {
        product_url: productUrl,
        title,
        image_url: imageUrl,
        price,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listKeys.detailPrefix(variables.publicId) });
    },
  });
}
