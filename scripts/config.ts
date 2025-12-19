/**
 * Cybos Global Configuration Management
 *
 * Handles reading, writing, and migrating the global config at ~/.cybos/config.json
 * API keys stay in .env file (not in this config) for security.
 *
 * Usage:
 *   import { loadConfig, saveConfig, getConfig, isSetupComplete } from './config'
 *
 *   const config = await loadConfig()
 *   if (!isSetupComplete(config)) {
 *     await launchSetupWizard()
 *   }
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { homedir } from 'os'

// ===== TYPES =====

export interface CybosConfig {
  version: string
  vault_path: string
  private: {
    git_enabled: boolean
    repo_url: string | null
  }
  shared: {
    enabled: boolean
    repo_url: string | null
  }
  user: {
    name: string
    owner_name: string
    slug: string
    aliases: string[]
  }
  setup_completed: boolean
  automations: {
    daily_reindex: boolean
    daily_brief: boolean
  }
}

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ===== CONSTANTS =====

export const CURRENT_VERSION = '2.1'
export const CONFIG_DIR = resolve(homedir(), '.cybos')
export const CONFIG_PATH = resolve(CONFIG_DIR, 'config.json')

/**
 * Get config file path (convenience function)
 */
export function getConfigPath(): string {
  return CONFIG_PATH
}

const DEFAULT_CONFIG: CybosConfig = {
  version: CURRENT_VERSION,
  vault_path: resolve(homedir(), 'CybosVault'),
  private: {
    git_enabled: false,
    repo_url: null
  },
  shared: {
    enabled: false,
    repo_url: null
  },
  user: {
    name: '',
    owner_name: '',
    slug: '',
    aliases: []
  },
  setup_completed: false,
  automations: {
    daily_reindex: true,
    daily_brief: true
  }
}

// ===== CONFIG LOADING =====

/**
 * Load config from ~/.cybos/config.json
 * Returns null if config doesn't exist (setup not completed)
 * Automatically migrates old versions
 */
export function loadConfig(): CybosConfig | null {
  if (!existsSync(CONFIG_PATH)) {
    return null
  }

  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    const config = JSON.parse(raw) as CybosConfig

    // Check for version migration
    const migrated = migrateConfig(config)
    if (migrated.version !== config.version) {
      // Save migrated config
      saveConfig(migrated)
      console.log(`Config migrated from v${config.version} to v${migrated.version}`)
    }

    return migrated
  } catch (error) {
    console.error('Failed to load config:', error)
    return null
  }
}

/**
 * Save config to ~/.cybos/config.json
 * Creates directory if it doesn't exist
 */
export function saveConfig(config: CybosConfig): void {
  // Ensure directory exists
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 }) // User-only permissions
  }

  const json = JSON.stringify(config, null, 2)
  writeFileSync(CONFIG_PATH, json, { mode: 0o600 }) // User-only read/write
}

/**
 * Get config or throw if not setup
 * Use this in commands that require setup to be complete
 */
export function getConfigOrThrow(): CybosConfig {
  const config = loadConfig()
  if (!config) {
    throw new ConfigNotFoundError()
  }
  if (!config.setup_completed) {
    throw new SetupIncompleteError()
  }
  return config
}

// ===== CONFIG VALIDATION =====

/**
 * Check if setup is complete (config exists and marked complete)
 */
export function isSetupComplete(config: CybosConfig | null): boolean {
  return config !== null && config.setup_completed === true
}

/**
 * Validate config for required fields and correctness
 */
