# Context Explorer - Implementation Plan

> **Status**: Ready for implementation
> **Estimated scope**: ~450 lines of new code
> **Dependencies**: Existing web-brief infrastructure + PostgreSQL context graph

---

## Overview

Add a new "Explorer" page to the web-brief application that surfaces extracted items from the context graph database with full relationship mapping and provenance.

**Key Decisions:**
- Single API endpoint (no lazy loading)
- Filter dropdown instead of search
- 2 component files instead of 6
- Owner-only for "My Commitments"
- Fuzzy grouping for auto-detected deals

---

## Mandatory Requirements

1. **TodoWrite**: Use TodoWrite for every implementation step
2. **Documentation**: Update `docs/ARCHITECTURE.md` when complete
3. **Logging**: Log completion to `/.cybos/logs/MMDD-YY.md`

---

## Architecture

```
web-brief/src/
├── App.tsx                    (add routing: brief/explorer)
├── pages/
│   └── ExplorerPage.tsx       (NEW - main page + inline components)
├── components/
│   └── ItemCard.tsx           (NEW - reusable item display)
├── api/
│   └── explorer.ts            (NEW - API client)
└── types/
    └── explorer.ts            (NEW - type definitions)

scripts/
├── brief-server.ts            (add /api/explorer endpoint)
└── db/
    └── query.ts               (add explorer query functions)
```

---

## Implementation Tasks

### Phase 1: Backend

#### Task 1.1: Explorer Query Functions

**File**: `scripts/db/query.ts`

Add functions:

```typescript
interface ExplorerDashboard {
  timeRange: { start: string; end: string; days: number }
  deals: DealWithActivity[]
  entities: EntityWithItems[]
  myCommitments: ExtractedItemWithProvenance[]
  metrics: MetricsByCompany[]
}

// Main dashboard query - returns everything in one call
export async function getExplorerDashboard(days = 14): Promise<ExplorerDashboard>

// Fuzzy group deals by similar names (Levenshtein distance)
function groupSimilarDeals(deals: RawDeal[]): DealWithActivity[]
```

**Key queries:**
1. Active deals from `extracted_items` where type = 'deal_mention' or 'metric'
2. Recent entities from `entities` joined with `interactions`
3. My commitments where `owner_entity = 'stepan-gershuni'`
4. All metrics grouped by inferred company

#### Task 1.2: API Endpoint

**File**: `scripts/brief-server.ts`

```typescript
app.get('/api/explorer', async (c) => {
  const days = parseInt(c.req.query('days') || '14')
  const data = await getExplorerDashboard(days)
  return c.json(data)
})
```

Single endpoint, returns all data. Client handles expand/collapse state.

---

### Phase 2: Types

**File**: `scripts/web-brief/src/types/explorer.ts`

```typescript
export interface ExplorerDashboard {
  timeRange: { start: string; end: string; days: number }
  deals: DealSummary[]
  entities: EntitySummary[]
  myCommitments: ExtractedItemWithProvenance[]
  metrics: MetricsByCompany[]
}

export interface DealSummary {
  slug: string
  name: string
  names: string[]           // All variant names (for fuzzy grouped)
  hasFolder: boolean
  lastActivity: string
  items: {
    metrics: ExtractedItemWithProvenance[]
    mentions: ExtractedItemWithProvenance[]
    decisions: ExtractedItemWithProvenance[]
  }
  introducedBy?: { name: string; slug: string }
}

export interface EntitySummary {
  slug: string
  name: string
  type: 'person' | 'company' | 'product'
  email?: string
  telegram?: string
  interactionCount: number
  lastActivity: string
  isCandidate: boolean
  items: {
    promisesIMade: ExtractedItemWithProvenance[]
    promisesToMe: ExtractedItemWithProvenance[]
    actionItems: ExtractedItemWithProvenance[]
    decisions: ExtractedItemWithProvenance[]
    metrics: ExtractedItemWithProvenance[]
  }
}

export interface ExtractedItemWithProvenance {
  id: string
  type: 'action_item' | 'promise' | 'decision' | 'metric' | 'question' | 'deal_mention'
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
  metrics: ExtractedItemWithProvenance[]
}

export type FilterType = 'all' | 'promise' | 'action_item' | 'decision' | 'metric'
```

---

### Phase 3: React Components

#### Task 3.1: ItemCard Component

**File**: `scripts/web-brief/src/components/ItemCard.tsx`

Reusable component for displaying any extracted item with provenance.

