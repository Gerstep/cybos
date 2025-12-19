/**
 * Query Interface (SQLite v2.1)
 *
 * Provides query functions for commands to use.
 * All queries return structured data that can be used in briefs, GTD, etc.
 *
 * Usage:
 *   bun scripts/db/query.ts status [--json]
 *   bun scripts/db/query.ts entity <slug>
 *   bun scripts/db/query.ts list-entities [--type <type>]
 *   bun scripts/db/query.ts list-candidates
 *   bun scripts/db/query.ts pending [--owner <slug>]
 */

import db from './client-sqlite'

// ============================================================================
// Types
// ============================================================================

export interface Entity {
  slug: string
  name: string
  type: 'person' | 'company' | 'product' | 'group'
  email?: string
  telegram?: string
  twitter?: string
  linkedin?: string
  current_company?: string
  job_title?: string
  current_focus?: string
  website?: string
  last_activity?: string
  interaction_count: number
  is_candidate: number
}

export interface EntityContext extends Entity {
  interactions: Interaction[]
  pending_items: ExtractedItem[]
  aliases: string[]
}

export interface Interaction {
  id: string
  type: 'call' | 'email' | 'telegram'
  timestamp: string
  participants: string[]
  participant_names: string[]
  summary?: string
  file_path?: string
}

export interface ExtractedItem {
  id: string
  interaction_id: string
  type: string
  content: string
  owner_name?: string
  owner_entity?: string
  target_name?: string
  target_entity?: string
  due_date?: string
  status: string
  confidence: number
  trust_level?: 'high' | 'medium' | 'low'
  source_quote?: string
  source_path?: string
}

export interface SearchResult {
  slug: string
  name: string
  type: string
  match_type: string
  confidence: number
}

// ============================================================================
// Entity Queries
// ============================================================================

/**
 * Get full entity context including interactions and pending items
 */
export function getEntityContext(
  slug: string,
  options: { limit?: number; includeInteractions?: boolean } = {}
): EntityContext | null {
  const { limit = 10, includeInteractions = true } = options

  // Get entity
  const entity = db.queryOne<Entity>(
    'SELECT * FROM entities WHERE slug = ?',
    [slug]
  )

  if (!entity) return null

  // Get aliases
  const aliasResult = db.query<{ alias: string }>(
    'SELECT alias FROM entity_aliases WHERE entity_slug = ?',
    [slug]
  )
  const aliases = aliasResult.map((r) => r.alias)

  // Get interactions
  let interactions: Interaction[] = []
  if (includeInteractions) {
    const interactionResult = db.query<any>(
      `SELECT id, type, timestamp, participants, participant_names, summary, file_path
       FROM interactions
       WHERE EXISTS (SELECT 1 FROM json_each(participants) WHERE value = ?)
       ORDER BY timestamp DESC
       LIMIT ?`,
      [slug, limit]
    )
    interactions = interactionResult.map(r => ({
      ...r,
      participants: JSON.parse(r.participants || '[]'),
      participant_names: JSON.parse(r.participant_names || '[]'),
    }))
  }

  // Get pending items
  const itemsResult = db.query<ExtractedItem>(
    `SELECT ei.*
     FROM extracted_items ei
     JOIN interactions i ON i.id = ei.interaction_id
     WHERE (ei.owner_entity = ? OR EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = ?))
       AND ei.status = 'pending'
       AND ei.type IN ('promise', 'action_item')
     ORDER BY ei.due_date NULLS LAST, i.timestamp DESC
     LIMIT 20`,
    [slug, slug]
  )

  return {
    ...entity,
    interactions,
    pending_items: itemsResult,
    aliases,
  }
}

/**
 * Find entity by email or telegram
 */
