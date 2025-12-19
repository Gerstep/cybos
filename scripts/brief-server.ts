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
import {
  getPathWithLegacyFallback,
  getBriefsPath,
  getContextPath,
  getWhoAmIPath,
  getAppRoot,
  isLegacyMode
} from './paths'

// ===== CONFIGURATION =====

const PORT = 3847
const PROJECT_DIR = getAppRoot()

// Use vault paths with legacy fallback
const BRIEFS_DIR = getPathWithLegacyFallback(getBriefsPath, 'content/briefs')
const STATIC_DIR = resolve(PROJECT_DIR, 'scripts/web-brief/dist')
const CONTEXT_DIR = getPathWithLegacyFallback(getContextPath, 'context')
const UNSTUCK_DIR = join(CONTEXT_DIR, 'unstuck')
const JOURNAL_FILE = join(UNSTUCK_DIR, 'journal.md')
const WHO_AM_I_FILE = getPathWithLegacyFallback(getWhoAmIPath, 'context/who-am-i.md')

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

// ===== SETUP WIZARD API =====

import { loadConfig, saveConfig, getConfigPath, type CybosConfig } from './config'
import { execSync, spawnSync } from 'child_process'
import { homedir } from 'os'
import { writeFileSync, symlinkSync, lstatSync } from 'fs'

/**
 * Check if setup is needed
 */
app.get('/api/setup/status', (c) => {
  try {
    const config = loadConfig()
    const configPath = getConfigPath()
    const configExists = existsSync(configPath)

    return c.json({
      configExists,
      configPath,
      setupComplete: config?.setup_completed || false,
      version: config?.version || null,
      vaultPath: config?.vault_path || null,
      userName: config?.user?.name || null
    })
  } catch (error) {
    return c.json({
      configExists: false,
      configPath: getConfigPath(),
      setupComplete: false,
      version: null,
      vaultPath: null,
      userName: null
    })
  }
})

/**
 * Check system dependencies
 */
app.get('/api/setup/deps', (c) => {
  const deps = {
    bun: { installed: false, version: null as string | null, installCmd: 'curl -fsSL https://bun.sh/install | bash' },
    git: { installed: false, version: null as string | null, installCmd: 'xcode-select --install' },
    claude: { installed: false, version: null as string | null, installCmd: 'npm install -g @anthropic-ai/claude-code' }
  }

  // Check bun
  try {
    const bunResult = spawnSync('bun', ['--version'], { encoding: 'utf-8' })
    if (bunResult.status === 0) {
      deps.bun.installed = true
      deps.bun.version = bunResult.stdout.trim()
    }
  } catch {}

  // Check git
  try {
    const gitResult = spawnSync('git', ['--version'], { encoding: 'utf-8' })
    if (gitResult.status === 0) {
      deps.git.installed = true
      deps.git.version = gitResult.stdout.trim().replace('git version ', '')
    }
  } catch {}

  // Check claude CLI
  try {
    const claudeResult = spawnSync('claude', ['--version'], { encoding: 'utf-8' })
    if (claudeResult.status === 0) {
      deps.claude.installed = true
      deps.claude.version = claudeResult.stdout.trim()
    }
  } catch {}

  const allInstalled = deps.bun.installed && deps.git.installed && deps.claude.installed

  return c.json({
    allInstalled,
    deps
  })
})

/**
 * Create vault directory structure
 */
app.post('/api/setup/vault', async (c) => {
  try {
    const body = await c.req.json<{ vaultPath: string }>()
    let vaultPath = body.vaultPath || '~/CybosVault'

    // Expand ~ to home directory
    if (vaultPath.startsWith('~/')) {
      vaultPath = join(homedir(), vaultPath.slice(2))
    }

    // Create vault structure
    const dirs = [
      'private/context',
      'private/context/calls',
      'private/context/telegram',
      'private/context/emails',
      'private/context/entities',
      'private/context/entities/people',
      'private/context/entities/orgs',
      'private/context/unstuck',
      'private/deals',
      'private/research',
      'private/projects',
      'private/content',
      'private/content/posts',
      'private/content/tweets',
      'private/content/essays',
      'private/content/images',
      'private/content/ideas',
      'private/content/briefs',
      'private/content/work',
      'private/.cybos',
      'private/.cybos/db',
      'private/.cybos/logs',
      'private/.cybos/cache',
      'shared'
    ]

    for (const dir of dirs) {
      const fullPath = join(vaultPath, dir)
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true })
      }
    }

    // Create README files
    const readmes: Record<string, string> = {
      'private/context/README.md': '# Context\n\nPersonal context files - identity, calls, emails, telegram conversations.',
      'private/deals/README.md': '# Deals\n\nInvestment deal folders - research, memos, materials.',
      'private/research/README.md': '# Research\n\nTopic and market research.',
      'private/projects/README.md': '# Projects\n\nMulti-week initiative folders.',
      'private/content/README.md': '# Content\n\nGenerated content - posts, tweets, essays, images.',
      'shared/README.md': '# Shared Vault\n\nTeam-shared data (optional GitHub sync).'
    }

    for (const [path, content] of Object.entries(readmes)) {
      const fullPath = join(vaultPath, path)
      if (!existsSync(fullPath)) {
        writeFileSync(fullPath, content)
      }
    }

    return c.json({
      success: true,
      vaultPath,
      created: dirs.length
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Failed to create vault',
      message: errorMessage
    }, 500)
  }
})

/**
 * Save user identity (creates who-am-i.md)
 */
