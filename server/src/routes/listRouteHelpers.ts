import type { Response } from 'express';
import type { GiftList } from '../types/index.js';
import { findListByPublicId } from '../services/listService.js';

export function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function findListOrRespond(publicId: string, res: Response): GiftList | null {
  const list = findListByPublicId(publicId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return null;
  }
  return list;
}

export function isListCreator(list: GiftList, userId: number | undefined): boolean {
  return userId === list.creator_id;
}

export function respondForbidden(res: Response, message: string): void {
  res.status(403).json({ error: message });
}

export function respondCreatorRequired(res: Response, list: GiftList, userId: number): boolean {
  if (list.creator_id !== userId) {
    respondForbidden(res, 'Not authorized to modify this list');
    return false;
  }
  return true;
}