export function findEntity(
  identifier: string,
  type?: string
): SearchResult | null {
  // Try email
  let entity = db.queryOne<Entity>(
    'SELECT * FROM entities WHERE email = ?' + (type ? ' AND type = ?' : ''),
    type ? [identifier, type] : [identifier]
  )

  if (entity) {
    return {
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      match_type: 'email',
      confidence: 1.0,
    }
  }

  // Try telegram
  const handle = identifier.replace(/^@/, '')
  entity = db.queryOne<Entity>(
    'SELECT * FROM entities WHERE telegram = ?' + (type ? ' AND type = ?' : ''),
    type ? [handle, type] : [handle]
  )

  if (entity) {
    return {
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      match_type: 'telegram',
      confidence: 1.0,
    }
  }

  // Try name LIKE
  entity = db.queryOne<Entity>(
    'SELECT * FROM entities WHERE name LIKE ? COLLATE NOCASE' + (type ? ' AND type = ?' : ''),
    type ? [`%${identifier}%`, type] : [`%${identifier}%`]
  )

  if (entity) {
    return {
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      match_type: 'fuzzy',
      confidence: 0.7,
    }
  }

  return null
}

/**
 * List all entities with optional filtering
 */
export function listEntities(
  options: { type?: string; limit?: number; offset?: number } = {}
): Entity[] {
  const { type, limit = 50, offset = 0 } = options

  let sql = 'SELECT * FROM entities'
  const params: any[] = []

  if (type) {
    sql += ' WHERE type = ?'
    params.push(type)
  }

  sql += ' ORDER BY interaction_count DESC, name LIMIT ? OFFSET ?'
  params.push(limit, offset)

  return db.query<Entity>(sql, params)
}

/**
 * List candidate entities (is_candidate = 1)
 */
export function listCandidates(
  options: { limit?: number } = {}
): Entity[] {
  const { limit = 100 } = options

  return db.query<Entity>(
    `SELECT * FROM entities
     WHERE is_candidate = 1
     ORDER BY last_activity DESC NULLS LAST, name
     LIMIT ?`,
    [limit]
  )
}

// ============================================================================
// Interaction Queries
// ============================================================================

/**
 * Full-text search across interactions (using FTS5)
 */
export function searchInteractions(
  searchQuery: string,
  options: {
    type?: string
    since?: Date
    limit?: number
  } = {}
): Interaction[] {
  const { type, since, limit = 20 } = options

  // Use FTS5 for search
  let sql = `
    SELECT i.id, i.type, i.timestamp, i.participants, i.participant_names, i.summary, i.file_path
    FROM interactions i
    JOIN interactions_fts fts ON fts.rowid = i.rowid
    WHERE interactions_fts MATCH ?
  `
  const params: any[] = [searchQuery]

  if (type) {
    sql += ' AND i.type = ?'
    params.push(type)
  }

  if (since) {
    sql += ' AND i.timestamp >= ?'
    params.push(since.toISOString())
  }

  sql += ' ORDER BY i.timestamp DESC LIMIT ?'
  params.push(limit)

  const results = db.query<any>(sql, params)
  return results.map(r => ({
    ...r,
    participants: JSON.parse(r.participants || '[]'),
    participant_names: JSON.parse(r.participant_names || '[]'),
  }))
}

/**
 * Get entity timeline - all interactions over time
 */
export function getEntityTimeline(
  slug: string,
  options: { limit?: number } = {}
): Interaction[] {
  const { limit = 50 } = options

  const results = db.query<any>(
    `SELECT id, type, timestamp, participants, participant_names, summary, file_path
     FROM interactions
     WHERE EXISTS (SELECT 1 FROM json_each(participants) WHERE value = ?)
     ORDER BY timestamp DESC
     LIMIT ?`,
    [slug, limit]
  )

  return results.map(r => ({
    ...r,
    participants: JSON.parse(r.participants || '[]'),
    participant_names: JSON.parse(r.participant_names || '[]'),
  }))
}

// ============================================================================
// Pending Items Queries
// ============================================================================

/**
 * Get pending promises and action items
 */
