/**
 * Cybos Path Resolution
 *
 * Centralized path resolution for all vault and app paths.
 * All scripts should import paths from here rather than constructing them directly.
 *
 * Usage:
 *   import { getVaultPath, getPrivatePath, getDealsPath } from './paths'
 *
 *   const dealsDir = getDealsPath()  // ~/CybosVault/private/deals
 */

import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { loadConfig, getAppRoot } from './config'

// ===== VAULT PATHS =====

/**
 * Get the vault root path (e.g., ~/CybosVault)
 * Throws if config not loaded
 */
export function getVaultPath(): string {
  const config = loadConfig()
  if (!config) {
    throw new Error('Config not loaded. Run setup first.')
  }
  return expandPath(config.vault_path)
}

/**
 * Get the private vault path (e.g., ~/CybosVault/private)
 */
export function getPrivatePath(): string {
  return join(getVaultPath(), 'private')
}

/**
 * Get the shared vault path (e.g., ~/CybosVault/shared)
 */
export function getSharedPath(): string {
  return join(getVaultPath(), 'shared')
}

// ===== PRIVATE VAULT SUBDIRECTORIES =====

/**
 * Get the context directory (e.g., ~/CybosVault/private/context)
 */
export function getContextPath(): string {
  return join(getPrivatePath(), 'context')
}

/**
 * Get the deals directory (e.g., ~/CybosVault/private/deals)
 */
export function getDealsPath(): string {
  return join(getPrivatePath(), 'deals')
}

/**
 * Get the research directory (e.g., ~/CybosVault/private/research)
 */
export function getResearchPath(): string {
  return join(getPrivatePath(), 'research')
}

/**
 * Get the projects directory (e.g., ~/CybosVault/private/projects)
 */
export function getProjectsPath(): string {
  return join(getPrivatePath(), 'projects')
}

/**
 * Get the content directory (e.g., ~/CybosVault/private/content)
 */
export function getContentPath(): string {
  return join(getPrivatePath(), 'content')
}

// ===== CONTEXT SUBDIRECTORIES =====

/**
 * Get the calls directory (e.g., ~/CybosVault/private/context/calls)
 */
export function getCallsPath(): string {
  return join(getContextPath(), 'calls')
}

/**
 * Get the telegram directory (e.g., ~/CybosVault/private/context/telegram)
 */
export function getTelegramPath(): string {
  return join(getContextPath(), 'telegram')
}

/**
 * Get the emails directory (e.g., ~/CybosVault/private/context/emails)
 */
export function getEmailsPath(): string {
  return join(getContextPath(), 'emails')
}

/**
 * Get the entities directory (e.g., ~/CybosVault/private/context/entities)
 */
export function getEntitiesPath(): string {
  return join(getContextPath(), 'entities')
}

// ===== CONTENT SUBDIRECTORIES =====

/**
 * Get the briefs directory (e.g., ~/CybosVault/private/content/briefs)
 */
export function getBriefsPath(): string {
  return join(getContentPath(), 'briefs')
}

/**
 * Get the work directory (e.g., ~/CybosVault/private/content/work)
 */
export function getWorkPath(): string {
  return join(getContentPath(), 'work')
}

/**
 * Get the tweets directory (e.g., ~/CybosVault/private/content/tweets)
 */
export function getTweetsPath(): string {
  return join(getContentPath(), 'tweets')
}

/**
 * Get the essays directory (e.g., ~/CybosVault/private/content/essays)
 */
export function getEssaysPath(): string {
  return join(getContentPath(), 'essays')
}

/**
 * Get the images directory (e.g., ~/CybosVault/private/content/images)
 */
export function getImagesPath(): string {
  return join(getContentPath(), 'images')
}

/**
 * Get the posts directory (e.g., ~/CybosVault/private/content/posts)
 */
export function getPostsPath(): string {
  return join(getContentPath(), 'posts')
}

/**
 * Get the ideas directory (e.g., ~/CybosVault/private/content/ideas)
 */
export function getIdeasPath(): string {
  return join(getContentPath(), 'ideas')
}

// ===== CYBOS METADATA PATHS =====

/**
 * Get the .cybos directory (e.g., ~/CybosVault/private/.cybos)
 */
export function getCybosPath(): string {
  return join(getPrivatePath(), '.cybos')
}

/**
 * Get the database path (e.g., ~/CybosVault/private/.cybos/db/cybos.sqlite)
 */
export function getDbPath(): string {
  return join(getCybosPath(), 'db', 'cybos.sqlite')
}

/**
 * Get the database directory (e.g., ~/CybosVault/private/.cybos/db)
 */
export function getDbDir(): string {
  return join(getCybosPath(), 'db')
}

/**
 * Get the logs directory (e.g., ~/CybosVault/private/.cybos/logs)
 */
export function getLogsPath(): string {
  return join(getCybosPath(), 'logs')
}

