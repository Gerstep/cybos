#!/usr/bin/env bun
/**
 * GramJS Telegram Integration Script
 *
 * Reads unread Telegram messages via MTProto, saves persistent per-person
 * conversation logs, and supports saving drafts without sending.
 *
 * Includes dialogs with:
 * - Actual unread messages (unreadCount > 0)
 * - Manually marked as unread (unreadMark flag / blue circle)
 *
 * Usage:
 *   bun scripts/telegram-gramjs.ts                    # Read 1 unread dialog
 *   bun scripts/telegram-gramjs.ts --count 3          # Read 3 unread dialogs
 *   bun scripts/telegram-gramjs.ts --dry-run          # Read but don't save drafts
 *   bun scripts/telegram-gramjs.ts --no-mark-unread   # Don't mark as unread after
 */

import { TelegramClient, Api, Logger } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { LogLevel } from 'telegram/extensions/Logger';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import * as readline from 'readline';

// ============================================================================
// Configuration
// ============================================================================

const SESSION_DIR = join(process.env.HOME!, '.cybos', 'telegram');
const SESSION_FILE = join(SESSION_DIR, 'session.txt');
const CONTEXT_DIR = join(process.cwd(), 'context', 'telegram');
const WORK_DIR = join(process.cwd(), 'content', 'work');
const LOG_DIR = join(process.cwd(), '.cybos', 'logs');
const SCRIPTS_DIR = join(process.cwd(), 'scripts', 'db');

// Load from .env
const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
const API_HASH = process.env.TELEGRAM_API_HASH || '';

// ============================================================================
// Types
// ============================================================================

interface DialogInfo {
  id: string;
  title: string;
  type: 'private' | 'group' | 'channel';
  unreadCount: number;
  lastMessageDate: Date;
  entity: Api.TypeInputPeer;
  username?: string;
}

interface MessageInfo {
  id: number;
  date: Date;
  sender: string;
  senderId?: string;
  text: string;
  isOutgoing: boolean;
}

interface ProcessedDialog {
  dialog: DialogInfo;
  messages: MessageInfo[];
  newMessages: MessageInfo[];
  conversationFile: string;
  entitySlug: string;
  entityContext?: string;
}

interface ScriptOptions {
  count: number;
  dryRun: boolean;
  markUnread: boolean;
  limit: number;
  summaryOnly: boolean;
  searchUser?: string; // Username or name to search for
}

interface ScriptResult {
  processed: ProcessedDialog[];
  workPath: string;
  errors: string[];
}

interface BriefSummary {
  generated: string;
  totalUnread: number;
  dialogs: Array<{
    id: string;
    title: string;
    username: string | null;
    entitySlug: string;
    type: string;
    unreadCount: number;
    lastMessageDate: string;
    messages: Array<{
      id: number;
      sender: string;
      text: string;
      date: string;
      isOutgoing: boolean;
    }>;
    entityContext: string | null;
  }>;
}

interface ConversationMetadata {
  entitySlug: string;
  username: string | null;
  type: string;
  firstContact: string;
  lastUpdated: string;
  lastMessageId: number;
}

// Entity types from database
interface DbSearchResult {
  slug: string;
  name: string;
  type: string;
  match_type: string;
  confidence: number;
}

interface DbEntityContext {
  slug: string;
  name: string;
  type: string;
  email?: string;
  telegram?: string;
  current_company?: string;
  job_title?: string;
  current_focus?: string;
  interactions: Array<{ date: string; type: string; summary?: string }>;
  pending_items: Array<{ type: string; content: string; due_date?: string }>;
}

// ============================================================================
// Utility Functions
// ============================================================================

