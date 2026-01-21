#!/usr/bin/env bun
/**
 * Initialize Context Graph Database (SQLite v2.1)
 *
 * Usage: bun scripts/db/init.ts [--reset]
 *
 * Options:
 *   --reset    Drop all tables and recreate schema
 */

import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from './client-sqlite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMA_PATH = join(__dirname, 'schema-sqlite.sql')

function dropAllTables(): void {
  console.log('\nDropping existing tables...')

  // Get all tables
  const tables = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  )

  if (tables.length === 0) {
    console.log('No tables to drop')
    return
  }

  // Disable foreign keys temporarily for clean drop
  db.run('PRAGMA foreign_keys = OFF')

  // Drop FTS tables first (they have special handling)
  const ftsTables = tables.filter(t => t.name.includes('_fts'))
  for (const table of ftsTables) {
    db.run(`DROP TABLE IF EXISTS "${table.name}"`)
    console.log(`  Dropped FTS: ${table.name}`)
  }

  // Drop triggers
  const triggers = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='trigger'"
  )
  for (const trigger of triggers) {
    db.run(`DROP TRIGGER IF EXISTS "${trigger.name}"`)
    console.log(`  Dropped trigger: ${trigger.name}`)
  }

  // Drop views
  const views = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='view'"
  )
  for (const view of views) {
    db.run(`DROP VIEW IF EXISTS "${view.name}"`)
    console.log(`  Dropped view: ${view.name}`)
  }

  // Drop regular tables
  const regularTables = tables.filter(t => !t.name.includes('_fts'))
  for (const table of regularTables) {
    db.run(`DROP TABLE IF EXISTS "${table.name}"`)
    console.log(`  Dropped: ${table.name}`)
  }

  // Re-enable foreign keys
  db.run('PRAGMA foreign_keys = ON')
}

function runSchema(): void {
  console.log('\nRunning schema-sqlite.sql...')

  const schema = readFileSync(SCHEMA_PATH, 'utf-8')

  // Split into statements and execute
  // SQLite exec can handle multiple statements
  db.exec(schema)

  console.log('Schema executed successfully')
}

function verifySchema(): boolean {
  console.log('\nVerifying schema...')

  const expectedTables = [
    'entities',
    'entity_aliases',
    'interactions',
    'extracted_items',
    'batch_runs',
    'interactions_fts'
  ]

  const result = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  )
  const tables = result.map(r => r.name)

  let allPresent = true
  for (const expected of expectedTables) {
    if (tables.includes(expected)) {
      console.log(`  + ${expected}`)
    } else {
      console.log(`  x ${expected} MISSING`)
      allPresent = false
    }
  }

  // Check view
  const views = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='view'"
  )
  const viewNames = views.map(r => r.name)

  console.log('\nViews:')
  if (viewNames.includes('pending_items')) {
    console.log('  + pending_items')
  } else {
    console.log('  x pending_items MISSING')
    allPresent = false
  }

  // Check triggers
  const triggers = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='trigger'"
  )
  const triggerNames = triggers.map(r => r.name)

  console.log('\nTriggers:')
  const expectedTriggers = [
    'interactions_fts_insert',
    'interactions_fts_delete',
    'interactions_fts_update'
  ]
  for (const trigger of expectedTriggers) {
    if (triggerNames.includes(trigger)) {
      console.log(`  + ${trigger}`)
    } else {
      console.log(`  x ${trigger} MISSING`)
      allPresent = false
    }
  }

  // Check indexes
  const indexes = db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
  )
  console.log(`\nIndexes: ${indexes.length} created`)

  return allPresent
}

function showStatus(): void {
  const info = db.getInfo()
  console.log('\nDatabase Info:')
  console.log(`  Path: ${info.path}`)
  console.log(`  Size: ${(info.size / 1024).toFixed(1)} KB`)
  console.log(`  Initialized: ${info.initialized}`)

  if (info.initialized) {
    // Show table counts
    const counts = [
      { name: 'entities', count: db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM entities')?.c || 0 },
      { name: 'interactions', count: db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM interactions')?.c || 0 },
      { name: 'extracted_items', count: db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM extracted_items')?.c || 0 },
      { name: 'batch_runs', count: db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM batch_runs')?.c || 0 }
    ]

    console.log('\nRow counts:')
    for (const { name, count } of counts) {
      console.log(`  ${name}: ${count}`)
    }

    // Show last batch run
    const lastRun = db.getLastBatchRun()
    if (lastRun) {
      console.log(`\nLast batch run: ${lastRun.started_at} (${lastRun.status})`)
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const reset = args.includes('--reset')
  const status = args.includes('--status')

  console.log('=== Context Graph Database (SQLite) ===')

  // Show database path
  const dbPath = db.getPath()
  console.log(`\nDatabase: ${dbPath}`)

  // Status only mode
  if (status) {
    if (!db.exists()) {
      console.log('\nDatabase does not exist. Run without --status to initialize.')
      process.exit(0)
    }
    showStatus()
    db.close()
    process.exit(0)
  }

  // Reset if requested
  if (reset) {
    console.log('\n!! RESET MODE: Dropping all tables...')
    if (db.exists() && db.isInitialized()) {
      dropAllTables()
    }
  }

  // Check if already initialized
  if (db.isInitialized() && !reset) {
    console.log('\nDatabase already initialized.')
    showStatus()
    db.close()
    process.exit(0)
  }

  // Run schema
  runSchema()

  // Verify
  const valid = verifySchema()

  if (valid) {
    console.log('\n[OK] Database initialized successfully')
    showStatus()
  } else {
    console.log('\n[ERROR] Database initialization incomplete')
    db.close()
    process.exit(1)
  }

  db.close()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
