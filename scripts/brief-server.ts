/**
 * Brief Server - Lightweight HTTP server for morning briefs, context explorer, and unstuck
 *
 * Serves the React web app and provides API endpoints for brief data.
 *
 * Usage:
 *   bun scripts/brief-server.ts
 *
 * Endpoints:
 *   GET  /api/brief/today      - Today's brief as JSON
 *   GET  /api/brief/yesterday  - Yesterday's brief as JSON
 *   GET  /api/brief/:date      - Specific brief (MMDD-YY format)
 *   GET  /api/briefs           - List available briefs
 *   GET  /api/explorer         - Explorer dashboard (deals, entities, items)
 *   GET  /api/unstuck/goals    - Active priorities from who-am-i.md
 *   POST /api/unstuck/log      - Log completed unstuck session
 *   GET  /api/health           - Health check
 *   GET  /*                    - Static files (React app)
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { parseBrief, type BriefData } from './brief-parser'
import { getExplorerDashboard } from './db/query'
import { existsSync, readFileSync, readdirSync, mkdirSync, appendFileSync } from 'fs'
import { resolve, join } from 'path'

// ===== CONFIGURATION =====

const PORT = 3847
const PROJECT_DIR = resolve(import.meta.dir, '..')
const BRIEFS_DIR = resolve(PROJECT_DIR, 'content/briefs')
const STATIC_DIR = resolve(PROJECT_DIR, 'scripts/web-brief/dist')
const CONTEXT_DIR = resolve(PROJECT_DIR, 'context')
const UNSTUCK_DIR = resolve(CONTEXT_DIR, 'unstuck')
const JOURNAL_FILE = resolve(UNSTUCK_DIR, 'journal.md')
const WHO_AM_I_FILE = resolve(CONTEXT_DIR, 'who-am-i.md')

// Ensure directories exist
if (!existsSync(BRIEFS_DIR)) {
  mkdirSync(BRIEFS_DIR, { recursive: true })
}
if (!existsSync(UNSTUCK_DIR)) {
  mkdirSync(UNSTUCK_DIR, { recursive: true })
}
if (!existsSync(JOURNAL_FILE)) {
  const header = '# Unstuck Journal\n\nLog of unstuck sessions for self-knowledge.\n\n---\n\n'
  appendFileSync(JOURNAL_FILE, header)
}

// ===== HELPERS =====

/**
 * Resolve brief path from day identifier
 */
function resolveBriefPath(day: string): string {
  if (day === 'today') {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    return resolve(BRIEFS_DIR, `${mm}${dd}-${yy}.md`)
  }

  if (day === 'yesterday') {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    return resolve(BRIEFS_DIR, `${mm}${dd}-${yy}.md`)
  }

  // Direct filename: MMDD-YY or MMDD-YY.md
  const filename = day.endsWith('.md') ? day : `${day}.md`
  return resolve(BRIEFS_DIR, filename)
}

/**
 * Format date for display
 */
function formatDate(day: string): string {
  if (day === 'today') {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })
  }

  if (day === 'yesterday') {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })
  }

  // Parse MMDD-YY format
  const match = day.match(/^(\d{2})(\d{2})-(\d{2})$/)
  if (match) {
    const [_, month, date, year] = match
    const d = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(date))
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })
  }

  return day
}

/**
 * Parse Active Priorities from who-am-i.md
 */
