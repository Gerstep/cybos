/**
 * LLM Extraction Runner (SQLite v2.1)
 *
 * Calls Claude Haiku to extract structured items and entities from interactions.
 * Uses batch processing for efficiency.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import db from "./client-sqlite";
import { loadConfig } from "../config";

// Auto-load vault .env if CYBOS_ANTHROPIC_KEY not in environment
function ensureEnvLoaded(): void {
  if (process.env.CYBOS_ANTHROPIC_KEY) return;

  // Try vault .env first
  const config = loadConfig();
  const vaultEnvPaths = [
    config ? join(config.vault_path.replace(/^~/, homedir()), 'private', '.env') : null,
    join(homedir(), 'CybosVault', 'private', '.env'),
  ].filter(Boolean) as string[];

  // Also try project .env
  const projectEnv = join(import.meta.dir, '..', '..', '.env');
  vaultEnvPaths.push(projectEnv);

  for (const envPath of vaultEnvPaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let value = trimmed.slice(eqIdx + 1).trim();
            // Remove inline comments
            const commentIdx = value.indexOf('#');
            if (commentIdx > 0) value = value.slice(0, commentIdx).trim();
            // Only set if not already in environment
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
        if (process.env.CYBOS_ANTHROPIC_KEY) {
          console.log(`Loaded env from: ${envPath}`);
          return;
        }
      } catch (e) {
        // Ignore errors, try next file
      }
    }
  }
}

// Load env on module import
ensureEnvLoaded();
import { resolveEntity, isUserIdentity, isBlockedName, type ExtractedEntity } from "./entity-resolver";
import type { ExtractedItem, ExtractionResult } from "./prompts/types";
import { USER_IDENTITY as UserIdentity } from "./prompts/types";
import {
  CALL_SYSTEM_PROMPT,
  buildCallExtractionPrompt,
} from "./prompts/call-extraction";
import {
  EMAIL_SYSTEM_PROMPT,
  buildEmailExtractionPrompt,
} from "./prompts/email-extraction";
import {
  TELEGRAM_SYSTEM_PROMPT,
  buildTelegramExtractionPrompt,
} from "./prompts/telegram-extraction";

const MODEL = "claude-3-5-haiku-20241022";
const MAX_TOKENS = 4096;

// Cost tracking (Claude 3.5 Haiku pricing)
const INPUT_COST_PER_1K = 0.001; // $1/MTok
const OUTPUT_COST_PER_1K = 0.005; // $5/MTok

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.CYBOS_ANTHROPIC_KEY;
    if (!apiKey) {
      throw new Error(
        "CYBOS_ANTHROPIC_KEY environment variable is not set. " +
          "Set it with: export CYBOS_ANTHROPIC_KEY=sk-ant-... " +
          "(separate from Claude Code's ANTHROPIC_API_KEY)"
      );
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

export interface ExtractionStats {
  interactionsProcessed: number;
  itemsExtracted: number;
  entitiesResolved: number;
  entitiesCreated: number;
  tokensUsed: { input: number; output: number };
  costUsd: number;
  errors: string[];
}

/**
 * Call Claude to extract structured data
 */
async function callLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<{ result: ExtractionResult | null; tokens: { input: number; output: number } }> {
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const tokens = {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    };

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { result: null, tokens };
    }

    // Parse JSON response - handle markdown code blocks and trailing text
    let jsonText = textContent.text.trim();

    // Strip markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    // Find the JSON object boundaries - handle trailing text after JSON
    const startIdx = jsonText.indexOf("{");
    if (startIdx === -1) {
      console.error("No JSON object found in response");
      return { result: null, tokens };
    }

    // Find matching closing brace
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < jsonText.length; i++) {
      if (jsonText[i] === "{") braceCount++;
      if (jsonText[i] === "}") braceCount--;
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }

    if (endIdx === -1) {
      console.error("Unclosed JSON object in response");
      return { result: null, tokens };
    }

    const jsonOnly = jsonText.substring(startIdx, endIdx);

    try {
      const result = JSON.parse(jsonOnly) as ExtractionResult;
      return { result, tokens };
    } catch (parseError: any) {
      console.error("JSON parse error. Response was:");
      console.error(jsonOnly.substring(0, 500) + (jsonOnly.length > 500 ? "..." : ""));
      throw parseError;
    }
  } catch (error: any) {
    console.error("LLM call failed:", error.message);
    return { result: null, tokens: { input: 0, output: 0 } };
  }
}

