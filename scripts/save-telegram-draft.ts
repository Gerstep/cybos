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

async function resolveByUsername(client: TelegramClient, username: string): Promise<Api.TypeInputPeer | null> {
  const clean = username.replace('@', '');
  try {
    const result = await client.invoke(new Api.contacts.ResolveUsername({ username: clean }));
    const peer = result.peer;
    if (peer instanceof Api.PeerUser) {
      const user = result.users.find((u: any) => u.id.eq(peer.userId));
      if (user && user instanceof Api.User) {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
        console.log(`✅ Resolved: ${name} (@${user.username || clean})`);
        return new Api.InputPeerUser({ userId: user.id, accessHash: user.accessHash! });
      }
    } else if (peer instanceof Api.PeerChannel) {
      const ch = result.chats.find((c: any) => c.id.eq(peer.channelId));
      if (ch && ch instanceof Api.Channel) {
        console.log(`✅ Resolved channel: ${ch.title} (@${clean})`);
        return new Api.InputPeerChannel({ channelId: ch.id, accessHash: ch.accessHash! });
      }
    } else if (peer instanceof Api.PeerChat) {
      console.log(`✅ Resolved chat: ${clean}`);
      return new Api.InputPeerChat({ chatId: peer.chatId });
    }
  } catch (err: any) {
    if (err.message?.includes('USERNAME_NOT_OCCUPIED')) {
      return null;
    }
    throw err;
  }
  return null;
}

async function searchDialogs(client: TelegramClient, query: string): Promise<{ peer: Api.TypeInputPeer; label: string } | null> {
  const searchLower = query.toLowerCase().replace('@', '');
  const dialogs = await client.getDialogs({ limit: 200 });

  for (const dialog of dialogs) {
    const entity = dialog.entity;
    if (entity instanceof Api.User) {
      const fullName = [entity.firstName, entity.lastName].filter(Boolean).join(' ');
      const matchesUsername = entity.username && entity.username.toLowerCase().includes(searchLower);
      const matchesName = fullName.toLowerCase().includes(searchLower);
      if (matchesUsername || matchesName) {
        console.log(`✅ Found in dialogs: ${fullName}${entity.username ? ` (@${entity.username})` : ''}`);
        return { peer: dialog.inputEntity!, label: fullName };
      }
    } else if (entity instanceof Api.Chat || entity instanceof Api.Channel) {
      const title = entity.title || '';
      if (title.toLowerCase().includes(searchLower)) {
        console.log(`✅ Found in dialogs: ${title}`);
        return { peer: dialog.inputEntity!, label: title };
      }
    }
  }
  return null;
}

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

    let peer: Api.TypeInputPeer | null = null;

    // Fast path: if it looks like a @username, resolve directly via API
    if (searchQuery.startsWith('@') || /^[a-zA-Z][a-zA-Z0-9_]{3,}$/.test(searchQuery)) {
      peer = await resolveByUsername(client, searchQuery);
    }

    // Fallback: search recent dialogs by name
    if (!peer) {
      console.log('🔍 Trying dialog search...');
      const found = await searchDialogs(client, searchQuery);
      if (found) peer = found.peer;
    }

    if (!peer) {
      console.error(`❌ Could not find "${searchQuery}". Check the username or try a name search.`);
      process.exit(1);
    }

    console.log(`📝 Saving draft...`);

    await client.invoke(
      new Api.messages.SaveDraft({
        peer,
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
