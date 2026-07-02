import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapCreatorItem, mapGuestItemRow } from '../services/serialization.js';

describe('serialization', () => {
  it('maps guest rows without exposing claimer names', () => {
    const mapped = mapGuestItemRow({
      id: 1,
      title: 'Blanket',
      image_url: null,
      price: '$10',
      product_url: 'https://example.com',
      is_claimed: 1,
      claimed_by_you: 1,
    });

    assert.equal(mapped.is_claimed, true);
    assert.equal(mapped.claimed_by_you, true);
    assert.equal('guest_name' in mapped, false);
  });

  it('maps creator items with guest names', () => {
    const mapped = mapCreatorItem({
      id: 1,
      list_id: 1,
      title: 'Blanket',
      image_url: null,
      price: '$10',
      product_url: 'https://example.com',
      sort_order: 0,
      created_at: '2026-01-01',
      claim_id: 5,
      guest_name: 'Alex',
      guest_token: 'token',
      claimed_at: '2026-01-02',
    });

    assert.equal(mapped.guest_name, 'Alex');
    assert.equal(mapped.is_claimed, true);
    assert.equal(mapped.claimed_by_you, false);
  });
});