function parseActivePriorities(): string[] {
  const priorities: string[] = []

  if (!existsSync(WHO_AM_I_FILE)) {
    console.warn('Warning: who-am-i.md not found')
    return priorities
  }

  const content = readFileSync(WHO_AM_I_FILE, 'utf-8')
  const lines = content.split('\n')

  let inPrioritiesSection = false

  for (const line of lines) {
    // Detect Active Priorities section
    if (line.includes('Active Priorities')) {
      inPrioritiesSection = true
      continue
    }
    // End section on new header or separator
    if (line.startsWith('##') || line.startsWith('---')) {
      if (inPrioritiesSection && priorities.length > 0) {
        inPrioritiesSection = false
      }
      continue
    }

    // Parse list items within section
    if (inPrioritiesSection) {
      // Match: "- **Text**" or "- Text - description"
      const listMatch = line.match(/^[-*]\s+(.+)$/)
      if (listMatch) {
        let item = listMatch[1]
        // Extract bold text if present
        const boldMatch = item.match(/\*\*([^*]+)\*\*/)
        if (boldMatch) {
          item = boldMatch[1].trim()
        } else {
          // Take text before dash/colon separator
          item = item.split(/\s*[-–:]\s*/)[0].trim()
        }
        if (item && !item.startsWith('[')) {
          priorities.push(item)
        }
      }

      // Match numbered items: "1. **Text**" or "1. Text - description"
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
      if (numberedMatch) {
        let item = numberedMatch[1]
        const boldMatch = item.match(/\*\*([^*]+)\*\*/)
        if (boldMatch) {
          item = boldMatch[1].trim()
        } else {
          item = item.split(/\s*[-–:]\s*/)[0].trim()
        }
        if (item) {
          priorities.push(item)
        }
      }
    }
  }

  return priorities
}

/**
 * Log unstuck session to journal
 */
interface UnstuckSession {
  timestamp: string
  state: string
  customState?: string
  neededDeeperDig: boolean
  deeperDigType?: string
  deeperDigResponse?: string
  connectedTo?: string
  smallestStep?: string
  note?: string
}

function logUnstuckSession(session: UnstuckSession): void {
  const date = new Date(session.timestamp).toISOString().split('T')[0]
  const time = new Date(session.timestamp).toTimeString().split(' ')[0].slice(0, 5)

  let markdown = `## ${date} ${time}\n\n`
  markdown += `**State:** ${session.state}${session.customState ? ` (${session.customState})` : ''}\n`

  if (session.neededDeeperDig) {
    markdown += `**Needed deeper dig:** Yes\n`
    if (session.deeperDigType) {
      markdown += `**Deeper dig prompt:** ${session.deeperDigType}\n`
    }
    if (session.deeperDigResponse) {
      markdown += `**Response:** ${session.deeperDigResponse}\n`
    }
  }

  if (session.connectedTo) {
    markdown += `**Connected to:** ${session.connectedTo}\n`
  }

  if (session.smallestStep) {
    markdown += `**Smallest step:** ${session.smallestStep}\n`
  }

  if (session.note) {
    markdown += `**Note:** ${session.note}\n`
  }

  markdown += `\n---\n\n`

  appendFileSync(JOURNAL_FILE, markdown)
}

// ===== APP SETUP =====

const app = new Hono()

// CORS for local development
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3847', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type']
}))

// ===== API ROUTES =====

/**
 * Get brief by day
 */
app.get('/api/brief/:day', async (c) => {
  const day = c.req.param('day')

  try {
    const briefPath = resolveBriefPath(day)

    if (!existsSync(briefPath)) {
      return c.json({
        error: 'Brief not found',
        path: briefPath,
        day,
        formattedDate: formatDate(day),
        suggestion: day === 'today'
          ? 'Run /cyber-brief to generate today\'s brief'
          : 'This brief does not exist'
      }, 404)
    }

    const markdown = readFileSync(briefPath, 'utf-8')
    const data = parseBrief(markdown)

    return c.json({
      ...data,
      _meta: {
        day,
        formattedDate: formatDate(day),
        path: briefPath
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Parse error',
      message: errorMessage,
      day
    }, 500)
  }
})

/**
 * List available briefs
 */
app.get('/api/briefs', async (c) => {
  try {
    if (!existsSync(BRIEFS_DIR)) {
      return c.json({ briefs: [], total: 0 })
    }

    const files = readdirSync(BRIEFS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 30) // Last 30 briefs

    const briefs = files.map(f => {
      const name = f.replace('.md', '')
      return {
        filename: f,
        name,
        formattedDate: formatDate(name)
      }
    })

    return c.json({
      briefs,
      total: briefs.length
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Failed to list briefs',
      message: errorMessage
    }, 500)
  }
})

/**
 * Health check
 */
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    port: PORT,
    uptime: process.uptime(),
    briefsDir: BRIEFS_DIR,
    staticDir: STATIC_DIR
  })
})

