import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicId, parsePositiveInt } from './validators.js';

describe('validators', () => {
  it('accepts valid UUID public ids', () => {
    assert.equal(isPublicId('550e8400-e29b-41d4-a716-446655440000'), true);
  });

  it('rejects SQL injection payloads as public ids', () => {
    assert.equal(isPublicId("' OR 1=1 --"), false);
    assert.equal(isPublicId("'; DROP TABLE users; --"), false);
  });

  it('parses positive integer ids', () => {
    assert.equal(parsePositiveInt(42), 42);
    assert.equal(parsePositiveInt('42'), 42);
  });

  it('rejects non-integer and injection-like item ids', () => {
    assert.equal(parsePositiveInt(0), null);
    assert.equal(parsePositiveInt(-1), null);
    assert.equal(parsePositiveInt(1.5), null);
    assert.equal(parsePositiveInt('1; DROP TABLE claims; --'), null);
    assert.equal(parsePositiveInt("1' OR '1'='1"), null);
    assert.equal(parsePositiveInt(''), null);
    assert.equal(parsePositiveInt(null), null);
  });
});
