/**
 * Query Interface
 *
 * Provides query functions for commands to use.
 * All queries return structured data that can be used in briefs, GTD, etc.
 *
 * Usage:
 *   bun scripts/db/query.ts entity <slug>
 *   bun scripts/db/query.ts find-entity <identifier>
 *   bun scripts/db/query.ts search-entities <query>
 *   bun scripts/db/query.ts search <query>
 *   bun scripts/db/query.ts who-shared <deal-slug>
 *   bun scripts/db/query.ts what-doing <slug> [when]
 *   bun scripts/db/query.ts pending [--owner <slug>] [--type <type>]
 *   bun scripts/db/query.ts timeline <slug>
 *   bun scripts/db/query.ts list-entities [--type <type>]
 */

import { query, queryOne, closePool } from "./client";

// ============================================================================
// Types
// ============================================================================

export interface Entity {
  slug: string;
  name: string;
  type: "person" | "company" | "product" | "group";
  email?: string;
  telegram?: string;
  twitter?: string;
  linkedin?: string;
  current_company?: string;
  job_title?: string;
  current_focus?: string;
  current_focus_updated?: Date;
  website?: string;
  sector?: string;
  file_path?: string;
  first_seen?: Date;
  last_activity?: Date;
  interaction_count: number;
  confidence: number;
  source: string;
}

export interface EntityContext extends Entity {
  interactions: Interaction[];
  pending_items: ExtractedItem[];
  aliases: string[];
}

export interface Interaction {
  id: string;
  type: "call" | "email" | "telegram";
  channel: string;
  date: string;
  timestamp: Date;
  from_entity?: string;
  from_name?: string;
  participants: string[];
  participant_names: string[];
  summary?: string;
  file_path?: string;
}

export interface ExtractedItem {
  id: string;
  interaction_id: string;
  type: string;
  content: string;
  owner_name?: string;
  owner_entity?: string;
  target_name?: string;
  target_entity?: string;
  due_date?: string;
  status: string;
  confidence: number;
  // v1.1: Provenance fields
  source_type?: string;
  source_path?: string;
  source_quote?: string;
  source_span?: string;
  trust_level?: "high" | "medium" | "low";
}

export interface ExtractedItemWithProvenance extends ExtractedItem {
  interaction_date: Date;
  interaction_type: string;
  is_actionable: boolean;
  relevance_score: number;
  provenance: {
    source_type?: string;
    source_path?: string;
    source_quote?: string;
    source_span?: string;
  };
}

export interface Deal {
  slug: string;
  name: string;
  status?: string;
  stage?: string;
  raising?: string;
  valuation?: string;
  sector?: string;
  thesis_fit?: string;
  lead_partner?: string;
  introduced_by?: string;
  primary_contact?: string;
  folder_path?: string;
  research_count: number;
  first_contact?: Date;
  last_activity?: Date;
}

export interface SearchResult {
  slug: string;
  name: string;
  type: string;
  match_type: string;
  confidence: number;
  snippet?: string;
}

// ============================================================================
// Explorer Dashboard Types
// ============================================================================

export interface ExplorerDashboard {
  timeRange: { start: string; end: string; days: number };
  deals: DealSummary[];
  entities: EntitySummary[];
  myCommitments: ExplorerItem[];
  metricsByCompany: MetricsByCompany[];
}

export interface DealSummary {
  slug: string;
  name: string;
  names: string[];  // All variant names (for fuzzy grouped)
  hasFolder: boolean;
  lastActivity: string;
  items: {
    metrics: ExplorerItem[];
    mentions: ExplorerItem[];
    decisions: ExplorerItem[];
  };
  introducedBy?: { name: string; slug: string };
}

export interface EntitySummary {
  slug: string;
  name: string;
  type: 'person' | 'company' | 'product' | 'group';
  email?: string;
  telegram?: string;
  interactionCount: number;
  lastActivity: string;
  isCandidate: boolean;
  items: {
    promisesIMade: ExplorerItem[];
    promisesToMe: ExplorerItem[];
    actionItems: ExplorerItem[];
    decisions: ExplorerItem[];
    metrics: ExplorerItem[];
  };
}

export interface ExplorerItem {
  id: string;
  type: 'action_item' | 'promise' | 'decision' | 'metric' | 'question' | 'deal_mention';
  content: string;
  ownerName?: string;
  ownerSlug?: string;
  targetName?: string;
  targetSlug?: string;
  confidence: number;
  trustLevel: 'high' | 'medium' | 'low';
  sourceQuote: string;
  source: {
    type: 'call' | 'email' | 'telegram';
    date: string;
    id: string;
  };
}

