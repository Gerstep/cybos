#!/usr/bin/env bun
/**
 * Helper script to save a draft to Telegram by username
 *
 * Usage:
 *   bun scripts/save-telegram-draft.ts <username> <draftText>
 */

import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SESSION_DIR = join(process.env.HOME!, '.cybos', 'telegram');
const SESSION_FILE = join(SESSION_DIR, 'session.txt');

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_API_HASH || '';

function loadSession(): string {
  if (existsSync(SESSION_FILE)) {
    return readFileSync(SESSION_FILE, 'utf-8').trim();
  }
  return '';
}

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: bun scripts/save-telegram-draft.ts <username|name> <draftText>');
  console.error('Example: bun scripts/save-telegram-draft.ts @CAiOfficer "Happy birthday!"');
  process.exit(1);
}

const searchQuery = args[0];
const draftText = args[1];

async function saveDraftByUsername() {
  const sessionString = loadSession();
  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  try {
    await client.connect();

    if (!await client.checkAuthorization()) {
      throw new Error('Not authenticated. Run telegram-gramjs.ts first to authenticate.');
    }

    console.log(`🔍 Searching for: ${searchQuery}`);

    const dialogs = await client.getDialogs({ limit: 200 });
    const searchLower = searchQuery.toLowerCase().replace('@', '');

    let targetDialog = null;

    for (const dialog of dialogs) {
      const entity = dialog.entity;

      if (entity instanceof Api.User) {
        const firstName = entity.firstName || '';
        const lastName = entity.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        const username = entity.username;

        const matchesUsername = username && username.toLowerCase().includes(searchLower);
        const matchesName = fullName.toLowerCase().includes(searchLower);

        if (matchesUsername || matchesName) {
          targetDialog = dialog;
          console.log(`✅ Found user: ${fullName}${username ? ` (@${username})` : ''}`);
          break;
        }
      } else if (entity instanceof Api.Chat || entity instanceof Api.Channel) {
        const title = entity.title || '';
        const matchesTitle = title.toLowerCase().includes(searchLower);

        if (matchesTitle) {
          targetDialog = dialog;
          console.log(`✅ Found group/channel: ${title}`);
          break;
        }
      }
    }

    if (!targetDialog) {
      console.error(`❌ No dialog found matching "${searchQuery}"`);
      process.exit(1);
    }

    console.log(`📝 Saving draft...`);

    await client.invoke(
      new Api.messages.SaveDraft({
        peer: targetDialog.inputEntity!,
        message: draftText,
      })
    );

    console.log(`✅ Draft saved successfully!`);
    await client.disconnect();
    process.exit(0);

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    await client.disconnect();
    process.exit(1);
  }
}

saveDraftByUsername();
