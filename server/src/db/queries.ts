import db from './database.js';

// All queries must use ? placeholders — never interpolate user input into SQL strings.
export const stmts = {
  createUser: db.prepare(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING *',
  ),

  findUserByEmail: db.prepare(
    'SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?',
  ),

  findUserById: db.prepare(
    'SELECT id, email, name, password_hash, created_at FROM users WHERE id = ?',
  ),

  createGiftList: db.prepare(
    'INSERT INTO gift_lists (public_id, title, creator_id) VALUES (?, ?, ?) RETURNING *',
  ),

  findListByPublicId: db.prepare('SELECT * FROM gift_lists WHERE public_id = ?'),

  findListsByCreator: db.prepare(
    'SELECT * FROM gift_lists WHERE creator_id = ? ORDER BY created_at DESC',
  ),

  getItemsForListCreator: db.prepare(`
    SELECT
      gi.*,
      c.id AS claim_id,
      c.guest_name,
      c.guest_token,
      c.claimed_at
    FROM gift_items gi
    LEFT JOIN claims c ON c.item_id = gi.id
    WHERE gi.list_id = ?
    ORDER BY gi.sort_order ASC, gi.id ASC
  `),

  getItemsForListGuest: db.prepare(`
    SELECT
      gi.id,
      gi.title,
      gi.image_url,
      gi.price,
      gi.product_url,
      CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS is_claimed,
      CASE WHEN c.guest_token = ? THEN 1 ELSE 0 END AS claimed_by_you
    FROM gift_items gi
    LEFT JOIN claims c ON c.item_id = gi.id
    WHERE gi.list_id = ?
    ORDER BY gi.sort_order ASC, gi.id ASC
  `),

  addGiftItem: db.prepare(`
    INSERT INTO gift_items (list_id, title, image_url, price, product_url, sort_order)
    VALUES (?, ?, ?, ?, ?,
      (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM gift_items WHERE list_id = ?)
    )
    RETURNING *
  `),

  deleteGiftItem: db.prepare('DELETE FROM gift_items WHERE id = ? AND list_id = ?'),

  findClaimByItemId: db.prepare('SELECT * FROM claims WHERE item_id = ?'),

  findItemInList: db.prepare(
    'SELECT id FROM gift_items WHERE id = ? AND list_id = ?',
  ),

  claimItem: db.prepare(`
    INSERT INTO claims (item_id, guest_name, guest_token)
    SELECT ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM gift_items WHERE id = ? AND list_id = ?
    )
    RETURNING *
  `),

  unclaimAuthorized: db.prepare(`
    DELETE FROM claims
    WHERE item_id = ?
      AND item_id IN (SELECT id FROM gift_items WHERE id = ? AND list_id = ?)
      AND (? = 1 OR guest_token = ?)
  `),

  beginImmediate: db.prepare('BEGIN IMMEDIATE'),
  commit: db.prepare('COMMIT'),
  rollback: db.prepare('ROLLBACK'),
};
