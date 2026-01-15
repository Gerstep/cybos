#!/usr/bin/env bun
/**
 * Granola Call Extraction Script
 *
 * Extracts meeting transcripts and AI notes from Granola cache
 * to /context/calls/ directory with searchable index.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

// Configuration
const DEFAULT_CACHE_PATH = join(process.env.HOME!, 'Library/Application Support/Granola/cache-v3.json');
const CACHE_PATH = process.env.GRANOLA_CACHE_OVERRIDE || DEFAULT_CACHE_PATH;
const OUTPUT_BASE = join(process.cwd(), 'context/calls');

// Types
interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  marks?: Array<{ type: string }>;
  attrs?: { level?: number };
}

interface Speaker {
  self: string;
  other: string;
}

interface TranscriptSegment {
  text?: string;
  content?: string;
  speaker?: string;
  source?: string;
  document_id?: string;
  start_timestamp?: string;
}

interface Document {
  id?: string;
  title?: string;
  created_at?: string;
  notes?: TipTapNode;
  notes_markdown?: string;
  notes_plain?: string;
  people?: {
    creator?: { name?: string };
    attendees?: Array<{
      email?: string;
      details?: {
        person?: {
          name?: {
            fullName?: string;
          };
        };
      };
    }>;
  };
}

interface Panel {
  id?: string;
  document_id?: string;
  title?: string;
  content?: TipTapNode;
  template_slug?: string;
}

interface State {
  documents?: Record<string, Document>;
  transcripts?: Record<string, TranscriptSegment[]>;
  documentPanels?: Record<string, Record<string, Panel>>;  // nested: { [doc_id]: { [panel_id]: panel } }
}

interface ExtractionResult {
  newCalls: number;
  errors: string[];
  totalCalls: number;
}

interface IndexEntry {
  date: string;
  title: string;
  attendees: string;
  path: string;
}

/**
 * Load and parse Granola cache file, handling double-encoding
 */
function loadGranolaData(path: string, silent: boolean = false): State | null {
  if (!silent) console.log(`📂 Loading Granola cache from: ${path}`);

  if (!existsSync(path)) {
    if (!silent) console.error(`❌ File not found: ${path}`);
    return null;
  }

  try {
    const raw = readFileSync(path, 'utf-8');
    const data = JSON.parse(raw);

    // Handle double-encoded JSON string in 'cache' key
    if (data.cache && typeof data.cache === 'string') {
      const innerData = JSON.parse(data.cache);
      return innerData.state || innerData;
    } else if (data.state) {
      return data.state;
    } else {
      return data;
    }
  } catch (err: any) {
    if (!silent) console.error(`❌ Error loading JSON: ${err.message}`);
    return null;
  }
}

/**
 * Create filesystem-safe filename
 */
function safeFilename(name: string): string {
  if (!name) return 'untitled';
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}

/**
 * Format ISO date string to YYYY-MM-DD
 */
function formatDate(isoStr: string): string {
  if (!isoStr) return 'unknown-date';
  try {
    const dt = new Date(isoStr.replace('Z', '+00:00'));
    return dt.toISOString().split('T')[0];
  } catch {
    return isoStr.slice(0, 10);
  }
}

/**
 * Recursively parse TipTap JSON node to Markdown
 */
function parseTipTapNode(node: TipTapNode | null | undefined, indent: number = 0): string {
  if (!node || typeof node !== 'object') return '';

  const nodeType = node.type || '';
  const content = node.content || [];

  // Process child content first
  const childTexts: string[] = [];
  for (const child of content) {
    childTexts.push(parseTipTapNode(child, indent));
  }

  // Handle specific node types
  if (nodeType === 'text') {
    let text = node.text || '';
    const marks = node.marks || [];
    for (const mark of marks) {
      const mType = mark.type;
      if (mType === 'bold') text = `**${text}**`;
      else if (mType === 'italic') text = `*${text}*`;
      else if (mType === 'code') text = `\`${text}\``;
    }
    return text;
  } else if (nodeType === 'paragraph') {
    return childTexts.join('');
  } else if (nodeType === 'heading') {
    const level = node.attrs?.level || 1;
    return '#'.repeat(level) + ' ' + childTexts.join('');
  } else if (nodeType === 'bulletList') {
    const items: string[] = [];
    for (const child of content) {
      if (child.type === 'listItem') {
        const liContent: string[] = [];
        for (const liChild of (child.content || [])) {
          liContent.push(parseTipTapNode(liChild, indent + 1));
        }
        items.push(`- ${liContent.join(' ')}`);
      }
    }
    return items.join('\n');
  } else if (nodeType === 'orderedList') {
    const items: string[] = [];
    content.forEach((child, i) => {
      if (child.type === 'listItem') {
        const liContent: string[] = [];
        for (const liChild of (child.content || [])) {
          liContent.push(parseTipTapNode(liChild, indent + 1));
        }
        items.push(`${i + 1}. ${liContent.join(' ')}`);
      }
    });
    return items.join('\n');
  } else if (nodeType === 'codeBlock') {
    return '```\n' + childTexts.join('') + '\n```';
  } else if (nodeType === 'blockquote') {
    return '> ' + childTexts.join('');
  } else if (nodeType === 'horizontalRule') {
    return '---';
  }

  // Default: join children
  return childTexts.join('');
}

