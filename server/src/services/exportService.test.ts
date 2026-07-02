import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapItemsToExportRows } from '../services/exportService.js';

describe('exportService', () => {
  it('maps creator items to export rows', () => {
    const rows = mapItemsToExportRows([
      {
        id: 1,
        list_id: 1,
        title: 'Stroller',
        image_url: null,
        price: '$100',
        product_url: 'https://example.com',
        sort_order: 0,
        created_at: '2026-01-01',
        claim_id: 10,
        guest_name: 'Alex',
        guest_token: 'token',
        claimed_at: '2026-01-02',
      },
      {
        id: 2,
        list_id: 1,
        title: 'Blanket',
        image_url: null,
        price: '$20',
        product_url: 'https://example.com/blanket',
        sort_order: 1,
        created_at: '2026-01-01',
        claim_id: null,
        guest_name: null,
        guest_token: null,
        claimed_at: null,
      },
    ]);

    assert.equal(rows.length, 2);
    assert.equal(rows[0].item_number, 1);
    assert.equal(rows[0].status, 'Claimed');
    assert.equal(rows[0].guest_name, 'Alex');
    assert.equal(rows[1].status, 'Available');
  });
});
