#!/usr/bin/env bun
/**
 * Create Telegram group and add members
 *
 * Usage:
 *   bun scripts/telegram-create-group.ts --title "Group Name" --users "user1,user2" [--draft "message"]
 *   bun scripts/telegram-create-group.ts --dry-run --title "Test" --users "@paigeinsf,@JanLiphardt"
 */

import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SESSION_DIR = join(process.env.HOME!, '.cybos', 'telegram');
const SESSION_FILE = join(SESSION_DIR, 'session.txt');
const DIALOG_CACHE_FILE = join(SESSION_DIR, 'dialog-cache.json');
const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_API_HASH || '';

interface CreateGroupOptions {
  title: string;
  users: string[]; // usernames or phone numbers
  draft?: string;
  dryRun: boolean;
}

async function createClient(): Promise<TelegramClient> {
  let sessionString = '';
  try {
    sessionString = readFileSync(SESSION_FILE, 'utf-8').trim();
  } catch {}

  const session = new StringSession(sessionString);
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });
}

async function resolveUsers(client: TelegramClient, usernames: string[]): Promise<Api.TypeInputUser[]> {
  const resolved: Api.TypeInputUser[] = [];

  for (const username of usernames) {
    const cleanUsername = username.replace('@', '').trim();
    if (!cleanUsername) continue;

    try {
      console.log(`  🔍 Resolving: @${cleanUsername}`);
      const result = await client.invoke(
        new Api.contacts.ResolveUsername({ username: cleanUsername })
      );

      if (result.users && result.users.length > 0) {
        const user = result.users[0] as Api.User;
        console.log(`  ✅ Found: ${user.firstName || ''} ${user.lastName || ''} (@${user.username})`);
        resolved.push(
          new Api.InputUser({
            userId: user.id,
            accessHash: user.accessHash || BigInt(0),
          })
        );
      } else {
        console.log(`  ❌ Not found: @${cleanUsername}`);
      }
      await new Promise(r => setTimeout(r, 300)); // Rate limit
    } catch (err: any) {
      console.log(`  ❌ Error resolving @${cleanUsername}: ${err.message}`);
    }
  }

  return resolved;
}

async function createGroup(client: TelegramClient, options: CreateGroupOptions): Promise<void> {
  console.log('\n📋 Group Creation Plan:');
  console.log(`   Title: ${options.title}`);
  console.log(`   Users: ${options.users.join(', ')}`);
  if (options.draft) {
    console.log(`   Draft: "${options.draft.substring(0, 50)}..."`);
  }

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - Resolving users only...\n');
  }

  // Resolve usernames to InputUser objects
  console.log('\n👥 Resolving users...');
  const inputUsers = await resolveUsers(client, options.users);

  if (inputUsers.length === 0) {
    throw new Error('No valid users found to add to group');
  }

  console.log(`\n✅ Resolved ${inputUsers.length}/${options.users.length} users`);

  if (options.dryRun) {
    console.log('\n✅ DRY RUN complete - all users can be resolved');
    console.log('   Remove --dry-run to create the group');
    return;
  }

  // Create the group using messages.createChat
  console.log('\n📱 Creating group...');
  const result = await client.invoke(
    new Api.messages.CreateChat({
      users: inputUsers,
      title: options.title,
    })
  );

  // Extract the created chat from the result
  let chatId: bigint | undefined;
  let chatTitle: string | undefined;

  // Debug: log the result type
  console.log(`  📦 Response type: ${result.className}`);

  // Handle different response types
  const resultAny = result as any;
  const chats = resultAny.chats || resultAny.updates?.chats || [];

  for (const chat of chats) {
    if (chat.className === 'Chat' || chat instanceof Api.Chat) {
      chatId = chat.id;
      chatTitle = chat.title;
      console.log(`  📦 Found chat: ${chatTitle} (${chatId})`);
      break;
    }
  }

  // Also check updates array for ChatCreate update
  const updates = resultAny.updates || [];
  if (Array.isArray(updates)) {
    for (const update of updates) {
      if (update?.className === 'UpdateChatParticipants' && update.participants?.chatId) {
        chatId = chatId || update.participants.chatId;
      }
    }
  }

  if (!chatId) {
    console.log('  ⚠️ Could not extract chat ID, but group may have been created');
    console.log('  📋 Check Telegram for the new group');
    return;
  }

  console.log(`✅ Group created: "${chatTitle}" (ID: ${chatId})`);

  // Save draft if provided
  if (options.draft) {
    console.log('\n📝 Saving draft message...');
    const inputPeer = new Api.InputPeerChat({ chatId });

    await client.invoke(
      new Api.messages.SaveDraft({
        peer: inputPeer,
        message: options.draft,
      })
    );
    console.log('✅ Draft saved to group');
  }

  console.log('\n🎉 Done! Open Telegram to see the new group.');
}

function parseArgs(args: string[]): CreateGroupOptions {
  const options: CreateGroupOptions = {
    title: '',
    users: [],
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--title' || arg === '-t') {
      options.title = args[++i] || '';
    } else if (arg === '--users' || arg === '-u') {
      const usersStr = args[++i] || '';
      options.users = usersStr.split(',').map(u => u.trim()).filter(Boolean);
    } else if (arg === '--draft' || arg === '-d') {
      options.draft = args[++i] || '';
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Create Telegram Group

Usage:
  bun scripts/telegram-create-group.ts --title "Group Name" --users "user1,user2" [--draft "message"]

Options:
  --title, -t     Group title (required)
  --users, -u     Comma-separated usernames (required)
  --draft, -d     Optional draft message to save in the group
  --dry-run       Resolve users but don't create group
  --help, -h      Show this help

Examples:
  # Dry run to verify users can be found
  bun scripts/telegram-create-group.ts --dry-run --title "Test" --users "@user1,@user2"

  # Create group with intro message
  bun scripts/telegram-create-group.ts \\
    --title "OpenMind <> Legion Intro" \\
    --users "@paigeinsf,@JanLiphardt,@mattyTokenomics,@Friction_Fabrizio" \\
    --draft "Hey everyone! Connecting you all for a potential collaboration..."
`);
      process.exit(0);
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.title) {
    console.error('❌ Missing --title');
    process.exit(1);
  }

  if (options.users.length === 0) {
    console.error('❌ Missing --users');
    process.exit(1);
  }

  const client = await createClient();

  try {
    await client.connect();

    if (!await client.checkAuthorization()) {
      throw new Error('Not authenticated. Run telegram-gramjs.ts first.');
    }

    console.log('✅ Authenticated');
    await createGroup(client, options);

  } finally {
    await client.disconnect();
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