/**
 * Extract and combine manual notes and AI panels
 */
function extractNotes(doc: Document, panels: Record<string, Panel>): string {
  const notesParts: string[] = [];

  // 1. Manual Notes
  let manualMd = doc.notes_markdown || doc.notes_plain;
  if (!manualMd) {
    const notesObj = doc.notes;
    if (notesObj) {
      manualMd = parseTipTapNode(notesObj);
    }
  }

  if (manualMd) {
    notesParts.push('# Manual Notes\n');
    notesParts.push(manualMd);
  }

  // 2. AI Panels - documentPanels is nested: { [doc_id]: { [panel_id]: panel } }
  const docId = doc.id;
  const docPanelsObj = docId ? panels[docId] : null;
  const docPanels = docPanelsObj ? Object.values(docPanelsObj) : [];

  if (docPanels.length > 0) {
    notesParts.push('\n# AI-Enhanced Notes\n');
    for (const panel of docPanels) {
      const title = panel.title || 'Untitled Panel';
      const content = panel.content;
      const panelMd = parseTipTapNode(content);
      if (panelMd) {
        notesParts.push(`## ${title}\n`);
        notesParts.push(panelMd);
        notesParts.push('\n');
      }
    }
  }

  return notesParts.join('\n');
}

/**
 * Infer self and other speaker names from metadata
 */
function inferSpeakers(docMetadata: Document): Speaker {
  let selfName = 'You';
  let otherName = 'Speaker';

  if (docMetadata) {
    const people = docMetadata.people || {};
    const creator = people.creator?.name;
    const attendees = people.attendees || [];

    if (creator) {
      selfName = creator;
    }

    const others: string[] = [];
    for (const att of attendees) {
      const details = att.details?.person;
      const name = details?.name?.fullName || att.email;
      if (name && name !== selfName) {
        others.push(name);
      }
    }

    if (others.length === 1) {
      otherName = others[0];
    } else if (others.length > 1) {
      otherName = others.join(' / ');
    }
  }

  return { self: selfName, other: otherName };
}

/**
 * Convert transcript segments to formatted text
 */
function extractTranscriptText(
  transcriptData: TranscriptSegment[],
  selfName: string,
  otherName: string
): string | null {
  if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
    return null;
  }

  const lines: string[] = [];
  for (const segment of transcriptData) {
    if (typeof segment !== 'object') continue;

    const text = segment.text || segment.content || '';
    if (!text) continue;

    const speaker = segment.speaker;
    const source = segment.source;

    let displayName = 'Unknown';
    if (speaker) {
      displayName = speaker;
    } else if (source === 'microphone') {
      displayName = selfName;
    } else if (source === 'system') {
      displayName = otherName;
    }

    lines.push(`[${displayName}] ${text}`);
  }

  return lines.join('\n\n');
}

/**
 * Parse existing INDEX.md to get existing entries
 */
function parseIndexTable(content: string): IndexEntry[] {
  const entries: IndexEntry[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Skip non-table lines
    if (!line.startsWith('|') || line.includes('----')) continue;
    if (line.includes('Date') && line.includes('Title')) continue; // Header row

    const parts = line.split('|').map(s => s.trim()).filter(s => s);
    if (parts.length >= 4) {
      // Extract path from markdown link [📁](./path/)
      const pathMatch = parts[3].match(/\(([^)]+)\)/);
      const path = pathMatch ? pathMatch[1] : parts[3];

      entries.push({
        date: parts[0],
        title: parts[1],
        attendees: parts[2],
        path: path
      });
    }
  }

  return entries;
}