/**
 * Extract from a call interaction
 */
async function extractFromCall(
  interactionId: string,
  folderPath: string
): Promise<{ result: ExtractionResult | null; tokens: { input: number; output: number } }> {
  // Read metadata
  const metadataPath = join(folderPath, "metadata.json");
  if (!existsSync(metadataPath)) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

  // Read transcript
  const transcriptPath = join(folderPath, "transcript.txt");
  const transcript = existsSync(transcriptPath)
    ? readFileSync(transcriptPath, "utf-8")
    : "";

  if (!transcript) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  // Read notes if available
  const notesPath = join(folderPath, "notes.md");
  const notes = existsSync(notesPath)
    ? readFileSync(notesPath, "utf-8")
    : undefined;

  // Build attendee list
  const attendees: string[] = [];
  if (metadata.attendees) {
    for (const a of metadata.attendees) {
      const name = a.details?.person?.name?.fullName || a.email;
      if (name) attendees.push(name);
    }
  }
  if (metadata.inferred_speakers?.other) {
    if (!attendees.includes(metadata.inferred_speakers.other)) {
      attendees.push(metadata.inferred_speakers.other);
    }
  }

  const prompt = buildCallExtractionPrompt(
    metadata.title || "Untitled Call",
    metadata.date,
    attendees,
    transcript.slice(0, 50000), // Limit transcript size
    notes?.slice(0, 10000)
  );

  return callLLM(CALL_SYSTEM_PROMPT, prompt);
}

/**
 * Extract from an email interaction
 */
async function extractFromEmail(
  interactionId: string,
  folderPath: string
): Promise<{ result: ExtractionResult | null; tokens: { input: number; output: number } }> {
  // Read metadata
  const metadataPath = join(folderPath, "metadata.json");
  if (!existsSync(metadataPath)) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

  // Read body
  const bodyPath = join(folderPath, "body.md");
  const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf-8") : "";

  if (!body) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  const fromName = metadata.from?.name || metadata.from?.email || "Unknown";
  const prompt = buildEmailExtractionPrompt(
    metadata.subject || "No Subject",
    metadata.date,
    fromName,
    metadata.to || [],
    body.slice(0, 30000)
  );

  return callLLM(EMAIL_SYSTEM_PROMPT, prompt);
}

/**
 * Extract from a telegram conversation
 */
async function extractFromTelegram(
  interactionId: string,
  filePath: string
): Promise<{ result: ExtractionResult | null; tokens: { input: number; output: number } }> {
  if (!existsSync(filePath)) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  const content = readFileSync(filePath, "utf-8");

  // Parse header
  const lines = content.split("\n");
  let title = "";
  let username: string | undefined;
  let type = "private";

  for (const line of lines) {
    if (line.startsWith("# ") && !title) {
      title = line.substring(2).trim();
    }
    const usernameMatch = line.match(/^\*\*Username:\*\*\s*@?(.+)$/);
    if (usernameMatch) username = usernameMatch[1].trim();
    const typeMatch = line.match(/^\*\*Type:\*\*\s*(.+)$/);
    if (typeMatch) type = typeMatch[1].trim().toLowerCase();
    if (line.trim() === "---") break;
  }

  // Get messages section (after header)
  const headerEnd = content.indexOf("---");
  const messages =
    headerEnd > 0 ? content.slice(headerEnd + 3).trim() : content;

  if (!messages || messages.length < 50) {
    return { result: null, tokens: { input: 0, output: 0 } };
  }

  const prompt = buildTelegramExtractionPrompt(
    title || "Unknown",
    username,
    type,
    messages.slice(0, 40000)
  );

  return callLLM(TELEGRAM_SYSTEM_PROMPT, prompt);
}

