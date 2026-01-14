/**
 * Email Extractor
 *
 * Imports emails from /context/emails/ folders.
 * Parses metadata.json for sender, recipients, subject.
 * Resolves sender to entity slugs.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { query, queryOne } from "../client";
import { createCandidateEntity } from "../entity-resolver";

const EMAILS_DIR = join(process.cwd(), "context/emails");

export interface EmailExtractResult {
  emailsCreated: number;
  emailsUpdated: number;
  emailsSkipped: number;
  errors: string[];
}

interface EmailMetadata {
  messageId: string;
  threadId: string;
  date: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  subject: string;
  labels: string[];
  isImportant: boolean;
  snippet?: string;
  summary?: string;
}

/**
 * Compute MD5 checksum of a file
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("md5").update(content).digest("hex");
}

/**
 * Compute content checksum for email body (for change detection separate from metadata)
 */
function computeContentChecksum(folderPath: string): string | null {
  const bodyPath = join(folderPath, "body.md");
  if (existsSync(bodyPath)) {
    return computeChecksum(bodyPath);
  }
  return null;
}

/**
 * Resolve an email to an entity slug
 */
async function resolveToEntity(
  email: string,
  name?: string
): Promise<{ slug: string; name: string } | null> {
  const result = await queryOne<{ slug: string; name: string }>(
    "SELECT slug, name FROM find_entity($1)",
    [email]
  );
  if (result) return result;

  // Try name if email didn't match
  if (name) {
    const nameResult = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM find_entity($1, 'person')",
      [name]
    );
    if (nameResult) return nameResult;
  }

  return null;
}

/**
 * Extract email data from a folder
 */
