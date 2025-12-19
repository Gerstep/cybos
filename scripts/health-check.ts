#!/usr/bin/env bun
/**
 * Health Check Script
 *
 * Validates all Cybos dependencies and configurations before workflows run.
 * Run this to diagnose issues with morning brief, reindex, etc.
 *
 * Usage:
 *   bun scripts/health-check.ts           # Full check
 *   bun scripts/health-check.ts --json    # JSON output
 *   bun scripts/health-check.ts --fix     # Attempt auto-fixes
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadConfig } from './config';
import db from './db/client-sqlite';

interface CheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  fix?: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, okMsg: string, errorMsg: string, fix?: string): void {
  results.push({
    name,
    status: condition ? 'ok' : 'error',
    message: condition ? okMsg : errorMsg,
    fix: condition ? undefined : fix
  });
}

function warn(name: string, message: string, fix?: string): void {
  results.push({ name, status: 'warning', message, fix });
}

async function runChecks(): Promise<void> {
  console.log('🔍 Cybos Health Check\n');

  // 1. Config file
  const config = loadConfig();
  check(
    'Config',
    !!config?.setup_completed,
    `Config loaded from ~/.cybos/config.json`,
    'Config not found or incomplete',
    'Run setup wizard: bun scripts/brief-server.ts, then open http://localhost:3847/setup'
  );

  // 2. Vault path
  const vaultPath = config?.vault_path?.replace(/^~/, homedir()) || join(homedir(), 'CybosVault');
  const vaultExists = existsSync(join(vaultPath, 'private'));
  check(
    'Vault',
    vaultExists,
    `Vault found at ${vaultPath}`,
    `Vault not found at ${vaultPath}`,
    'Run setup wizard or mkdir -p ~/CybosVault/private'
  );

  // 3. Vault .env
  const vaultEnv = join(vaultPath, 'private', '.env');
  const vaultEnvExists = existsSync(vaultEnv);
  check(
    'Vault .env',
    vaultEnvExists,
    `Vault .env found at ${vaultEnv}`,
    `Vault .env not found`,
    `Create ${vaultEnv} with CYBOS_ANTHROPIC_KEY`
  );

  // 4. CYBOS_ANTHROPIC_KEY
  let hasAnthropicKey = !!process.env.CYBOS_ANTHROPIC_KEY;
  if (!hasAnthropicKey && vaultEnvExists) {
    // Try loading from vault .env
    const content = readFileSync(vaultEnv, 'utf-8');
    hasAnthropicKey = content.includes('CYBOS_ANTHROPIC_KEY=');
  }
  check(
    'CYBOS_ANTHROPIC_KEY',
    hasAnthropicKey,
    'API key found for LLM extraction',
    'CYBOS_ANTHROPIC_KEY not set',
    `Add to ${vaultEnv}: CYBOS_ANTHROPIC_KEY=sk-ant-...`
  );

  // 5. Database
  const dbPath = db.getPath();
  const dbExists = db.exists();
  const dbInitialized = dbExists && db.isInitialized();
  check(
    'Database',
    dbInitialized,
    `SQLite database initialized at ${dbPath}`,
    dbExists ? 'Database exists but not initialized' : `Database not found at ${dbPath}`,
    'Run: bun scripts/db/migrate.ts'
  );

  // 6. Database content
  if (dbInitialized) {
    const entities = db.query<{ count: number }>('SELECT COUNT(*) as count FROM entities')[0]?.count || 0;
    const interactions = db.query<{ count: number }>('SELECT COUNT(*) as count FROM interactions')[0]?.count || 0;
    const items = db.query<{ count: number }>('SELECT COUNT(*) as count FROM extracted_items')[0]?.count || 0;

    check(
      'Entities',
      entities > 0,
      `${entities} entities indexed`,
      'No entities in database',
      'Run: bun scripts/db/index.ts'
    );

    check(
      'Interactions',
      interactions > 0,
      `${interactions} interactions indexed`,
      'No interactions in database',
      'Run: bun scripts/db/index.ts'
    );

    if (interactions > 0 && items === 0) {
      warn(
        'Extracted Items',
        `0 items extracted from ${interactions} interactions`,
        'Run: bun scripts/db/index.ts --extract'
      );
    } else {
      check(
        'Extracted Items',
        items > 0,
        `${items} items extracted`,
        'No extracted items',
        'Run: bun scripts/db/index.ts --extract'
      );
    }
  }

  // 7. Telegram session
  const telegramSession = join(homedir(), '.cybos', 'telegram', 'session.txt');
  const hasTelegramSession = existsSync(telegramSession);
  check(
    'Telegram Session',
    hasTelegramSession,
    'Telegram session found',
    'Telegram session not found',
    'Run interactively: bun scripts/telegram-gramjs.ts --login'
  );

  // 8. Telegram env vars
  const hasTelegramCreds = !!(process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH);
  check(
    'Telegram Credentials',
    hasTelegramCreds,
    'TELEGRAM_API_ID and TELEGRAM_API_HASH found',
    'Telegram credentials not in environment',
    'Add to .env: TELEGRAM_API_ID and TELEGRAM_API_HASH from my.telegram.org'
  );

  // 9. Briefs directory
  const briefsDir = join(vaultPath, 'private', 'content', 'briefs');
  const briefsDirExists = existsSync(briefsDir);
  check(
    'Briefs Directory',
    briefsDirExists,
    `Briefs directory found at ${briefsDir}`,
    'Briefs directory not found',
    `mkdir -p ${briefsDir}`
  );

  // 10. Brief server
  try {
    const response = await fetch('http://localhost:3847/api/health', { signal: AbortSignal.timeout(2000) });
    const data = await response.json() as { status: string; briefsDir: string };
    check(
      'Brief Server',
      data.status === 'ok',
      `Brief server running on port 3847`,
      'Brief server not responding correctly',
      'Run: bun scripts/brief-server.ts'
    );

    // Check if server is pointing to correct briefs dir
    if (data.briefsDir !== briefsDir) {
      warn(
        'Brief Server Path',
        `Server using ${data.briefsDir}, expected ${briefsDir}`,
        'Restart server: pkill -f brief-server && bun scripts/brief-server.ts'
      );
    }
  } catch {
    warn(
      'Brief Server',
      'Brief server not running',
      'Run: bun scripts/brief-server.ts'
    );
  }
}

function printResults(jsonOutput: boolean): void {
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const icons = { ok: '✅', warning: '⚠️', error: '❌' };

  for (const r of results) {
    console.log(`${icons[r.status]} ${r.name}: ${r.message}`);
    if (r.fix) {
      console.log(`   Fix: ${r.fix}`);
    }
  }

  console.log('');

  const errors = results.filter(r => r.status === 'error');
  const warnings = results.filter(r => r.status === 'warning');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All checks passed!');
  } else {
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} error(s) found`);
    }
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s) found`);
    }
  }
}

// Main
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');

runChecks()
  .then(() => {
    printResults(jsonOutput);
    const hasErrors = results.some(r => r.status === 'error');
    process.exit(hasErrors ? 1 : 0);
  })
  .catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
