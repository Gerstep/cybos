#!/usr/bin/env bun
/**
 * Read messages from Telegram groups/channels
 * Usage: bun scripts/telegram-read-group.ts <group-identifier> [--limit N]
 *
 * group-identifier can be:
 *   - Channel ID from URL: e.g. "3708665676" (from https://t.me/c/3708665676/1)
 *   - Username: e.g. "@ProductsAndStartups"
 *   - Group name (partial match): e.g. "Founders for Founders"
 */

import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Logger } from 'telegram/extensions/Logger';
import { LogLevel } from 'telegram/extensions/Logger';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: bun scripts/telegram-read-group.ts <group-id-or-name> [--limit N] [--output path]');
    process.exit(1);
  }

  let groupQuery = args[0];
  let limit = 200;
  let outputPath = '';

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[++i];
    }
  }

  const sessionString = loadSession();
  const session = new StringSession(sessionString);
  const silentLogger = new Logger(LogLevel.NONE);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    baseLogger: silentLogger,
  });

  await client.connect();
  console.error(`Connected. Looking for: ${groupQuery}`);

  let entity: any;

  // Try as channel ID (from t.me/c/ URLs)
  if (/^\d+$/.test(groupQuery)) {
    // Private channel IDs need -100 prefix for API
    const channelId = BigInt(`-100${groupQuery}`);
    try {
      entity = await client.getEntity(channelId);
      console.error(`Found by channel ID: ${(entity as any).title || entity}`);
    } catch (e) {
      console.error(`Could not find channel by ID ${groupQuery}, trying as dialog search...`);
    }
  }

  // Try as username
  if (!entity && groupQuery.startsWith('@')) {
    try {
      entity = await client.getEntity(groupQuery);
      console.error(`Found by username: ${(entity as any).title || entity}`);
    } catch (e) {
      console.error(`Could not find by username ${groupQuery}`);
    }
  }

  // Search in dialogs by name
  if (!entity) {
    console.error(`Searching dialogs for "${groupQuery}"...`);
    const dialogs = await client.getDialogs({ limit: 200 });
    for (const d of dialogs) {
      const title = (d.title || '').toLowerCase();
      if (title.includes(groupQuery.toLowerCase())) {
        entity = d.entity;
        console.error(`Found in dialogs: ${d.title}`);
        break;
      }
    }
  }

  if (!entity) {
    console.error(`ERROR: Could not find group/channel: ${groupQuery}`);
    process.exit(1);
  }

  const title = (entity as any).title || groupQuery;
  console.error(`Fetching ${limit} messages from "${title}"...`);

  // Fetch messages
  const messages = await client.getMessages(entity, { limit });
  console.error(`Got ${messages.length} messages`);

  // Build output
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push(`## ${messages.length} messages (latest first)`);
  lines.push(`## Fetched: ${new Date().toISOString()}`);
  lines.push('');

  // Reverse to show oldest first
  const sorted = [...messages].reverse();

  for (const msg of sorted) {
    if (!msg.message && !msg.media) continue;

    const date = new Date(msg.date * 1000);
    const dateStr = date.toISOString().slice(0, 16).replace('T', ' ');

    let senderName = 'Unknown';
    if (msg.senderId) {
      try {
        const sender = await client.getEntity(msg.senderId);
        if ('firstName' in sender) {
          senderName = [sender.firstName, sender.lastName].filter(Boolean).join(' ');
        } else if ('title' in sender) {
          senderName = sender.title || 'Channel';
        }
      } catch {
        senderName = `User#${msg.senderId}`;
      }
    }

    const text = msg.message || '[media]';
    lines.push(`### [${dateStr}] ${senderName}`);
    lines.push(text);
    lines.push('');
  }

  const output = lines.join('\n');

  if (outputPath) {
    writeFileSync(outputPath, output);
    console.error(`Saved to ${outputPath}`);
  } else {
    console.log(output);
  }

  await client.disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