async function extractEmail(
  folderPath: string,
  folderName: string
): Promise<{ created: boolean; updated: boolean; skipped: boolean }> {
  const metadataPath = join(folderPath, "metadata.json");

  if (!existsSync(metadataPath)) {
    return { created: false, updated: false, skipped: true };
  }

  // Compute checksums for change detection
  const checksum = computeChecksum(metadataPath);
  const contentChecksum = computeContentChecksum(folderPath);

  // Check if already indexed with same checksums
  const existingFile = await queryOne<{ checksum: string; content_checksum: string | null }>(
    "SELECT checksum, content_checksum FROM files WHERE path = $1",
    [folderPath]
  );

  // Skip if both metadata and content unchanged
  if (
    existingFile &&
    existingFile.checksum === checksum &&
    existingFile.content_checksum === contentChecksum
  ) {
    return { created: false, updated: false, skipped: true };
  }

  // Parse metadata
  const metadata: EmailMetadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

  // Extract date
  const emailDate = new Date(metadata.date);
  const dateStr = emailDate.toISOString().split("T")[0];

  // Resolve sender
  let sender = await resolveToEntity(metadata.from.email, metadata.from.name);

  // v1.1: Create candidate entity for unmatched sender
  if (!sender && metadata.from.email) {
    const candidate = await createCandidateEntity(
      metadata.from.name,
      metadata.from.email,
      undefined,
      "email",
      emailDate
    );
    sender = { slug: candidate.slug, name: candidate.name };
  }

  const fromEntity = sender?.slug || null;
  const fromName = sender?.name || metadata.from.name;

  // Build participant list (sender + recipients)
  const participants: string[] = [];
  const participantNames: string[] = [];

  if (sender) {
    participants.push(sender.slug);
    participantNames.push(sender.name);
  } else {
    participantNames.push(metadata.from.name);
  }

  // Add recipients
  for (const recipientEmail of metadata.to) {
    const recipient = await resolveToEntity(recipientEmail);
    if (recipient && !participants.includes(recipient.slug)) {
      participants.push(recipient.slug);
      participantNames.push(recipient.name);
    }
    // Note: We don't create candidates for recipients as we often don't have their names
  }

  // Use message ID as the interaction ID
  const emailId = `email-${metadata.messageId}`;

  // Check if email already exists
  const existingEmail = await queryOne<{ id: string }>(
    "SELECT id FROM interactions WHERE id = $1",
    [emailId]
  );

  // Use summary if available, otherwise subject
  const summary = metadata.summary || metadata.subject;

  if (existingEmail) {
    // Update existing email
    await query(
      `UPDATE interactions SET
        type = 'email',
        channel = 'gmail',
        date = $2,
        timestamp = $3,
        from_entity = $4,
        from_name = $5,
        participants = $6,
        participant_names = $7,
        file_path = $8,
        summary = $9,
        data = $10
      WHERE id = $1`,
      [
        emailId,
        dateStr,
        emailDate.toISOString(),
        fromEntity,
        fromName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        summary,
        JSON.stringify({
          gmail_message_id: metadata.messageId,
          thread_id: metadata.threadId,
          subject: metadata.subject,
          labels: metadata.labels,
          is_important: metadata.isImportant,
        }),
      ]
    );

    // Update file registry with content checksum
    await query(
      `INSERT INTO files (path, type, checksum, content_checksum, indexed_at)
       VALUES ($1, 'email', $2, $3, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, content_checksum = $3, indexed_at = NOW()`,
      [folderPath, checksum, contentChecksum]
    );

    return { created: false, updated: true, skipped: false };
  } else {
    // Insert new email
    await query(
      `INSERT INTO interactions (id, type, channel, date, timestamp, from_entity, from_name, participants, participant_names, file_path, summary, data)
       VALUES ($1, 'email', 'gmail', $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        emailId,
        dateStr,
        emailDate.toISOString(),
        fromEntity,
        fromName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        summary,
        JSON.stringify({
          gmail_message_id: metadata.messageId,
          thread_id: metadata.threadId,
          subject: metadata.subject,
          labels: metadata.labels,
          is_important: metadata.isImportant,
        }),
      ]
    );

    // Insert file registry with content checksum
    await query(
      `INSERT INTO files (path, type, checksum, content_checksum, indexed_at)
       VALUES ($1, 'email', $2, $3, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, content_checksum = $3, indexed_at = NOW()`,
      [folderPath, checksum, contentChecksum]
    );

    return { created: true, updated: false, skipped: false };
  }
}

/**
 * Main extraction function
 */
export async function extractEmails(): Promise<EmailExtractResult> {
  console.log("\n=== Extracting Emails ===\n");

  const result: EmailExtractResult = {
    emailsCreated: 0,
    emailsUpdated: 0,
    emailsSkipped: 0,
    errors: [],
  };

  if (!existsSync(EMAILS_DIR)) {
    console.log("No emails folder found");
    return result;
  }

  // Get all email folders (skip INDEX.md, README.md, etc.)
  const emailFolders = readdirSync(EMAILS_DIR).filter((f) => {
    const fullPath = join(EMAILS_DIR, f);
    return statSync(fullPath).isDirectory() && !f.startsWith(".");
  });

  console.log(`Found ${emailFolders.length} email folders`);

  for (const folderName of emailFolders) {
    try {
      const folderPath = join(EMAILS_DIR, folderName);
      const { created, updated, skipped } = await extractEmail(folderPath, folderName);

      if (created) {
        result.emailsCreated++;
        console.log(`  + ${folderName}`);
      } else if (updated) {
        result.emailsUpdated++;
        console.log(`  ~ ${folderName}`);
      } else if (skipped) {
        result.emailsSkipped++;
      }
    } catch (error: any) {
      result.errors.push(`Email ${folderName}: ${error.message}`);
    }
  }

  return result;
}

// Run if executed directly
if (import.meta.main) {
  const { closePool } = await import("../client");

  try {
    const result = await extractEmails();
    console.log("\n=== Results ===");
    console.log(`Emails created: ${result.emailsCreated}`);
    console.log(`Emails updated: ${result.emailsUpdated}`);
    console.log(`Emails skipped: ${result.emailsSkipped}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    await closePool();
  }
}
