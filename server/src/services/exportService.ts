import type { GiftItemWithClaim } from '../types/index.js';
import { getCreatorItemsForList } from './listService.js';

export function mapItemsToExportRows(items: GiftItemWithClaim[]) {
  return items.map((item, index) => ({
    item_number: index + 1,
    title: item.title,
    price: item.price,
    product_url: item.product_url,
    status: item.claim_id ? 'Claimed' : 'Available',
    guest_name: item.guest_name,
    claimed_at: item.claimed_at,
  }));
}

export function buildExportRows(listId: number) {
  return mapItemsToExportRows(getCreatorItemsForList(listId));
}