export function getPendingItems(
  options: {
    owner?: string
    type?: 'promise' | 'action_item'
    limit?: number
  } = {}
): (ExtractedItem & { interaction_date: string; interaction_type: string })[] {
  const { owner, type, limit = 50 } = options

  let sql = `
    SELECT ei.*, i.timestamp as interaction_date, i.type as interaction_type
    FROM extracted_items ei
    JOIN interactions i ON i.id = ei.interaction_id
    WHERE ei.status = 'pending' AND ei.type IN ('promise', 'action_item')
  `
  const params: any[] = []

  if (owner) {
    sql += ` AND (ei.owner_entity = ? OR EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = ?))`
    params.push(owner, owner)
  }

  if (type) {
    sql += ' AND ei.type = ?'
    params.push(type)
  }

  sql += ' ORDER BY ei.due_date NULLS LAST, i.timestamp DESC LIMIT ?'
  params.push(limit)

  return db.query(sql, params)
}

// ============================================================================
// Explorer Dashboard Query
// ============================================================================

/**
 * Explorer Dashboard - combines deals, entities, commitments, and metrics
 */
export interface ExplorerDashboard {
  timeRange: { start: string; end: string; days: number }
  deals: DealSummary[]
  entities: EntitySummary[]
  myCommitments: ExplorerItem[]
  metricsByCompany: MetricsByCompany[]
}

export interface DealSummary {
  slug: string
  name: string
  names: string[]
  hasFolder: boolean
  lastActivity: string
  items: {
    metrics: ExplorerItem[]
    mentions: ExplorerItem[]
    decisions: ExplorerItem[]
  }
  introducedBy?: { name: string; slug: string }
}

export interface EntitySummary {
  slug: string
  name: string
  type: 'person' | 'company' | 'product' | 'group'
  email?: string
  telegram?: string
  interactionCount: number
  lastActivity: string
  isCandidate: boolean
  items: {
    promisesIMade: ExplorerItem[]
    promisesToMe: ExplorerItem[]
    actionItems: ExplorerItem[]
    decisions: ExplorerItem[]
    metrics: ExplorerItem[]
  }
}

export interface ExplorerItem {
  id: string
  type: string
  content: string
  ownerName?: string
  ownerSlug?: string
  targetName?: string
  targetSlug?: string
  confidence: number
  trustLevel: 'high' | 'medium' | 'low'
  sourceQuote: string
  source: {
    type: 'call' | 'email' | 'telegram'
    date: string
    id: string
  }
}

export interface MetricsByCompany {
  company: string
  companySlug?: string
  metrics: ExplorerItem[]
}

/**
 * Get explorer dashboard data
 */
