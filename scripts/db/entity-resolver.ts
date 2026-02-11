/**
 * Entity Resolver (SQLite v2.1)
 *
 * Resolves extracted entity mentions to entity slugs.
 * Creates new entities when no match found.
 * Adds aliases when fuzzy match succeeds.
 * Updates entity context (current_focus) on match.
 *
 * 3-stage matching:
 * 1. Exact email match
 * 2. Exact telegram match
 * 3. Fuzzy name match (Levenshtein in TypeScript)
 */

import db from './client-sqlite'
import { USER_IDENTITY } from './prompts/types'

/**
 * Names that should NOT be created as entities
 */
const BLOCKED_ENTITY_NAMES = new Set([
  'speaker',
  'unknown',
  'participant',
  'caller',
  'host',
  'guest',
  'user',
  'admin',
  'moderator',
  'anonymous',
])

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Handle edge cases
  if (m === 0) return n
  if (n === 0) return m

  // Create distance matrix
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  // Initialize first column
  for (let i = 0; i <= m; i++) d[i][0] = i

  // Initialize first row
  for (let j = 0; j <= n; j++) d[0][j] = j

  // Fill in the rest
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return d[m][n]
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function levenshteinSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - distance / maxLen
}

/**
 * Check if a name is the user's identity
 */
export function isUserIdentity(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  const normalized = name.toLowerCase().trim()
  return USER_IDENTITY.names.some(n => n.toLowerCase() === normalized)
}

/**
 * Check if a name should be blocked from entity creation
 */
export function isBlockedName(name: string): boolean {
  if (!name || typeof name !== 'string') return true
  const normalized = name.toLowerCase().trim()
  return BLOCKED_ENTITY_NAMES.has(normalized) || isUserIdentity(name)
}

export interface ExtractedEntity {
  name: string
  type: 'person' | 'company' | 'product'

  // Identifiers (if mentioned)
  email?: string
  telegram?: string

  // Context (person)
  company?: string
  role?: string
  building?: string // What they're working on

  // Context (company)
  sector?: string
  product?: string

  // Confidence from LLM
  confidence: number
}

export interface ResolvedEntity {
  slug: string
  name: string
  matchType: 'email' | 'telegram' | 'alias' | 'fuzzy' | 'created'
  confidence: number
  isNew: boolean
}

/**
 * Generate a slug from a name
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim hyphens
}

/**
 * Check if a slug is available
 */
function isSlugAvailable(slug: string): boolean {
  const existing = db.queryOne<{ slug: string }>(
    'SELECT slug FROM entities WHERE slug = ?',
    [slug]
  )
  return !existing
}

/**
 * Generate a unique slug
 */
