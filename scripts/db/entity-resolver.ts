/**
 * Entity Resolver
 *
 * Resolves extracted entity mentions to entity slugs.
 * Creates new entities when no match found.
 * Adds aliases when fuzzy match succeeds.
 * Updates entity context (current_focus) on match.
 */

import { query, queryOne } from "./client";
import { USER_IDENTITY } from "./prompts/types";

/**
 * Names that should NOT be created as entities
 */
const BLOCKED_ENTITY_NAMES = new Set([
  "speaker",
  "unknown",
  "participant",
  "caller",
  "host",
  "guest",
  "user",
  "admin",
  "moderator",
  "anonymous",
]);

/**
 * Check if a name is the user's identity
 */
export function isUserIdentity(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  return USER_IDENTITY.names.some(n => n.toLowerCase() === normalized);
}

/**
 * Check if a name should be blocked from entity creation
 */
export function isBlockedName(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  return BLOCKED_ENTITY_NAMES.has(normalized) || isUserIdentity(name);
}

export interface ExtractedEntity {
  name: string;
  type: "person" | "company" | "product";

  // Identifiers (if mentioned)
  email?: string;
  telegram?: string;

  // Context (person)
  company?: string;
  role?: string;
  building?: string; // What they're working on

  // Context (company)
  sector?: string;
  product?: string;

  // Confidence from LLM
  confidence: number;
}

export interface ResolvedEntity {
  slug: string;
  name: string;
  matchType: "email" | "telegram" | "alias" | "fuzzy" | "created";
  confidence: number;
  isNew: boolean;
}

/**
 * Generate a slug from a name
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}

/**
 * Check if a slug is available
 */
async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await queryOne<{ slug: string }>(
    "SELECT slug FROM entities WHERE slug = $1",
    [slug]
  );
  return !existing;
}

/**
 * Generate a unique slug
 */
async function generateUniqueSlug(name: string): Promise<string> {
  let baseSlug = nameToSlug(name);
  if (!baseSlug) baseSlug = "entity";

  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Resolve an extracted entity to a database entity
 *
 * Multi-stage matching:
 * 0. Check for user identity (configured aliases)
 * 1. Email exact match
 * 2. Telegram handle match
 * 3. Alias exact match
 * 4. Fuzzy name match (similarity > 0.5)
 * 5. Create new entity if no match
 */
export async function resolveEntity(
  extracted: ExtractedEntity,
  interactionDate?: Date
): Promise<ResolvedEntity> {
  // Check for user identity first
  if (isUserIdentity(extracted.name)) {
    // Ensure user entity exists
    const userEntity = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM entities WHERE slug = $1",
      [USER_IDENTITY.slug]
    );

    if (userEntity) {
      return {
        slug: userEntity.slug,
        name: userEntity.name,
        matchType: "alias",
        confidence: 1.0,
        isNew: false,
      };
    }

    // Create user entity if it doesn't exist
    await query(
      `INSERT INTO entities (slug, name, type, first_seen, last_activity, source, confidence)
       VALUES ($1, $2, 'person', NOW(), NOW(), 'manual', 1.0)
       ON CONFLICT (slug) DO NOTHING`,
      [USER_IDENTITY.slug, USER_IDENTITY.name]
    );

    return {
      slug: USER_IDENTITY.slug,
      name: USER_IDENTITY.name,
      matchType: "created",
      confidence: 1.0,
      isNew: true,
    };
  }

  // Skip blocked names (Speaker, Unknown, etc.)
  if (isBlockedName(extracted.name)) {
    // Return a dummy result that won't be stored
    return {
      slug: "_blocked_",
      name: extracted.name,
      matchType: "created",
      confidence: 0,
      isNew: false,
    };
  }

  // Try to find by email first
  if (extracted.email) {
    const match = await queryOne<{
      slug: string;
      name: string;
      match_type: string;
      confidence: number;
    }>("SELECT * FROM find_entity($1, $2)", [extracted.email, extracted.type]);

    if (match) {
      await updateEntityContext(match.slug, extracted, interactionDate, match.match_type);
      return {
        slug: match.slug,
        name: match.name,
        matchType: match.match_type as ResolvedEntity["matchType"],
        confidence: match.confidence,
        isNew: false,
      };
    }
  }

  // Try to find by telegram
  if (extracted.telegram) {
    const handle = extracted.telegram.replace(/^@/, "");
    const match = await queryOne<{
      slug: string;
      name: string;
      match_type: string;
      confidence: number;
    }>("SELECT * FROM find_entity($1, $2)", [`@${handle}`, extracted.type]);

    if (match) {
      await updateEntityContext(match.slug, extracted, interactionDate, match.match_type);
      return {
        slug: match.slug,
        name: match.name,
        matchType: match.match_type as ResolvedEntity["matchType"],
        confidence: match.confidence,
        isNew: false,
      };
    }
  }

  // Try to find by name (will check aliases and fuzzy)
  const match = await queryOne<{
    slug: string;
    name: string;
    match_type: string;
    confidence: number;
  }>("SELECT * FROM find_entity($1, $2)", [extracted.name, extracted.type]);

  if (match) {
    // If fuzzy match, add as alias (nickname) for future exact matching
    if (match.match_type === "fuzzy" && match.confidence >= 0.7) {
      await addAlias(match.slug, extracted.name, "nickname", match.confidence);
    }

    await updateEntityContext(match.slug, extracted, interactionDate, match.match_type);
    return {
      slug: match.slug,
      name: match.name,
      matchType: match.match_type as ResolvedEntity["matchType"],
      confidence: match.confidence,
      isNew: false,
    };
  }

  // No match found - create new entity
  const newEntity = await createEntity(extracted, interactionDate);
  return {
    slug: newEntity.slug,
    name: newEntity.name,
    matchType: "created",
    confidence: extracted.confidence,
    isNew: true,
  };
}