/**
 * Generate markdown index content
 */
function generateIndexMarkdown(entries: IndexEntry[]): string {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  let md = `# Granola Calls Index\n\n`;
  md += `Last updated: ${now}\n\n`;
  md += `## Calls\n\n`;
  md += `| Date | Title | Attendees | Path |\n`;
  md += `|------|-------|-----------|------|\n`;

  for (const entry of entries) {
    md += `| ${entry.date} | ${entry.title} | ${entry.attendees} | [📁](${entry.path}) |\n`;
  }

  md += `\nTotal calls: ${entries.length}\n`;

  return md;
}

/**
 * Update INDEX.md with new calls
 */
function updateIndex(newCalls: IndexEntry[], outputBase: string): void {
  const indexPath = join(outputBase, 'INDEX.md');
  let existingEntries: IndexEntry[] = [];

  // Parse existing index if it exists
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf-8');
    existingEntries = parseIndexTable(content);
  }

  // Merge with new calls
  const allEntries = [...existingEntries, ...newCalls];

  // Sort by date descending (newest first)
  allEntries.sort((a, b) => b.date.localeCompare(a.date));

  // Generate markdown
  const markdown = generateIndexMarkdown(allEntries);

  writeFileSync(indexPath, markdown, 'utf-8');
}

/**
 * Get N most recent call directories (by date in folder name)
 */
function getRecentCallDirs(outputBase: string, count: number): string[] {
  if (!existsSync(outputBase)) return [];

  const dirs = readdirSync(outputBase, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}_/.test(d.name))
    .map(d => d.name)
    .sort((a, b) => b.localeCompare(a)) // Newest first
    .slice(0, count);

  return dirs;
}

/**
 * Remove call directories and their entries from INDEX.md
 */
function removeCallDirs(outputBase: string, dirNames: string[], silent: boolean): void {
  for (const dirName of dirNames) {
    const dirPath = join(outputBase, dirName);
    if (existsSync(dirPath)) {
      if (!silent) console.log(`🗑️  Removing for re-extraction: ${dirName}`);
      rmSync(dirPath, { recursive: true, force: true });
    }
  }

  // Update INDEX.md to remove these entries
  const indexPath = join(outputBase, 'INDEX.md');
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf-8');
    const entries = parseIndexTable(content);
    const remainingEntries = entries.filter(e => {
      const entryDir = e.path.replace('./', '').replace('/', '');
      return !dirNames.includes(entryDir);
    });
    const markdown = generateIndexMarkdown(remainingEntries);
    writeFileSync(indexPath, markdown, 'utf-8');
  }
}

/**
 * Main extraction function
 */