/**
 * Explorer dashboard data
 * Returns deals, entities, commitments, and metrics from the context graph
 */
app.get('/api/explorer', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '14')
    const data = await getExplorerDashboard({ days })
    return c.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Explorer API error:', errorMessage)
    return c.json({
      error: 'Failed to fetch explorer data',
      message: errorMessage
    }, 500)
  }
})

/**
 * Get active priorities for unstuck flow
 */
app.get('/api/unstuck/goals', (c) => {
  try {
    const priorities = parseActivePriorities()
    return c.json({ priorities })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unstuck goals error:', errorMessage)
    return c.json({
      error: 'Failed to fetch priorities',
      message: errorMessage
    }, 500)
  }
})

/**
 * Log completed unstuck session
 */
app.post('/api/unstuck/log', async (c) => {
  try {
    const session = await c.req.json<UnstuckSession>()
    logUnstuckSession(session)
    return c.json({
      success: true,
      path: JOURNAL_FILE
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unstuck log error:', errorMessage)
    return c.json({
      error: 'Failed to log session',
      message: errorMessage
    }, 500)
  }
})

// ===== STATIC FILES =====

// Check if dist exists, otherwise serve dev message
if (existsSync(STATIC_DIR)) {
  // Serve static files from dist
  app.use('/*', serveStatic({
    root: STATIC_DIR.replace(PROJECT_DIR, '').slice(1), // relative path
    rewriteRequestPath: (path) => path
  }))

  // Catch-all route for client-side routing (SPA)
  // Serves index.html for any route that doesn't match an API endpoint or static file
  app.get('/*', (c) => {
    const indexPath = join(STATIC_DIR, 'index.html')
    if (existsSync(indexPath)) {
      return c.html(readFileSync(indexPath, 'utf-8'))
    }
    return c.text('index.html not found', 404)
  })
} else {
  // Dev fallback - redirect to Vite dev server or serve basic HTML
  app.get('/', (c) => {
    return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>Morning Brief</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    .status { color: #22c55e; font-weight: bold; }
    .info { color: #6b7280; margin-top: 20px; }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
    }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <h1>Morning Brief Server</h1>
  <p class="status">Server running on port ${PORT}</p>

  <div class="info">
    <p>The React app hasn't been built yet.</p>
    <p>Run: <code>cd scripts/web-brief && bun run build</code></p>
    <p>Or use the Vite dev server: <code>cd scripts/web-brief && bun run dev</code></p>
  </div>

  <div style="margin-top: 40px;">
    <h3>API Endpoints</h3>
    <p><a href="/api/brief/today">/api/brief/today</a> - Today's brief</p>
    <p><a href="/api/brief/yesterday">/api/brief/yesterday</a> - Yesterday's brief</p>
    <p><a href="/api/briefs">/api/briefs</a> - List all briefs</p>
    <p><a href="/api/health">/api/health</a> - Health check</p>
  </div>
</body>
</html>
    `)
  })
}

// ===== START SERVER =====

console.log(`
╔════════════════════════════════════════════════════════════╗
║              MORNING BRIEF & CONTEXT EXPLORER               ║
╠════════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                          ║
║  Briefs:      ${BRIEFS_DIR.slice(-40).padEnd(40)}║
║  Static:      ${existsSync(STATIC_DIR) ? 'Ready' : 'Not built (run bun build)'.padEnd(40)}║
╠════════════════════════════════════════════════════════════╣
║  API:                                                       ║
║    GET /api/brief/today     - Today's brief                 ║
║    GET /api/brief/yesterday - Yesterday's brief             ║
║    GET /api/briefs          - List all briefs               ║
║    GET /api/explorer        - Explorer dashboard            ║
║    GET /api/health          - Health check                  ║
╠════════════════════════════════════════════════════════════╣
║  Pages:                                                     ║
║    /?page=brief    - Morning brief (default)                ║
║    /?page=explorer - Context explorer                       ║
╚════════════════════════════════════════════════════════════╝

Server: http://localhost:${PORT}
`)

serve({
  fetch: app.fetch,
  port: PORT
})