/**
 * Calculate trust level based on confidence, evidence, and linkage
 */
function calculateTrustLevel(
  item: ExtractedItem,
  hasOwnerEntity: boolean,
  hasTargetEntity: boolean
): "high" | "medium" | "low" {
  // No evidence quote = automatic low trust
  if (!item.evidence_quote) return "low";

  // High trust: explicit statement with entity linkage
  if (item.confidence >= 0.85 && item.evidence_quote && (hasOwnerEntity || hasTargetEntity)) {
    return "high";
  }

  // Medium trust: clear statement, but missing linkage or slightly lower confidence
  if (item.confidence >= 0.65 && item.evidence_quote) {
    return "medium";
  }

  // Low trust: uncertain or incomplete
  return "low";
}

/**
 * Ensure user entity exists in database
 */
function ensureUserEntityExists(): void {
  const existing = db.queryOne<{ slug: string }>(
    "SELECT slug FROM entities WHERE slug = ?",
    [UserIdentity.slug]
  );

  if (!existing) {
    db.run(
      `INSERT INTO entities (slug, name, type, last_activity, is_candidate)
       VALUES (?, ?, 'person', datetime('now'), 0)
       ON CONFLICT (slug) DO NOTHING`,
      [UserIdentity.slug, UserIdentity.name]
    );
  }
}

/**
 * Store extracted items in database with provenance
 */
function storeExtractedItems(
  interactionId: string,
  interactionDate: Date,
  interactionType: "call" | "email" | "telegram",
  filePath: string,
  items: ExtractedItem[],
  resolvedEntities: Map<string, { slug: string; name: string }>
): number {
  let count = 0;

  // Ensure user entity exists before storing items that might reference it
  let userEntityEnsured = false;

  for (const item of items) {
    // Resolve owner to entity slug if possible
    let ownerEntity: string | null = null;
    if (item.owner) {
      // Check if owner is user identity
      if (isUserIdentity(item.owner)) {
        if (!userEntityEnsured) {
          ensureUserEntityExists();
          userEntityEnsured = true;
        }
        ownerEntity = UserIdentity.slug;
      } else {
        // Try person first, then company
        const personKey = `person:${item.owner.toLowerCase()}`;
        const companyKey = `company:${item.owner.toLowerCase()}`;
        const resolved = resolvedEntities.get(personKey) || resolvedEntities.get(companyKey);
        if (resolved && resolved.slug !== "_blocked_") {
          ownerEntity = resolved.slug;
        }
      }
    }

    // Resolve target to entity slug if possible
    let targetEntity: string | null = null;
    if (item.target) {
      // Check if target is user identity
      if (isUserIdentity(item.target)) {
        if (!userEntityEnsured) {
          ensureUserEntityExists();
          userEntityEnsured = true;
        }
        targetEntity = UserIdentity.slug;
      } else {
        // Try person first, then company
        const personKey = `person:${item.target.toLowerCase()}`;
        const companyKey = `company:${item.target.toLowerCase()}`;
        const resolved = resolvedEntities.get(personKey) || resolvedEntities.get(companyKey);
        if (resolved && resolved.slug !== "_blocked_") {
          targetEntity = resolved.slug;
        }
      }
    }

    // Normalize item type to valid values
    const validTypes = ["promise", "action_item", "decision", "question", "metric", "deal_mention", "entity_context"];
    let itemType = item.type;
    if (!validTypes.includes(itemType)) {
      // Map common invalid types to valid ones
      if (itemType === "info" || itemType === "context" || itemType === "note") {
        itemType = "entity_context";
      } else if (itemType === "task" || itemType === "todo") {
        itemType = "action_item";
      } else if (itemType === "commitment") {
        itemType = "promise";
      } else {
        console.log(`  Warning: Skipping item with invalid type "${itemType}"`);
        continue; // Skip items with unknown types
      }
    }

    const itemId = `${interactionId}-${itemType}-${count}`;

    // Normalize status to valid values
    let status = item.status || "pending";
    if (!["pending", "completed", "cancelled"].includes(status)) {
      status = "pending"; // Default to pending for invalid values
    }

    // Calculate trust level
    const trustLevel = calculateTrustLevel(item, !!ownerEntity, !!targetEntity);

    // Insert or update extracted item
    db.run(
      `INSERT INTO extracted_items (
        id, interaction_id, type, content, owner_name, owner_entity,
        target_name, target_entity,
        source_path, source_quote, trust_level,
        due_date, status, confidence, extracted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (id) DO UPDATE SET
        content = excluded.content,
        owner_name = excluded.owner_name,
        owner_entity = excluded.owner_entity,
        target_name = excluded.target_name,
        target_entity = excluded.target_entity,
        source_path = excluded.source_path,
        source_quote = excluded.source_quote,
        trust_level = excluded.trust_level,
        due_date = excluded.due_date,
        confidence = excluded.confidence`,
      [
        itemId,
        interactionId,
        itemType,
        item.content,
        item.owner || null,
        ownerEntity,
        item.target || null,
        targetEntity,
        filePath,
        item.evidence_quote || null,
        trustLevel,
        item.due_date || null,
        status,
        item.confidence,
      ]
    );

    count++;
  }

  return count;
}

