/**
 * Call Extractor (SQLite v2.1)
 *
 * Imports calls from /context/calls/ folders.
 * Parses metadata.json for attendees, date, title.
 * Resolves participants to entity slugs.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import db from '../client-sqlite'
import { createCandidateEntity } from '../entity-resolver'
import { getCallsPath, isLegacyMode, getAppRoot } from '../../paths'

function getCallsDir(): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), 'context/calls')
  }
  return getCallsPath()
}

export interface CallExtractResult {
  callsCreated: number
  callsUpdated: number
  callsSkipped: number
  errors: string[]
}

interface CallMetadata {
  id: string
  title: string
  date: string
  attendees?: Array<{
    email?: string
    details?: {
      person?: {
        name?: {
          fullName?: string
        }
      }
      company?: Record<string, unknown>
    }
  }>
  inferred_speakers?: {
    self?: string
    other?: string
  }
}

/**
 * Compute MD5 checksum of a file
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath)
  return createHash('md5').update(content).digest('hex')
}

/**
 * Compute content checksum for transcript (for change detection separate from metadata)
 */
function computeContentChecksum(folderPath: string): string | null {
  const transcriptPath = join(folderPath, 'transcript.txt')
  if (existsSync(transcriptPath)) {
    return computeChecksum(transcriptPath)
  }
  return null
}

/**
 * Resolve an email or name to an entity slug using direct DB queries
 */
function resolveToEntity(
  email?: string,
  name?: string
): { slug: string; name: string } | null {
  // Try email first
  if (email) {
    const result = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE email = ?',
      [email]
    )
    if (result) return result
  }

  // Try name with fuzzy matching
  if (name) {
    // Simple partial match for now - entity resolver handles proper fuzzy matching
    const result = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE name LIKE ? COLLATE NOCASE',
      [`%${name}%`]
    )
    if (result) return result
  }

  return null
}

/**
 * Extract call data from a folder
 */
function extractCall(
  folderPath: string,
  folderName: string
): { created: boolean; updated: boolean; skipped: boolean } {
  const metadataPath = join(folderPath, 'metadata.json')

  if (!existsSync(metadataPath)) {
    return { created: false, updated: false, skipped: true }
  }

  // Parse metadata
  const metadata: CallMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))

  // Extract date
  const callDate = new Date(metadata.date)
  const timestamp = callDate.toISOString()

  // Build participant list
  const participants: string[] = []
  const participantNames: string[] = []

  // Add attendees
  if (metadata.attendees) {
    for (const attendee of metadata.attendees) {
      const name = attendee.details?.person?.name?.fullName
      const entity = resolveToEntity(attendee.email, name)

      if (entity) {
        participants.push(entity.slug)
        participantNames.push(entity.name)
      } else if (name) {
        // Create candidate entity for unmatched participants
        const candidate = createCandidateEntity(
          name,
          attendee.email,
          undefined, // no telegram for calls
          'call',
          callDate
        )
        // Skip blocked names (Speaker, Unknown, etc.)
        if (candidate.slug !== '_blocked_') {
          participants.push(candidate.slug)
          participantNames.push(candidate.name)
        }
      }
    }
  }

  // Add inferred speakers if not already included
  if (metadata.inferred_speakers?.other) {
    const otherName = metadata.inferred_speakers.other
    if (!participantNames.includes(otherName)) {
      const entity = resolveToEntity(undefined, otherName)
      if (entity && !participants.includes(entity.slug)) {
        participants.push(entity.slug)
        participantNames.push(entity.name)
      } else if (!entity) {
        // Create candidate entity for inferred speaker
        const candidate = createCandidateEntity(
          otherName,
          undefined,
          undefined,
          'call',
          callDate
        )
        // Skip blocked names (Speaker, Unknown, etc.)
        if (candidate.slug !== '_blocked_' && !participants.includes(candidate.slug)) {
          participants.push(candidate.slug)
          participantNames.push(candidate.name)
        }
      }
    }
  }

  // Use folder name as ID (it's unique and readable)
  const callId = `call-${folderName}`

  // Check if call already exists
  const existingCall = db.queryOne<{ id: string }>(
    'SELECT id FROM interactions WHERE id = ?',
    [callId]
  )

  if (existingCall) {
    // Update existing call
    db.run(
      `UPDATE interactions SET
        type = 'call',
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
        folderPath,
        metadata.title,
        callId,
      ]
    )

    return { created: false, updated: true, skipped: false }
  } else {
    // Insert new call
    db.run(
      `INSERT INTO interactions (id, type, timestamp, participants, participant_names, file_path, summary, indexed_at)
       VALUES (?, 'call', ?, ?, ?, ?, ?, datetime('now'))`,
      [
        callId,
        timestamp,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        metadata.title,
      ]
    )

    return { created: true, updated: false, skipped: false }
  }
}

/**
 * Main extraction function
 */
export function extractCalls(): CallExtractResult {
  console.log('\n=== Extracting Calls ===\n')

  const result: CallExtractResult = {
    callsCreated: 0,
    callsUpdated: 0,
    callsSkipped: 0,
    errors: [],
  }

  const callsDir = getCallsDir()
  if (!existsSync(callsDir)) {
    console.log('No calls folder found')
    return result
  }

  // Get all call folders
  const callFolders = readdirSync(callsDir).filter((f) => {
    const fullPath = join(callsDir, f)
    return statSync(fullPath).isDirectory() && !f.startsWith('.')
  })

  console.log(`Found ${callFolders.length} call folders`)

  for (const folderName of callFolders) {
    try {
      const folderPath = join(callsDir, folderName)
      const { created, updated, skipped } = extractCall(folderPath, folderName)

      if (created) {
        result.callsCreated++
        console.log(`  + ${folderName}`)
      } else if (updated) {
        result.callsUpdated++
        console.log(`  ~ ${folderName}`)
      } else if (skipped) {
        result.callsSkipped++
      }
    } catch (error: any) {
      result.errors.push(`Call ${folderName}: ${error.message}`)
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
    const result = extractCalls()
    console.log('\n=== Results ===')
    console.log(`Calls created: ${result.callsCreated}`)
    console.log(`Calls updated: ${result.callsUpdated}`)
    console.log(`Calls skipped: ${result.callsSkipped}`)

    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach((e) => console.log(`  - ${e}`))
    }
  } finally {
    db.close()
  }
}
