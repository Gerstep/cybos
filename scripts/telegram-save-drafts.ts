#!/usr/bin/env bun
/**
 * Save Telegram draft replies from work file
 *
 * Usage:
 *   bun scripts/telegram-save-drafts.ts <work-file-path>
 */

import { readFileSync } from 'fs';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { join } from 'path';

const SESSION_DIR = join(process.env.HOME!, '.cybos', 'telegram');
const SESSION_FILE = join(SESSION_DIR, 'session.txt');
const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_API_HASH || '';

interface Draft {
  title: string;
  username?: string;
  dialogId?: string;
  text: string;
}

function parseWorkFile(path: string): Draft[] {
  const content = readFileSync(path, 'utf-8');
  const drafts: Draft[] = [];

  const sections = content.split(/^## /m).slice(1); // Split by ## headers

  for (const section of sections) {
    const lines = section.split('\n');
    const titleLine = lines[0];

    // Parse title and username
    const titleMatch = titleLine.match(/^(.+?)(?: \((@\w+)\))?$/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const username = titleMatch[2];

    // Parse dialog ID (optional, for better matching)
    let dialogId: string | undefined;
    const dialogIdMatch = section.match(/\*\*Dialog ID:\*\* (.+)/);
    if (dialogIdMatch) {
      dialogId = dialogIdMatch[1].trim();
    }

    // Find draft reply section
    const draftStart = section.indexOf('### Draft Reply');
    if (draftStart === -1) continue;

    const draftSection = section.substring(draftStart);
    const codeBlockMatch = draftSection.match(/```\n([\s\S]*?)\n```/);

    if (codeBlockMatch && codeBlockMatch[1].trim() && codeBlockMatch[1].trim() !== '[AI will generate draft here]') {
      drafts.push({
        title,
        username,
        dialogId,
        text: codeBlockMatch[1].trim()
      });
    }
  }

  return drafts;
}

async function createClient(): Promise<TelegramClient> {
  let sessionString = '';

  try {
    sessionString = readFileSync(SESSION_FILE, 'utf-8').trim();
  } catch {}

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  return client;
}

async function main() {
  const workFilePath = process.argv[2];

  if (!workFilePath) {
    console.error('Usage: bun scripts/telegram-save-drafts.ts <work-file-path>');
    process.exit(1);
  }

  console.log('📝 Parsing work file...');
  const drafts = parseWorkFile(workFilePath);

  if (drafts.length === 0) {
    console.log('❌ No drafts found in work file');
    process.exit(0);
  }

  console.log(`Found ${drafts.length} draft(s) to save`);

  const client = await createClient();

  try {
    await client.connect();

    if (!await client.checkAuthorization()) {
      throw new Error('Not authenticated. Run telegram-gramjs.ts first.');
    }

    console.log('✅ Authenticated');
    console.log('📥 Fetching dialogs...');

    const dialogs = await client.getDialogs({ limit: 500 });

    let success = 0;
    let failed = 0;

    for (const draft of drafts) {
      // Find dialog by ID (preferred) or exact title/username (fallback)
      const dialog = dialogs.find(d => {
        // Try dialog ID first (most reliable)
        if (draft.dialogId && d.id) {
          if (d.id.toString() === draft.dialogId) {
            return true;
          }
          // Fall through to other matching if ID doesn't match
        }

        // Fall back to username matching (exact match only)
        if (draft.username && d.entity) {
          const entity = d.entity as any;
          if (entity.username === draft.username.replace('@', '')) {
            return true;
          }
        }

        // Fall back to exact title matching only
        if (d.title === draft.title || d.name === draft.title) {
          return true;
        }

        return false;
      });

      if (!dialog || !dialog.inputEntity) {
        console.error(`❌ Dialog not found: ${draft.title} (ID: ${draft.dialogId || 'none'})`);
        failed++;
        continue;
      }

      try {
        await client.invoke(
          new Api.messages.SaveDraft({
            peer: dialog.inputEntity,
            message: draft.text,
          })
        );
        console.log(`✅ Draft saved: ${draft.title}`);
        success++;
        await new Promise(r => setTimeout(r, 300));
      } catch (err: any) {
        console.error(`❌ Failed to save draft for ${draft.title}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Complete: ${success} saved, ${failed} failed`);

  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
