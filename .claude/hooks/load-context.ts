#!/usr/bin/env bun
// SessionStart hook: Load core context into every Cybos session

import { readFileSync, existsSync } from 'fs';
import { extractGranolaCalls } from '../../scripts/extract-granola';

const CYBOS_DIR = process.env.CYBOS_DIR || process.cwd();
const INDEX_MAX_AGE_HOURS = 24;

function readFile(path: string): string {
  const fullPath = `${CYBOS_DIR}/${path}`;
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return `[File not found: ${path}]`;
}

async function checkDatabaseFreshness(): Promise<{ exists: boolean; ageHours: number | null; needsRebuild: boolean; error?: string }> {
  try {
    const { execSync } = await import('child_process');
    const result = execSync(
      'bun scripts/db/query.ts status --json 2>/dev/null',
      { cwd: CYBOS_DIR, encoding: 'utf-8', timeout: 5000 }
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

// Read stdin for hook payload (required by Claude Code hooks)
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });

process.stdin.on('end', async () => {
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

  // System context for Claude
  const context = `
<system-reminder>
## Your Identity
${readFile('context/who-am-i.md')}

## Fund Context
${readFile('context/what-is-cyber.md')}

## Deal Context Auto-Loading
When the user mentions a company that might be a deal:
1. Check if /deals/<company-slug>/ exists (try kebab-case conversion)
2. If exists, read /deals/<company-slug>/.cybos/context.md
3. Also check for latest research in /deals/<company-slug>/research/
4. Incorporate this context into your response

## Project Context Auto-Loading
When the user mentions a project (e.g., "work on scheduler", "context graph status"):
1. Check if /projects/<slug>/ exists (try kebab-case conversion)
2. If exists, read /projects/<slug>/.cybos/context.md
3. Also check GTD.md for tasks under the \`# <slug>\` heading
4. Incorporate this context into your response

## Logging Requirement
After completing any workflow (research, content, memo), append a log entry to:
/.cybos/logs/MMDD-YY.md

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
  const messages = [granolaMessage, indexMessage].filter(Boolean);
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
