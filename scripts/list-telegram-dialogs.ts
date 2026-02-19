#!/usr/bin/env bun
/**
 * List all Telegram dialogs to find group names
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

const searchTerm = process.argv[2]?.toLowerCase() || '';

async function listDialogs() {
  const sessionString = loadSession();
  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  try {
    await client.connect();

    if (!await client.checkAuthorization()) {
      throw new Error('Not authenticated.');
    }

    console.log('📥 Fetching all dialogs...\n');

    const dialogs = await client.getDialogs({ limit: 500 });

    let matches = 0;

    for (const dialog of dialogs) {
      const entity = dialog.entity;
      let name = '';

      if (entity instanceof Api.User) {
        const firstName = entity.firstName || '';
        const lastName = entity.lastName || '';
        name = [firstName, lastName].filter(Boolean).join(' ');
        if (entity.username) name += ` (@${entity.username})`;
      } else if (entity instanceof Api.Chat || entity instanceof Api.Channel) {
        name = entity.title || '';
      }

      if (!searchTerm || name.toLowerCase().includes(searchTerm)) {
        console.log(`  ${name}`);
        matches++;
      }
    }

    console.log(`\n✅ Total: ${matches} dialog(s)`);
    await client.disconnect();

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    await client.disconnect();
    process.exit(1);
  }
}

listDialogs();
