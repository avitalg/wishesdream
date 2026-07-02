import type { CreatorClaimPayload, GuestClaimPayload, GuestItemRow, GiftItem, GiftItemWithClaim, GiftList, User } from '../types/index.js';
import { stmts } from '../db/queries.js';
import { mapCreatorItems, mapGuestItemRows } from './serialization.js';
import { v4 as uuidv4 } from 'uuid';

export function createUser(email: string, name: string, passwordHash: string): User {
  return stmts.createUser.get(email.toLowerCase(), name, passwordHash) as User;
}

export function findUserByEmail(email: string): User | undefined {
  return stmts.findUserByEmail.get(email.toLowerCase()) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return stmts.findUserById.get(id) as User | undefined;
}

export function createGiftList(title: string, creatorId: number): GiftList {
  const publicId = uuidv4();
  return stmts.createGiftList.get(publicId, title, creatorId) as GiftList;
}

export function findListByPublicId(publicId: string): GiftList | undefined {
  return stmts.findListByPublicId.get(publicId) as GiftList | undefined;
}

export function findListsByCreator(creatorId: number): GiftList[] {
  return stmts.findListsByCreator.all(creatorId) as GiftList[];
}

export function getCreatorItemsForList(listId: number): GiftItemWithClaim[] {
  return stmts.getItemsForListCreator.all(listId) as GiftItemWithClaim[];
}

export function getGuestItemsForList(listId: number, guestToken: string | null): GuestItemRow[] {
  return stmts.getItemsForListGuest.all(guestToken ?? '', listId) as GuestItemRow[];
}

export function getItemsForViewer(
  listId: number,
  role: 'creator' | 'guest',
  guestToken: string | null,
): Array<GuestClaimPayload | CreatorClaimPayload> {
  if (role === 'creator') {
    return mapCreatorItems(getCreatorItemsForList(listId));
  }
  return mapGuestItemRows(getGuestItemsForList(listId, guestToken));
}

export function addGiftItem(
  listId: number,
  data: { title: string; image_url: string | null; price: string | null; product_url: string },
): GiftItem {
  return stmts.addGiftItem.get(
    listId,
    data.title,
    data.image_url,
    data.price,
    data.product_url,
    listId,
  ) as GiftItem;
}

export function deleteGiftItem(itemId: number, listId: number): boolean {
  const result = stmts.deleteGiftItem.run(itemId, listId);
  return result.changes > 0;
}

export class ClaimConflictError extends Error {
  constructor(message = 'Sorry, this item was just selected by someone else.') {
    super(message);
    this.name = 'ClaimConflictError';
  }
}

export class ItemNotFoundError extends Error {
  constructor(message = 'Item not found') {
    super(message);
    this.name = 'ItemNotFoundError';
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'SQLITE_CONSTRAINT_UNIQUE'
  );
}

export function claimItem(
  itemId: number,
  listId: number,
  guestName: string,
  guestToken: string,
): { id: number; guest_token: string } {
  const trimmedName = guestName.trim();

  stmts.beginImmediate.run();

  try {
    const claim = stmts.claimItem.get(
      itemId,
      trimmedName,
      guestToken,
      itemId,
      listId,
    ) as { id: number; guest_token: string } | undefined;

    if (!claim) {
      const item = stmts.findItemInList.get(itemId, listId);
      if (!item) {
        throw new ItemNotFoundError();
      }
      throw new ClaimConflictError();
    }

    stmts.commit.run();
    return claim;
  } catch (error) {
    stmts.rollback.run();

    if (isUniqueConstraintError(error)) {
      throw new ClaimConflictError();
    }

    throw error;
  }
}

export type UnclaimResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'not_claimed' | 'forbidden' };

export function unclaimItemIfAuthorized(
  itemId: number,
  listId: number,
  isCreator: boolean,
  guestToken: string | null,
): UnclaimResult {
  const result = stmts.unclaimAuthorized.run(
    itemId,
    itemId,
    listId,
    isCreator ? 1 : 0,
    guestToken ?? '',
  );

  if (result.changes > 0) {
    return { ok: true };
  }

  const item = stmts.findItemInList.get(itemId, listId);
  if (!item) {
    return { ok: false, reason: 'not_found' };
  }

  const claim = stmts.findClaimByItemId.get(itemId);
  if (!claim) {
    return { ok: false, reason: 'not_claimed' };
  }

  return { ok: false, reason: 'forbidden' };
}
