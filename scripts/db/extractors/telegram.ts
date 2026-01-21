/**
 * Telegram Extractor (SQLite v2.1)
 *
 * Imports telegram conversations from /context/telegram/*.md files.
 * Parses header for entity, username, last message ID.
 * Creates one interaction per conversation file.
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import db from '../client-sqlite'
import { createCandidateEntity } from '../entity-resolver'
import { getTelegramPath, isLegacyMode, getAppRoot } from '../../paths'

function getTelegramDir(): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), 'context/telegram')
  }
  return getTelegramPath()
}

export interface TelegramExtractResult {
  conversationsCreated: number
  conversationsUpdated: number
  conversationsSkipped: number
  errors: string[]
}

interface TelegramHeader {
  title: string
  entity?: string
  username?: string
  type?: string
  firstContact?: string
  lastUpdated?: string
  lastMessageId?: string
}

/**
 * Compute MD5 checksum of file content
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath)
  return createHash('md5').update(content).digest('hex')
}

/**
 * Parse telegram file header
 */
function parseHeader(content: string): TelegramHeader {
  const lines = content.split('\n')
  const header: TelegramHeader = { title: '' }

  for (const line of lines) {
    // Title is the first # heading
    if (line.startsWith('# ') && !header.title) {
      header.title = line.substring(2).trim()
      continue
    }

    // Parse **Key:** Value format
    const match = line.match(/^\*\*([^:]+):\*\*\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '')

      switch (normalizedKey) {
        case 'entity':
          header.entity = value.trim()
          break
        case 'username':
          header.username = value.trim().replace('@', '')
          break
        case 'type':
          header.type = value.trim()
          break
        case 'firstcontact':
          header.firstContact = value.trim()
          break
        case 'lastupdated':
          header.lastUpdated = value.trim()
          break
        case 'lastmessageid':
          header.lastMessageId = value.trim()
          break
      }
    }

    // Stop at the first --- separator
    if (line.trim() === '---') {
      break
    }
  }

  return header
}

/**
 * Count messages in a telegram file
 */
function countMessages(content: string): number {
  // Count lines starting with "- [" (message format)
  const messageLines = content.split('\n').filter((line) =>
    line.trim().startsWith('- [')
  )
  return messageLines.length
}

/**
 * Get the most recent date from messages
 */