export function getExplorerDashboard(options: { days?: number } = {}): ExplorerDashboard {
  const { days = 14 } = options

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const timeRange = {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
    days
  }

  // Get all extracted items within time range with their interactions
  const rawItems = db.query<any>(
    `SELECT
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
      i.timestamp as interaction_date,
      i.participants
    FROM extracted_items ei
    JOIN interactions i ON i.id = ei.interaction_id
    WHERE i.timestamp >= ?
    ORDER BY i.timestamp DESC`,
    [startDate.toISOString()]
  )

  // Convert raw items to ExplorerItem format
  function toExplorerItem(raw: any): ExplorerItem {
    return {
      id: raw.id,
      type: raw.type,
      content: raw.content,
      ownerName: raw.owner_name,
      ownerSlug: raw.owner_entity,
      targetName: raw.target_name,
      targetSlug: raw.target_entity,
      confidence: raw.confidence || 0.5,
      trustLevel: raw.trust_level || 'medium',
      sourceQuote: raw.source_quote || '',
      source: {
        type: raw.interaction_type,
        date: raw.interaction_date?.split('T')[0] || '',
        id: raw.interaction_id
      }
    }
  }

  // Get company entities (deals)
  const companyEntities = db.query<Entity>(
    `SELECT * FROM entities
     WHERE type = 'company'
     ORDER BY last_activity DESC NULLS LAST
     LIMIT 50`
  )

  // Get person entities with recent activity
  const personEntities = db.query<Entity>(
    `SELECT e.* FROM entities e
     WHERE e.type = 'person' AND e.interaction_count > 0
     ORDER BY e.last_activity DESC NULLS LAST
     LIMIT 30`
  )

  // Build deals array
  const deals: DealSummary[] = companyEntities.map((company) => {
    const companyItems = rawItems.filter(
      (item: any) =>
        item.target_entity === company.slug ||
        item.owner_entity === company.slug
    )

    return {
      slug: company.slug,
      name: company.name,
      names: [company.name],
      hasFolder: true, // We could check this but simplified for now
      lastActivity: company.last_activity?.split('T')[0] || 'Unknown',
      items: {
        metrics: companyItems
          .filter((i: any) => i.type === 'metric')
          .map(toExplorerItem),
        mentions: companyItems
          .filter((i: any) => i.type === 'deal_mention')
          .map(toExplorerItem),
        decisions: companyItems
          .filter((i: any) => i.type === 'decision')
          .map(toExplorerItem)
      }
    }
  }).filter(d =>
    d.items.metrics.length > 0 ||
    d.items.mentions.length > 0 ||
    d.items.decisions.length > 0
  )

  // Build entities array (people)
  const entities: EntitySummary[] = personEntities.map((person) => {
    // Items where this person is involved
    const personItems = rawItems.filter(
      (item: any) =>
        item.target_entity === person.slug ||
        item.owner_entity === person.slug ||
        (item.participants && JSON.parse(item.participants || '[]').includes(person.slug))
    )

    // TODO: Need to know current user slug to properly separate promisesIMade vs promisesToMe
    // For now, use owner_entity to determine direction
    const promisesIMade = personItems
      .filter((i: any) => i.type === 'promise' && i.target_entity === person.slug)
      .map(toExplorerItem)
    const promisesToMe = personItems
      .filter((i: any) => i.type === 'promise' && i.owner_entity === person.slug)
      .map(toExplorerItem)

    return {
      slug: person.slug,
      name: person.name,
      type: person.type,
      email: person.email,
      telegram: person.telegram,
      interactionCount: person.interaction_count || 0,
      lastActivity: person.last_activity?.split('T')[0] || 'Unknown',
      isCandidate: person.is_candidate === 1,
      items: {
        promisesIMade,
        promisesToMe,
        actionItems: personItems
          .filter((i: any) => i.type === 'action_item')
          .map(toExplorerItem),
        decisions: personItems
          .filter((i: any) => i.type === 'decision')
          .map(toExplorerItem),
        metrics: personItems
          .filter((i: any) => i.type === 'metric')
          .map(toExplorerItem)
      }
    }
  }).filter(e =>
    e.items.promisesIMade.length > 0 ||
    e.items.promisesToMe.length > 0 ||
    e.items.actionItems.length > 0 ||
    e.items.decisions.length > 0 ||
    e.items.metrics.length > 0
  )

  // My commitments - promises I made and action items assigned to me
  const myCommitments = rawItems
    .filter((item: any) =>
      (item.type === 'promise' || item.type === 'action_item') &&
      item.status === 'pending'
    )
    .map(toExplorerItem)
    .slice(0, 20)

  // Metrics grouped by company
  const metricsMap = new Map<string, ExplorerItem[]>()
  rawItems
    .filter((i: any) => i.type === 'metric')
    .forEach((item: any) => {
      const company = item.target_entity || item.owner_entity || 'Unknown'
      if (!metricsMap.has(company)) {
        metricsMap.set(company, [])
      }
      metricsMap.get(company)!.push(toExplorerItem(item))
    })

  const metricsByCompany: MetricsByCompany[] = Array.from(metricsMap.entries())
    .map(([company, metrics]) => ({
      company: company.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      companySlug: company,
      metrics
    }))
    .filter(g => g.metrics.length > 0)

  return {
    timeRange,
    deals,
    entities,
    myCommitments,
    metricsByCompany
  }
}

// ============================================================================
// Status Query
// ============================================================================

/**
 * Get database status
 */