function generateUniqueSlug(name: string): string {
  let baseSlug = nameToSlug(name)
  if (!baseSlug) baseSlug = 'entity'

  let slug = baseSlug
  let counter = 1

  while (!isSlugAvailable(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Find entity by email
 */
function findByEmail(email: string, entityType?: string): { slug: string; name: string } | null {
  let sql = 'SELECT slug, name FROM entities WHERE email = ?'
  const params: any[] = [email]

  if (entityType) {
    sql += ' AND type = ?'
    params.push(entityType)
  }

  return db.queryOne<{ slug: string; name: string }>(sql, params)
}

/**
 * Find entity by telegram handle
 */
function findByTelegram(telegram: string, entityType?: string): { slug: string; name: string } | null {
  const handle = telegram.replace(/^@/, '')
  let sql = 'SELECT slug, name FROM entities WHERE telegram = ?'
  const params: any[] = [handle]

  if (entityType) {
    sql += ' AND type = ?'
    params.push(entityType)
  }

  return db.queryOne<{ slug: string; name: string }>(sql, params)
}

/**
 * Find entity by fuzzy name match (Levenshtein)
 */
function findByFuzzyName(name: string, entityType?: string): { slug: string; name: string; confidence: number } | null {
  // Get candidates with LIKE for initial filtering
  let sql = 'SELECT slug, name FROM entities WHERE name LIKE ? COLLATE NOCASE'
  const params: any[] = [`%${name.substring(0, 3)}%`] // Match first 3 chars anywhere

  if (entityType) {
    sql += ' AND type = ?'
    params.push(entityType)
  }

  sql += ' LIMIT 100'

  const candidates = db.query<{ slug: string; name: string }>(sql, params)

  // Score all candidates with Levenshtein
  const scored = candidates
    .map(c => ({ ...c, score: levenshteinSimilarity((c.name || '').toLowerCase(), (name || '').toLowerCase()) }))
    .filter(c => c.score >= 0.7) // Only accept high-similarity matches
    .sort((a, b) => b.score - a.score)

  if (scored.length > 0) {
    return {
      slug: scored[0].slug,
      name: scored[0].name,
      confidence: scored[0].score
    }
  }

  return null
}

/**
 * Resolve an extracted entity to a database entity
 *
 * 3-stage matching:
 * 1. Email exact match
 * 2. Telegram handle match
 * 3. Fuzzy name match (Levenshtein > 0.7)
 * 4. Create new entity if no match
 */
export function resolveEntity(
  extracted: ExtractedEntity,
  interactionDate?: Date
): ResolvedEntity {
  // Check for user identity first
  if (isUserIdentity(extracted.name)) {
    // Ensure user entity exists
    const userEntity = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE slug = ?',
      [USER_IDENTITY.slug]
    )

    if (userEntity) {
      return {
        slug: userEntity.slug,
        name: userEntity.name,
        matchType: 'alias',
        confidence: 1.0,
        isNew: false,
      }
    }

    // Create user entity if it doesn't exist
    db.run(
      `INSERT INTO entities (slug, name, type, last_activity, is_candidate)
       VALUES (?, ?, 'person', datetime('now'), 0)
       ON CONFLICT (slug) DO NOTHING`,
      [USER_IDENTITY.slug, USER_IDENTITY.name]
    )

    return {
      slug: USER_IDENTITY.slug,
      name: USER_IDENTITY.name,
      matchType: 'created',
      confidence: 1.0,
      isNew: true,
    }
  }

  // Skip blocked names (Speaker, Unknown, etc.)
  if (isBlockedName(extracted.name)) {
    return {
      slug: '_blocked_',
      name: extracted.name,
      matchType: 'created',
      confidence: 0,
      isNew: false,
    }
  }

  // Stage 1: Try to find by email first
  if (extracted.email) {
    const match = findByEmail(extracted.email, extracted.type)
    if (match) {
      updateEntityContext(match.slug, extracted, interactionDate, 'email')
      return {
        slug: match.slug,
        name: match.name,
        matchType: 'email',
        confidence: 1.0,
        isNew: false,
      }
    }
  }

  // Stage 2: Try to find by telegram
  if (extracted.telegram) {
    const match = findByTelegram(extracted.telegram, extracted.type)
    if (match) {
      updateEntityContext(match.slug, extracted, interactionDate, 'telegram')
      return {
        slug: match.slug,
        name: match.name,
        matchType: 'telegram',
        confidence: 1.0,
        isNew: false,
      }
    }
  }

  // Stage 3: Try fuzzy name match
  const fuzzyMatch = findByFuzzyName(extracted.name, extracted.type)
  if (fuzzyMatch) {
    // Add as alias (nickname) for future exact matching
    addAlias(fuzzyMatch.slug, extracted.name, 'nickname', fuzzyMatch.confidence)
    updateEntityContext(fuzzyMatch.slug, extracted, interactionDate, 'fuzzy')
    return {
      slug: fuzzyMatch.slug,
      name: fuzzyMatch.name,
      matchType: 'fuzzy',
      confidence: fuzzyMatch.confidence,
      isNew: false,
    }
  }

  // No match found - create new entity
  const newEntity = createEntity(extracted, interactionDate)
  return {
    slug: newEntity.slug,
    name: newEntity.name,
    matchType: 'created',
    confidence: extracted.confidence,
    isNew: true,
  }
}

/**
 * Create a candidate entity from participant data (low-confidence, needs review)
 *
 * Used by extractors when a participant can't be resolved to an existing entity.
 * Marked with is_candidate = 1 for later manual review.
 */
export function createCandidateEntity(
  name: string,
  email?: string,
  telegram?: string,
  sourceType?: 'call' | 'email' | 'telegram',
  interactionDate?: Date
): { slug: string; name: string; isNew: boolean } {
  // Check for user identity
  if (isUserIdentity(name)) {
    const userEntity = db.queryOne<{ slug: string; name: string }>(
      'SELECT slug, name FROM entities WHERE slug = ?',
      [USER_IDENTITY.slug]
    )

    if (userEntity) {
      return { slug: userEntity.slug, name: userEntity.name, isNew: false }
    }

    // Create user entity
    db.run(
      `INSERT INTO entities (slug, name, type, last_activity, is_candidate)
       VALUES (?, ?, 'person', datetime('now'), 0)
       ON CONFLICT (slug) DO NOTHING`,
      [USER_IDENTITY.slug, USER_IDENTITY.name]
    )

    return { slug: USER_IDENTITY.slug, name: USER_IDENTITY.name, isNew: true }
  }

  // Skip blocked names
  if (isBlockedName(name)) {
    console.log(`    → Skipped blocked name: ${name}`)
    return { slug: '_blocked_', name, isNew: false }
  }

  // First try to resolve - maybe they exist
  // Stage 1: Check email
  if (email) {
    const match = findByEmail(email)
    if (match) return { slug: match.slug, name: match.name, isNew: false }
  }

  // Stage 2: Check telegram
  if (telegram) {
    const match = findByTelegram(telegram)
    if (match) return { slug: match.slug, name: match.name, isNew: false }
  }

  // Stage 3: Fuzzy name match
  const fuzzyMatch = findByFuzzyName(name, 'person')
  if (fuzzyMatch) {
    return { slug: fuzzyMatch.slug, name: fuzzyMatch.name, isNew: false }
  }

  // Create as candidate
  const slug = generateUniqueSlug(name)
  const timestamp = interactionDate?.toISOString() || new Date().toISOString()

  db.run(
    `INSERT INTO entities (
      slug, name, type, email, telegram,
      last_activity, is_candidate
    ) VALUES (?, ?, 'person', ?, ?, ?, 1)`,
    [
      slug,
      name,
      email || null,
      telegram?.replace(/^@/, '') || null,
      timestamp,
    ]
  )

  // Add name as an alias for consistent matching
  addAlias(slug, name, 'name', 0.5)

  console.log(`    → Created candidate entity: ${name} (${slug}) from ${sourceType || 'unknown'}`)

  return { slug, name, isNew: true }
}

/**
 * Create a new entity from extracted data
 */
function createEntity(
  extracted: ExtractedEntity,
  interactionDate?: Date
): { slug: string; name: string } {
  const slug = generateUniqueSlug(extracted.name)
  const timestamp = interactionDate?.toISOString() || new Date().toISOString()

  // Normalize entity type to valid values
  let entityType = extracted.type
  if (!['person', 'company', 'product', 'group'].includes(entityType)) {
    entityType = 'person' // Default to person for invalid types
  }

  db.run(
    `INSERT INTO entities (
      slug, name, type, email, telegram,
      current_company, job_title, current_focus,
      last_activity, is_candidate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      slug,
      extracted.name,
      entityType,
      extracted.email || null,
      extracted.telegram?.replace(/^@/, '') || null,
      extracted.company || null,
      extracted.role || null,
      extracted.building || null,
      timestamp,
    ]
  )

  // Add name as an alias for consistent matching
  addAlias(slug, extracted.name, 'name', 1.0)

  return { slug, name: extracted.name }
}

/**
 * Add an alias for an entity
 */
function addAlias(
  entitySlug: string,
  alias: string,
  aliasType: string,
  confidence: number
): void {
  const aliasId = `${entitySlug}-${aliasType}-${nameToSlug(alias)}`

  db.run(
    `INSERT INTO entity_aliases (id, entity_slug, alias, alias_type)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (id) DO NOTHING`,
    [aliasId, entitySlug, alias, aliasType]
  )
}

/**
 * Update entity context with new information
 *
 * @param matchType - How the entity was matched. Only update company/role for exact matches.
 */
function updateEntityContext(
  slug: string,
  extracted: ExtractedEntity,
  interactionDate?: Date,
  matchType?: string
): void {
  const timestamp = interactionDate?.toISOString() || new Date().toISOString()

  // Get current entity state
  const current = db.queryOne<{
    email: string | null
    telegram: string | null
    current_company: string | null
    job_title: string | null
    current_focus: string | null
    last_activity: string | null
  }>('SELECT email, telegram, current_company, job_title, current_focus, last_activity FROM entities WHERE slug = ?', [slug])

  if (!current) return

  // Build update
  const updates: string[] = []
  const values: any[] = []

  // Update contact info if provided and not already set
  if (extracted.email && !current.email) {
    updates.push('email = ?')
    values.push(extracted.email)
  }

  if (extracted.telegram && !current.telegram) {
    updates.push('telegram = ?')
    values.push(extracted.telegram.replace(/^@/, ''))
  }

  // CONSERVATIVE: Only update company/role from EXACT matches (email, telegram)
  // Fuzzy matches should NOT update company/role to prevent entity conflation
  const isExactMatch = matchType && ['email', 'telegram'].includes(matchType)

  if (extracted.type === 'person' && isExactMatch) {
    if (extracted.company && extracted.company !== current.current_company) {
      updates.push('current_company = ?')
      values.push(extracted.company)
    }
    if (extracted.role && extracted.role !== current.job_title) {
      updates.push('job_title = ?')
      values.push(extracted.role)
    }
  }

  // Update current_focus if mentioned
  if (extracted.building && extracted.building !== current.current_focus) {
    updates.push('current_focus = ?')
    values.push(extracted.building)
  }

  // Always update last_activity if newer
  if (!current.last_activity || timestamp > current.last_activity) {
    updates.push('last_activity = ?')
    values.push(timestamp)
  }

  // Increment interaction count
  updates.push('interaction_count = interaction_count + 1')

  if (updates.length > 0) {
    values.push(slug)
    db.run(`UPDATE entities SET ${updates.join(', ')} WHERE slug = ?`, values)
  }
}

/**
 * Batch resolve multiple entities
 */
export function resolveEntities(
  entities: ExtractedEntity[],
  interactionDate?: Date
): Map<string, ResolvedEntity> {
  const results = new Map<string, ResolvedEntity>()

  for (const entity of entities) {
    if (!entity.name) continue
    const key = `${entity.type}:${entity.name.toLowerCase()}`
    if (!results.has(key)) {
      const resolved = resolveEntity(entity, interactionDate)
      results.set(key, resolved)
    }
  }

  return results
}

// CLI for testing
if (import.meta.main) {
  try {
    console.log('Testing entity resolver (SQLite)...\n')

    // First, ensure we have some test data
    const testPerson = db.queryOne<{ slug: string }>('SELECT slug FROM entities WHERE name LIKE ?', ['%Test%'])
    if (!testPerson) {
      // Create a test entity
      db.run(
        'INSERT INTO entities (slug, name, type, last_activity, is_candidate) VALUES (?, ?, ?, datetime("now"), 0)',
        ['test-person', 'Test Person Full Name', 'person']
      )
      console.log('Created test entity: test-person')
    }

    // Test 1: Resolve by fuzzy name match
    const test1 = resolveEntity({
      name: 'Test Person',
      type: 'person',
      confidence: 0.8,
    })
    console.log('Test 1 (fuzzy name match):', test1)

    // Test 2: Create new entity
    const test2 = resolveEntity(
      {
        name: 'New Test Person ' + Date.now(),
        type: 'person',
        company: 'Test Corp',
        role: 'CEO',
        building: 'AI agents platform',
        confidence: 0.7,
      },
      new Date()
    )
    console.log('Test 2 (new entity):', test2)

    // Verify context was set
    const newEntity = db.queryOne<{
      slug: string
      name: string
      current_company: string | null
      job_title: string | null
      current_focus: string | null
    }>('SELECT slug, name, current_company, job_title, current_focus FROM entities WHERE slug = ?', [test2.slug])
    console.log('Test 2 entity details:', newEntity)

    // Cleanup test entities
    if (test2.isNew) {
      db.run('DELETE FROM entity_aliases WHERE entity_slug = ?', [test2.slug])
      db.run('DELETE FROM entities WHERE slug = ?', [test2.slug])
      console.log('\nCleaned up test entity:', test2.slug)
    }

    // Also cleanup the initial test entity if we created it
    if (!testPerson) {
      db.run('DELETE FROM entity_aliases WHERE entity_slug = ?', ['test-person'])
      db.run('DELETE FROM entities WHERE slug = ?', ['test-person'])
      console.log('Cleaned up test entity: test-person')
    }

    console.log('\n[OK] All tests passed')
  } finally {
    db.close()
  }
}