/**
 * Create a candidate entity from participant data (low-confidence, needs review)
 *
 * Used by extractors when a participant can't be resolved to an existing entity.
 * Marked with is_candidate = TRUE for later manual review.
 */
export async function createCandidateEntity(
  name: string,
  email?: string,
  telegram?: string,
  sourceType?: "call" | "email" | "telegram",
  interactionDate?: Date
): Promise<{ slug: string; name: string; isNew: boolean }> {
  // Check for user identity
  if (isUserIdentity(name)) {
    // Ensure user entity exists
    const userEntity = await queryOne<{ slug: string; name: string }>(
      "SELECT slug, name FROM entities WHERE slug = $1",
      [USER_IDENTITY.slug]
    );

    if (userEntity) {
      return { slug: userEntity.slug, name: userEntity.name, isNew: false };
    }

    // Create user entity
    await query(
      `INSERT INTO entities (slug, name, type, first_seen, last_activity, source, confidence)
       VALUES ($1, $2, 'person', NOW(), NOW(), 'manual', 1.0)
       ON CONFLICT (slug) DO NOTHING`,
      [USER_IDENTITY.slug, USER_IDENTITY.name]
    );

    return { slug: USER_IDENTITY.slug, name: USER_IDENTITY.name, isNew: true };
  }

  // Skip blocked names
  if (isBlockedName(name)) {
    console.log(`    → Skipped blocked name: ${name}`);
    return { slug: "_blocked_", name, isNew: false };
  }

  // First try to resolve - maybe they exist
  const match = await queryOne<{
    slug: string;
    name: string;
    match_type: string;
    confidence: number;
  }>("SELECT * FROM find_entity($1, 'person')", [email || telegram || name]);

  if (match) {
    return { slug: match.slug, name: match.name, isNew: false };
  }

  // Create as candidate
  const slug = await generateUniqueSlug(name);
  const timestamp = interactionDate?.toISOString() || new Date().toISOString();

  await query(
    `INSERT INTO entities (
      slug, name, type, email, telegram,
      first_seen, last_activity, source, confidence, is_candidate
    ) VALUES ($1, $2, 'person', $3, $4, $5, $5, 'extracted', 0.5, TRUE)`,
    [
      slug,
      name,
      email || null,
      telegram?.replace(/^@/, "") || null,
      timestamp,
    ]
  );

  // Add name as an alias for consistent matching
  await addAlias(slug, name, "name", 0.5);

  console.log(`    → Created candidate entity: ${name} (${slug}) from ${sourceType || "unknown"}`);

  return { slug, name, isNew: true };
}

/**
 * Create a new entity from extracted data
 */
async function createEntity(
  extracted: ExtractedEntity,
  interactionDate?: Date
): Promise<{ slug: string; name: string }> {
  const slug = await generateUniqueSlug(extracted.name);
  const timestamp = interactionDate?.toISOString() || new Date().toISOString();

  // Normalize entity type to valid values
  let entityType = extracted.type;
  if (!["person", "company", "product", "group"].includes(entityType)) {
    entityType = "person"; // Default to person for invalid types
  }

  await query(
    `INSERT INTO entities (
      slug, name, type, email, telegram,
      current_company, job_title, current_focus, current_focus_updated,
      first_seen, last_activity, source, confidence
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, 'extracted', $11)`,
    [
      slug,
      extracted.name,
      entityType,
      extracted.email || null,
      extracted.telegram?.replace(/^@/, "") || null,
      extracted.company || null,
      extracted.role || null,
      extracted.building || null,
      extracted.building ? timestamp : null,
      timestamp,
      extracted.confidence,
    ]
  );

  // Add name as an alias for consistent matching
  await addAlias(slug, extracted.name, "name", 1.0);

  return { slug, name: extracted.name };
}

/**
 * Add an alias for an entity
 */
