/**
 * Email Extractor (SQLite v2.1)
 *
 * Imports emails from /context/emails/ folders.
 * Parses metadata.json for sender, recipients, subject.
 * Resolves sender to entity slugs.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import db from '../client-sqlite'
import { createCandidateEntity } from '../entity-resolver'
import { getEmailsPath, isLegacyMode, getAppRoot } from '../../paths'

function getEmailsDir(): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), 'context/emails')
  }
  return getEmailsPath()
}

export interface EmailExtractResult {
  emailsCreated: number
  emailsUpdated: number
  emailsSkipped: number
  errors: string[]
}

interface EmailMetadata {
  messageId: string
  threadId: string
  date: string
  from: {
    name: string
    email: string
  }
  to: string[]
  cc?: string[]
  subject: string
  labels: string[]
  isImportant: boolean
  snippet?: string
  summary?: string
}

/**
 * Compute MD5 checksum of a file
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath)
  return createHash('md5').update(content).digest('hex')
}

/**
 * Resolve an email to an entity slug
 */
function resolveToEntity(
  email: string,
  name?: string
): { slug: string; name: string } | null {
  // Try email first
  const result = db.queryOne<{ slug: string; name: string }>(
    'SELECT slug, name FROM entities WHERE email = ?',
    [email]
  )
  if (result) return result

  // Try name if email didn't match
  if (name) {
    const nameResult = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE name LIKE ? COLLATE NOCASE',
      [`%${name}%`]
    )
    if (nameResult) return nameResult
  }

  return null
}

/**
 * Extract email data from a folder
 */
function extractEmail(
  folderPath: string,
  folderName: string
): { created: boolean; updated: boolean; skipped: boolean } {
  const metadataPath = join(folderPath, 'metadata.json')

  if (!existsSync(metadataPath)) {
    return { created: false, updated: false, skipped: true }
  }

  // Parse metadata
  const metadata: EmailMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))

  // Extract date
  const emailDate = new Date(metadata.date)
  const timestamp = emailDate.toISOString()

  // Resolve sender
  let sender = resolveToEntity(metadata.from.email, metadata.from.name)

  // Create candidate entity for unmatched sender
  if (!sender && metadata.from.email) {
    const candidate = createCandidateEntity(
      metadata.from.name,
      metadata.from.email,
      undefined,
      'email',
      emailDate
    )
    sender = { slug: candidate.slug, name: candidate.name }
  }

  // Build participant list (sender + recipients)
  const participants: string[] = []
  const participantNames: string[] = []

  if (sender) {
    participants.push(sender.slug)
    participantNames.push(sender.name)
  } else {
    participantNames.push(metadata.from.name)
  }

  // Add recipients
  for (const recipientEmail of metadata.to) {
    const recipient = resolveToEntity(recipientEmail)
    if (recipient && !participants.includes(recipient.slug)) {
      participants.push(recipient.slug)
      participantNames.push(recipient.name)
    }
    // Note: We don't create candidates for recipients as we often don't have their names
  }

  // Use message ID as the interaction ID
  const emailId = `email-${metadata.messageId}`

  // Check if email already exists
  const existingEmail = db.queryOne<{ id: string }>(
    'SELECT id FROM interactions WHERE id = ?',
    [emailId]
  )

  // Use summary if available, otherwise subject
  const summary = metadata.summary || metadata.subject

  if (existingEmail) {
    // Update existing email
    db.run(
      `UPDATE interactions SET
        type = 'email',
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
        summary,
        emailId,
      ]
    )

    return { created: false, updated: true, skipped: false }
  } else {
    // Insert new email
    db.run(
      `INSERT INTO interactions (id, type, timestamp, participants, participant_names, file_path, summary, indexed_at)
       VALUES (?, 'email', ?, ?, ?, ?, ?, datetime('now'))`,
      [
        emailId,
        timestamp,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        summary,
      ]
    )

    return { created: true, updated: false, skipped: false }
  }
}

/**
 * Main extraction function
 */
export function extractEmails(): EmailExtractResult {
  console.log('\n=== Extracting Emails ===\n')

  const result: EmailExtractResult = {
    emailsCreated: 0,
    emailsUpdated: 0,
    emailsSkipped: 0,
    errors: [],
  }

  const emailsDir = getEmailsDir()
  if (!existsSync(emailsDir)) {
    console.log('No emails folder found')
    return result
  }

  // Get all email folders (skip INDEX.md, README.md, etc.)
  const emailFolders = readdirSync(emailsDir).filter((f) => {
    const fullPath = join(emailsDir, f)
    return statSync(fullPath).isDirectory() && !f.startsWith('.')
  })

  console.log(`Found ${emailFolders.length} email folders`)

  for (const folderName of emailFolders) {
    try {
      const folderPath = join(emailsDir, folderName)
      const { created, updated, skipped } = extractEmail(folderPath, folderName)

      if (created) {
        result.emailsCreated++
        console.log(`  + ${folderName}`)
      } else if (updated) {
        result.emailsUpdated++
        console.log(`  ~ ${folderName}`)
      } else if (skipped) {
        result.emailsSkipped++
      }
    } catch (error: any) {
      result.errors.push(`Email ${folderName}: ${error.message}`)
    }
  }

  return result
}

// Run if executed directly
if (import.meta.main) {
  try {
    const result = extractEmails()
    console.log('\n=== Results ===')
    console.log(`Emails created: ${result.emailsCreated}`)
    console.log(`Emails updated: ${result.emailsUpdated}`)
    console.log(`Emails skipped: ${result.emailsSkipped}`)

    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach((e) => console.log(`  - ${e}`))
    }
  } finally {
    db.close()
  }
}
