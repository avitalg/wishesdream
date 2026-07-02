export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export interface GiftList {
  id: number;
  public_id: string;
  title: string;
  creator_id: number;
  created_at: string;
}

export interface GiftItem {
  id: number;
  list_id: number;
  title: string;
  image_url: string | null;
  price: string | null;
  product_url: string;
  sort_order: number;
  created_at: string;
}

export interface Claim {
  id: number;
  item_id: number;
  guest_name: string;
  guest_token: string;
  claimed_at: string;
}

export interface GiftItemWithClaim extends GiftItem {
  claim_id: number | null;
  guest_name: string | null;
  guest_token: string | null;
  claimed_at: string | null;
}

export interface GuestItemRow {
  id: number;
  title: string;
  image_url: string | null;
  price: string | null;
  product_url: string;
  is_claimed: number;
  claimed_by_you: number;
}

export type ViewerRole = 'creator' | 'self' | 'guest';

export interface GuestClaimPayload {
  id: number;
  title: string;
  image_url: string | null;
  price: string | null;
  product_url: string;
  is_claimed: boolean;
  claimed_by_you: boolean;
}

export interface CreatorClaimPayload extends GuestClaimPayload {
  guest_name: string | null;
}

export interface AuthPayload {
  userId: number;
  email: string;
}
