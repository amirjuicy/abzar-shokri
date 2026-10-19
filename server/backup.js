/* Abzar Shokri — consistent SQLite backup (no new dependencies; node:sqlite only).
 *
 * Manual PowerShell usage (run from the project root):
 *   node server/backup.js                                   # live DB -> data/backups/
 *   $env:DB_PATH='C:\path\to.db'; $env:BACKUP_DIR='C:\out'; node server/backup.js
 *   node server/restore-validate.js data/backups/<file>.db # validate into temp DB
 *
 * Design: snapshot via VACUUM INTO from a read-only handle (safe while the
 * server runs; the live file is never copied blindly and never modified),
 * then PRAGMA integrity_check on the snapshot before publishing. Keeps the
 * latest 7 successful backups; failures exit non-zero without reporting
 * success and without touching the last known-good backup.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const KEEP = 7;
const PREFIX = 'abzar-shokri-';

function resolvePaths() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'abzar-shokri.db');
  const dir = process.env.BACKUP_DIR || path.join(__dirname, '..', 'data', 'backups');
  return { dbPath, dir };
}

function stamp(d) {
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
    + `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${p(d.getMilliseconds(), 3)}`;
}

function listBackups(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith(PREFIX) && f.endsWith('.db'))
    .sort();
}

function prune(dir) {
  // Oldest-first deletion; never delete when count is within retention.
  const files = listBackups(dir);
  const excess = files.slice(0, Math.max(0, files.length - KEEP));
  for (const f of excess) fs.unlinkSync(path.join(dir, f));
  return { kept: listBackups(dir), removed: excess };
}

function backup() {
  const { dbPath, dir } = resolvePaths();
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Live database not found: ${dbPath}`);
  }
  fs.mkdirSync(dir, { recursive: true });
  const name = `${PREFIX}${stamp(new Date())}.db`;
  const finalPath = path.join(dir, name);
  if (path.resolve(finalPath) === path.resolve(dbPath)) {
    throw new Error('Refusing to write a backup over the live database path');
  }
  if (fs.existsSync(finalPath)) {
    throw new Error(`Refusing to overwrite existing backup: ${finalPath}`);
  }
  // Snapshot to a temp file first so a failure can never leave a partial backup.
  const tmpPath = path.join(dir, `${name}.tmp-${process.pid}`);
  try {
    const src = new DatabaseSync(dbPath, { readOnly: true });
    try {
      src.prepare('VACUUM INTO ?').run(tmpPath);
    } finally {
      src.close();
    }
    const snap = new DatabaseSync(tmpPath);
    let ok = false;
    try {
      const rows = snap.prepare('PRAGMA integrity_check').all();
      ok = rows.length === 1 && rows[0].integrity_check === 'ok';
    } finally {
      snap.close();
    }
    if (!ok) {
      throw new Error('Backup snapshot failed integrity_check; discarding');
    }
    fs.renameSync(tmpPath, finalPath);
  } catch (e) {
    try { fs.unlinkSync(tmpPath); } catch (_) {}
    throw e;
  }
  const { kept, removed } = prune(dir);
  return { file: finalPath, kept, removed };
}

if (require.main === module) {
  try {
    const r = backup();
    console.log(`BACKUP OK: ${r.file}`);
    console.log(`retained=${r.kept.length} removed=${r.removed.length}`);
  } catch (e) {
    console.error(`BACKUP FAILED: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { backup, prune, listBackups, resolvePaths, KEEP };
