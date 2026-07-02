import type Database from 'better-sqlite3';
import { CLAIMS_MIGRATION_SQL, SCHEMA_SQL } from './schema.js';

export function initializeDatabase(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.exec(SCHEMA_SQL);

  const claimColumns = db.prepare('PRAGMA table_info(claims)').all() as Array<{ name: string }>;
  if (claimColumns.some((column) => column.name === 'guest_email')) {
    db.exec(CLAIMS_MIGRATION_SQL);
  }
}
