import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isKnownClientRoute } from './seoConfig.js';

describe('isKnownClientRoute', () => {
  it('accepts marketing and auth routes', () => {
    assert.equal(isKnownClientRoute('/'), true);
    assert.equal(isKnownClientRoute('/faq'), true);
    assert.equal(isKnownClientRoute('/login'), true);
    assert.equal(isKnownClientRoute('/dashboard'), true);
  });

  it('accepts list routes', () => {
    assert.equal(isKnownClientRoute('/lists/abc123'), true);
    assert.equal(isKnownClientRoute('/lists/abc123/manage'), true);
  });

  it('rejects unknown routes', () => {
    assert.equal(isKnownClientRoute('/missing-page'), false);
    assert.equal(isKnownClientRoute('/lists/'), false);
    assert.equal(isKnownClientRoute('/api/lists'), false);
  });
});