function getMostRecentDate(content: string): Date | null {
  // Look for ## YYYY-MM-DD date headers
  const dateMatches = content.match(/^## (\d{4}-\d{2}-\d{2})/gm)
  if (!dateMatches || dateMatches.length === 0) return null

  // Get the last date (assuming chronological order)
  const lastDate = dateMatches[dateMatches.length - 1].replace('## ', '')
  return new Date(lastDate)
}

/**
 * Extract telegram conversation from a file
 */
function extractConversation(
  filePath: string,
  fileName: string
): { created: boolean; updated: boolean; skipped: boolean } {
  // Read and parse file
  const content = readFileSync(filePath, 'utf-8')
  const header = parseHeader(content)

  // Get date from header or content
  let conversationDate = new Date()
  if (header.lastUpdated) {
    conversationDate = new Date(header.lastUpdated)
  } else {
    const contentDate = getMostRecentDate(content)
    if (contentDate) conversationDate = contentDate
  }
  const timestamp = conversationDate.toISOString()

  // Resolve entity
  let entitySlug: string | null = header.entity || null
  let entityName = header.title

  // If entity slug is provided, verify it exists
  if (entitySlug) {
    const entity = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE slug = ?',
      [entitySlug]
    )
    if (entity) {
      entityName = entity.name
    } else {
      // Entity not found in DB, clear the slug
      entitySlug = null
    }
  }

  // Try to resolve by telegram username if we don't have an entity yet
  if (!entitySlug && header.username) {
    const entity = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE telegram = ?',
      [header.username]
    )
    if (entity) {
      entitySlug = entity.slug
      entityName = entity.name
    }
  }

  // Create candidate entity if still no match but we have a username or title
  if (!entitySlug && (header.username || header.title)) {
    const candidate = createCandidateEntity(
      header.title,
      undefined, // no email for telegram
      header.username,
      'telegram',
      conversationDate
    )
    entitySlug = candidate.slug
    entityName = candidate.name
  }

  // Build participants
  const participants = entitySlug ? [entitySlug] : []
  const participantNames = [entityName]

  // Use file name (without .md) as ID base
  const conversationId = `telegram-${fileName.replace('.md', '')}`

  // Count messages for summary
  const messageCount = countMessages(content)

  // Check if conversation already exists
  const existingConversation = db.queryOne<{ id: string }>(
    'SELECT id FROM interactions WHERE id = ?',
    [conversationId]
  )

  const summary = `Telegram conversation with ${entityName}`

  if (existingConversation) {
    // Update existing conversation
    db.run(
      `UPDATE interactions SET
        type = 'telegram',
        timestamp = ?,
        participants = ?,
        participant_names = ?,
        file_path = ?,
        summary = ?,
        indexed_at = datetime('now')
      WHERE id = ?`,
      [
        timestamp,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        filePath,
        summary,
        conversationId,
      ]
    )

    return { created: false, updated: true, skipped: false }
  } else {
    // Insert new conversation
    db.run(
      `INSERT INTO interactions (id, type, timestamp, participants, participant_names, file_path, summary, indexed_at)
       VALUES (?, 'telegram', ?, ?, ?, ?, ?, datetime('now'))`,
      [
        conversationId,
        timestamp,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        filePath,
        summary,
      ]
    )

    return { created: true, updated: false, skipped: false }
  }
}

/**
 * Main extraction function
 */
export function extractTelegram(): TelegramExtractResult {
  console.log('\n=== Extracting Telegram ===\n')

  const result: TelegramExtractResult = {
    conversationsCreated: 0,
    conversationsUpdated: 0,
    conversationsSkipped: 0,
    errors: [],
  }

  const telegramDir = getTelegramDir()
  if (!existsSync(telegramDir)) {
    console.log('No telegram folder found')
    return result
  }

  // Get all telegram files (exclude README and other non-conversation files)
  const telegramFiles = readdirSync(telegramDir).filter(
    (f) => f.endsWith('.md') && !f.startsWith('.') && f !== 'README.md' && f !== 'INDEX.md'
  )

  console.log(`Found ${telegramFiles.length} telegram files`)

  for (const fileName of telegramFiles) {
    try {
      const filePath = join(telegramDir, fileName)
      const { created, updated, skipped } = extractConversation(filePath, fileName)

      if (created) {
        result.conversationsCreated++
        console.log(`  + ${fileName}`)
      } else if (updated) {
        result.conversationsUpdated++
        console.log(`  ~ ${fileName}`)
      } else if (skipped) {
        result.conversationsSkipped++
      }
    } catch (error: any) {
      result.errors.push(`Telegram ${fileName}: ${error.message}`)
    }
  }

  // Update entity interaction counts using SQLite JSON functions
  db.run(`
    UPDATE entities SET
      interaction_count = (
        SELECT COUNT(*) FROM interactions i
        WHERE EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = entities.slug)
      ),
      last_activity = COALESCE(
        (SELECT MAX(i.timestamp) FROM interactions i
         WHERE EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = entities.slug)),
        last_activity
      )
  `)

  return result
}

// Run if executed directly
if (import.meta.main) {
  try {
    const result = extractTelegram()
    console.log('\n=== Results ===')
    console.log(`Conversations created: ${result.conversationsCreated}`)
    console.log(`Conversations updated: ${result.conversationsUpdated}`)
    console.log(`Conversations skipped: ${result.conversationsSkipped}`)

    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach((e) => console.log(`  - ${e}`))
    }
  } finally {
    db.close()
  }
}
