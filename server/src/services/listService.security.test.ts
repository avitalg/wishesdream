import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after, describe, it } from 'node:test';

const testDir = mkdtempSync(join(tmpdir(), 'wishesdream-security-'));
process.env.DATABASE_PATH = join(testDir, 'test.db');
process.env.JWT_SECRET = 'test-secret';

const { findListByPublicId } = await import('./listService.js');

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe('listService SQL injection resistance', () => {
  it('treats injection payloads in public_id as a normal lookup miss', () => {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "1; DELETE FROM gift_lists; --",
    ];

    for (const payload of payloads) {
      assert.equal(findListByPublicId(payload), undefined);
    }
  });
});
