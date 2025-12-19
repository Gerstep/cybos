#!/usr/bin/env bun
// SessionStart hook: Load core context into every Cybos session

import { readFileSync, existsSync } from 'fs';
import { extractGranolaCalls } from '../../scripts/extract-granola';
import { loadConfig, isSetupComplete } from '../../scripts/config';
import {
  getWhoAmIPath,
  getLogsPath,
  getDealsPath,
  getProjectsPath,
  getCallsPath,
  getAppRoot,
  isLegacyMode,
  getPathWithLegacyFallback,
  getContextPath
} from '../../scripts/paths';
import { join } from 'path';

const INDEX_MAX_AGE_HOURS = 24;

// ===== PATH RESOLUTION =====

/**
 * Get the appropriate path for a context file
 * Supports both vault mode and legacy mode
 */
function getContextFilePath(relativePath: string): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), relativePath);
  }
  // In vault mode, context files are in vault/private/context/
  const parts = relativePath.split('/');
  if (parts[0] === 'context') {
    return join(getContextPath(), ...parts.slice(1));
  }
  // For other paths, they're relative to vault private
  return join(getContextPath(), '..', relativePath);
}

/**
 * Read a file with fallback to legacy location
 */
function readFile(path: string): string {
  const fullPath = getContextFilePath(path);
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return `[File not found: ${path}]`;
}

/**
 * Get the log path instruction (different for vault vs legacy)
 */
function getLogPathInstruction(): string {
  if (isLegacyMode()) {
    return '/.cybos/logs/MMDD-YY.md';
  }
  try {
    const logsPath = getLogsPath();
    return logsPath.replace(process.env.HOME || '~', '~');
  } catch {
    return '~/CybosVault/private/.cybos/logs/MMDD-YY.md';
  }
}

/**
 * Get the deals path instruction (different for vault vs legacy)
 */
function getDealsPathInstruction(): string {
  if (isLegacyMode()) {
    return '/deals/<company-slug>/';
  }
  try {
    const dealsPath = getDealsPath();
    return dealsPath.replace(process.env.HOME || '~', '~') + '/<company-slug>/';
  } catch {
    return '~/CybosVault/private/deals/<company-slug>/';
  }
}

/**
 * Get the projects path instruction (different for vault vs legacy)
 */
function getProjectsPathInstruction(): string {
  if (isLegacyMode()) {
    return '/projects/<slug>/';
  }
  try {
    const projectsPath = getProjectsPath();
    return projectsPath.replace(process.env.HOME || '~', '~') + '/<slug>/';
  } catch {
    return '~/CybosVault/private/projects/<slug>/';
  }
}

// ===== DATABASE FRESHNESS =====

async function checkDatabaseFreshness(): Promise<{ exists: boolean; ageHours: number | null; needsRebuild: boolean; error?: string }> {
  try {
    const { execSync } = await import('child_process');
    const appRoot = getAppRoot();
    const result = execSync(
      'bun scripts/db/query.ts status --json 2>/dev/null',
      { cwd: appRoot, encoding: 'utf-8', timeout: 5000 }
    );
    const status = JSON.parse(result);

    if (status.error) {
      return { exists: false, ageHours: null, needsRebuild: true, error: status.error };
    }

    if (status.lastRun) {
      const ageMs = Date.now() - new Date(status.lastRun).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      return {
        exists: true,
        ageHours: Math.round(ageHours * 10) / 10,
        needsRebuild: ageHours > INDEX_MAX_AGE_HOURS
      };
    }

    // Database exists but hasn't been indexed yet
    return { exists: false, ageHours: null, needsRebuild: true };
  } catch (err: any) {
    // Database not accessible
    return {
      exists: false,
      ageHours: null,
      needsRebuild: true,
      error: 'Database not accessible. Ensure PostgreSQL is running.'
    };
  }
}

// ===== MAIN HOOK =====

// Read stdin for hook payload (required by Claude Code hooks)
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });

