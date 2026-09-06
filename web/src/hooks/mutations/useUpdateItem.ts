import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';

interface UpdateItemInput {
  publicId: string;
  itemId: number;
  productUrl: string;
  title: string;
  imageUrl?: string | null;
  price?: string | null;
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, itemId, productUrl, title, imageUrl, price }: UpdateItemInput) =>
      api.updateItem(publicId, itemId, {
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