export interface MetricsByCompany {
  company: string;
  companySlug?: string;
  metrics: ExplorerItem[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate relevance score for an item based on confidence and age decay
 * Score: confidence * time_decay
 * - Time decay: 1.0 for today, 0.5 for 7 days ago, 0.25 for 14 days
 */
export function calculateRelevance(
  confidence: number,
  interactionDate: Date
): number {
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Exponential decay: halflife of 7 days
  const timeDecay = Math.pow(0.5, daysSince / 7);
  return confidence * timeDecay;
}

/**
 * Check if an item is actionable (pending, has evidence, medium+ trust)
 */
export function isActionable(item: {
  status?: string;
  trust_level?: string;
  source_quote?: string;
  type?: string;
}): boolean {
  // Must be pending
  if (item.status !== "pending") return false;
  // Must be an actionable type
  if (!["promise", "action_item"].includes(item.type || "")) return false;
  // Must have at least medium trust
  if (item.trust_level === "low") return false;
  // Must have evidence
  if (!item.source_quote) return false;
  return true;
}

/**
 * Transform extracted item to include provenance and actionability
 */
function enrichItem(
  item: ExtractedItem & { interaction_date: Date; interaction_type: string }
): ExtractedItemWithProvenance {
  const interactionDate = new Date(item.interaction_date);
  return {
    ...item,
    is_actionable: isActionable(item),
    relevance_score: calculateRelevance(item.confidence, interactionDate),
    provenance: {
      source_type: item.source_type,
      source_path: item.source_path,
      source_quote: item.source_quote,
      source_span: item.source_span,
    },
  };
}

// ============================================================================
// Entity Queries
// ============================================================================

/**
 * Get full entity context including interactions and pending items
 */
export async function getEntityContext(
  slug: string,
  options: { limit?: number; includeInteractions?: boolean } = {}
): Promise<EntityContext | null> {
  const { limit = 10, includeInteractions = true } = options;

  // Get entity
  const entity = await queryOne<Entity>(
    `SELECT * FROM entities WHERE slug = $1`,
    [slug]
  );

  if (!entity) return null;

  // Get aliases
  const aliasResult = await query<{ alias: string }>(
    `SELECT alias FROM entity_aliases WHERE entity_slug = $1`,
    [slug]
  );
  const aliases = aliasResult.rows.map((r) => r.alias);

  // Get interactions
  let interactions: Interaction[] = [];
  if (includeInteractions) {
    const interactionResult = await query<Interaction>(
      `SELECT id, type, channel, date, timestamp, from_entity, from_name,
              participants, participant_names, summary, file_path
       FROM interactions
       WHERE participants ? $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [slug, limit]
    );
    interactions = interactionResult.rows;
  }

  // Get pending items
  const itemsResult = await query<ExtractedItem>(
    `SELECT ei.*
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE (ei.owner_entity = $1 OR i.participants ? $1)
       AND ei.status = 'pending'
       AND ei.type IN ('promise', 'action_item')
     ORDER BY ei.due_date NULLS LAST, i.timestamp DESC
     LIMIT 20`,
    [slug]
  );

  return {
    ...entity,
    interactions,
    pending_items: itemsResult.rows,
    aliases,
  };
}

/**
 * Find entity by identifier (email, telegram, name)
 */
export async function findEntity(
  identifier: string,
  type?: string
): Promise<SearchResult | null> {
  const result = await queryOne<{
    slug: string;
    name: string;
    match_type: string;
    confidence: number;
  }>(`SELECT * FROM find_entity($1, $2)`, [identifier, type || null]);

  if (!result) return null;

  // Get entity type
  const entity = await queryOne<{ type: string }>(
    `SELECT type FROM entities WHERE slug = $1`,
    [result.slug]
  );

  return {
    slug: result.slug,
    name: result.name,
    type: entity?.type || "unknown",
    match_type: result.match_type,
    confidence: result.confidence,
  };
}

/**
 * Search entities with fuzzy matching
 */
export async function searchEntities(
  searchQuery: string,
  options: { type?: string; limit?: number } = {}
): Promise<SearchResult[]> {
  const { type, limit = 10 } = options;

  let whereClause = "e.name % $1";
  const params: any[] = [searchQuery, limit];

  if (type) {
    whereClause += " AND e.type = $3";
    params.push(type);
  }

  const result = await query<{
    slug: string;
    name: string;
    type: string;
    similarity: number;
  }>(
    `SELECT e.slug, e.name, e.type, similarity(e.name, $1) as similarity
     FROM entities e
     WHERE ${whereClause}
     ORDER BY similarity DESC
     LIMIT $2`,
    params
  );

  return result.rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    type: r.type,
    match_type: "fuzzy",
    confidence: r.similarity,
  }));
}

/**
 * List all entities with optional filtering
 */
export async function listEntities(
  options: { type?: string; limit?: number; offset?: number } = {}
): Promise<Entity[]> {
  const { type, limit = 50, offset = 0 } = options;

  let whereClause = "TRUE";
  const params: any[] = [limit, offset];

  if (type) {
    whereClause = "type = $3";
    params.push(type);
  }

  const result = await query<Entity>(
    `SELECT * FROM entities
     WHERE ${whereClause}
     ORDER BY interaction_count DESC, name
     LIMIT $1 OFFSET $2`,
    params
  );

  return result.rows;
}

// ============================================================================
// Interaction Queries
// ============================================================================

/**
 * Full-text search across interactions
 */
export async function searchInteractions(
  searchQuery: string,
  options: {
    type?: string;
    since?: Date;
    until?: Date;
    participant?: string;
    limit?: number;
  } = {}
): Promise<Interaction[]> {
  const { type, since, until, participant, limit = 20 } = options;

  let whereClause = "search_vector @@ plainto_tsquery('english', $1)";
  const params: any[] = [searchQuery];
  let paramIndex = 2;

  if (type) {
    whereClause += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (since) {
    whereClause += ` AND timestamp >= $${paramIndex}`;
    params.push(since.toISOString());
    paramIndex++;
  }

  if (until) {
    whereClause += ` AND timestamp <= $${paramIndex}`;
    params.push(until.toISOString());
    paramIndex++;
  }

  if (participant) {
    whereClause += ` AND participants ? $${paramIndex}`;
    params.push(participant);
    paramIndex++;
  }

  params.push(limit);

  const result = await query<Interaction>(
    `SELECT id, type, channel, date, timestamp, from_entity, from_name,
            participants, participant_names, summary, file_path,
            ts_headline('english', summary, plainto_tsquery('english', $1)) as snippet
     FROM interactions
     WHERE ${whereClause}
     ORDER BY timestamp DESC
     LIMIT $${paramIndex}`,
    params
  );

  return result.rows;
}

/**
 * Get entity timeline - all interactions over time
 */
export async function getEntityTimeline(
  slug: string,
  options: { limit?: number } = {}
): Promise<Interaction[]> {
  const { limit = 50 } = options;

  const result = await query<Interaction>(
    `SELECT id, type, channel, date, timestamp, from_entity, from_name,
            participants, participant_names, summary, file_path
     FROM interactions
     WHERE participants ? $1
     ORDER BY timestamp DESC
     LIMIT $2`,
    [slug, limit]
  );

  return result.rows;
}

// ============================================================================
// Deal Queries
// ============================================================================

/**
 * Get deal by slug
 */
export async function getDeal(slug: string): Promise<Deal | null> {
  return queryOne<Deal>(`SELECT * FROM deals WHERE slug = $1`, [slug]);
}

/**
 * Find who shared/introduced a deal
 */
export async function whoSharedDeal(
  dealSlug: string
): Promise<{ entity: Entity; mention: ExtractedItem } | null> {
  // Check introduced_by in deals table
  const deal = await queryOne<{ introduced_by: string }>(
    `SELECT introduced_by FROM deals WHERE slug = $1`,
    [dealSlug]
  );

  if (deal?.introduced_by) {
    const entity = await queryOne<Entity>(
      `SELECT * FROM entities WHERE slug = $1`,
      [deal.introduced_by]
    );
    if (entity) {
      return {
        entity,
        mention: {
          id: "deal-intro",
          interaction_id: "",
          type: "deal_mention",
          content: `Introduced ${dealSlug}`,
          owner_entity: entity.slug,
          status: "completed",
          confidence: 1.0,
        },
      };
    }
  }

  // Look for first deal_mention in extracted_items
  const mention = await queryOne<ExtractedItem & { from_entity: string }>(
    `SELECT ei.*, i.from_entity
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE ei.type = 'deal_mention'
       AND LOWER(ei.content) LIKE $1
     ORDER BY i.timestamp ASC
     LIMIT 1`,
    [`%${dealSlug.toLowerCase()}%`]
  );

  if (mention?.from_entity) {
    const entity = await queryOne<Entity>(
      `SELECT * FROM entities WHERE slug = $1`,
      [mention.from_entity]
    );
    if (entity) {
      return { entity, mention };
    }
  }

  return null;
}

// ============================================================================
// Context Queries
// ============================================================================

/**
 * Get what an entity was doing/building at a point in time
 */
export async function whatWasEntityDoing(
  slug: string,
  when?: Date
): Promise<{
  current_focus?: string;
  context_date?: Date;
  recent_interactions: Interaction[];
} | null> {
  const entity = await queryOne<Entity>(
    `SELECT * FROM entities WHERE slug = $1`,
    [slug]
  );

  if (!entity) return null;

  const targetDate = when || new Date();

  // Get interactions around that time
  const interactions = await query<Interaction>(
    `SELECT id, type, channel, date, timestamp, from_entity, from_name,
            participants, participant_names, summary, file_path
     FROM interactions
     WHERE participants ? $1
       AND timestamp <= $2
     ORDER BY timestamp DESC
     LIMIT 5`,
    [slug, targetDate.toISOString()]
  );

  // If we have a current_focus and it was updated before or around the target date
  if (
    entity.current_focus &&
    entity.current_focus_updated &&
    entity.current_focus_updated <= targetDate
  ) {
    return {
      current_focus: entity.current_focus,
      context_date: entity.current_focus_updated,
      recent_interactions: interactions.rows,
    };
  }

  return {
    recent_interactions: interactions.rows,
  };
}

// ============================================================================
// Pending Items Queries
// ============================================================================

/**
 * Get pending promises and action items
 */
export async function getPendingItems(
  options: {
    owner?: string;
    type?: "promise" | "action_item";
    dueWithinDays?: number;
    limit?: number;
  } = {}
): Promise<(ExtractedItem & { interaction_date: Date; interaction_type: string })[]> {
  const { owner, type, dueWithinDays, limit = 50 } = options;

  let whereClause = "ei.status = 'pending' AND ei.type IN ('promise', 'action_item')";
  const params: any[] = [];
  let paramIndex = 1;

  if (owner) {
    whereClause += ` AND (ei.owner_entity = $${paramIndex} OR i.participants ? $${paramIndex})`;
    params.push(owner);
    paramIndex++;
  }

  if (type) {
    whereClause += ` AND ei.type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (dueWithinDays) {
    whereClause += ` AND ei.due_date <= NOW() + INTERVAL '${dueWithinDays} days'`;
  }

  params.push(limit);

  const result = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
    `SELECT ei.*, i.date as interaction_date, i.type as interaction_type
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE ${whereClause}
     ORDER BY ei.due_date NULLS LAST, i.timestamp DESC
     LIMIT $${paramIndex}`,
    params
  );

  return result.rows;
}

// ============================================================================
// v1.1 Query Functions
// ============================================================================

/**
 * Get actionable items for the user from the last N days
 * Only returns items that pass actionability checks
 */
export async function getMyActionItems(
  options: { days?: number; limit?: number } = {}
): Promise<ExtractedItemWithProvenance[]> {
  const { days = 7, limit = 50 } = options;

  const result = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
    `SELECT ei.*, i.timestamp as interaction_date, i.type as interaction_type
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE ei.status = 'pending'
       AND ei.type IN ('promise', 'action_item')
       AND ei.trust_level IN ('high', 'medium')
       AND ei.source_quote IS NOT NULL
       AND i.timestamp >= NOW() - INTERVAL '${days} days'
     ORDER BY i.timestamp DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows
    .map(enrichItem)
    .sort((a, b) => b.relevance_score - a.relevance_score);
}

/**
 * Get decisions linked to a deal
 * Searches both interactions.deal_slug and deal_mention items
 */
export async function getDecisionsByDeal(
  dealSlug: string,
  options: { limit?: number } = {}
): Promise<ExtractedItemWithProvenance[]> {
  const { limit = 50 } = options;

  // Get decisions from interactions linked to deal
  const linkedResult = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
    `SELECT ei.*, i.timestamp as interaction_date, i.type as interaction_type
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE ei.type = 'decision'
       AND i.deal_slug = $1
     ORDER BY i.timestamp DESC
     LIMIT $2`,
    [dealSlug, limit]
  );

  // Get decisions from interactions that have deal_mention items
  const mentionResult = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
    `SELECT DISTINCT ei.*, i.timestamp as interaction_date, i.type as interaction_type
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE ei.type = 'decision'
       AND i.id IN (
         SELECT DISTINCT interaction_id
         FROM extracted_items
         WHERE type = 'deal_mention'
           AND LOWER(content) LIKE $1
       )
       AND ei.id NOT IN (
         SELECT id FROM extracted_items
         WHERE interaction_id IN (
           SELECT id FROM interactions WHERE deal_slug = $2
         )
       )
     ORDER BY i.timestamp DESC
     LIMIT $3`,
    [`%${dealSlug.toLowerCase()}%`, dealSlug, limit]
  );

  // Combine and dedupe
  const allItems = [...linkedResult.rows, ...mentionResult.rows];
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return deduped.map(enrichItem);
}

/**
 * Get the most recent interaction with a person and its items
 */
export async function getLastConversation(
  nameOrSlug: string,
  options: { includeItems?: boolean } = {}
): Promise<{
  entity: Entity | null;
  interaction: Interaction | null;
  items: ExtractedItemWithProvenance[];
} | null> {
  const { includeItems = true } = options;

  // Find entity
  const findResult = await queryOne<{ slug: string; name: string }>(
    `SELECT * FROM find_entity($1, 'person')`,
    [nameOrSlug]
  );

  if (!findResult) return null;

  const entity = await queryOne<Entity>(
    `SELECT * FROM entities WHERE slug = $1`,
    [findResult.slug]
  );

  // Get most recent interaction
  const interaction = await queryOne<Interaction>(
    `SELECT id, type, channel, date, timestamp, from_entity, from_name,
            participants, participant_names, summary, file_path
     FROM interactions
     WHERE participants ? $1
     ORDER BY timestamp DESC
     LIMIT 1`,
    [findResult.slug]
  );

  if (!interaction) {
    return { entity, interaction: null, items: [] };
  }

  // Get items from that interaction
  let items: ExtractedItemWithProvenance[] = [];
  if (includeItems) {
    const itemResult = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
      `SELECT ei.*, i.timestamp as interaction_date, i.type as interaction_type
       FROM extracted_items ei
       JOIN interactions i ON i.id = ei.interaction_id
       WHERE ei.interaction_id = $1
       ORDER BY ei.confidence DESC`,
      [interaction.id]
    );
    items = itemResult.rows.map(enrichItem);
  }

  return { entity, interaction, items };
}

/**
 * Full-text search for project/topic discussions
 * Returns both interactions and their extracted items
 */
export async function getProjectDiscussions(
  projectName: string,
  options: { limit?: number } = {}
): Promise<{
  interactions: (Interaction & { items: ExtractedItemWithProvenance[] })[];
}> {
  const { limit = 20 } = options;

  // Search interactions by full-text
  const interactionResult = await query<Interaction & { rank: number }>(
    `SELECT id, type, channel, date, timestamp, from_entity, from_name,
            participants, participant_names, summary, file_path,
            ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
     FROM interactions
     WHERE search_vector @@ plainto_tsquery('english', $1)
     ORDER BY rank DESC, timestamp DESC
     LIMIT $2`,
    [projectName, limit]
  );

  // For each interaction, get its items
  const results = [];
  for (const interaction of interactionResult.rows) {
    const itemResult = await query<ExtractedItem & { interaction_date: Date; interaction_type: string }>(
      `SELECT ei.*, i.timestamp as interaction_date, i.type as interaction_type
       FROM extracted_items ei
       JOIN interactions i ON i.id = ei.interaction_id
       WHERE ei.interaction_id = $1
       ORDER BY ei.confidence DESC`,
      [interaction.id]
    );
    results.push({
      ...interaction,
      items: itemResult.rows.map(enrichItem),
    });
  }

  return { interactions: results };
}

/**
 * List candidate entities (is_candidate = TRUE)
 */
export async function listCandidates(
  options: { limit?: number } = {}
): Promise<Entity[]> {
  const { limit = 100 } = options;

  const result = await query<Entity>(
    `SELECT * FROM entities
     WHERE is_candidate = TRUE
     ORDER BY last_activity DESC NULLS LAST, name
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}

// ============================================================================
// Explorer Dashboard
// ============================================================================

/**
 * Transform raw DB row to ExplorerItem
 */
function toExplorerItem(row: any): ExplorerItem {
  return {
    id: row.id,
    type: row.type,
    content: row.content,
    ownerName: row.owner_name || undefined,
    ownerSlug: row.owner_entity || undefined,
    targetName: row.target_name || undefined,
    targetSlug: row.target_entity || undefined,
    confidence: row.confidence,
    trustLevel: row.trust_level || 'medium',
    sourceQuote: row.source_quote || '',
    source: {
      type: row.interaction_type,
      date: row.interaction_date instanceof Date
        ? row.interaction_date.toISOString().split('T')[0]
        : row.interaction_date,
      id: row.interaction_id,
    },
  };
}

/**
 * Calculate Levenshtein distance between two strings (for fuzzy grouping)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy group deal names (e.g., "Naptha" and "Naphta" together)
 */
function fuzzyGroupDeals(
  items: { name: string; items: any[] }[]
): Map<string, { names: string[]; items: any[] }> {
  const groups = new Map<string, { names: string[]; items: any[] }>();

  for (const { name, items: dealItems } of items) {
    const normalizedName = name.toLowerCase().trim();
    let foundGroup = false;

    // Check against existing groups
    for (const [groupKey, groupData] of groups) {
      // Check if any name in the group is similar (distance <= 2)
      for (const existingName of groupData.names) {
        const distance = levenshteinDistance(
          normalizedName,
          existingName.toLowerCase()
        );
        // If similar (distance <= 2 for short names, proportional for longer)
        const threshold = Math.max(2, Math.floor(existingName.length * 0.2));
        if (distance <= threshold) {
          groupData.names.push(name);
          groupData.items.push(...dealItems);
          foundGroup = true;
          break;
        }
      }
      if (foundGroup) break;
    }

    // Create new group if no match found
    if (!foundGroup) {
      groups.set(normalizedName, { names: [name], items: dealItems });
    }
  }

  return groups;
}

/**
 * Check if a deal folder exists
 */
function checkDealFolder(dealName: string): boolean {
  const slug = dealName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fs = require('fs');
  const path = require('path');
  const dealsDir = path.resolve(__dirname, '../../deals');
  return fs.existsSync(path.join(dealsDir, slug));
}

/**
 * Get Explorer Dashboard - main function returning all data for the Explorer page
 */
export async function getExplorerDashboard(
  options: { days?: number } = {}
): Promise<ExplorerDashboard> {
  const { days = 14 } = options;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  // ===== 1. Get deals with activity =====
  const dealsResult = await query<any>(`
    SELECT
      ei.id,
      ei.type,
      ei.content,
      ei.owner_name,
      ei.owner_entity,
      ei.target_name,
      ei.target_entity,
      ei.confidence,
      ei.trust_level,
      ei.source_quote,
      i.id as interaction_id,
      i.type as interaction_type,
      i.date as interaction_date,
      COALESCE(i.deal_slug, LOWER(REGEXP_REPLACE(ei.content, '[^a-zA-Z0-9]+', '-', 'g'))) as deal_key
    FROM extracted_items ei
    JOIN interactions i ON i.id = ei.interaction_id
    WHERE ei.type IN ('deal_mention', 'metric', 'decision')
      AND i.timestamp >= NOW() - INTERVAL '${days} days'
    ORDER BY i.timestamp DESC
  `);

  // Group items by deal
  const dealItemsMap = new Map<string, { name: string; items: any[] }>();
  for (const row of dealsResult.rows) {
    // For deal_mention, use content as deal name; for others, infer from context
    let dealName: string;
    if (row.type === 'deal_mention') {
      dealName = row.content;
    } else if (row.deal_key) {
      dealName = row.deal_key;
    } else {
      continue; // Skip items without deal association
    }

    if (!dealItemsMap.has(dealName.toLowerCase())) {
      dealItemsMap.set(dealName.toLowerCase(), { name: dealName, items: [] });
    }
    dealItemsMap.get(dealName.toLowerCase())!.items.push(row);
  }

  // Fuzzy group deals
  const fuzzyGroups = fuzzyGroupDeals(
    Array.from(dealItemsMap.values())
  );

  // Build deal summaries
  const deals: DealSummary[] = [];
  for (const [_, groupData] of fuzzyGroups) {
    const { names, items } = groupData;
    const primaryName = names[0]; // Use first (most common/recent) name

    // Group items by type
    const metrics = items.filter(i => i.type === 'metric').map(toExplorerItem);
    const mentions = items.filter(i => i.type === 'deal_mention').map(toExplorerItem);
    const decisions = items.filter(i => i.type === 'decision').map(toExplorerItem);

    // Get last activity date
    const lastActivity = items.reduce((latest, item) => {
      const date = item.interaction_date instanceof Date
        ? item.interaction_date.toISOString().split('T')[0]
        : item.interaction_date;
      return date > latest ? date : latest;
    }, '');

    deals.push({
      slug: primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: primaryName,
      names: [...new Set(names)],
      hasFolder: checkDealFolder(primaryName),
      lastActivity,
      items: { metrics, mentions, decisions },
      introducedBy: undefined, // Could be enhanced later
    });
  }

  // Sort deals by last activity
  deals.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

  // ===== 2. Get recent entities (people) with their items =====
  const entitiesResult = await query<any>(`
    SELECT
      e.slug,
      e.name,
      e.type,
      e.email,
      e.telegram,
      e.interaction_count,
      e.last_activity,
      e.is_candidate
    FROM entities e
    WHERE e.type = 'person'
      AND e.last_activity >= NOW() - INTERVAL '${days} days'
    ORDER BY e.last_activity DESC
    LIMIT 50
  `);

  const entities: EntitySummary[] = [];

  for (const entity of entitiesResult.rows) {
    // Get all items related to this entity
    const entityItemsResult = await query<any>(`
      SELECT
        ei.id,
        ei.type,
        ei.content,
        ei.owner_name,
        ei.owner_entity,
        ei.target_name,
        ei.target_entity,
        ei.confidence,
        ei.trust_level,
        ei.source_quote,
        i.id as interaction_id,
        i.type as interaction_type,
        i.date as interaction_date
      FROM extracted_items ei
      JOIN interactions i ON i.id = ei.interaction_id
      WHERE (ei.owner_entity = $1 OR ei.target_entity = $1 OR i.participants ? $1)
        AND i.timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY i.timestamp DESC
    `, [entity.slug]);

    const allItems = entityItemsResult.rows.map(toExplorerItem);

    // Categorize items
    // Promises I made TO this person (I am owner, they are target)
    const promisesIMade = allItems.filter(i =>
      i.type === 'promise' &&
      (i.ownerSlug === 'stepan-gershuni' || i.ownerName?.toLowerCase().includes('stepan')) &&
      (i.targetSlug === entity.slug || i.targetName?.toLowerCase() === entity.name.toLowerCase())
    );

    // Promises they made TO me (they are owner, I am target)
    const promisesToMe = allItems.filter(i =>
      i.type === 'promise' &&
      (i.ownerSlug === entity.slug || i.ownerName?.toLowerCase() === entity.name.toLowerCase()) &&
      (i.targetSlug === 'stepan-gershuni' || i.targetName?.toLowerCase().includes('stepan'))
    );

    // Action items involving this person
    const actionItems = allItems.filter(i =>
      i.type === 'action_item' &&
      (i.ownerSlug === entity.slug || i.targetSlug === entity.slug)
    );

    // Decisions with this person
    const decisions = allItems.filter(i => i.type === 'decision');

    // Metrics from conversations with this person
    const metrics = allItems.filter(i => i.type === 'metric');

    entities.push({
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      email: entity.email || undefined,
      telegram: entity.telegram || undefined,
      interactionCount: entity.interaction_count,
      lastActivity: entity.last_activity instanceof Date
        ? entity.last_activity.toISOString().split('T')[0]
        : entity.last_activity,
      isCandidate: entity.is_candidate,
      items: {
        promisesIMade,
        promisesToMe,
        actionItems,
        decisions,
        metrics,
      },
    });
  }

  // ===== 3. Get My Commitments (owner-only) =====
  const myCommitmentsResult = await query<any>(`
    SELECT
      ei.id,
      ei.type,
      ei.content,
      ei.owner_name,
      ei.owner_entity,
      ei.target_name,
      ei.target_entity,
      ei.confidence,
      ei.trust_level,
      ei.source_quote,
      i.id as interaction_id,
      i.type as interaction_type,
      i.date as interaction_date
    FROM extracted_items ei
    JOIN interactions i ON i.id = ei.interaction_id
    WHERE ei.type IN ('promise', 'action_item')
      AND ei.status = 'pending'
      AND (ei.owner_entity = 'stepan-gershuni' OR ei.owner_name ILIKE '%stepan%')
      AND i.timestamp >= NOW() - INTERVAL '${days} days'
    ORDER BY i.timestamp DESC
    LIMIT 100
  `);

  const myCommitments = myCommitmentsResult.rows.map(toExplorerItem);

  // ===== 4. Get Metrics grouped by company =====
  const metricsResult = await query<any>(`
    SELECT
      ei.id,
      ei.type,
      ei.content,
      ei.owner_name,
      ei.owner_entity,
      ei.target_name,
      ei.target_entity,
      ei.confidence,
      ei.trust_level,
      ei.source_quote,
      i.id as interaction_id,
      i.type as interaction_type,
      i.date as interaction_date,
      i.deal_slug,
      i.participant_names
    FROM extracted_items ei
    JOIN interactions i ON i.id = ei.interaction_id
    WHERE ei.type = 'metric'
      AND i.timestamp >= NOW() - INTERVAL '${days} days'
    ORDER BY i.timestamp DESC
  `);

  // Group metrics by company (infer from deal_slug or participants)
  const metricsByCompanyMap = new Map<string, { slug?: string; metrics: ExplorerItem[] }>();

  for (const row of metricsResult.rows) {
    // Try to determine company from deal_slug first, then from participants
    let companyName = row.deal_slug || 'Other';

    if (companyName === 'Other' && row.participant_names?.length > 0) {
      // Use first non-user participant as company proxy
      const otherParticipants = row.participant_names.filter(
        (n: string) => !n.toLowerCase().includes('stepan')
      );
      if (otherParticipants.length > 0) {
        companyName = otherParticipants[0];
      }
    }

    if (!metricsByCompanyMap.has(companyName)) {
      metricsByCompanyMap.set(companyName, {
        slug: row.deal_slug || undefined,
        metrics: []
      });
    }
    metricsByCompanyMap.get(companyName)!.metrics.push(toExplorerItem(row));
  }

  const metricsByCompany: MetricsByCompany[] = Array.from(metricsByCompanyMap.entries())
    .map(([company, data]) => ({
      company,
      companySlug: data.slug,
      metrics: data.metrics,
    }))
    .sort((a, b) => b.metrics.length - a.metrics.length); // Sort by metric count

  return {
    timeRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days,
    },
    deals: deals.slice(0, 20), // Limit to 20 deals
    entities,
    myCommitments,
    metricsByCompany,
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

async function printEntity(entity: EntityContext) {
  console.log(`\n=== ${entity.name} (${entity.type}) ===`);
  console.log(`Slug: ${entity.slug}`);
  if (entity.email) console.log(`Email: ${entity.email}`);
  if (entity.telegram) console.log(`Telegram: @${entity.telegram}`);
  if (entity.current_company) console.log(`Company: ${entity.current_company}`);
  if (entity.job_title) console.log(`Role: ${entity.job_title}`);
  if (entity.current_focus) {
    console.log(`Working on: ${entity.current_focus}`);
    if (entity.current_focus_updated) {
      console.log(`  (as of ${entity.current_focus_updated.toISOString().split("T")[0]})`);
    }
  }
  console.log(`Interactions: ${entity.interaction_count}`);
  if (entity.aliases.length > 0) {
    console.log(`Aliases: ${entity.aliases.join(", ")}`);
  }

  if (entity.interactions.length > 0) {
    console.log(`\nRecent interactions:`);
    for (const i of entity.interactions) {
      console.log(`  - [${i.date}] ${i.type}: ${i.summary || "(no summary)"}`);
    }
  }

  if (entity.pending_items.length > 0) {
    console.log(`\nPending items:`);
    for (const item of entity.pending_items) {
      const due = item.due_date ? ` (due: ${item.due_date})` : "";
      console.log(`  - [${item.type}] ${item.content}${due}`);
    }
  }
}

async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];
  const jsonOutput = args.includes("--json");

  switch (command) {
    case "entity": {
      const slug = args[1];
      if (!slug) {
        console.error("Usage: query.ts entity <slug> [--json]");
        process.exit(1);
      }
      const entity = await getEntityContext(slug);
      if (entity) {
        if (jsonOutput) {
          console.log(JSON.stringify(entity, null, 2));
        } else {
          printEntity(entity);
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: "Entity not found", slug }));
        } else {
          console.log(`Entity not found: ${slug}`);
        }
      }
      break;
    }

