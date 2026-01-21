/**
 * SQLite Database Client for Context Graph (v2.1)
 *
 * Replaces PostgreSQL client with bun:sqlite for simpler, local-first storage.
 * Uses vault path from centralized paths.ts for database location.
 */

import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { getDbPath, isLegacyMode, getAppRoot } from '../paths'

// Singleton database instance
let db: Database | null = null

/**
 * Get the database path (handles legacy vs vault mode)
 */
function getDatabasePath(): string {
  if (isLegacyMode()) {
    // Legacy mode: DB in app root
    return `${getAppRoot()}/.cybos/cybos.sqlite`
  }
  // Vault mode: DB in vault
  return getDbPath()
}

/**
 * Get or create the database connection
 */
export function getDatabase(): Database {
  if (!db) {
    const dbPath = getDatabasePath()

    // Ensure directory exists
    const dbDir = dirname(dbPath)
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }

    // Create database connection
    db = new Database(dbPath)

    // Set pragmas for performance and safety
    db.run('PRAGMA foreign_keys = ON')
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA synchronous = NORMAL')
    db.run('PRAGMA cache_size = -64000') // 64MB cache
  }
  return db
}

/**
 * Execute a query and return all rows
 */
export function query<T = any>(sql: string, params?: any[]): T[] {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  if (params && params.length > 0) {
    return stmt.all(...params) as T[]
  }
  return stmt.all() as T[]
}

/**
 * Execute a query and return first row or null
 */
export function queryOne<T = any>(sql: string, params?: any[]): T | null {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  if (params && params.length > 0) {
    return (stmt.get(...params) as T) || null
  }
  return (stmt.get() as T) || null
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
export function run(sql: string, params?: any[]): { changes: number; lastInsertRowid: number } {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  if (params && params.length > 0) {
    return stmt.run(...params) as { changes: number; lastInsertRowid: number }
  }
  return stmt.run() as { changes: number; lastInsertRowid: number }
}

/**
 * Execute raw SQL (for schema, multi-statement)
 */
export function exec(sql: string): void {
  const database = getDatabase()
  database.exec(sql)
}

/**
 * Execute a transaction
 */
export function transaction<T>(fn: () => T): T {
  const database = getDatabase()
  return database.transaction(fn)()
}

/**
 * Check if database is initialized (tables exist)
 */
export function isInitialized(): boolean {
  try {
    const result = queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='entities'"
    )
    return result !== null && result.count > 0
  } catch {
    return false
  }
}

/**
 * Check if database file exists
 */
export function exists(): boolean {
  return existsSync(getDatabasePath())
}

/**
 * Get database file path
 */
export function getPath(): string {
  return getDatabasePath()
}

/**
 * Get database info for status display
 */
export function getInfo(): { path: string; size: number; initialized: boolean } {
  const path = getDatabasePath()
  let size = 0
  if (existsSync(path)) {
    const stat = Bun.file(path).size
    size = stat
  }
  return {
    path,
    size,
    initialized: isInitialized()
  }
}

/**
 * Close the database connection
 * Call this when shutting down the application
 */
export function close(): void {
  if (db) {
    db.close()
    db = null
  }
}

/**
 * Get last batch run info (for status checks)
 */
export function getLastBatchRun(): { id: string; started_at: string; status: string } | null {
  try {
    return queryOne<{ id: string; started_at: string; status: string }>(
      'SELECT id, started_at, status FROM batch_runs ORDER BY started_at DESC LIMIT 1'
    )
  } catch {
    return null
  }
}

// Default export for convenience
export default {
  getDatabase,
  query,
  queryOne,
  run,
  exec,
  transaction,
  isInitialized,
  exists,
  getPath,
  getInfo,
  close,
  getLastBatchRun
}
