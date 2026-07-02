export interface User {
  id: number;
  email: string;
  name: string;
}

export interface GiftListSummary {
  id: string;
  title: string;
  created_at: string;
  is_creator?: boolean;
}

export interface GuestItem {
  id: number;
  title: string;
  image_url: string | null;
  price: string | null;
  product_url: string;
  is_claimed: boolean;
  claimed_by_you: boolean;
}

export interface CreatorItem extends GuestItem {
  guest_name: string | null;
}

export type GiftItem = GuestItem | CreatorItem;

export function isCreatorItem(item: GiftItem): item is CreatorItem {
  return 'guest_name' in item;
}

export interface ParsedProduct {
  title: string;
  image_url: string | null;
  price: string | null;
}

export interface ExportRow {
  item_number: number;
  title: string;
  price: string | null;
  product_url: string;
  status: string;
  guest_name: string | null;
  claimed_at: string | null;
}