app.post('/api/setup/identity', async (c) => {
  try {
    const body = await c.req.json<{
      vaultPath: string
      name: string
      ownerName: string
      aliases: string[]
      description?: string
    }>()

    let vaultPath = body.vaultPath
    if (vaultPath.startsWith('~/')) {
      vaultPath = join(homedir(), vaultPath.slice(2))
    }

    // Generate who-am-i.md content
    const aliasesFormatted = body.aliases.length > 0
      ? body.aliases.map(a => `  - ${a}`).join('\n')
      : '  - Me'

    const whoAmI = `# ${body.name}

## Identity

**Owner Name:** ${body.ownerName}
**Aliases:**
${aliasesFormatted}

${body.description ? `## About\n\n${body.description}\n` : ''}
## Active Priorities

1. (Add your priorities here)

---

*Generated by Cybos Setup Wizard*
`

    const whoAmIPath = join(vaultPath, 'private/context/who-am-i.md')
    writeFileSync(whoAmIPath, whoAmI)

    // Generate slug from name
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return c.json({
      success: true,
      path: whoAmIPath,
      slug
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Failed to save identity',
      message: errorMessage
    }, 500)
  }
})

/**
 * Save API keys to .env file
 */
app.post('/api/setup/apikeys', async (c) => {
  try {
    const body = await c.req.json<{
      vaultPath: string
      keys: Record<string, string>
    }>()

    let vaultPath = body.vaultPath
    if (vaultPath.startsWith('~/')) {
      vaultPath = join(homedir(), vaultPath.slice(2))
    }

    // Build .env content
    const lines: string[] = [
      '# Cybos Environment Variables',
      '# Generated by Setup Wizard',
      ''
    ]

    const keyMappings: Record<string, string> = {
      anthropic: 'CYBOS_ANTHROPIC_KEY',
      perplexity: 'PERPLEXITY_API_KEY',
      exa: 'EXA_API_KEY',
      gemini: 'GEMINI_API_KEY',
      telegram_id: 'TELEGRAM_API_ID',
      telegram_hash: 'TELEGRAM_API_HASH',
      firecrawl: 'FIRECRAWL_API_KEY',
      notion: 'NOTION_TOKEN'
    }

    for (const [key, value] of Object.entries(body.keys)) {
      if (value && value.trim()) {
        const envKey = keyMappings[key] || key.toUpperCase()
        lines.push(`${envKey}=${value.trim()}`)
      }
    }

    const envPath = join(vaultPath, 'private/.env')
    writeFileSync(envPath, lines.join('\n') + '\n')

    return c.json({
      success: true,
      path: envPath,
      keysCount: Object.keys(body.keys).filter(k => body.keys[k]?.trim()).length
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Failed to save API keys',
      message: errorMessage
    }, 500)
  }
})

/**
 * Complete setup - save config
 */
app.post('/api/setup/complete', async (c) => {
  try {
    const body = await c.req.json<{
      vaultPath: string
      user: {
        name: string
        ownerName: string
        slug: string
        aliases: string[]
      }
      privateGit?: { enabled: boolean; repoUrl?: string }
      sharedGit?: { enabled: boolean; repoUrl?: string }
      automations?: { dailyReindex: boolean; dailyBrief: boolean }
    }>()

    const config: CybosConfig = {
      version: '2.1',
      vault_path: body.vaultPath,
      private: {
        git_enabled: body.privateGit?.enabled || false,
        repo_url: body.privateGit?.repoUrl || null
      },
      shared: {
        enabled: body.sharedGit?.enabled || false,
        repo_url: body.sharedGit?.repoUrl || null
      },
      user: {
        name: body.user.name,
        owner_name: body.user.ownerName,
        slug: body.user.slug,
        aliases: body.user.aliases
      },
      setup_completed: true,
      automations: {
        daily_reindex: body.automations?.dailyReindex ?? true,
        daily_brief: body.automations?.dailyBrief ?? true
      }
    }

    saveConfig(config)

    // Create vault symlink in app root for IDE access
    // Links cyberman/vault -> ~/CybosVault (so user sees both private/ and shared/)
    let symlinkCreated = false
    let symlinkPath = ''
    try {
      let expandedVaultPath = body.vaultPath
      if (expandedVaultPath.startsWith('~/')) {
        expandedVaultPath = join(homedir(), expandedVaultPath.slice(2))
      }

      symlinkPath = join(getAppRoot(), 'vault')
      const targetPath = expandedVaultPath  // Point to vault root, not just private

      // Check if symlink already exists
      let symlinkExists = false
      try {
        const stats = lstatSync(symlinkPath)
        symlinkExists = stats.isSymbolicLink()
      } catch {
        // Symlink doesn't exist, which is fine
      }

      if (!symlinkExists && existsSync(targetPath)) {
        symlinkSync(targetPath, symlinkPath)
        symlinkCreated = true
      } else if (symlinkExists) {
        symlinkCreated = true // Already exists
      }
    } catch (symlinkError) {
      // Non-fatal: symlink creation failed, user can create manually
      console.warn('Failed to create vault symlink:', symlinkError)
    }

    // Ensure vault is in .gitignore (belt and suspenders)
    try {
      const gitignorePath = join(getAppRoot(), '.gitignore')
      if (existsSync(gitignorePath)) {
        const gitignore = readFileSync(gitignorePath, 'utf-8')
        if (!gitignore.includes('\nvault\n') && !gitignore.includes('\nvault')) {
          appendFileSync(gitignorePath, '\n# Vault symlink (user data)\nvault\n')
        }
      }
    } catch {
      // Non-fatal: gitignore update failed
    }

    return c.json({
      success: true,
      configPath: getConfigPath(),
      config,
      symlinkCreated,
      symlinkPath
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({
      error: 'Failed to complete setup',
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
