import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import bcrypt from 'bcryptjs';

const testDir = mkdtempSync(join(tmpdir(), 'wishesdream-test-'));
process.env.DATABASE_PATH = join(testDir, 'test.db');
process.env.JWT_SECRET = 'test-secret';

const {
  createUser,
  createGiftList,
  addGiftItem,
  claimItem,
  unclaimItemIfAuthorized,
  ClaimConflictError,
} = await import('../services/listService.js');

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe('listService claims', () => {
  const passwordHash = bcrypt.hashSync('password123', 4);
  const host = createUser('host@example.com', 'Host', passwordHash);
  const list = createGiftList('Shower List', host.id);
  const item = addGiftItem(list.id, {
    title: 'Stroller',
    image_url: null,
    price: '$100',
    product_url: 'https://example.com/stroller',
  });

  it('claims an available item', () => {
    const claim = claimItem(item.id, list.id, 'Guest One', 'guest-token-1');
    assert.ok(claim.id);
  });

  it('prevents double claims', () => {
    assert.throws(
      () => claimItem(item.id, list.id, 'Guest Two', 'guest-token-2'),
      ClaimConflictError,
    );
  });

  it('allows the guest to unclaim their item', () => {
    const result = unclaimItemIfAuthorized(item.id, list.id, false, 'guest-token-1');
    assert.deepEqual(result, { ok: true });
  });

  it('blocks other guests from unclaiming', () => {
    claimItem(item.id, list.id, 'Guest One', 'guest-token-1');
    const result = unclaimItemIfAuthorized(item.id, list.id, false, 'guest-token-2');
    assert.deepEqual(result, { ok: false, reason: 'forbidden' });
  });

  it('allows the host to unclaim any item', () => {
    const result = unclaimItemIfAuthorized(item.id, list.id, true, null);
    assert.deepEqual(result, { ok: true });
  });
});