    case "find-entity": {
      const identifier = args[1];
      if (!identifier) {
        console.error("Usage: query.ts find-entity <identifier> [--json]");
        process.exit(1);
      }
      const result = await findEntity(identifier);
      if (result) {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Found: ${result.name} (${result.slug})`);
          console.log(`  Type: ${result.type}`);
          console.log(`  Match: ${result.match_type} (${result.confidence.toFixed(2)})`);
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: "No entity found", identifier }));
        } else {
          console.log(`No entity found for: ${identifier}`);
        }
      }
      break;
    }

    case "search-entities": {
      const searchQuery = args[1];
      const type = args.includes("--type") ? args[args.indexOf("--type") + 1] : undefined;
      if (!searchQuery) {
        console.error("Usage: query.ts search-entities <query> [--type <type>] [--json]");
        process.exit(1);
      }
      const results = await searchEntities(searchQuery, { type });
      if (jsonOutput) {
        console.log(JSON.stringify({ count: results.length, results }, null, 2));
      } else {
        console.log(`\nFound ${results.length} entities:\n`);
        for (const r of results) {
          console.log(`  ${r.name} (${r.slug}) - ${r.type} [${r.confidence.toFixed(2)}]`);
        }
      }
      break;
    }

    case "search": {
      const searchQuery = args[1];
      if (!searchQuery) {
        console.error("Usage: query.ts search <query> [--json]");
        process.exit(1);
      }
      const results = await searchInteractions(searchQuery);
      if (jsonOutput) {
        console.log(JSON.stringify({ count: results.length, results }, null, 2));
      } else {
        console.log(`\nFound ${results.length} interactions:\n`);
        for (const r of results) {
          console.log(`  [${r.date}] ${r.type}: ${r.summary || "(no summary)"}`);
        }
      }
      break;
    }

    case "who-shared": {
      const dealSlug = args[1];
      if (!dealSlug) {
        console.error("Usage: query.ts who-shared <deal-slug> [--json]");
        process.exit(1);
      }
      const result = await whoSharedDeal(dealSlug);
      if (result) {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\n${dealSlug} was introduced by: ${result.entity.name}`);
          console.log(`  Slug: ${result.entity.slug}`);
          if (result.entity.email) console.log(`  Email: ${result.entity.email}`);
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: "No introduction found", dealSlug }));
        } else {
          console.log(`No introduction found for: ${dealSlug}`);
        }
      }
      break;
    }

    case "what-doing": {
      const slug = args[1];
      const when = args[2] && !args[2].startsWith("--") ? new Date(args[2]) : undefined;
      if (!slug) {
        console.error("Usage: query.ts what-doing <slug> [date] [--json]");
        process.exit(1);
      }
      const result = await whatWasEntityDoing(slug, when);
      if (result) {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          if (result.current_focus) {
            console.log(`\n${slug} was working on: ${result.current_focus}`);
            if (result.context_date) {
              console.log(`  (as of ${result.context_date.toISOString().split("T")[0]})`);
            }
          } else {
            console.log(`\nNo specific focus recorded for ${slug}`);
          }
          if (result.recent_interactions.length > 0) {
            console.log(`\nRecent interactions:`);
            for (const i of result.recent_interactions) {
              console.log(`  [${i.date}] ${i.type}: ${i.summary || "(no summary)"}`);
            }
          }
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: "Entity not found", slug }));
        } else {
          console.log(`Entity not found: ${slug}`);
        }
      }
      break;
    }

    case "pending": {
      const owner = args.includes("--owner") ? args[args.indexOf("--owner") + 1] : undefined;
      const type = args.includes("--type") ? args[args.indexOf("--type") + 1] as "promise" | "action_item" : undefined;
      const items = await getPendingItems({ owner, type });
      if (jsonOutput) {
        console.log(JSON.stringify({ count: items.length, items }, null, 2));
      } else {
        console.log(`\nFound ${items.length} pending items:\n`);
        for (const item of items) {
          const due = item.due_date ? ` (due: ${item.due_date})` : "";
          const owner = item.owner_name ? ` [${item.owner_name}]` : "";
          console.log(`  - [${item.type}]${owner} ${item.content}${due}`);
        }
      }
      break;
    }

    case "timeline": {
      const slug = args[1];
      if (!slug) {
        console.error("Usage: query.ts timeline <slug> [--json]");
        process.exit(1);
      }
      const interactions = await getEntityTimeline(slug);
      if (jsonOutput) {
        console.log(JSON.stringify({ slug, count: interactions.length, interactions }, null, 2));
      } else {
        console.log(`\nTimeline for ${slug} (${interactions.length} interactions):\n`);
        for (const i of interactions) {
          console.log(`  [${i.date}] ${i.type}: ${i.summary || "(no summary)"}`);
        }
      }
      break;
    }

    case "list-entities": {
      const type = args.includes("--type") ? args[args.indexOf("--type") + 1] : undefined;
      const limit = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : 50;
      const entities = await listEntities({ type, limit });
      if (jsonOutput) {
        console.log(JSON.stringify({ count: entities.length, entities }, null, 2));
      } else {
        console.log(`\nFound ${entities.length} entities:\n`);
        for (const e of entities) {
          console.log(`  ${e.name} (${e.slug}) - ${e.type} [${e.interaction_count} interactions]`);
        }
      }
      break;
    }

    case "status": {
      try {
        const lastRun = await queryOne<{ started_at: Date; status: string }>(
          "SELECT started_at, status FROM batch_runs ORDER BY started_at DESC LIMIT 1"
        );
        const entityCount = await queryOne<{ count: string }>(
          "SELECT COUNT(*) as count FROM entities"
        );
        const interactionCount = await queryOne<{ count: string }>(
          "SELECT COUNT(*) as count FROM interactions"
        );
        const candidateCount = await queryOne<{ count: string }>(
          "SELECT COUNT(*) as count FROM entities WHERE is_candidate = TRUE"
        );
        const itemCount = await queryOne<{ count: string }>(
          "SELECT COUNT(*) as count FROM extracted_items"
        );

        if (jsonOutput) {
          console.log(JSON.stringify({
            lastRun: lastRun?.started_at?.toISOString() || null,
            status: lastRun?.status || null,
            entities: parseInt(entityCount?.count || "0"),
            candidates: parseInt(candidateCount?.count || "0"),
            interactions: parseInt(interactionCount?.count || "0"),
            extractedItems: parseInt(itemCount?.count || "0")
          }, null, 2));
        } else {
          console.log("\nDatabase Status:");
          console.log(`  Entities: ${entityCount?.count || 0} (${candidateCount?.count || 0} candidates)`);
          console.log(`  Interactions: ${interactionCount?.count || 0}`);
          console.log(`  Extracted Items: ${itemCount?.count || 0}`);
          if (lastRun) {
            console.log(`  Last run: ${lastRun.started_at.toISOString()} (${lastRun.status})`);
          } else {
            console.log("  Last run: never");
          }
        }
      } catch (error: any) {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: error.message, lastRun: null }));
        } else {
          console.error("Database not accessible:", error.message);
        }
      }
      break;
    }

    // v1.1 Commands
    case "my-action-items": {
      const days = args.includes("--days") ? parseInt(args[args.indexOf("--days") + 1]) : 7;
      const items = await getMyActionItems({ days });
      if (jsonOutput) {
        console.log(JSON.stringify({ days, count: items.length, items }, null, 2));
      } else {
        console.log(`\nAction items from last ${days} days (${items.length} items):\n`);
        for (const item of items) {
          const due = item.due_date ? ` (due: ${item.due_date})` : "";
          const owner = item.owner_name ? ` [${item.owner_name}]` : "";
          const trust = item.trust_level ? ` {${item.trust_level}}` : "";
          console.log(`  - [${item.type}]${owner}${trust} ${item.content}${due}`);
          if (item.provenance.source_quote) {
            console.log(`    > "${item.provenance.source_quote}"`);
          }
        }
      }
      break;
    }

    case "decisions-by-deal": {
      const dealSlug = args[1];
      if (!dealSlug) {
        console.error("Usage: query.ts decisions-by-deal <deal-slug> [--json]");
        process.exit(1);
      }
      const items = await getDecisionsByDeal(dealSlug);
      if (jsonOutput) {
        console.log(JSON.stringify({ dealSlug, count: items.length, items }, null, 2));
      } else {
        console.log(`\nDecisions for ${dealSlug} (${items.length} items):\n`);
        for (const item of items) {
          const trust = item.trust_level ? ` {${item.trust_level}}` : "";
          console.log(`  - ${item.content}${trust}`);
          if (item.provenance.source_quote) {
            console.log(`    > "${item.provenance.source_quote}"`);
          }
        }
      }
      break;
    }

    case "last-conversation": {
      const name = args[1];
      if (!name) {
        console.error("Usage: query.ts last-conversation <name> [--json]");
        process.exit(1);
      }
      const result = await getLastConversation(name);
      if (result) {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          if (result.entity) {
            console.log(`\n=== Last conversation with ${result.entity.name} ===`);
          }
          if (result.interaction) {
            console.log(`[${result.interaction.date}] ${result.interaction.type}: ${result.interaction.summary || "(no summary)"}`);
            if (result.items.length > 0) {
              console.log(`\nItems from this conversation (${result.items.length}):`);
              for (const item of result.items) {
                const trust = item.trust_level ? ` {${item.trust_level}}` : "";
                console.log(`  - [${item.type}]${trust} ${item.content}`);
                if (item.provenance.source_quote) {
                  console.log(`    > "${item.provenance.source_quote}"`);
                }
              }
            }
          } else {
            console.log("No interactions found.");
          }
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: "Entity not found", name }));
        } else {
          console.log(`Entity not found: ${name}`);
        }
      }
      break;
    }

    case "project-discussions": {
      const projectName = args[1];
      if (!projectName) {
        console.error("Usage: query.ts project-discussions <project-name> [--json]");
        process.exit(1);
      }
      const result = await getProjectDiscussions(projectName);
      if (jsonOutput) {
        console.log(JSON.stringify({ projectName, count: result.interactions.length, ...result }, null, 2));
      } else {
        console.log(`\nDiscussions about "${projectName}" (${result.interactions.length} interactions):\n`);
        for (const i of result.interactions) {
          console.log(`[${i.date}] ${i.type}: ${i.summary || "(no summary)"}`);
          if (i.items.length > 0) {
            for (const item of i.items.slice(0, 3)) { // Show first 3 items
              console.log(`  - [${item.type}] ${item.content}`);
            }
            if (i.items.length > 3) {
              console.log(`  ... and ${i.items.length - 3} more items`);
            }
          }
          console.log();
        }
      }
      break;
    }

    case "list-candidates": {
      const limit = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : 100;
      const candidates = await listCandidates({ limit });
      if (jsonOutput) {
        console.log(JSON.stringify({ count: candidates.length, candidates }, null, 2));
      } else {
        console.log(`\nCandidate entities (${candidates.length}):\n`);
        for (const c of candidates) {
          const email = c.email ? ` <${c.email}>` : "";
          const telegram = c.telegram ? ` @${c.telegram}` : "";
          console.log(`  ${c.name}${email}${telegram}`);
        }
      }
      break;
    }

    default:
      console.log(`
Context Graph Query Tool

Usage:
  bun scripts/db/query.ts <command> [args] [--json]

Entity Commands:
  entity <slug>                    Get full entity context
  find-entity <identifier>         Find entity by email/telegram/name
  search-entities <query>          Fuzzy search entities
  list-entities [--type <type>]    List all entities
  list-candidates                  List candidate entities (unverified)

Interaction Commands:
  search <query>                   Full-text search interactions
  timeline <slug>                  Entity interaction timeline
  who-shared <deal-slug>           Find who introduced a deal
  what-doing <slug> [date]         What was entity working on

Item Commands (v1.1):
  my-action-items [--days N]       Action items from last N days (default: 7)
  pending [--owner <slug>]         List all pending items
  decisions-by-deal <slug>         Decisions linked to a deal
  last-conversation <name>         Most recent interaction with person
  project-discussions <name>       Search for project/topic discussions

System:
  status                           Database status and last run

All commands support --json for structured output.
      `);
  }
}

// Main entry point
if (import.meta.main) {
  try {
    await runCLI();
  } finally {
    await closePool();
  }
}