/**
 * Get the cache directory (e.g., ~/CybosVault/private/.cybos/cache)
 */
export function getCachePath(): string {
  return join(getCybosPath(), 'cache')
}

// ===== SHARED VAULT PATHS =====

/**
 * Get the shared deals directory
 */
export function getSharedDealsPath(): string {
  return join(getSharedPath(), 'deals')
}

/**
 * Get the shared calls directory
 */
export function getSharedCallsPath(): string {
  return join(getSharedPath(), 'context', 'calls')
}

/**
 * Get the shared research directory
 */
export function getSharedResearchPath(): string {
  return join(getSharedPath(), 'research')
}

/**
 * Get the shared projects directory
 */
export function getSharedProjectsPath(): string {
  return join(getSharedPath(), 'projects')
}

// ===== APP PATHS (CODE, NOT DATA) =====

/**
 * Re-export getAppRoot from config
 */
export { getAppRoot }

/**
 * Get the scripts directory in the app
 */
export function getScriptsPath(): string {
  return join(getAppRoot(), 'scripts')
}

/**
 * Get the .claude directory in the app
 */
export function getClaudePath(): string {
  return join(getAppRoot(), '.claude')
}

/**
 * Get the docs directory in the app
 */
export function getDocsPath(): string {
  return join(getAppRoot(), 'docs')
}

// ===== SPECIFIC FILE PATHS =====

/**
 * Get the who-am-i.md path
 */
export function getWhoAmIPath(): string {
  return join(getContextPath(), 'who-am-i.md')
}

/**
 * Get the organization.md path
 */
export function getOrganizationPath(): string {
  return join(getContextPath(), 'organization.md')
}

/**
 * Get the GTD.md path (in vault root for now, may change)
 */
export function getGTDPath(): string {
  return join(getPrivatePath(), 'GTD.md')
}

/**
 * Get today's log file path (e.g., ~/CybosVault/private/.cybos/logs/0118-26.md)
 */
export function getTodayLogPath(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  return join(getLogsPath(), `${mm}${dd}-${yy}.md`)
}

// ===== DEAL-SPECIFIC PATHS =====

/**
 * Get a specific deal's directory
 */
export function getDealPath(dealSlug: string): string {
  return join(getDealsPath(), dealSlug)
}

/**
 * Get a deal's context file
 */
export function getDealContextPath(dealSlug: string): string {
  return join(getDealPath(dealSlug), '.cybos', 'context.md')
}

/**
 * Get a deal's research directory
 */
export function getDealResearchPath(dealSlug: string): string {
  return join(getDealPath(dealSlug), 'research')
}

/**
 * Get a deal's memo directory
 */
export function getDealMemoPath(dealSlug: string): string {
  return join(getDealPath(dealSlug), 'memo')
}

// ===== PROJECT-SPECIFIC PATHS =====

/**
 * Get a specific project's directory
 */
export function getProjectPath(projectSlug: string): string {
  return join(getProjectsPath(), projectSlug)
}

/**
 * Get a project's context file
 */
export function getProjectContextPath(projectSlug: string): string {
  return join(getProjectPath(projectSlug), '.cybos', 'context.md')
}

// ===== UTILITIES =====

/**
 * Expand ~ to home directory in a path
 */
export function expandPath(path: string): string {
  if (path.startsWith('~/')) {
    return join(homedir(), path.slice(2))
  }
  if (path === '~') {
    return homedir()
  }
  return path
}

/**
 * Check if a deal exists
 */
export function dealExists(dealSlug: string): boolean {
  return existsSync(getDealPath(dealSlug))
}

/**
 * Check if a project exists
 */
export function projectExists(projectSlug: string): boolean {
  return existsSync(getProjectPath(projectSlug))
}

/**
 * Check if the vault is set up
 */
export function vaultExists(): boolean {
  try {
    return existsSync(getPrivatePath())
  } catch {
    return false
  }
}

/**
 * Determine if a path is in private or shared vault
 */
export function isSharedPath(path: string): boolean {
  const shared = getSharedPath()
  return path.startsWith(shared)
}

/**
 * Determine if a path is in private vault
 */
export function isPrivatePath(path: string): boolean {
  const priv = getPrivatePath()
  return path.startsWith(priv)
}

// ===== LEGACY COMPATIBILITY =====

/**
 * For transitioning: check if running in legacy mode (no vault)
 * Returns true if config doesn't exist and we're in old project structure
 */
export function isLegacyMode(): boolean {
  const config = loadConfig()
  if (config) return false

  // Check if we're in old-style project with context/ in current dir
  const appRoot = getAppRoot()
  return existsSync(join(appRoot, 'context')) && existsSync(join(appRoot, 'deals'))
}

/**
 * Get path, falling back to legacy location if in legacy mode
 * Use this during transition period
 */
export function getPathWithLegacyFallback(
  vaultPathFn: () => string,
  legacySubpath: string
): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), legacySubpath)
  }
  return vaultPathFn()
}