// Logging wrapper that respects summaryOnly mode
let quietMode = false;
function log(...args: any[]): void {
  if (!quietMode) {
    console.log(...args);
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim() || 'unknown';
}

function formatDateShort(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
}

function formatTimeShort(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatYear(): string {
  return new Date().getFullYear().toString().slice(-2);
}

function formatDateISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTimeISO(): string {
  return new Date().toISOString();
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// ============================================================================
// Session Management
// ============================================================================

function loadSession(): string {
  ensureDir(SESSION_DIR);
  if (existsSync(SESSION_FILE)) {
    return readFileSync(SESSION_FILE, 'utf-8').trim();
  }
  return '';
}

function saveSession(session: string): void {
  ensureDir(SESSION_DIR);
  writeFileSync(SESSION_FILE, session, 'utf-8');
  log(`📁 Session saved to ${SESSION_FILE}`);
}

// ============================================================================
// Database Entity Operations
// ============================================================================

/**
 * Find entity by telegram username using database
 */
function findEntityByTelegram(username: string): DbSearchResult | null {
  try {
    const result = execSync(
      `bun ${join(SCRIPTS_DIR, 'query.ts')} find-entity "@${username.replace('@', '')}" --json`,
      { encoding: 'utf-8', timeout: 5000, cwd: process.cwd() }
    );
    const parsed = JSON.parse(result.trim());
    return parsed || null;
  } catch {
    return null;
  }
}

/**
 * Find entity by name using database
 */
function findEntityByName(name: string): DbSearchResult | null {
  try {
    const result = execSync(
      `bun ${join(SCRIPTS_DIR, 'query.ts')} find-entity "${name}" --json`,
      { encoding: 'utf-8', timeout: 5000, cwd: process.cwd() }
    );
    const parsed = JSON.parse(result.trim());
    return parsed || null;
  } catch {
    return null;
  }
}

/**
 * Get entity slug for a dialog, using database lookup
 */
function getEntitySlugForDialog(dialog: DialogInfo): string {
  // First try lookup by telegram username
  if (dialog.username) {
    const entity = findEntityByTelegram(dialog.username);
    if (entity?.slug) return entity.slug;
  }

  // Try by name
  const entityByName = findEntityByName(dialog.title);
  if (entityByName?.slug) return entityByName.slug;

  // Fall back to generating from name
  return nameToSlug(dialog.title);
}

/**
 * Load entity context from database
 */
function loadEntityContext(entitySlug: string): string | undefined {
  try {
    const result = execSync(
      `bun ${join(SCRIPTS_DIR, 'query.ts')} entity "${entitySlug}" --json`,
      { encoding: 'utf-8', timeout: 5000, cwd: process.cwd() }
    );
    const entity: DbEntityContext | null = JSON.parse(result.trim());
    if (!entity) return undefined;

    const parts: string[] = [];
    parts.push(`**${entity.name}** (${entity.type})`);

    if (entity.email) parts.push(`Email: ${entity.email}`);
    if (entity.telegram) parts.push(`Telegram: @${entity.telegram}`);
    if (entity.current_company) parts.push(`Company: ${entity.current_company}`);
    if (entity.job_title) parts.push(`Role: ${entity.job_title}`);
    if (entity.current_focus) parts.push(`Working on: ${entity.current_focus}`);

    if (entity.interactions?.length > 0) {
      parts.push(`Recent interactions: ${entity.interactions.length}`);
    }

    if (entity.pending_items?.length > 0) {
      parts.push(`Pending items: ${entity.pending_items.length}`);
    }

    return parts.join('\n');
  } catch {
    return undefined;
  }
}

// ============================================================================
// Conversation File Operations
// ============================================================================

function getConversationFilePath(entitySlug: string): string {
  return join(CONTEXT_DIR, `${entitySlug}.md`);
}

function parseConversationFile(filePath: string): ConversationMetadata | null {
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let entitySlug = '';
    let username: string | null = null;
    let type = 'private';
    let firstContact = '';
    let lastUpdated = '';
    let lastMessageId = 0;

    for (const line of lines) {
      if (line.startsWith('**Entity:**')) {
        entitySlug = line.replace('**Entity:**', '').trim();
      } else if (line.startsWith('**Username:**')) {
        const val = line.replace('**Username:**', '').trim();
        username = val === 'none' ? null : val.replace('@', '');
      } else if (line.startsWith('**Type:**')) {
        type = line.replace('**Type:**', '').trim();
      } else if (line.startsWith('**First contact:**')) {
        firstContact = line.replace('**First contact:**', '').trim();
      } else if (line.startsWith('**Last updated:**')) {
        lastUpdated = line.replace('**Last updated:**', '').trim();
      } else if (line.startsWith('**Last message ID:**')) {
        lastMessageId = parseInt(line.replace('**Last message ID:**', '').trim(), 10) || 0;
      }
    }

    return { entitySlug, username, type, firstContact, lastUpdated, lastMessageId };
  } catch {
    return null;
  }
}

function createConversationFile(
  filePath: string,
  dialog: DialogInfo,
  entitySlug: string,
  messages: MessageInfo[]
): void {
  const now = formatDateISO();
  const maxMsgId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0;

  const lines: string[] = [];
  lines.push(`# ${dialog.title}`);
  lines.push('');
  lines.push(`**Entity:** ${entitySlug}`);
  lines.push(`**Username:** ${dialog.username ? `@${dialog.username}` : 'none'}`);
  lines.push(`**Type:** ${dialog.type}`);
  lines.push(`**First contact:** ${now}`);
  lines.push(`**Last updated:** ${formatDateTimeISO()}`);
  lines.push(`**Last message ID:** ${maxMsgId}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Group messages by date
  const messagesByDate = groupMessagesByDate(messages);
  for (const [date, msgs] of messagesByDate) {
    lines.push(`## ${date}`);
    lines.push('');
    for (const msg of msgs) {
      const time = msg.date.toISOString().slice(11, 16);
      const sender = msg.isOutgoing ? 'Me' : msg.sender;
      const text = msg.text.replace(/\n/g, ' ').slice(0, 500);
      lines.push(`- [${time}] **${sender}**: ${text}${msg.text.length > 500 ? '...' : ''}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

function appendToConversationFile(
  filePath: string,
  newMessages: MessageInfo[],
  currentMetadata: ConversationMetadata
): void {
  if (newMessages.length === 0) return;

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Update metadata
  const maxMsgId = Math.max(currentMetadata.lastMessageId, ...newMessages.map(m => m.id));
  const updatedLines = lines.map(line => {
    if (line.startsWith('**Last updated:**')) {
      return `**Last updated:** ${formatDateTimeISO()}`;
    }
    if (line.startsWith('**Last message ID:**')) {
      return `**Last message ID:** ${maxMsgId}`;
    }
    return line;
  });

  // Find the last "---" before end to insert new messages
  let insertIndex = updatedLines.length - 1;
  for (let i = updatedLines.length - 1; i >= 0; i--) {
    if (updatedLines[i] === '---') {
      insertIndex = i;
      break;
    }
  }

  // Group new messages by date and format
  const messagesByDate = groupMessagesByDate(newMessages);
  const newContent: string[] = [];

  for (const [date, msgs] of messagesByDate) {
    // Check if this date section already exists
    const dateHeaderIndex = updatedLines.findIndex(l => l === `## ${date}`);

    if (dateHeaderIndex >= 0) {
      // Find where to insert (before next ## or ---)
      let insertAt = dateHeaderIndex + 1;
      while (insertAt < insertIndex &&
             !updatedLines[insertAt].startsWith('## ') &&
             updatedLines[insertAt] !== '---') {
        insertAt++;
      }
      // Insert messages at this position
      const formattedMsgs = msgs.map(msg => {
        const time = msg.date.toISOString().slice(11, 16);
        const sender = msg.isOutgoing ? 'Me' : msg.sender;
        const text = msg.text.replace(/\n/g, ' ').slice(0, 500);
        return `- [${time}] **${sender}**: ${text}${msg.text.length > 500 ? '...' : ''}`;
      });
      updatedLines.splice(insertAt, 0, ...formattedMsgs);
      insertIndex += formattedMsgs.length;
    } else {
      // New date section
      newContent.push(`## ${date}`);
      newContent.push('');
      for (const msg of msgs) {
        const time = msg.date.toISOString().slice(11, 16);
        const sender = msg.isOutgoing ? 'Me' : msg.sender;
        const text = msg.text.replace(/\n/g, ' ').slice(0, 500);
        newContent.push(`- [${time}] **${sender}**: ${text}${msg.text.length > 500 ? '...' : ''}`);
      }
      newContent.push('');
    }
  }

  // Insert new date sections before the final ---
  if (newContent.length > 0) {
    updatedLines.splice(insertIndex, 0, ...newContent);
  }

  writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
}

function groupMessagesByDate(messages: MessageInfo[]): Map<string, MessageInfo[]> {
  const grouped = new Map<string, MessageInfo[]>();
  for (const msg of messages) {
    const date = msg.date.toISOString().slice(0, 10);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(msg);
  }
  return grouped;
}

// ============================================================================
// Telegram Client Operations
// ============================================================================

async function createClient(): Promise<TelegramClient> {
  if (!API_ID || !API_HASH) {
    throw new Error(
      'Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in environment.\n' +
      'Get them from https://my.telegram.org/apps and add to .env'
    );
  }

  const sessionString = loadSession();
  const session = new StringSession(sessionString);

  // Create silent logger for summary mode
  const clientOptions: any = {
    connectionRetries: 5,
  };

  if (quietMode) {
    const silentLogger = new Logger(LogLevel.NONE);
    clientOptions.baseLogger = silentLogger;
  }

  const client = new TelegramClient(session, API_ID, API_HASH, clientOptions);

  return client;
}

async function authenticate(client: TelegramClient): Promise<void> {
  log('🔐 Authenticating with Telegram...');

  await client.start({
    phoneNumber: async () => await prompt('📱 Enter your phone number: '),
    password: async () => await prompt('🔑 Enter 2FA password (if any): '),
    phoneCode: async () => await prompt('📨 Enter the code you received: '),
    onError: (err) => console.error('Auth error:', err),
  });

  // Save session for future use
  const sessionString = client.session.save() as unknown as string;
  saveSession(sessionString);

  log('✅ Authentication successful!');
}

function isMuted(dialog: any): boolean {
  const notifySettings = dialog.dialog?.notifySettings;
  if (!notifySettings) return false;

  const muteUntil = notifySettings.muteUntil;
  if (!muteUntil || muteUntil === 0) return false;

  const now = Math.floor(Date.now() / 1000);
  return muteUntil > now;
}

async function getUnreadDialogs(
  client: TelegramClient,
  maxCount: number
): Promise<DialogInfo[]> {
  log('📥 Fetching dialogs (excluding archived and muted)...');

  const dialogs = await client.getDialogs({ limit: 100, archived: false });

  const unreadDialogs: DialogInfo[] = [];

  for (const dialog of dialogs) {
    // Check both unreadCount (actual unread messages) and unreadMark (manually marked as unread)
    const hasUnreadMark = (dialog.dialog as any)?.unreadMark === true;
    if (dialog.unreadCount <= 0 && !hasUnreadMark) continue;

    if (dialog.archived || (dialog as any).folderId === 1) {
      log(`  ⏭️ Skipping archived: ${dialog.title}`);
      continue;
    }

    if (isMuted(dialog)) {
      log(`  🔇 Skipping muted: ${dialog.title}`);
      continue;
    }

    const entity = dialog.entity;
    let dialogType: 'private' | 'group' | 'channel' = 'private';
    let title = dialog.title || 'Unknown';
    let username: string | undefined;

    if (entity instanceof Api.User) {
      dialogType = 'private';
      title = [entity.firstName, entity.lastName].filter(Boolean).join(' ') || entity.username || 'Unknown';
      username = entity.username;
    } else if (entity instanceof Api.Chat) {
      dialogType = 'group';
      title = entity.title || 'Unknown Group';
    } else if (entity instanceof Api.Channel) {
      dialogType = entity.megagroup ? 'group' : 'channel';
      title = entity.title || 'Unknown Channel';
      username = entity.username;
    }

    // Log if included via unreadMark (helpful for debugging)
    if (hasUnreadMark && dialog.unreadCount === 0) {
      log(`  📌 Including marked-unread: ${title}`);
    }

    unreadDialogs.push({
      id: dialog.id!.toString(),
      title,
      type: dialogType,
      unreadCount: dialog.unreadCount,
      lastMessageDate: dialog.date ? new Date(dialog.date * 1000) : new Date(),
      entity: dialog.inputEntity!,
      username
    });
  }

  unreadDialogs.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

  log(`📊 Found ${unreadDialogs.length} unread dialogs`);

  return unreadDialogs.slice(0, maxCount);
}

async function searchDialogByUser(
  client: TelegramClient,
  searchQuery: string
): Promise<DialogInfo[]> {
  log(`🔍 Searching for user: ${searchQuery}`);

  // Fetch more dialogs to search through (including archived)
  const dialogs = await client.getDialogs({ limit: 200 });

  const searchLower = searchQuery.toLowerCase().replace('@', '');
  const matchedDialogs: DialogInfo[] = [];

  for (const dialog of dialogs) {
    const entity = dialog.entity;
    let dialogType: 'private' | 'group' | 'channel' = 'private';
    let title = dialog.title || 'Unknown';
    let username: string | undefined;

    if (entity instanceof Api.User) {
      dialogType = 'private';
      const firstName = entity.firstName || '';
      const lastName = entity.lastName || '';
      title = [firstName, lastName].filter(Boolean).join(' ') || entity.username || 'Unknown';
      username = entity.username;

      // Match by username or full name
      const matchesUsername = username && username.toLowerCase().includes(searchLower);
      const matchesName = title.toLowerCase().includes(searchLower);
      const matchesFirstName = firstName.toLowerCase().includes(searchLower);
      const matchesLastName = lastName.toLowerCase().includes(searchLower);

      if (matchesUsername || matchesName || matchesFirstName || matchesLastName) {
        log(`  ✅ Found: ${title}${username ? ` (@${username})` : ''}`);
        matchedDialogs.push({
          id: dialog.id!.toString(),
          title,
          type: dialogType,
          unreadCount: dialog.unreadCount,
          lastMessageDate: dialog.date ? new Date(dialog.date * 1000) : new Date(),
          entity: dialog.inputEntity!,
          username
        });
      }
    } else if (entity instanceof Api.Chat) {
      dialogType = 'group';
      title = entity.title || 'Unknown Group';

      if (title.toLowerCase().includes(searchLower)) {
        log(`  ✅ Found group: ${title}`);
        matchedDialogs.push({
          id: dialog.id!.toString(),
          title,
          type: dialogType,
          unreadCount: dialog.unreadCount,
          lastMessageDate: dialog.date ? new Date(dialog.date * 1000) : new Date(),
          entity: dialog.inputEntity!,
          username
        });
      }
    } else if (entity instanceof Api.Channel) {
      dialogType = entity.megagroup ? 'group' : 'channel';
      title = entity.title || 'Unknown Channel';
      username = entity.username;

      const matchesUsername = username && username.toLowerCase().includes(searchLower);
      const matchesTitle = title.toLowerCase().includes(searchLower);

      if (matchesUsername || matchesTitle) {
        log(`  ✅ Found channel: ${title}${username ? ` (@${username})` : ''}`);
        matchedDialogs.push({
          id: dialog.id!.toString(),
          title,
          type: dialogType,
          unreadCount: dialog.unreadCount,
          lastMessageDate: dialog.date ? new Date(dialog.date * 1000) : new Date(),
          entity: dialog.inputEntity!,
          username
        });
      }
    }
  }

  if (matchedDialogs.length === 0) {
    log(`  ❌ No dialogs found matching "${searchQuery}"`);
  } else {
    log(`📊 Found ${matchedDialogs.length} matching dialog(s)`);
  }

  return matchedDialogs;
}

async function getMessages(
  client: TelegramClient,
  dialog: DialogInfo,
  limit: number
): Promise<MessageInfo[]> {
  const messages = await client.getMessages(dialog.entity, { limit });

  return messages.map((msg) => {
    let sender = 'Unknown';
    let senderId: string | undefined;

    if (msg.sender instanceof Api.User) {
      sender = [msg.sender.firstName, msg.sender.lastName].filter(Boolean).join(' ') || msg.sender.username || 'Unknown';
      senderId = msg.sender.id.toString();
    } else if (msg.sender instanceof Api.Channel || msg.sender instanceof Api.Chat) {
      sender = (msg.sender as any).title || 'Channel';
      senderId = msg.sender.id.toString();
    }

    return {
      id: msg.id,
      date: new Date(msg.date * 1000),
      sender,
      senderId,
      text: msg.message || '',
      isOutgoing: msg.out || false
    };
  }).reverse(); // Chronological order (oldest first)
}

async function saveDraftToTelegram(
  client: TelegramClient,
  dialog: DialogInfo,
  draftText: string
): Promise<void> {
  await client.invoke(
    new Api.messages.SaveDraft({
      peer: dialog.entity,
      message: draftText,
    })
  );
  log(`📝 Draft saved to "${dialog.title}"`);
}

async function markDialogUnread(
  client: TelegramClient,
  dialog: DialogInfo
): Promise<void> {
  await client.invoke(
    new Api.messages.MarkDialogUnread({
      peer: new Api.InputDialogPeer({ peer: dialog.entity }),
      unread: true
    })
  );
  log(`🔔 Marked "${dialog.title}" as unread`);
}

// ============================================================================
// Output Generation
// ============================================================================

function generateBriefSummary(processed: ProcessedDialog[]): BriefSummary {
  return {
    generated: formatDateTimeISO(),
    totalUnread: processed.reduce((sum, p) => sum + p.dialog.unreadCount, 0),
    dialogs: processed.map(item => ({
      id: item.dialog.id,
      title: item.dialog.title,
      username: item.dialog.username || null,
      entitySlug: item.entitySlug,
      type: item.dialog.type,
      unreadCount: item.dialog.unreadCount,
      lastMessageDate: item.dialog.lastMessageDate.toISOString(),
      messages: item.messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        date: msg.date.toISOString(),
        isOutgoing: msg.isOutgoing
      })),
      entityContext: item.entityContext || null
    }))
  };
}

function generateWorkFile(processed: ProcessedDialog[]): string {
  const lines: string[] = [];

  lines.push(`# Telegram Replies - ${formatDateISO()}`);
  lines.push('');
  lines.push(`**Status:** Pending AI Draft Generation`);
  lines.push(`**Created:** ${formatDateTimeISO()}`);
  lines.push('');

  for (const item of processed) {
    const dialog = item.dialog;

    lines.push(`## ${dialog.title}${dialog.username ? ` (@${dialog.username})` : ''}`);
    lines.push('');
    lines.push(`**Dialog ID:** ${dialog.id}`);
    lines.push('');

    // Show last few messages for context (from new messages or all if first time)
    const contextMsgs = item.newMessages.length > 0 ? item.newMessages.slice(-5) : item.messages.slice(-5);
    lines.push('### Recent Messages');
    for (const msg of contextMsgs) {
      const time = msg.date.toISOString().slice(11, 16);
      const prefix = msg.isOutgoing ? 'Me' : msg.sender;
      lines.push(`> [${time}] **${prefix}**: ${msg.text.slice(0, 200)}${msg.text.length > 200 ? '...' : ''}`);
    }
    lines.push('');

    if (item.entityContext) {
      lines.push('### Context');
      lines.push(item.entityContext);
      lines.push('');
    }

    lines.push('### Draft Reply');
    lines.push('```');
    lines.push('[AI will generate draft here]');
    lines.push('```');
    lines.push('');

    lines.push('### Pending Actions');
    lines.push(`- [ ] Review and approve draft`);
    lines.push(`- [ ] Save draft to Telegram for: ${dialog.title}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

function appendLog(message: string): void {
  const dateStr = formatDateShort();
  const year = formatYear();
  const logPath = join(LOG_DIR, `${dateStr}-${year}.md`);

  ensureDir(LOG_DIR);

  let content = '';
  if (existsSync(logPath)) {
    content = readFileSync(logPath, 'utf-8');
  }

  const time = formatTimeShort();
  const entry = `\n## ${time} | telegram | read | unread messages\n${message}\n\n---\n`;

  writeFileSync(logPath, content + entry, 'utf-8');
}

// ============================================================================
// Main Script Logic
// ============================================================================

async function processUnreadMessages(options: ScriptOptions): Promise<ScriptResult> {
  const result: ScriptResult = {
    processed: [],
    workPath: '',
    errors: []
  };

  let client: TelegramClient | null = null;

  try {
    client = await createClient();
    await client.connect();

    if (!await client.checkAuthorization()) {
      await authenticate(client);
    } else {
      log('✅ Already authenticated');
    }

    // Fetch dialogs - either search for specific user or get unread
    let dialogs: DialogInfo[];
    if (options.searchUser) {
      dialogs = await searchDialogByUser(client, options.searchUser);
    } else {
      dialogs = await getUnreadDialogs(client, options.count);
    }

    if (dialogs.length === 0) {
      if (options.searchUser) {
        log(`📭 No conversations found matching "${options.searchUser}"`);
      } else {
        log('📭 No unread messages found');
      }
      return result;
    }

    log(`\n📨 Processing ${dialogs.length} dialog(s)...\n`);

    ensureDir(CONTEXT_DIR);

    for (const dialog of dialogs) {
      try {
        log(`📖 Reading: ${dialog.title} (${dialog.unreadCount} unread)`);

        // Get entity slug
        const entitySlug = getEntitySlugForDialog(dialog);
        const conversationFile = getConversationFilePath(entitySlug);

        // Get all messages (both directions)
        const messages = await getMessages(client, dialog, options.limit);

        // Load existing conversation metadata
        const existingMetadata = parseConversationFile(conversationFile);

        // Filter to only new messages
        let newMessages: MessageInfo[] = [];
        if (existingMetadata) {
          newMessages = messages.filter(m => m.id > existingMetadata.lastMessageId);
          log(`  📄 Existing file found, ${newMessages.length} new messages`);
        } else {
          newMessages = messages;
          log(`  📄 New conversation file will be created`);
        }

        // Load entity context
        const entityContext = loadEntityContext(entitySlug);

        result.processed.push({
          dialog,
          messages,
          newMessages,
          conversationFile,
          entitySlug,
          entityContext
        });

        // Update or create conversation file (if not dry run)
        if (!options.dryRun && newMessages.length > 0) {
          if (existingMetadata) {
            appendToConversationFile(conversationFile, newMessages, existingMetadata);
            log(`  ✅ Appended ${newMessages.length} messages to ${conversationFile}`);
          } else {
            createConversationFile(conversationFile, dialog, entitySlug, messages);
            log(`  ✅ Created ${conversationFile}`);
          }
        }

        await new Promise(r => setTimeout(r, 500));

      } catch (err: any) {
        log(`❌ Error processing ${dialog.title}: ${err.message}`);
        result.errors.push(`${dialog.title}: ${err.message}`);
      }
    }

    // Save work file for AI drafting
    ensureDir(WORK_DIR);
    const dateStr = formatDateShort();
    const year = formatYear();
    result.workPath = join(WORK_DIR, `${dateStr}-telegram-replies-${year}.md`);
    writeFileSync(result.workPath, generateWorkFile(result.processed), 'utf-8');
    log(`\n📝 Work file saved: ${result.workPath}`);

    // Mark dialogs as unread (unless disabled)
    if (options.markUnread && !options.dryRun) {
      log('\n🔔 Marking dialogs as unread...');
      for (const item of result.processed) {
        try {
          await markDialogUnread(client, item.dialog);
          await new Promise(r => setTimeout(r, 300));
        } catch (err: any) {
          log(`⚠️ Failed to mark ${item.dialog.title} unread: ${err.message}`);
        }
      }
    }

    // Log summary
    const conversationFiles = result.processed.map(p => p.conversationFile).join(', ');
    const logMsg = [
      `- Dialogs processed: ${result.processed.length}`,
      `- Conversation files: ${result.processed.length}`,
      `- New messages: ${result.processed.reduce((sum, p) => sum + p.newMessages.length, 0)}`,
      `- Work file: ${result.workPath}`,
      `- Dry run: ${options.dryRun}`,
      `- Errors: ${result.errors.length}`
    ].join('\n');
    appendLog(logMsg);

  } catch (err: any) {
    log(`\n❌ Fatal error: ${err.message}`);
    result.errors.push(`Fatal: ${err.message}`);

    if (err.message?.includes('FLOOD_WAIT')) {
      const waitMatch = err.message.match(/(\d+)/);
      const waitSeconds = waitMatch ? parseInt(waitMatch[1]) : 60;
      log(`⏳ Rate limited. Waiting ${waitSeconds}s and retrying once...`);
      await new Promise(r => setTimeout(r, waitSeconds * 1000));

      try {
        return await processUnreadMessages(options);
      } catch (retryErr: any) {
        log(`❌ Retry failed: ${retryErr.message}`);
        result.errors.push(`Retry failed: ${retryErr.message}`);
      }
    }
  } finally {
    if (client) {
      await client.disconnect();
    }
  }

  return result;
}

// ============================================================================
// Draft Saving (called separately after AI generates drafts)
// ============================================================================

export async function saveDrafts(
  drafts: Array<{ dialogId: string; text: string }>
): Promise<{ success: number; failed: number }> {
  let client: TelegramClient | null = null;
  let success = 0;
  let failed = 0;

  try {
    client = await createClient();
    await client.connect();

    if (!await client.checkAuthorization()) {
      throw new Error('Not authenticated. Run the script first to authenticate.');
    }

    const dialogs = await client.getDialogs({ limit: 100 });

    for (const draft of drafts) {
      const dialog = dialogs.find(d => d.id?.toString() === draft.dialogId);
      if (!dialog || !dialog.inputEntity) {
        log(`❌ Dialog not found: ${draft.dialogId}`);
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
        log(`✅ Draft saved for dialog ${draft.dialogId}`);
        success++;
        await new Promise(r => setTimeout(r, 300));
      } catch (err: any) {
        log(`❌ Failed to save draft: ${err.message}`);
        failed++;
      }
    }
  } finally {
    if (client) {
      await client.disconnect();
    }
  }

  return { success, failed };
}

// ============================================================================
// CLI Entry Point
// ============================================================================

function parseArgs(args: string[]): ScriptOptions {
  const options: ScriptOptions = {
    count: 1,
    dryRun: false,
    markUnread: true,
    limit: 20,
    summaryOnly: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--count' || arg === '-c') {
      const val = args[++i];
      if (val) options.count = parseInt(val, 10) || 1;
    } else if (arg === '--limit' || arg === '-l') {
      const val = args[++i];
      if (val) options.limit = parseInt(val, 10) || 20;
    } else if (arg === '--user' || arg === '-u') {
      const val = args[++i];
      if (val) options.searchUser = val;
    } else if (arg === '--all') {
      options.count = 999; // Practical infinity
    } else if (arg === '--summary-only') {
      options.summaryOnly = true;
      options.dryRun = true; // Don't modify files in summary mode
      options.markUnread = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-mark-unread') {
      options.markUnread = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Telegram GramJS Script (Per-Person Conversation Files)

Usage:
  bun scripts/telegram-gramjs.ts [options]

Options:
  --count N, -c N       Number of unread dialogs to process (default: 1)
  --all                 Process ALL unread dialogs (sets count to 999)
  --user NAME, -u NAME  Search for specific user by username or name (ignores read/unread status)
  --limit N, -l N       Messages per dialog (default: 20)
  --summary-only        Output JSON summary to stdout (for morning brief)
  --dry-run             Read only, don't update files or mark unread
  --no-mark-unread      Don't mark dialogs as unread after processing
  --help, -h            Show this help

Output:
  Conversation files: context/telegram/<entity-slug>.md (persistent)
  Work file: content/work/MMDD-telegram-replies-YY.md (for AI drafting)

Examples:
  bun scripts/telegram-gramjs.ts                           # Process 1 unread dialog
  bun scripts/telegram-gramjs.ts --user "@CAiOfficer"      # Find and read conversation with @CAiOfficer
  bun scripts/telegram-gramjs.ts --user "Sergey Anosov"    # Find by full name
  bun scripts/telegram-gramjs.ts --user "Anosov"           # Find by partial name
  bun scripts/telegram-gramjs.ts --all --summary-only      # JSON output for morning brief

Morning Brief Mode:
  bun scripts/telegram-gramjs.ts --all --summary-only
  Outputs JSON to stdout with all unread messages for brief generation.

Environment variables:
  TELEGRAM_API_ID       Your Telegram API ID (from my.telegram.org)
  TELEGRAM_API_HASH     Your Telegram API hash (from my.telegram.org)

First run:
  The script will prompt for phone number and verification code.
  Session is saved to ~/.cybos/telegram/ for future use.
`);
      process.exit(0);
    }
  }

  return options;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // In summary-only mode, suppress verbose output
  if (options.summaryOnly) {
    quietMode = true;
  } else {
    console.log('🤖 Telegram GramJS Script (Per-Person Files)');
    if (options.searchUser) {
      console.log(`   Searching for: ${options.searchUser}, Limit: ${options.limit}, DryRun: ${options.dryRun}`);
    } else {
      console.log(`   Count: ${options.count}, Limit: ${options.limit}, DryRun: ${options.dryRun}`);
    }
    console.log('');
  }

  processUnreadMessages(options)
    .then(result => {
      if (options.summaryOnly) {
        // Output JSON summary to stdout for morning brief
        const summary = generateBriefSummary(result.processed);
        console.log(JSON.stringify(summary, null, 2));
      } else {
        console.log('\n✅ Done!');
        console.log(`   Processed: ${result.processed.length} dialog(s)`);
        console.log(`   Conversation files updated: ${result.processed.filter(p => p.newMessages.length > 0).length}`);
        if (result.errors.length > 0) {
          console.log(`   Errors: ${result.errors.length}`);
        }
      }
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch(err => {
      if (options.summaryOnly) {
        // Output error as JSON
        console.log(JSON.stringify({ error: err.message, dialogs: [] }));
      } else {
        console.error('\n❌ Fatal error:', err);
      }
      process.exit(1);
    });
}

// Export for use by command
export { processUnreadMessages, generateBriefSummary, ScriptOptions, ScriptResult, ProcessedDialog, BriefSummary };
