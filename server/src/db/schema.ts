export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gift_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gift_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL REFERENCES gift_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image_url TEXT,
    price TEXT,
    product_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL UNIQUE REFERENCES gift_items(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_token TEXT NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_gift_items_list_id ON gift_items(list_id);
  CREATE INDEX IF NOT EXISTS idx_gift_items_list_sort ON gift_items(list_id, sort_order, id);
  CREATE INDEX IF NOT EXISTS idx_gift_lists_creator_id ON gift_lists(creator_id);
  CREATE INDEX IF NOT EXISTS idx_claims_guest_token ON claims(guest_token);
`;

export const CLAIMS_MIGRATION_SQL = `
  CREATE TABLE claims_migrated (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL UNIQUE REFERENCES gift_items(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_token TEXT NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  INSERT INTO claims_migrated (id, item_id, guest_name, guest_token, claimed_at)
  SELECT id, item_id, guest_name, guest_token, claimed_at FROM claims;
  DROP TABLE claims;
  ALTER TABLE claims_migrated RENAME TO claims;
  CREATE INDEX IF NOT EXISTS idx_claims_guest_token ON claims(guest_token);
`;