process.stdin.on('end', async () => {
  // Check if setup is complete
  const config = loadConfig();
  const setupComplete = isSetupComplete(config);
  let setupMessage = '';

  if (!setupComplete) {
    setupMessage = '⚠️ Cybos not configured. Run: bun scripts/brief-server.ts → http://localhost:3847/setup';
  }

  // Check database freshness
  const dbStatus = await checkDatabaseFreshness();
  let indexMessage = '';

  if (dbStatus.error) {
    indexMessage = `⚠️ ${dbStatus.error}`;
  } else if (!dbStatus.exists) {
    indexMessage = '⚠️ Database not indexed. Run /cyber-reindex to build.';
  } else if (dbStatus.needsRebuild) {
    indexMessage = `⚠️ Database stale (${dbStatus.ageHours}h old). Run /cyber-reindex to refresh.`;
  }

  // Try to extract Granola calls (silent, incremental)
  let granolaStatus = '';
  let granolaMessage = '';

  try {
    const result = await extractGranolaCalls({ silent: true });

    // Build status for context and user message
    if (result.newCalls > 0) {
      granolaMessage = `📞 Granola: Extracted ${result.newCalls} new call${result.newCalls > 1 ? 's' : ''} | Total: ${result.totalCalls} calls indexed`;
      granolaStatus = `\n${granolaMessage}`;
    } else if (result.totalCalls > 0) {
      granolaMessage = `📞 Granola: ${result.totalCalls} call${result.totalCalls > 1 ? 's' : ''} indexed (no new calls)`;
      granolaStatus = `\n${granolaMessage}`;
    }

    if (result.errors.length > 0) {
      const errorMsg = `⚠️ ${result.errors.length} error${result.errors.length > 1 ? 's' : ''} during extraction`;
      granolaStatus += `\n${errorMsg}`;
      granolaMessage = granolaMessage ? `${granolaMessage} | ${errorMsg}` : errorMsg;
    }
  } catch (err: any) {
    // Silent failure - don't break session
    if (err.message && !err.message.includes('File not found')) {
      const errorMsg = `⚠️ Granola extraction failed: ${err.message}`;
      granolaStatus = `\n${errorMsg}`;
      granolaMessage = errorMsg;
    }
  }

  // Build path instructions based on mode
  const dealsPathInstruction = getDealsPathInstruction();
  const projectsPathInstruction = getProjectsPathInstruction();
  const logPathInstruction = getLogPathInstruction();

  // System context for Claude
  const context = `
<system-reminder>
## Your Identity
${readFile('context/who-am-i.md')}

## Fund Context
${readFile('context/what-is-cyber.md')}

## Deal Context Auto-Loading
When the user mentions a company that might be a deal:
1. Check if ${dealsPathInstruction} exists (try kebab-case conversion)
2. If exists, read ${dealsPathInstruction}.cybos/context.md
3. Also check for latest research in ${dealsPathInstruction}research/
4. Incorporate this context into your response

## Project Context Auto-Loading
When the user mentions a project (e.g., "work on scheduler", "context graph status"):
1. Check if ${projectsPathInstruction} exists (try kebab-case conversion)
2. If exists, read ${projectsPathInstruction}.cybos/context.md
3. Also check GTD.md for tasks under the \`# <slug>\` heading
4. Incorporate this context into your response

## Logging Requirement
After completing any workflow (research, content, memo), append a log entry to:
${logPathInstruction}

Use format:
## HH:MM | category | type | subject
- Workflow: name
- Duration: Xm Ys
- Output: path
- Agents: (if used)
- Sources: (if used)

---
${granolaStatus}
</system-reminder>`;

  // Combine messages for user display
  const messages = [setupMessage, granolaMessage, indexMessage].filter(Boolean);
  const systemMessage = messages.length > 0 ? messages.join(' | ') : 'Ready!';

  // Use JSON output for user-visible messages
  const hookOutput = {
    "hookSpecificOutput": {
      "hookEventName": "SessionStart",
      "additionalContext": context
    },
    "systemMessage": systemMessage
  };

  console.log(JSON.stringify(hookOutput));
  process.exit(0);
});
