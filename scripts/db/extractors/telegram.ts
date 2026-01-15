/**
 * Telegram Extractor
 *
 * Imports telegram conversations from /context/telegram/*.md files.
 * Parses header for entity, username, last message ID.
 * Creates one interaction per conversation file.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { query, queryOne } from "../client";
import { createCandidateEntity } from "../entity-resolver";

const TELEGRAM_DIR = join(process.cwd(), "context/telegram");

export interface TelegramExtractResult {
  conversationsCreated: number;
  conversationsUpdated: number;
  conversationsSkipped: number;
  errors: string[];
}

interface TelegramHeader {
  title: string;
  entity?: string;
  username?: string;
  type?: string;
  firstContact?: string;
  lastUpdated?: string;
  lastMessageId?: string;
}

/**
 * Compute MD5 checksum of file content
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("md5").update(content).digest("hex");
}

/**
 * Parse telegram file header
 */
function parseHeader(content: string): TelegramHeader {
  const lines = content.split("\n");
  const header: TelegramHeader = { title: "" };

  for (const line of lines) {
    // Title is the first # heading
    if (line.startsWith("# ") && !header.title) {
      header.title = line.substring(2).trim();
      continue;
    }

    // Parse **Key:** Value format
    const match = line.match(/^\*\*([^:]+):\*\*\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");

      switch (normalizedKey) {
        case "entity":
          header.entity = value.trim();
          break;
        case "username":
          header.username = value.trim().replace("@", "");
          break;
        case "type":
          header.type = value.trim();
          break;
        case "firstcontact":
          header.firstContact = value.trim();
          break;
        case "lastupdated":
          header.lastUpdated = value.trim();
          break;
        case "lastmessageid":
          header.lastMessageId = value.trim();
          break;
      }
    }

    // Stop at the first --- separator
    if (line.trim() === "---") {
      break;
    }
  }

  return header;
}

/**
 * Count messages in a telegram file
 */
function countMessages(content: string): number {
  // Count lines starting with "- [" (message format)
  const messageLines = content.split("\n").filter((line) =>
    line.trim().startsWith("- [")
  );
  return messageLines.length;
}

/**
 * Get the most recent date from messages
 */
