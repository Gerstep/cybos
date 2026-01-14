/**
 * Call Extractor
 *
 * Imports calls from /context/calls/ folders.
 * Parses metadata.json for attendees, date, title.
 * Resolves participants to entity slugs.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { query, queryOne } from "../client";
import { createCandidateEntity } from "../entity-resolver";

const CALLS_DIR = join(process.cwd(), "context/calls");

export interface CallExtractResult {
  callsCreated: number;
  callsUpdated: number;
  callsSkipped: number;
  errors: string[];
}

interface CallMetadata {
  id: string;
  title: string;
  date: string;
  attendees?: Array<{
    email?: string;
    details?: {
      person?: {
        name?: {
          fullName?: string;
        };
      };
      company?: Record<string, unknown>;
    };
  }>;
  inferred_speakers?: {
    self?: string;
    other?: string;
  };
}

/**
 * Compute MD5 checksum of a file
 */
function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("md5").update(content).digest("hex");
}

/**
 * Compute content checksum for transcript (for change detection separate from metadata)
 */
function computeContentChecksum(folderPath: string): string | null {
  const transcriptPath = join(folderPath, "transcript.txt");
  if (existsSync(transcriptPath)) {
    return computeChecksum(transcriptPath);
  }
  return null;
}

/**
 * Resolve an email or name to an entity slug
 */
async function resolveToEntity(
  email?: string,
  name?: string
): Promise<{ slug: string; name: string } | null> {
  // Try email first
  if (email) {
    const result = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM find_entity($1)",
      [email]
    );
    if (result) return result;
  }

  // Try name
  if (name) {
    const result = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM find_entity($1, 'person')",
      [name]
    );
    if (result) return result;
  }

  return null;
}

/**
 * Extract call data from a folder
 */
async function extractCall(
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
  const metadata: CallMetadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

  // Extract date
  const callDate = new Date(metadata.date);
  const dateStr = callDate.toISOString().split("T")[0];

  // Build participant list
  const participants: string[] = [];
  const participantNames: string[] = [];

  // Add attendees
  if (metadata.attendees) {
    for (const attendee of metadata.attendees) {
      const name = attendee.details?.person?.name?.fullName;
      const entity = await resolveToEntity(attendee.email, name);

      if (entity) {
        participants.push(entity.slug);
        participantNames.push(entity.name);
      } else if (name) {
        // v1.1: Create candidate entity for unmatched participants
        const candidate = await createCandidateEntity(
          name,
          attendee.email,
          undefined, // no telegram for calls
          "call",
          callDate
        );
        // Skip blocked names (Speaker, Unknown, etc.)
        if (candidate.slug !== "_blocked_") {
          participants.push(candidate.slug);
          participantNames.push(candidate.name);
        }
      }
    }
  }

  // Add inferred speakers if not already included
  if (metadata.inferred_speakers?.other) {
    const otherName = metadata.inferred_speakers.other;
    if (!participantNames.includes(otherName)) {
      const entity = await resolveToEntity(undefined, otherName);
      if (entity && !participants.includes(entity.slug)) {
        participants.push(entity.slug);
        participantNames.push(entity.name);
      } else if (!entity) {
        // v1.1: Create candidate entity for inferred speaker
        const candidate = await createCandidateEntity(
          otherName,
          undefined,
          undefined,
          "call",
          callDate
        );
        // Skip blocked names (Speaker, Unknown, etc.)
        if (candidate.slug !== "_blocked_" && !participants.includes(candidate.slug)) {
          participants.push(candidate.slug);
          participantNames.push(candidate.name);
        }
      }
    }
  }

  // Use folder name as ID (it's unique and readable)
  const callId = `call-${folderName}`;

  // Check if call already exists
  const existingCall = await queryOne<{ id: string }>(
    "SELECT id FROM interactions WHERE id = $1",
    [callId]
  );

  // Determine from/to entities (first participant is "other", self is implicit)
  const fromEntity = participants[0] || null;
  const fromName = participantNames[0] || metadata.inferred_speakers?.other || null;

  if (existingCall) {
    // Update existing call
    await query(
      `UPDATE interactions SET
        type = 'call',
        channel = 'granola',
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
        callId,
        dateStr,
        callDate.toISOString(),
        fromEntity,
        fromName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        metadata.title,
        JSON.stringify({ granola_id: metadata.id }),
      ]
    );

    // Update file registry with content checksum
    await query(
      `INSERT INTO files (path, type, checksum, content_checksum, indexed_at)
       VALUES ($1, 'call', $2, $3, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, content_checksum = $3, indexed_at = NOW()`,
      [folderPath, checksum, contentChecksum]
    );

    return { created: false, updated: true, skipped: false };
  } else {
    // Insert new call
    await query(
      `INSERT INTO interactions (id, type, channel, date, timestamp, from_entity, from_name, participants, participant_names, file_path, summary, data)
       VALUES ($1, 'call', 'granola', $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        callId,
        dateStr,
        callDate.toISOString(),
        fromEntity,
        fromName,
        JSON.stringify(participants),
        JSON.stringify(participantNames),
        folderPath,
        metadata.title,
        JSON.stringify({ granola_id: metadata.id }),
      ]
    );

    // Insert file registry with content checksum
    await query(
      `INSERT INTO files (path, type, checksum, content_checksum, indexed_at)
       VALUES ($1, 'call', $2, $3, NOW())
       ON CONFLICT (path) DO UPDATE SET checksum = $2, content_checksum = $3, indexed_at = NOW()`,
      [folderPath, checksum, contentChecksum]
    );

    return { created: true, updated: false, skipped: false };
  }
}

/**
 * Main extraction function
 */
export async function extractCalls(): Promise<CallExtractResult> {
  console.log("\n=== Extracting Calls ===\n");

  const result: CallExtractResult = {
    callsCreated: 0,
    callsUpdated: 0,
    callsSkipped: 0,
    errors: [],
  };

  if (!existsSync(CALLS_DIR)) {
    console.log("No calls folder found");
    return result;
  }

  // Get all call folders
  const callFolders = readdirSync(CALLS_DIR).filter((f) => {
    const fullPath = join(CALLS_DIR, f);
    return statSync(fullPath).isDirectory() && !f.startsWith(".");
  });

  console.log(`Found ${callFolders.length} call folders`);

  for (const folderName of callFolders) {
    try {
      const folderPath = join(CALLS_DIR, folderName);
      const { created, updated, skipped } = await extractCall(folderPath, folderName);

      if (created) {
        result.callsCreated++;
        console.log(`  + ${folderName}`);
      } else if (updated) {
        result.callsUpdated++;
        console.log(`  ~ ${folderName}`);
      } else if (skipped) {
        result.callsSkipped++;
      }
    } catch (error: any) {
      result.errors.push(`Call ${folderName}: ${error.message}`);
    }
  }

  // Update entity interaction counts
  await query(`
    UPDATE entities e SET
      interaction_count = (
        SELECT COUNT(*) FROM interactions i WHERE i.participants ? e.slug
      ),
      last_activity = (
        SELECT MAX(i.timestamp) FROM interactions i WHERE i.participants ? e.slug
      )
  `);

  return result;
}

// Run if executed directly
if (import.meta.main) {
  const { closePool } = await import("../client");

  try {
    const result = await extractCalls();
    console.log("\n=== Results ===");
    console.log(`Calls created: ${result.callsCreated}`);
    console.log(`Calls updated: ${result.callsUpdated}`);
    console.log(`Calls skipped: ${result.callsSkipped}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    await closePool();
  }
}