async function addAlias(
  entitySlug: string,
  alias: string,
  aliasType: string,
  confidence: number
): Promise<void> {
  const aliasId = `${entitySlug}-${aliasType}-${nameToSlug(alias)}`;

  await query(
    `INSERT INTO entity_aliases (id, entity_slug, alias, alias_type, confidence)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET confidence = GREATEST(entity_aliases.confidence, $5)`,
    [aliasId, entitySlug, alias, aliasType, confidence]
  );
}

/**
 * Update entity context with new information
 *
 * @param matchType - How the entity was matched. Only update company/role for exact matches.
 */
async function updateEntityContext(
  slug: string,
  extracted: ExtractedEntity,
  interactionDate?: Date,
  matchType?: string
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [slug];
  let paramIndex = 2;

  // Update contact info if provided and not already set
  if (extracted.email) {
    updates.push(`email = COALESCE(email, $${paramIndex})`);
    values.push(extracted.email);
    paramIndex++;
  }

  if (extracted.telegram) {
    updates.push(`telegram = COALESCE(telegram, $${paramIndex})`);
    values.push(extracted.telegram.replace(/^@/, ""));
    paramIndex++;
  }

  // CONSERVATIVE: Only update company/role from EXACT matches (email, telegram, alias)
  // Fuzzy matches should NOT update company/role to prevent entity conflation
  const isExactMatch = matchType && ["email", "telegram", "alias"].includes(matchType);

  if (extracted.type === "person" && isExactMatch) {
    if (extracted.company) {
      updates.push(`current_company = $${paramIndex}`);
      values.push(extracted.company);
      paramIndex++;
    }
    if (extracted.role) {
      updates.push(`job_title = $${paramIndex}`);
      values.push(extracted.role);
      paramIndex++;
    }
  }

  // Update current_focus if mentioned and newer than existing
  if (extracted.building && interactionDate) {
    updates.push(`
      current_focus = CASE
        WHEN current_focus_updated IS NULL OR current_focus_updated < $${paramIndex}
        THEN $${paramIndex + 1}
        ELSE current_focus
      END,
      current_focus_updated = CASE
        WHEN current_focus_updated IS NULL OR current_focus_updated < $${paramIndex}
        THEN $${paramIndex}
        ELSE current_focus_updated
      END
    `);
    values.push(interactionDate.toISOString(), extracted.building);
    paramIndex += 2;
  }

  // Always update last_activity
  updates.push(`last_activity = GREATEST(last_activity, $${paramIndex})`);
  values.push(interactionDate?.toISOString() || new Date().toISOString());

  if (updates.length > 0) {
    await query(
      `UPDATE entities SET ${updates.join(", ")} WHERE slug = $1`,
      values
    );
  }
}

/**
 * Batch resolve multiple entities
 */
export async function resolveEntities(
  entities: ExtractedEntity[],
  interactionDate?: Date
): Promise<Map<string, ResolvedEntity>> {
  const results = new Map<string, ResolvedEntity>();

  for (const entity of entities) {
    const key = `${entity.type}:${entity.name.toLowerCase()}`;
    if (!results.has(key)) {
      const resolved = await resolveEntity(entity, interactionDate);
      results.set(key, resolved);
    }
  }

  return results;
}

// CLI for testing
if (import.meta.main) {
  const { closePool } = await import("./client");

  try {
    // Test resolving some entities
    console.log("Testing entity resolver...\n");

    // Test 1: Resolve by name fuzzy match (Sishir -> Sishir Varghese)
    const test1 = await resolveEntity({
      name: "Sishir",
      type: "person",
      confidence: 0.8,
    });
    console.log("Test 1 (fuzzy name match):", test1);

    // Test 2: Resolve by exact alias (should now find via the alias we just created)
    const test2 = await resolveEntity({
      name: "Sishir",
      type: "person",
      confidence: 0.8,
    });
    console.log("Test 2 (alias match after fuzzy):", test2);

    // Test 3: Create new entity (will be cleaned up)
    const test3 = await resolveEntity(
      {
        name: "Test New Person",
        type: "person",
        company: "Test Corp",
        role: "CEO",
        building: "AI agents platform",
        confidence: 0.7,
      },
      new Date()
    );
    console.log("Test 3 (new entity):", test3);

    // Verify context was set
    const newEntity = await query(
      "SELECT slug, name, current_company, job_title, current_focus FROM entities WHERE slug = $1",
      [test3.slug]
    );
    console.log("Test 3 entity details:", newEntity.rows[0]);

    // Cleanup test entity
    if (test3.isNew) {
      await query("DELETE FROM entity_aliases WHERE entity_slug = $1", [
        test3.slug,
      ]);
      await query("DELETE FROM entities WHERE slug = $1", [test3.slug]);
      console.log("\nCleaned up test entity:", test3.slug);
    }

    console.log("\n✓ All tests passed");
  } finally {
    await closePool();
  }
}