/**
 * Update interaction participants with resolved entities
 */
function updateInteractionParticipants(
  interactionId: string,
  resolvedEntities: Map<string, { slug: string; name: string }>
): void {
  const slugs: string[] = [];
  const names: string[] = [];

  for (const [key, entity] of resolvedEntities) {
    if ((key.startsWith("person:") || key.startsWith("company:")) && entity.slug !== "_blocked_") {
      slugs.push(entity.slug);
      names.push(entity.name);
    }
  }

  if (slugs.length > 0) {
    // Get existing participants
    const existing = db.queryOne<{ participants: string; participant_names: string }>(
      'SELECT participants, participant_names FROM interactions WHERE id = ?',
      [interactionId]
    );

    if (existing) {
      // Merge with existing participants
      const existingSlugs: string[] = existing.participants ? JSON.parse(existing.participants) : [];
      const existingNames: string[] = existing.participant_names ? JSON.parse(existing.participant_names) : [];

      // Add new unique slugs and names
      for (let i = 0; i < slugs.length; i++) {
        if (!existingSlugs.includes(slugs[i])) {
          existingSlugs.push(slugs[i]);
          existingNames.push(names[i]);
        }
      }

      // Update interaction
      db.run(
        `UPDATE interactions SET
          participants = ?,
          participant_names = ?
        WHERE id = ?`,
        [JSON.stringify(existingSlugs), JSON.stringify(existingNames), interactionId]
      );
    }
  }
}

/**
 * Check if interaction has already been extracted
 */
function isExtracted(interactionId: string): boolean {
  const result = db.queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM extracted_items WHERE interaction_id = ?',
    [interactionId]
  );
  return result !== null && result.count > 0;
}

/**
 * Extract from a single interaction
 */
async function extractFromInteraction(
  interaction: {
    id: string;
    type: string;
    file_path: string;
    timestamp: string;
  },
  stats: ExtractionStats
): Promise<void> {
  let extraction: {
    result: ExtractionResult | null;
    tokens: { input: number; output: number };
  };

  // Call appropriate extractor
  switch (interaction.type) {
    case "call":
      extraction = await extractFromCall(interaction.id, interaction.file_path);
      break;
    case "email":
      extraction = await extractFromEmail(
        interaction.id,
        interaction.file_path
      );
      break;
    case "telegram":
      extraction = await extractFromTelegram(
        interaction.id,
        interaction.file_path
      );
      break;
    default:
      return;
  }

  // Track tokens
  stats.tokensUsed.input += extraction.tokens.input;
  stats.tokensUsed.output += extraction.tokens.output;

  if (!extraction.result) {
    return;
  }

  const interactionDate = new Date(interaction.timestamp);

  // Resolve entities (skip blocked names like "Speaker", "Me", etc.)
  const resolvedEntities = new Map<string, { slug: string; name: string }>();
  let newEntities = 0;

  for (const entity of extraction.result.entities || []) {
    // Skip blocked names entirely
    if (isBlockedName(entity.name)) {
      continue;
    }

    const key = `${entity.type}:${entity.name.toLowerCase()}`;
    if (!resolvedEntities.has(key)) {
      const resolved = resolveEntity(
        entity as ExtractedEntity,
        interactionDate
      );
      // Skip if resolver returned blocked marker
      if (resolved.slug === "_blocked_") {
        continue;
      }
      resolvedEntities.set(key, { slug: resolved.slug, name: resolved.name });
      stats.entitiesResolved++;
      if (resolved.isNew) {
        newEntities++;
        stats.entitiesCreated++;
      }
    }
  }

  // Store extracted items with provenance
  const itemCount = storeExtractedItems(
    interaction.id,
    interactionDate,
    interaction.type as "call" | "email" | "telegram",
    interaction.file_path,
    extraction.result.items || [],
    resolvedEntities
  );
  stats.itemsExtracted += itemCount;

  // Update interaction participants
  updateInteractionParticipants(interaction.id, resolvedEntities);

  stats.interactionsProcessed++;

  console.log(
    `  ${interaction.id}: ${itemCount} items, ${resolvedEntities.size} entities (${newEntities} new)`
  );
}

