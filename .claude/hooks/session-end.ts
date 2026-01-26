#!/usr/bin/env bun
// SessionEnd hook: Save session summary as Obsidian-compatible MD file
// Creates bidirectional links between sessions and output files

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getContextPath } from '../../scripts/paths';

interface SessionEndPayload {
  session_id: string;
  transcript_path?: string;
  working_directory?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// ===== UTILITIES =====

function getSessionsPath(): string {
  const contextPath = getContextPath();
  return join(contextPath, 'sessions');
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}${day}-${year}`;
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function extractCommand(transcript: Message[]): string | null {
  // Look for /cyber-* commands in user messages
  for (const msg of transcript) {
    if (msg.role === 'user') {
      const match = msg.content.match(/\/cyber-[\w-]+/);
      if (match) return match[0];
    }
  }
  return null;
}

function extractTitle(transcript: Message[]): string {
  // Try to extract meaningful title from first user message
  const firstUser = transcript.find(m => m.role === 'user');
  if (!firstUser) return 'session';

  // Remove commands and take first meaningful words
  const cleaned = firstUser.content
    .replace(/\/cyber-[\w-]+/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).slice(0, 4);
  return words.length > 0 ? slugify(words.join(' ')) : 'session';
}

function extractOutputFiles(transcript: Message[]): string[] {
  const outputs: string[] = [];
  const filePatterns = [
    /(?:saved|wrote|created|output).*?([\/~][\w\-\/\.]+\.md)/gi,
    /deals\/[\w-]+\/[\w-]+\/[\w\-\.]+\.md/gi,
    /projects\/[\w-]+\/[\w\-\.]+\.md/gi,
    /research\/[\w\-\.]+\.md/gi,
  ];

  for (const msg of transcript) {
    if (msg.role === 'assistant') {
      for (const pattern of filePatterns) {
        const matches = msg.content.matchAll(pattern);
        for (const match of matches) {
          const file = match[1] || match[0];
          if (file && !outputs.includes(file)) {
            outputs.push(file);
          }
        }
      }
    }
  }

  return outputs;
}

function generateSummary(transcript: Message[]): string {
  // Generate a brief summary from the last assistant message
  // In a real implementation, this would use AI to summarize
  const lastAssistant = [...transcript].reverse().find(m => m.role === 'assistant');
  if (!lastAssistant) return 'Session completed.';

  // Take first 500 chars and clean up
  const summary = lastAssistant.content
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 500);

  return summary + (summary.length >= 500 ? '...' : '');
}

function convertToWikiLink(filePath: string): string {
  // Convert absolute/relative paths to Obsidian wiki links
  const path = filePath
    .replace(/^~\/CybosVault\/private\//, '')
    .replace(/^\/Users\/[^\/]+\/CybosVault\/private\//, '')
    .replace(/\.md$/, '');

  return `[[${path}]]`;
}

function parseTranscript(transcriptPath: string): Message[] {
  // Parse JSONL transcript file
  if (!existsSync(transcriptPath)) return [];

  const messages: Message[] = [];
  const lines = readFileSync(transcriptPath, 'utf-8').split('\n').filter(Boolean);

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'user' || entry.type === 'assistant') {
        messages.push({
          role: entry.type,
          content: typeof entry.message === 'string'
            ? entry.message
            : JSON.stringify(entry.message),
          timestamp: entry.timestamp
        });
      }
    } catch {
      // Skip malformed lines
    }
  }

  return messages;
}

// ===== MAIN HOOK =====

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });

process.stdin.on('end', async () => {
  try {
    const payload: SessionEndPayload = JSON.parse(input);
    const sessionId = payload.session_id;

    if (!sessionId) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    // Parse transcript if available
    let transcript: Message[] = [];
    if (payload.transcript_path && existsSync(payload.transcript_path)) {
      transcript = parseTranscript(payload.transcript_path);
    }

    // Extract session metadata
    const now = new Date();
    const command = extractCommand(transcript);
    const title = extractTitle(transcript);
    const outputFiles = extractOutputFiles(transcript);
    const summary = generateSummary(transcript);

    // Generate filename: MMDD-title-YY.md
    const dateStr = formatDate(now);
    const filename = `${dateStr}-${title}.md`;

    // Ensure sessions directory exists
    const sessionsPath = getSessionsPath();
    if (!existsSync(sessionsPath)) {
      mkdirSync(sessionsPath, { recursive: true });
    }

    // Build session file content
    const outputLinks = outputFiles.length > 0
      ? outputFiles.map(f => `- ${convertToWikiLink(f)}`).join('\n')
      : '- (no output files detected)';

    const sessionContent = `# Session: ${title.replace(/-/g, ' ')}

**Session ID:** \`${sessionId}\`
**Date:** ${formatDateTime(now)}
${command ? `**Command:** \`${command}\`\n` : ''}
## Output Files
${outputLinks}

## Summary
${summary}

## Resume
[Resume this session](cc://resume/${sessionId})

---
*Auto-generated by Cybos session-end hook*
`;

    // Write session file
    const sessionFilePath = join(sessionsPath, filename);
    writeFileSync(sessionFilePath, sessionContent);

    // Output hook response
    const hookOutput = {
      continue: true,
      systemMessage: `Session saved: context/sessions/${filename}`
    };

    console.log(JSON.stringify(hookOutput));
  } catch (err: any) {
    // Don't block session end on errors
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `Session save failed: ${err.message}`
    }));
  }

  process.exit(0);
});