function getMostRecentDate(content: string): Date | null {
  // Look for ## YYYY-MM-DD date headers
  const dateMatches = content.match(/^## (\d{4}-\d{2}-\d{2})/gm);
  if (!dateMatches || dateMatches.length === 0) return null;

  // Get the last date (assuming chronological order)
  const lastDate = dateMatches[dateMatches.length - 1].replace("## ", "");
  return new Date(lastDate);
}

/**
 * Extract telegram conversation from a file
 */
async function extractConversation(
  filePath: string,
  fileName: string
): Promise<{ created: boolean; updated: boolean; skipped: boolean }> {
  // Compute checksum for change detection
  const checksum = computeChecksum(filePath);

  // Check if already indexed with same checksum
  const existingFile = await queryOne<{ checksum: string }>(
    "SELECT checksum FROM files WHERE path = $1",
    [filePath]
  );

  if (existingFile && existingFile.checksum === checksum) {
    return { created: false, updated: false, skipped: true };
  }

  // Read and parse file
  const content = readFileSync(filePath, "utf-8");
  const header = parseHeader(content);

  // Get date from header or content
  let conversationDate = new Date();
  if (header.lastUpdated) {
    conversationDate = new Date(header.lastUpdated);
  } else {
    const contentDate = getMostRecentDate(content);
    if (contentDate) conversationDate = contentDate;
  }
  const dateStr = conversationDate.toISOString().split("T")[0];

  // Resolve entity
  let entitySlug: string | null = header.entity || null;
  let entityName = header.title;

  // If entity slug is provided, verify it exists
  if (entitySlug) {
    const entity = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM entities WHERE slug = $1",
      [entitySlug]
    );
    if (entity) {
      entityName = entity.name;
    } else {
      // Entity not found in DB, clear the slug
      entitySlug = null;
    }
  }

  // Try to resolve by telegram username if we don't have an entity yet
  if (!entitySlug && header.username) {
    const entity = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM find_entity($1)",
      [`@${header.username}`]
    );
    if (entity) {
      entitySlug = entity.slug;
      entityName = entity.name;
    }
  }

  // v1.1: Create candidate entity if still no match but we have a username or title
  if (!entitySlug && (header.username || header.title)) {
    const candidate = await createCandidateEntity(
      header.title,
      undefined, // no email for telegram
      header.username,
      "telegram",
      conversationDate
    );
    entitySlug = candidate.slug;
    entityName = candidate.name;
  }

  // Build participants
  const participants = entitySlug ? [entitySlug] : [];
  const participantNames = [entityName];

  // Use file name (without .md) as ID base
  const conversationId = `telegram-${fileName.replace(".md", "")}`;

  // Count messages for summary
  const messageCount = countMessages(content);

  // Check if conversation already exists
  const existingConversation = await queryOne<{ id: string }>(
    "SELECT id FROM interactions WHERE id = $1",
    [conversationId]
  );

  const summary = `Telegram conversation with ${entityName}`;

  if (existingConversation) {
    // Update existing conversation
    await query(
      `UPDATE interactions SET
        type = 'telegram',
        channel = $2,
        date = $3,
        timestamp = $4,
        from_entity = $5,
        from_name = $6,
        participants = $7,
        participant_names = $8,
        file_path = $9,
        summary = $10,
        data = $11
      WHERE id = $1`,
      [
        conversationId,
        header.type || "private",
        dateStr,
        conversationDate.toISOString(),
        entitySlug,
        entityName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        filePath,
        summary,
        JSON.stringify({
          telegram_username: header.username,
          message_count: messageCount,
          last_message_id: header.lastMessageId,
          first_contact: header.firstContact,
        }),
      ]
    );

    // Update file registry
    await query(
      `INSERT INTO files (path, type, checksum, indexed_at)
       VALUES ($1, 'telegram', $2, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, indexed_at = NOW()`,
      [filePath, checksum]
    );

    return { created: false, updated: true, skipped: false };
  } else {
    // Insert new conversation
    await query(
      `INSERT INTO interactions (id, type, channel, date, timestamp, from_entity, from_name, participants, participant_names, file_path, summary, data)
       VALUES ($1, 'telegram', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        conversationId,
        header.type || "private",
        dateStr,
        conversationDate.toISOString(),
        entitySlug,
        entityName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        filePath,
        summary,
        JSON.stringify({
          telegram_username: header.username,
          message_count: messageCount,
          last_message_id: header.lastMessageId,
          first_contact: header.firstContact,
        }),
      ]
    );

    // Insert file registry
    await query(
      `INSERT INTO files (path, type, checksum, indexed_at)
       VALUES ($1, 'telegram', $2, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, indexed_at = NOW()`,
      [filePath, checksum]
    );

    return { created: true, updated: false, skipped: false };
  }
}

/**
 * Main extraction function
 */
export async function extractTelegram(): Promise<TelegramExtractResult> {
  console.log("\n=== Extracting Telegram ===\n");

  const result: TelegramExtractResult = {
    conversationsCreated: 0,
    conversationsUpdated: 0,
    conversationsSkipped: 0,
    errors: [],
  };

  if (!existsSync(TELEGRAM_DIR)) {
    console.log("No telegram folder found");
    return result;
  }

  // Get all telegram files (exclude README and other non-conversation files)
  const telegramFiles = readdirSync(TELEGRAM_DIR).filter(
    (f) => f.endsWith(".md") && !f.startsWith(".") && f !== "README.md" && f !== "INDEX.md"
  );

  console.log(`Found ${telegramFiles.length} telegram files`);

  for (const fileName of telegramFiles) {
    try {
      const filePath = join(TELEGRAM_DIR, fileName);
      const { created, updated, skipped } = await extractConversation(filePath, fileName);

      if (created) {
        result.conversationsCreated++;
        console.log(`  + ${fileName}`);
      } else if (updated) {
        result.conversationsUpdated++;
        console.log(`  ~ ${fileName}`);
      } else if (skipped) {
        result.conversationsSkipped++;
      }
    } catch (error: any) {
      result.errors.push(`Telegram ${fileName}: ${error.message}`);
    }
  }

  // Update entity interaction counts
  await query(`
    UPDATE entities e SET
      interaction_count = (
        SELECT COUNT(*) FROM interactions i WHERE i.participants ? e.slug
      ),
      last_activity = GREATEST(
        e.last_activity,
        (SELECT MAX(i.timestamp) FROM interactions i WHERE i.participants ? e.slug)
      )
  `);

  return result;
}

// Run if executed directly
if (import.meta.main) {
  const { closePool } = await import("../client");

  try {
    const result = await extractTelegram();
    console.log("\n=== Results ===");
    console.log(`Conversations created: ${result.conversationsCreated}`);
    console.log(`Conversations updated: ${result.conversationsUpdated}`);
    console.log(`Conversations skipped: ${result.conversationsSkipped}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    await closePool();
  }
}
