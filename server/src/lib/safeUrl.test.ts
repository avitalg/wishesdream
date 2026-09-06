import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBlockedIp, isSafeHttpUrl, sanitizeHttpUrl } from './safeUrl.js';

describe('safeUrl', () => {
  it('accepts public https URLs', () => {
    assert.equal(isSafeHttpUrl('https://example.com/product'), true);
    assert.equal(isSafeHttpUrl('http://shop.example.co.uk/item'), true);
  });

  it('rejects non-http schemes and credentials', () => {
    assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
    assert.equal(isSafeHttpUrl('file:///etc/passwd'), false);
    assert.equal(isSafeHttpUrl('https://user:pass@example.com'), false);
  });

  it('rejects localhost and private IPs', () => {
    assert.equal(isSafeHttpUrl('http://localhost/admin'), false);
    assert.equal(isSafeHttpUrl('http://127.0.0.1/'), false);
    assert.equal(isSafeHttpUrl('http://192.168.1.1/'), false);
    assert.equal(isSafeHttpUrl('http://169.254.169.254/'), false);
  });

  it('blocks known private address ranges', () => {
    assert.equal(isBlockedIp('10.0.0.1'), true);
    assert.equal(isBlockedIp('172.16.0.1'), true);
    assert.equal(isBlockedIp('8.8.8.8'), false);
  });

  it('sanitizes unsafe optional URLs to null', () => {
    assert.equal(sanitizeHttpUrl('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
    assert.equal(sanitizeHttpUrl('javascript:alert(1)'), null);
    assert.equal(sanitizeHttpUrl(''), null);
  });
});