export function getStatus(): {
  lastRun: string | null
  status: string | null
  entities: number
  candidates: number
  interactions: number
  extractedItems: number
  error?: string
} {
  try {
    const lastRun = db.queryOne<{ started_at: string; status: string }>(
      'SELECT started_at, status FROM batch_runs ORDER BY started_at DESC LIMIT 1'
    )
    const entityCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM entities'
    )
    const interactionCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM interactions'
    )
    const candidateCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM entities WHERE is_candidate = 1'
    )
    const itemCount = db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM extracted_items'
    )

    return {
      lastRun: lastRun?.started_at || null,
      status: lastRun?.status || null,
      entities: entityCount?.count || 0,
      candidates: candidateCount?.count || 0,
      interactions: interactionCount?.count || 0,
      extractedItems: itemCount?.count || 0,
    }
  } catch (error: any) {
    return {
      lastRun: null,
      status: null,
      entities: 0,
      candidates: 0,
      interactions: 0,
      extractedItems: 0,
      error: error.message,
    }
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

function printEntity(entity: EntityContext) {
  console.log(`\n=== ${entity.name} (${entity.type}) ===`)
  console.log(`Slug: ${entity.slug}`)
  if (entity.email) console.log(`Email: ${entity.email}`)
  if (entity.telegram) console.log(`Telegram: @${entity.telegram}`)
  if (entity.current_company) console.log(`Company: ${entity.current_company}`)
  if (entity.job_title) console.log(`Role: ${entity.job_title}`)
  if (entity.current_focus) console.log(`Working on: ${entity.current_focus}`)
  console.log(`Interactions: ${entity.interaction_count}`)
  if (entity.aliases.length > 0) {
    console.log(`Aliases: ${entity.aliases.join(', ')}`)
  }

  if (entity.interactions.length > 0) {
    console.log(`\nRecent interactions:`)
    for (const i of entity.interactions) {
      const date = i.timestamp.split('T')[0]
      console.log(`  - [${date}] ${i.type}: ${i.summary || '(no summary)'}`)
    }
  }

  if (entity.pending_items.length > 0) {
    console.log(`\nPending items:`)
    for (const item of entity.pending_items) {
      const due = item.due_date ? ` (due: ${item.due_date})` : ''
      console.log(`  - [${item.type}] ${item.content}${due}`)
    }
  }
}

function runCLI() {
  const args = process.argv.slice(2)
  const command = args[0]
  const jsonOutput = args.includes('--json')

  switch (command) {
    case 'status': {
      const status = getStatus()
      if (jsonOutput) {
        console.log(JSON.stringify(status, null, 2))
      } else {
        if (status.error) {
          console.error('Database error:', status.error)
        } else {
          console.log('\nDatabase Status:')
          console.log(`  Entities: ${status.entities} (${status.candidates} candidates)`)
          console.log(`  Interactions: ${status.interactions}`)
          console.log(`  Extracted Items: ${status.extractedItems}`)
          if (status.lastRun) {
            console.log(`  Last run: ${status.lastRun} (${status.status})`)
          } else {
            console.log('  Last run: never')
          }
        }
      }
      break
    }

    case 'entity': {
      const slug = args[1]
      if (!slug) {
        console.error('Usage: query.ts entity <slug> [--json]')
        process.exit(1)
      }
      const entity = getEntityContext(slug)
      if (entity) {
        if (jsonOutput) {
          console.log(JSON.stringify(entity, null, 2))
        } else {
          printEntity(entity)
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: 'Entity not found', slug }))
        } else {
          console.log(`Entity not found: ${slug}`)
        }
      }
      break
    }

    case 'find-entity': {
      const identifier = args[1]
      if (!identifier) {
        console.error('Usage: query.ts find-entity <identifier> [--json]')
        process.exit(1)
      }
      const result = findEntity(identifier)
      if (result) {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          console.log(`Found: ${result.name} (${result.slug})`)
          console.log(`  Type: ${result.type}`)
          console.log(`  Match: ${result.match_type} (${result.confidence.toFixed(2)})`)
        }
      } else {
        if (jsonOutput) {
          console.log(JSON.stringify({ error: 'No entity found', identifier }))
        } else {
          console.log(`No entity found for: ${identifier}`)
        }
      }
      break
    }

    case 'list-entities': {
      const type = args.includes('--type') ? args[args.indexOf('--type') + 1] : undefined
      const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 50
      const entities = listEntities({ type, limit })
      if (jsonOutput) {
        console.log(JSON.stringify({ count: entities.length, entities }, null, 2))
      } else {
        console.log(`\nFound ${entities.length} entities:\n`)
        for (const e of entities) {
          console.log(`  ${e.name} (${e.slug}) - ${e.type} [${e.interaction_count} interactions]`)
        }
      }
      break
    }

    case 'list-candidates': {
      const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 100
      const candidates = listCandidates({ limit })
      if (jsonOutput) {
        console.log(JSON.stringify({ count: candidates.length, candidates }, null, 2))
      } else {
        console.log(`\nCandidate entities (${candidates.length}):\n`)
        for (const c of candidates) {
          const email = c.email ? ` <${c.email}>` : ''
          const telegram = c.telegram ? ` @${c.telegram}` : ''
          console.log(`  ${c.name}${email}${telegram}`)
        }
      }
      break
    }

    case 'pending': {
      const owner = args.includes('--owner') ? args[args.indexOf('--owner') + 1] : undefined
      const type = args.includes('--type') ? args[args.indexOf('--type') + 1] as 'promise' | 'action_item' : undefined
      const items = getPendingItems({ owner, type })
      if (jsonOutput) {
        console.log(JSON.stringify({ count: items.length, items }, null, 2))
      } else {
        console.log(`\nFound ${items.length} pending items:\n`)
        for (const item of items) {
          const due = item.due_date ? ` (due: ${item.due_date})` : ''
          const ownerName = item.owner_name ? ` [${item.owner_name}]` : ''
          console.log(`  - [${item.type}]${ownerName} ${item.content}${due}`)
        }
      }
      break
    }

    case 'timeline': {
      const slug = args[1]
      if (!slug) {
        console.error('Usage: query.ts timeline <slug> [--json]')
        process.exit(1)
      }
      const interactions = getEntityTimeline(slug)
      if (jsonOutput) {
        console.log(JSON.stringify({ slug, count: interactions.length, interactions }, null, 2))
      } else {
        console.log(`\nTimeline for ${slug} (${interactions.length} interactions):\n`)
        for (const i of interactions) {
          const date = i.timestamp.split('T')[0]
          console.log(`  [${date}] ${i.type}: ${i.summary || '(no summary)'}`)
        }
      }
      break
    }

    case 'search': {
      const searchQuery = args[1]
      if (!searchQuery) {
        console.error('Usage: query.ts search <query> [--json]')
        process.exit(1)
      }
      const results = searchInteractions(searchQuery)
      if (jsonOutput) {
        console.log(JSON.stringify({ count: results.length, results }, null, 2))
      } else {
        console.log(`\nFound ${results.length} interactions:\n`)
        for (const r of results) {
          const date = r.timestamp.split('T')[0]
          console.log(`  [${date}] ${r.type}: ${r.summary || '(no summary)'}`)
        }
      }
      break
    }

    default:
      console.log(`
Context Graph Query Tool (SQLite v2.1)

Usage:
  bun scripts/db/query.ts <command> [args] [--json]

Entity Commands:
  entity <slug>                    Get full entity context
  find-entity <identifier>         Find entity by email/telegram/name
  list-entities [--type <type>]    List all entities
  list-candidates                  List candidate entities (unverified)

Interaction Commands:
  search <query>                   Full-text search interactions
  timeline <slug>                  Entity interaction timeline

Item Commands:
  pending [--owner <slug>]         List all pending items

System:
  status                           Database status and last run

All commands support --json for structured output.
      `)
  }
}

// Main entry point
if (import.meta.main) {
  try {
    runCLI()
  } finally {
    db.close()
  }
}