export async function extractGranolaCalls(options?: {
  cachePath?: string;
  outputPath?: string;
  silent?: boolean;
  forceReindex?: number; // Number of recent calls to force re-extract
}): Promise<ExtractionResult> {
  const cachePath = options?.cachePath || CACHE_PATH;
  const outputBase = options?.outputPath || OUTPUT_BASE;
  const silent = options?.silent || false;
  const forceReindex = options?.forceReindex || 0;

  const result: ExtractionResult = {
    newCalls: 0,
    errors: [],
    totalCalls: 0
  };

  const state = loadGranolaData(cachePath, silent);
  if (!state) {
    result.errors.push('Failed to load Granola cache');
    return result;
  }

  const documents = state.documents || {};
  const transcripts = state.transcripts || {};
  const panels = state.documentPanels || {};

  if (!silent) {
    console.log(`🔍 Found ${Object.keys(documents).length} documents and ${Object.keys(transcripts).length} transcript entries.`);
  }

  // Create output base
  if (!existsSync(outputBase)) {
    mkdirSync(outputBase, { recursive: true });
  }

  // Handle force reindex - remove recent calls so they get re-extracted
  if (forceReindex > 0) {
    const recentDirs = getRecentCallDirs(outputBase, forceReindex);
    if (recentDirs.length > 0) {
      if (!silent) console.log(`🔄 Force re-extracting ${recentDirs.length} recent call(s)...`);
      removeCallDirs(outputBase, recentDirs, silent);
    } else {
      if (!silent) console.log(`⚠️  No existing calls to re-extract`);
    }
  }

  const newIndexEntries: IndexEntry[] = [];

  // Iterate through transcripts to find valid ones
  for (const [tId, tData] of Object.entries(transcripts)) {
    if (!Array.isArray(tData) || tData.length === 0) {
      continue;
    }

    // Find associated document
    let doc = documents[tId];
    if (!doc) {
      // Try finding via document_id in first segment
      if (typeof tData[0] === 'object') {
        const internalDocId = tData[0].document_id;
        if (internalDocId) {
          doc = documents[internalDocId];
        }
      }
    }

    // Basic metadata
    let title: string;
    let createdAt: string;
    let docId: string;

    if (doc) {
      title = doc.title || 'Untitled';
      createdAt = doc.created_at || new Date().toISOString();
      docId = doc.id || tId;
    } else {
      title = 'Unknown Meeting';
      // Try timestamp from transcript
      const ts = tData[0]?.start_timestamp;
      createdAt = ts || new Date().toISOString();
      docId = tId;
    }

    const dateStr = formatDate(createdAt);
    const safeTitle = safeFilename(title);
    const dirName = `${dateStr}_${safeTitle}`;
    const callDir = join(outputBase, dirName);

    // Check if already exists (incremental)
    if (existsSync(callDir)) {
      if (!silent) console.log(`⏭️  Skipping existing: ${dirName}`);
      continue;
    }

    if (!silent) console.log(`✨ Processing: ${title} (${dateStr})`);
    mkdirSync(callDir, { recursive: true });

    try {
      // 1. Metadata
      const speakers = inferSpeakers(doc!);
      const people = doc?.people || {};

      const metadata = {
        id: docId,
        title: title,
        date: createdAt,
        attendees: people.attendees || [],
        inferred_speakers: {
          self: speakers.self,
          other: speakers.other
        }
      };

      writeFileSync(
        join(callDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2),
        'utf-8'
      );

      // 2. Transcript
      const transcriptText = extractTranscriptText(tData, speakers.self, speakers.other);
      if (transcriptText) {
        writeFileSync(
          join(callDir, 'transcript.txt'),
          transcriptText,
          'utf-8'
        );
      }

      // 3. Notes (AI + Manual)
      if (doc) {
        const notesText = extractNotes(doc, panels);
        if (notesText) {
          writeFileSync(
            join(callDir, 'notes.md'),
            notesText,
            'utf-8'
          );
        }
      }

      // Add to index
      const attendeesList = (people.attendees || [])
        .map(att => {
          const name = att.details?.person?.name?.fullName;
          const email = att.email;
          if (name && email) return `${name} (${email})`;
          return name || email || 'Unknown';
        })
        .join(', ');

      newIndexEntries.push({
        date: dateStr,
        title: title,
        attendees: attendeesList || 'No attendees',
        path: `./${dirName}/`
      });

      result.newCalls++;
    } catch (err: any) {
      if (!silent) console.error(`❌ Error processing ${title}: ${err.message}`);
      result.errors.push(`${title}: ${err.message}`);
    }
  }

  // Update INDEX.md
  if (newIndexEntries.length > 0) {
    updateIndex(newIndexEntries, outputBase);
  }

  // Count total calls
  if (existsSync(outputBase)) {
    const dirs = readdirSync(outputBase, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .length;
    result.totalCalls = dirs;
  }

  if (!silent) {
    console.log(`\n✅ Completed! Processed ${result.newCalls} new calls into ${outputBase}`);
  }

  return result;
}

// CLI execution
if (import.meta.main) {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let forceReindex = 0;

  const forceIdx = args.findIndex(a => a === '--force' || a === '-f');
  if (forceIdx !== -1) {
    // Check if next arg is a number
    const nextArg = args[forceIdx + 1];
    if (nextArg && /^\d+$/.test(nextArg)) {
      forceReindex = parseInt(nextArg, 10);
    } else {
      // Default to 2 if no number specified
      forceReindex = 2;
    }
  }

  extractGranolaCalls({ forceReindex })
    .then(result => {
      if (result.errors.length > 0) {
        console.error('\n⚠️ Errors encountered:');
        result.errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