Props:
- `item: ExtractedItemWithProvenance`
- `showOwner?: boolean` (default true)
- `showTarget?: boolean` (default true)
- `compact?: boolean` (default false)

#### Task 3.2: ExplorerPage Component

**File**: `scripts/web-brief/src/pages/ExplorerPage.tsx`

Main page with all panels. Inline components for DealCard and EntityCard (not separate files).

State:
- `data: ExplorerDashboard | null`
- `loading: boolean`
- `error: string | null`
- `filter: FilterType`
- `expandedDeals: Set<string>`
- `expandedEntities: Set<string>`

---

### Phase 4: Routing

**File**: `scripts/web-brief/src/App.tsx`

Add page state based on URL query param:
- `/?page=brief` or `/` → BriefPage (existing)
- `/?page=explorer` → ExplorerPage (new)

Add navigation toggle in header.

---

### Phase 5: API Client

**File**: `scripts/web-brief/src/api/explorer.ts`

```typescript
export async function fetchExplorerDashboard(days = 14): Promise<ExplorerDashboard> {
  const res = await fetch(`/api/explorer?days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch explorer data')
  return res.json()
}
```

---

## Database Queries

### Deals with Activity

```sql
WITH deal_items AS (
  SELECT
    ei.*,
    i.timestamp,
    i.type as interaction_type,
    i.deal_slug
  FROM extracted_items ei
  JOIN interactions i ON i.id = ei.interaction_id
  WHERE ei.type IN ('deal_mention', 'metric', 'decision')
    AND i.timestamp >= NOW() - INTERVAL '14 days'
)
SELECT
  content as deal_name,
  array_agg(DISTINCT content) as all_names,
  MAX(timestamp) as last_activity,
  json_agg(json_build_object(
    'id', id,
    'type', type,
    'content', content,
    'source_quote', source_quote,
    'trust_level', trust_level
  )) as items
FROM deal_items
GROUP BY deal_slug  -- or fuzzy group in application code
ORDER BY last_activity DESC
```

### Entities with Items

```sql
SELECT
  e.*,
  (
    SELECT json_agg(item_data)
    FROM (
      SELECT ei.*, i.timestamp, i.type as interaction_type
      FROM extracted_items ei
      JOIN interactions i ON i.id = ei.interaction_id
      WHERE (ei.owner_entity = e.slug OR ei.target_entity = e.slug)
        AND i.timestamp >= NOW() - INTERVAL '14 days'
      ORDER BY i.timestamp DESC
    ) item_data
  ) as items
FROM entities e
WHERE e.last_activity >= NOW() - INTERVAL '14 days'
ORDER BY e.last_activity DESC
LIMIT 50
```

### My Commitments

```sql
SELECT ei.*, i.timestamp, i.type as interaction_type
FROM extracted_items ei
JOIN interactions i ON i.id = ei.interaction_id
WHERE ei.type IN ('promise', 'action_item')
  AND ei.status = 'pending'
  AND (ei.owner_entity = 'stepan-gershuni' OR ei.owner_name ILIKE '%stepan%')
  AND i.timestamp >= NOW() - INTERVAL '14 days'
ORDER BY i.timestamp DESC
```

---

## File Summary

| File | Action | Lines (est) |
|------|--------|-------------|
| `scripts/db/query.ts` | Add getExplorerDashboard + helpers | +120 |
| `scripts/brief-server.ts` | Add /api/explorer endpoint | +20 |
| `src/types/explorer.ts` | New file | +80 |
| `src/api/explorer.ts` | New file | +20 |
| `src/components/ItemCard.tsx` | New file | +60 |
| `src/pages/ExplorerPage.tsx` | New file | +150 |
| `src/App.tsx` | Add routing + nav toggle | +30 |
| **Total** | | **~480 lines** |

---

## Testing Checklist

- [ ] `/api/explorer` returns valid JSON
- [ ] Deals are fuzzy-grouped (Naptha/Naphta together)
- [ ] Entities show items in correct categories
- [ ] My Commitments shows owner-only items
- [ ] Filter dropdown filters all panels
- [ ] Expand/collapse works on deals and entities
- [ ] Item cards show provenance quotes
- [ ] Navigation toggle switches pages
- [ ] Design matches Brief page exactly
- [ ] Loading and error states work

---

## Post-Implementation

1. Update `docs/ARCHITECTURE.md` with Explorer section
2. Log completion to `/.cybos/logs/MMDD-YY.md`
3. Rebuild web-brief: `cd scripts/web-brief && bun run build`
