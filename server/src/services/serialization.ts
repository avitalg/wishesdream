import type {
  CreatorClaimPayload,
  GiftItemWithClaim,
  GuestClaimPayload,
  GuestItemRow,
} from '../types/index.js';

export function mapGuestItemRow(row: GuestItemRow): GuestClaimPayload {
  return {
    id: row.id,
    title: row.title,
    image_url: row.image_url,
    price: row.price,
    product_url: row.product_url,
    is_claimed: row.is_claimed === 1,
    claimed_by_you: row.claimed_by_you === 1,
  };
}

export function mapGuestItemRows(rows: GuestItemRow[]): GuestClaimPayload[] {
  return rows.map(mapGuestItemRow);
}

export function mapCreatorItem(item: GiftItemWithClaim): CreatorClaimPayload {
  return {
    id: item.id,
    title: item.title,
    image_url: item.image_url,
    price: item.price,
    product_url: item.product_url,
    is_claimed: item.claim_id !== null,
    claimed_by_you: false,
    guest_name: item.guest_name,
  };
}

export function mapCreatorItems(items: GiftItemWithClaim[]): CreatorClaimPayload[] {
  return items.map(mapCreatorItem);
}
