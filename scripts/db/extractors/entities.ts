/**
 * Entity Extractor (SQLite v2.1)
 *
 * Imports entities from:
 * 1. Existing .index.json file (primary source)
 * 2. Manual entity files in /context/entities/{people,orgs}/*.md
 *
 * Creates entity_aliases from the aliases array.
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import db from '../client-sqlite'
import { getEntitiesPath, isLegacyMode, getAppRoot } from '../../paths'

function getEntitiesDir(): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), 'context/entities')
  }
  return getEntitiesPath()
}

// Type mapping from old format to new format
const TYPE_MAP: Record<string, string> = {
  person: 'person',
  org: 'company', // Map org -> company
  group: 'group',
  company: 'company',
}

interface LegacyEntity {
  name: string
  type: string
  aliases?: string[]
  email?: string | null
  telegram?: string | null
  sources?: {
    deal?: string | null
    calls?: string[]
    entity_file?: string | null
    telegram_log?: string | null
  }
}

interface LegacyIndex {
  generated: string
  entities: Record<string, LegacyEntity>
  lookups: {
    telegram: Record<string, string>
    email: Record<string, string>
  }
}

export interface ExtractResult {
  entitiesCreated: number
  entitiesUpdated: number
  aliasesCreated: number
  errors: string[]
}

/**
 * Import entities from .index.json
 */