/**
 * Run extraction on interactions that need it
 */
export async function runExtraction(
  options: {
    type?: "call" | "email" | "telegram";
    limit?: number;
    force?: boolean;
  } = {}
): Promise<ExtractionStats> {
  console.log("\n=== Running LLM Extraction ===\n");

  const stats: ExtractionStats = {
    interactionsProcessed: 0,
    itemsExtracted: 0,
    entitiesResolved: 0,
    entitiesCreated: 0,
    tokensUsed: { input: 0, output: 0 },
    costUsd: 0,
    errors: [],
  };

  // Build query to find interactions needing extraction
  let sql = `
    SELECT id, type, file_path, timestamp
    FROM interactions i
    WHERE file_path IS NOT NULL
  `;

  const params: any[] = [];

  if (!options.force) {
    // Only process interactions without extracted items
    sql += ` AND NOT EXISTS (SELECT 1 FROM extracted_items e WHERE e.interaction_id = i.id)`;
  }

  if (options.type) {
    sql += ` AND type = ?`;
    params.push(options.type);
  }

  sql += ` ORDER BY timestamp DESC`;

  if (options.limit) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const interactions = db.query<{
    id: string;
    type: string;
    file_path: string;
    timestamp: string;
  }>(sql, params);

  console.log(`Found ${interactions.length} interactions to process\n`);

  for (const interaction of interactions) {
    try {
      await extractFromInteraction(interaction, stats);
    } catch (error: any) {
      console.error(`Error extracting ${interaction.id}:`, error.message);
      stats.errors.push(`${interaction.id}: ${error.message}`);
    }
  }

  // Calculate cost
  stats.costUsd =
    (stats.tokensUsed.input / 1000) * INPUT_COST_PER_1K +
    (stats.tokensUsed.output / 1000) * OUTPUT_COST_PER_1K;

  console.log("\n=== Extraction Results ===");
  console.log(`Interactions processed: ${stats.interactionsProcessed}`);
  console.log(`Items extracted: ${stats.itemsExtracted}`);
  console.log(`Entities resolved: ${stats.entitiesResolved}`);
  console.log(`Entities created: ${stats.entitiesCreated}`);
  console.log(
    `Tokens used: ${stats.tokensUsed.input} input, ${stats.tokensUsed.output} output`
  );
  console.log(`Estimated cost: $${stats.costUsd.toFixed(4)}`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    stats.errors.forEach((e) => console.log(`  - ${e}`));
  }

  return stats;
}

// CLI entry point
if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    const options: Parameters<typeof runExtraction>[0] = {};

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--type" && args[i + 1]) {
        options.type = args[i + 1] as "call" | "email" | "telegram";
        i++;
      } else if (args[i] === "--limit" && args[i + 1]) {
        options.limit = parseInt(args[i + 1], 10);
        i++;
      } else if (args[i] === "--force") {
        options.force = true;
      }
    }

    await runExtraction(options);
  } finally {
    db.close();
  }
}