export function validateConfig(config: CybosConfig): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!config.vault_path) {
    errors.push('vault_path is required')
  }
  if (!config.user.name) {
    errors.push('user.name is required')
  }
  if (!config.user.owner_name) {
    errors.push('user.owner_name is required')
  }
  if (!config.user.slug) {
    errors.push('user.slug is required')
  }

  // Vault path validation
  if (config.vault_path && !config.vault_path.includes('/')) {
    errors.push('vault_path must be an absolute path')
  }

  // Warnings for recommended but optional fields
  if (config.user.aliases.length === 0) {
    warnings.push('user.aliases is empty - entity matching may be less accurate')
  }

  // Git config validation
  if (config.private.git_enabled && !config.private.repo_url) {
    errors.push('private.repo_url is required when private.git_enabled is true')
  }
  if (config.shared.enabled && !config.shared.repo_url) {
    errors.push('shared.repo_url is required when shared.enabled is true')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// ===== VERSION MIGRATION =====

/**
 * Migrate config from older versions to current version
 */
export function migrateConfig(config: CybosConfig): CybosConfig {
  let migrated = { ...config }

  // No migrations needed yet for 2.1 (it's the first version with this system)
  // Future migrations will be added here:
  //
  // if (compareVersions(config.version, '2.2') < 0) {
  //   migrated = migrate_2_1_to_2_2(migrated)
  // }

  // Ensure version is current
  migrated.version = CURRENT_VERSION

  // Ensure all required fields exist with defaults
  migrated = {
    ...DEFAULT_CONFIG,
    ...migrated,
    private: { ...DEFAULT_CONFIG.private, ...migrated.private },
    shared: { ...DEFAULT_CONFIG.shared, ...migrated.shared },
    user: { ...DEFAULT_CONFIG.user, ...migrated.user },
    automations: { ...DEFAULT_CONFIG.automations, ...migrated.automations }
  }

  return migrated
}

/**
 * Compare semantic versions
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0
    const bVal = bParts[i] || 0
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
  }
  return 0
}

// ===== WIZARD LAUNCHING =====

/**
 * Check if wizard server is running
 */
export async function isWizardServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3847/api/health', {
      signal: AbortSignal.timeout(1000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Launch the setup wizard
 * - Starts brief-server if not running
 * - Opens browser to /setup
 */
export async function launchSetupWizard(): Promise<void> {
  const serverRunning = await isWizardServerRunning()

  if (!serverRunning) {
    // Start the server in background
    console.log('Starting Cybos server...')
    const proc = Bun.spawn(['bun', 'scripts/brief-server.ts'], {
      cwd: getAppRoot(),
      stdout: 'ignore',
      stderr: 'ignore'
    })

    // Wait for server to start
    let attempts = 0
    while (attempts < 10) {
      await new Promise(r => setTimeout(r, 500))
      if (await isWizardServerRunning()) break
      attempts++
    }

    if (!(await isWizardServerRunning())) {
      console.error('Failed to start server. Please run manually:')
      console.error('  bun scripts/brief-server.ts')
      process.exit(1)
    }
  }

  // Open browser
  const url = 'http://localhost:3847/setup'
  console.log(`Opening setup wizard: ${url}`)

  const platform = process.platform
  if (platform === 'darwin') {
    Bun.spawn(['open', url])
  } else if (platform === 'linux') {
    Bun.spawn(['xdg-open', url])
  } else {
    console.log(`Please open in browser: ${url}`)
  }
}

/**
 * Get the app root directory (where the code lives)
 */
export function getAppRoot(): string {
  // This file is at scripts/config.ts, so app root is one level up
  return resolve(dirname(import.meta.path), '..')
}

// ===== ERROR CLASSES =====

export class ConfigNotFoundError extends Error {
  constructor() {
    super('Cybos configuration not found. Setup wizard will open.')
    this.name = 'ConfigNotFoundError'
  }
}

export class SetupIncompleteError extends Error {
  constructor() {
    super('Cybos setup is incomplete. Setup wizard will open.')
    this.name = 'SetupIncompleteError'
  }
}

// ===== CLI HELPER =====

/**
 * Ensure config exists and setup is complete
 * If not, launches wizard and exits
 * Use at the start of commands that require config
 */
export async function ensureSetup(): Promise<CybosConfig> {
  const config = loadConfig()

  if (!config || !config.setup_completed) {
    console.log('Cybos not configured. Opening setup wizard...')
    await launchSetupWizard()
    console.log('\nSetup wizard opened in browser.')
    console.log('Please complete setup and run the command again.')
    process.exit(0)
  }

  return config
}

// ===== EXPORTS FOR TESTING =====

export const _testing = {
  DEFAULT_CONFIG,
  compareVersions,
  migrateConfig
}