function importFromIndexJson(): ExtractResult {
  const result: ExtractResult = {
    entitiesCreated: 0,
    entitiesUpdated: 0,
    aliasesCreated: 0,
    errors: [],
  }

  const indexPath = join(getEntitiesDir(), '.index.json')
  if (!existsSync(indexPath)) {
    console.log('No .index.json found, skipping legacy import')
    return result
  }

  const indexData: LegacyIndex = JSON.parse(readFileSync(indexPath, 'utf-8'))
  console.log(`Found ${Object.keys(indexData.entities).length} entities in .index.json`)

  for (const [slug, entity] of Object.entries(indexData.entities)) {
    try {
      const mappedType = TYPE_MAP[entity.type] || entity.type

      // Check if entity already exists
      const existing = db.queryOne<{ slug: string }>(
        'SELECT slug FROM entities WHERE slug = ?',
        [slug]
      )

      if (existing) {
        // Update existing entity
        db.run(
          `UPDATE entities SET
            name = ?,
            type = ?,
            email = COALESCE(?, email),
            telegram = COALESCE(?, telegram),
            last_activity = datetime('now')
          WHERE slug = ?`,
          [
            entity.name,
            mappedType,
            entity.email || null,
            entity.telegram || null,
            slug,
          ]
        )
        result.entitiesUpdated++
      } else {
        // Insert new entity
        db.run(
          `INSERT INTO entities (slug, name, type, email, telegram, last_activity, is_candidate)
           VALUES (?, ?, ?, ?, ?, datetime('now'), 0)`,
          [
            slug,
            entity.name,
            mappedType,
            entity.email || null,
            entity.telegram || null,
          ]
        )
        result.entitiesCreated++
      }

      // Import aliases
      if (entity.aliases && entity.aliases.length > 0) {
        for (const alias of entity.aliases) {
          const aliasId = `${slug}-alias-${alias.toLowerCase().replace(/\s+/g, '-')}`

          // Check if alias already exists
          const existingAlias = db.queryOne<{ id: string }>(
            'SELECT id FROM entity_aliases WHERE id = ?',
            [aliasId]
          )

          if (!existingAlias) {
            db.run(
              `INSERT INTO entity_aliases (id, entity_slug, alias, alias_type)
               VALUES (?, ?, ?, 'nickname')
               ON CONFLICT (id) DO NOTHING`,
              [aliasId, slug, alias]
            )
            result.aliasesCreated++
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Entity ${slug}: ${error.message}`)
    }
  }

  return result
}

/**
 * Import entities from markdown files in people/orgs folders
 */
function importFromFiles(): ExtractResult {
  const result: ExtractResult = {
    entitiesCreated: 0,
    entitiesUpdated: 0,
    aliasesCreated: 0,
    errors: [],
  }

  const entitiesDir = getEntitiesDir()
  const folders = [
    { path: join(entitiesDir, 'people'), type: 'person' },
    { path: join(entitiesDir, 'orgs'), type: 'company' },
  ]

  for (const { path: folderPath, type } of folders) {
    if (!existsSync(folderPath)) continue

    const files = readdirSync(folderPath).filter(
      (f) => f.endsWith('.md') && !f.startsWith('.')
    )

    for (const file of files) {
      try {
        const filePath = join(folderPath, file)
        const content = readFileSync(filePath, 'utf-8')
        const slug = file.replace('.md', '')

        // Parse frontmatter if exists
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        let name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        let email: string | null = null
        let telegram: string | null = null

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1]
          const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
          const emailMatch = frontmatter.match(/^email:\s*(.+)$/m)
          const telegramMatch = frontmatter.match(/^telegram:\s*@?(.+)$/m)

          if (nameMatch) name = nameMatch[1].trim()
          if (emailMatch) email = emailMatch[1].trim()
          if (telegramMatch) telegram = telegramMatch[1].trim()
        }

        // Check if entity already exists
        const existing = db.queryOne<{ slug: string }>(
          'SELECT slug FROM entities WHERE slug = ?',
          [slug]
        )

        if (existing) {
          // Update with file path
          db.run(
            `UPDATE entities SET
              email = COALESCE(?, email),
              telegram = COALESCE(?, telegram)
            WHERE slug = ?`,
            [email, telegram, slug]
          )
          result.entitiesUpdated++
        } else {
          // Insert new entity from file
          db.run(
            `INSERT INTO entities (slug, name, type, email, telegram, last_activity, is_candidate)
             VALUES (?, ?, ?, ?, ?, datetime('now'), 0)`,
            [slug, name, type, email, telegram]
          )
          result.entitiesCreated++
        }
      } catch (error: any) {
        result.errors.push(`File ${file}: ${error.message}`)
      }
    }
  }

  return result
}

/**
 * Update interaction counts for all entities
 */
function updateInteractionCounts(): void {
  db.run(`
    UPDATE entities SET
      interaction_count = (
        SELECT COUNT(*) FROM interactions i
        WHERE EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = entities.slug)
      )
  `)
}

/**
 * Main extraction function
 */
export function extractEntities(): ExtractResult {
  console.log('\n=== Extracting Entities ===\n')

  // Import from .index.json first (primary source)
  const indexResult = importFromIndexJson()
  console.log(`From .index.json: ${indexResult.entitiesCreated} created, ${indexResult.entitiesUpdated} updated, ${indexResult.aliasesCreated} aliases`)

  // Then import from files (may update existing)
  const fileResult = importFromFiles()
  console.log(`From files: ${fileResult.entitiesCreated} created, ${fileResult.entitiesUpdated} updated`)

  // Update interaction counts
  updateInteractionCounts()
  console.log('Updated interaction counts')

  // Combine results
  return {
    entitiesCreated: indexResult.entitiesCreated + fileResult.entitiesCreated,
    entitiesUpdated: indexResult.entitiesUpdated + fileResult.entitiesUpdated,
    aliasesCreated: indexResult.aliasesCreated + fileResult.aliasesCreated,
    errors: [...indexResult.errors, ...fileResult.errors],
  }
}

// Run if executed directly
if (import.meta.main) {
  try {
    const result = extractEntities()
    console.log('\n=== Results ===')
    console.log(`Entities created: ${result.entitiesCreated}`)
    console.log(`Entities updated: ${result.entitiesUpdated}`)
    console.log(`Aliases created: ${result.aliasesCreated}`)

    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach((e) => console.log(`  - ${e}`))
    }
  } finally {
    db.close()
  }
}
