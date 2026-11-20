import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

export function previewDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  const migrations = new URL('../drizzle/', import.meta.url);
  const journal = JSON.parse(readFileSync(new URL('meta/_journal.json', migrations), 'utf8'));
  for (const {tag} of journal.entries) sqlite.exec(readFileSync(new URL(tag + '.sql', migrations), 'utf8'));
  return {
    prepare(sql) { return {bind(...values) { return {sql, values}; }}; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const result = statements.map(({sql, values}) => ({results: sqlite.prepare(sql).all(...values)}));
        sqlite.exec('COMMIT');
        return result;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    close() { sqlite.close(); }
  };
}
