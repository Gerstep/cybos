#!/usr/bin/env bun
/**
 * Save Telegram draft replies from work file
 *
 * Uses dialog cache for fast lookups - no need to fetch all dialogs if cached.
 *
 * Usage:
 *   bun scripts/telegram-save-drafts.ts <work-file-path>
 */

import { readFileSync, existsSync } from 'fs';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { join } from 'path';

const SESSION_DIR = join(process.env.HOME!, '.cybos', 'telegram');
const SESSION_FILE = join(SESSION_DIR, 'session.txt');
const DIALOG_CACHE_FILE = join(SESSION_DIR, 'dialog-cache.json');
const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_API_HASH || '';

// Cache types (same as in telegram-gramjs.ts)
interface CachedDialog {
  id: string;
  title: string;
  type: 'private' | 'group' | 'channel';
  username?: string;
  accessHash?: string;
  lastUpdated: string;
}

interface DialogCache {
  version: number;
  dialogs: Record<string, CachedDialog>;
}

function loadDialogCache(): DialogCache {
  try {
    if (existsSync(DIALOG_CACHE_FILE)) {
      const data = readFileSync(DIALOG_CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.log('⚠️ Failed to load dialog cache');
  }
  return { version: 1, dialogs: {} };
}

function findInCache(cache: DialogCache, draft: Draft): CachedDialog | null {
  // Try by dialog ID first
  if (draft.dialogId && cache.dialogs[draft.dialogId]) {
    return cache.dialogs[draft.dialogId];
  }

  // Try by exact title match
  for (const cached of Object.values(cache.dialogs)) {
    if (cached.title === draft.title) {
      return cached;
    }
    // Try username match
    if (draft.username && cached.username === draft.username.replace('@', '')) {
      return cached;
    }
  }

  return null;
}

function createInputPeer(cached: CachedDialog): Api.TypeInputPeer | null {
  const id = BigInt(cached.id);
  const accessHash = cached.accessHash ? BigInt(cached.accessHash) : BigInt(0);

  if (cached.type === 'private') {
    return new Api.InputPeerUser({ userId: id, accessHash });
  } else if (cached.type === 'channel' || (cached.type === 'group' && cached.accessHash)) {
    // Supergroups are channels internally
    return new Api.InputPeerChannel({ channelId: id < 0 ? -id - BigInt(1000000000000) : id, accessHash });
  } else if (cached.type === 'group') {
    // Regular groups (Chat)
    return new Api.InputPeerChat({ chatId: id < 0 ? -id : id });
  }
  return null;
}

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

    // Load dialog cache for fast lookups
    const cache = loadDialogCache();
    const cacheSize = Object.keys(cache.dialogs).length;
    console.log(`💾 Dialog cache: ${cacheSize} entries`);

    let success = 0;
    let failed = 0;
    let dialogs: any[] | null = null; // Lazy load only if needed

    for (const draft of drafts) {
      let inputPeer: Api.TypeInputPeer | null = null;

      // Try cache first (fast path)
      const cached = findInCache(cache, draft);
      if (cached) {
        console.log(`  💾 Found in cache: ${cached.title}`);
        inputPeer = createInputPeer(cached);
      }

      // If not in cache or cache lookup failed, fetch all dialogs (slow path)
      if (!inputPeer) {
        if (!dialogs) {
          console.log('📥 Dialog not in cache, fetching all dialogs...');
          dialogs = [];
          for await (const dialog of client.iterDialogs({ limit: undefined })) {
            dialogs.push(dialog);
            if (dialogs.length % 500 === 0) {
              console.log(`  📦 Fetched ${dialogs.length} dialogs...`);
            }
          }
          console.log(`📦 Total: ${dialogs.length} dialogs`);
        }

        // Find dialog in fetched dialogs
        const dialog = dialogs.find(d => {
          if (draft.dialogId && d.id?.toString() === draft.dialogId) return true;
          if (draft.username && d.entity?.username === draft.username.replace('@', '')) return true;
          if (d.title === draft.title || d.name === draft.title) return true;
          return false;
        });

        if (dialog?.inputEntity) {
          inputPeer = dialog.inputEntity;
        }
      }

      if (!inputPeer) {
        console.error(`❌ Dialog not found: ${draft.title} (ID: ${draft.dialogId || 'none'})`);
        failed++;
        continue;
      }

      try {
        await client.invoke(
          new Api.messages.SaveDraft({
            peer: inputPeer,
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
