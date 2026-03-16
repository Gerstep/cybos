#!/usr/bin/env bun
/**
 * Rebuild sessions-index.json for a CC project directory.
 * - Scans all .jsonl files to find sessions CC missed or didn't update
 * - Extracts customTitle from "custom-title" events in the .jsonl
 * - Extracts summary from "summary" events
 * - Preserves existing valid entries, only adds/updates missing fields
 *
 * Usage: bun scripts/rebuild-sessions-index.ts [--project <path>]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DEFAULT_PROJECT = `${process.env.HOME}/.claude/projects/-Users-sg-Work-cyberman`;

function getProjectDir(): string {
  const idx = process.argv.indexOf('--project');
  return idx >= 0 ? process.argv[idx + 1] : DEFAULT_PROJECT;
}

interface IndexEntry {
  sessionId: string;
  fullPath: string;
  fileMtime: number;
  firstPrompt: string;
  customTitle?: string;
  summary: string;
  messageCount: number;
  created: string | number;
  modified: string | number;
  gitBranch: string;
  projectPath: string;
  isSidechain: boolean;
  [key: string]: unknown;
}

interface IndexFile {
  version: number;
  entries: IndexEntry[];
}

function parseJsonl(path: string): {
  firstPrompt: string;
  customTitle: string | undefined;
  summary: string;
  messageCount: number;
  sessionId: string | undefined;
  gitBranch: string;
  projectPath: string;
  isSidechain: boolean;
  created: string;
  modified: string;
} {
  const lines = readFileSync(path, 'utf-8').split('\n').filter(Boolean);

  let firstPrompt = '';
  let customTitle: string | undefined;
  let summary = '';
  let messageCount = 0;
  let sessionId: string | undefined;
  let gitBranch = '';
  let projectPath = '';
  let isSidechain = false;
  let created = '';
  let modified = '';
  let lastTimestamp = '';

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);

      // Extract session metadata from any message
      if (!sessionId && obj.sessionId) sessionId = obj.sessionId;
      if (!gitBranch && obj.gitBranch) gitBranch = obj.gitBranch;
      if (!projectPath && obj.cwd) projectPath = obj.cwd;
      if (obj.isSidechain !== undefined) isSidechain = obj.isSidechain;
      if (obj.timestamp) {
        if (!created) created = obj.timestamp;
        lastTimestamp = obj.timestamp;
      }

      // Extract first user prompt
      if (!firstPrompt && obj.type === 'user') {
        const msg = obj.message;
        if (typeof msg === 'string') {
          firstPrompt = msg.slice(0, 200);
        } else if (Array.isArray(msg)) {
          const textPart = msg.find((p: { type: string }) => p.type === 'text');
          if (textPart?.text) firstPrompt = textPart.text.slice(0, 200);
        } else if (msg?.content) {
          if (typeof msg.content === 'string') firstPrompt = msg.content.slice(0, 200);
          else if (Array.isArray(msg.content)) {
            const textPart = msg.content.find((p: { type: string }) => p.type === 'text');
            if (textPart?.text) firstPrompt = textPart.text.slice(0, 200);
          }
        }
      }

      // Count messages
      if (obj.type === 'user' || obj.type === 'assistant') {
        messageCount++;
      }

      // Extract customTitle from custom-title events (use last one = most recent rename)
      if (obj.type === 'custom-title' && obj.customTitle) {
        customTitle = obj.customTitle;
      }

      // Extract summary from summary events (use last one)
      if (obj.type === 'summary' && obj.summary) {
        summary = obj.summary;
      }
    } catch {
      // skip malformed lines
    }
  }

  if (lastTimestamp) modified = lastTimestamp;

  return { firstPrompt, customTitle, summary, messageCount, sessionId, gitBranch, projectPath, isSidechain, created, modified };
}

function main() {
  const projectDir = getProjectDir();
  const indexPath = join(projectDir, 'sessions-index.json');

  // Read current index
  let index: IndexFile = { version: 1, entries: [] };
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch {
    console.log('No existing index, starting fresh');
  }

  // Backup
  const backupPath = join(projectDir, 'sessions-index.json.bak');
  writeFileSync(backupPath, JSON.stringify(index, null, 0));

  // Build lookup by sessionId
  const byId = new Map<string, IndexEntry>();
  for (const entry of index.entries) {
    byId.set(entry.sessionId, entry);
  }

  // Scan all .jsonl files
  const files = readdirSync(projectDir).filter(f => f.endsWith('.jsonl'));
  console.log(`Found ${files.length} .jsonl files`);

  let added = 0;
  let updated = 0;

  for (const file of files) {
    const filePath = join(projectDir, file);
    const sessionId = file.replace('.jsonl', '');
    const stat = statSync(filePath);
    const fileMtime = stat.mtimeMs;

    let parsed;
    try {
      parsed = parseJsonl(filePath);
    } catch {
      continue;
    }

    const resolvedSessionId = parsed.sessionId || sessionId;

    if (byId.has(resolvedSessionId)) {
      // Update existing entry with missing fields
      const entry = byId.get(resolvedSessionId)!;
      let changed = false;

      if (!entry.customTitle && parsed.customTitle) {
        entry.customTitle = parsed.customTitle;
        changed = true;
      }
      if ((!entry.summary || entry.summary === '') && parsed.summary) {
        entry.summary = parsed.summary;
        changed = true;
      }
      // Update mtime if file is newer
      if (fileMtime > entry.fileMtime) {
        entry.fileMtime = fileMtime;
        entry.modified = parsed.modified || new Date(fileMtime).toISOString();
        changed = true;
      }

      if (changed) updated++;
    } else {
      // New entry not in index
      const newEntry: IndexEntry = {
        sessionId: resolvedSessionId,
        fullPath: filePath,
        fileMtime,
        firstPrompt: parsed.firstPrompt,
        summary: parsed.summary,
        messageCount: parsed.messageCount,
        created: parsed.created || new Date(stat.birthtimeMs).toISOString(),
        modified: parsed.modified || new Date(fileMtime).toISOString(),
        gitBranch: parsed.gitBranch,
        projectPath: parsed.projectPath || '/Users/sg/Work/cyberman',
        isSidechain: parsed.isSidechain,
      };
      if (parsed.customTitle) newEntry.customTitle = parsed.customTitle;
      byId.set(resolvedSessionId, newEntry);
      added++;
    }
  }

  // Rebuild entries array
  index.entries = Array.from(byId.values());

  // Write back
  writeFileSync(indexPath, JSON.stringify(index));

  console.log(`Done: ${added} added, ${updated} updated, ${index.entries.length} total entries`);

  // Print renamed sessions summary
  const renamed = index.entries.filter(e => e.customTitle);
  console.log(`\nRenamed sessions (${renamed.length}):`);
  for (const e of renamed) {
    console.log(`  "${e.customTitle}" → ${e.sessionId}`);
  }
}

main();
