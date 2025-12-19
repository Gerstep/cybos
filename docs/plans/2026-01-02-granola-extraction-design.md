# Granola Call Extraction & Indexing - Design Document

**Date:** 2026-01-02
**Status:** Ready for Implementation
**Version:** 1.0

## Overview

Implement automatic extraction of Granola meeting transcripts and AI notes into Cybos' context system, with searchable indexing for Claude to use in workflows like call preparation and memo writing.

## Requirements

### Functional Requirements
- Extract calls from Granola cache to `/context/calls/[date]_[title]/`
- Generate searchable index at `/context/calls/INDEX.md`
- Auto-extract on SessionStart (silent, incremental)
- Manual extraction via `/cyber-save-calls` slash command
- Preserve formatting from AI notes (Markdown conversion)
- Infer speaker names from metadata
- Claude can auto-search index when user mentions person/company names

### Non-Functional Requirements
- Incremental: only extract new calls
- Graceful failure if Granola cache missing
- Fast enough for SessionStart hook (<2s for typical case)
- No external dependencies beyond Bun + Node stdlib

## Architecture

### Components

```
┌─────────────────────────────────────────────────────┐
│  SessionStart Hook (load-context.ts)                │
│  • Calls extract-granola.ts on every session        │
│  • Silent unless new calls found                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Core Extraction Script (scripts/extract-granola.ts)│
│  • Read Granola cache                               │
│  • Parse double-encoded JSON                        │
│  • Extract calls incrementally                      │
│  • Generate/update INDEX.md                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Slash Command (.claude/commands/cyber-save-calls.md)│
│  • Manual trigger for extraction                    │
│  • Same behavior as hook                            │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Read Granola cache**
   - Path: `~/Library/Application Support/Granola/cache-v3.json`
   - Handle double-encoding: `data.cache` (string) → parse → `state`

2. **Parse state objects**
   - `state.documents`: meeting metadata (ID, title, date, attendees)
   - `state.transcripts`: raw transcript segments (keyed by doc ID)
   - `state.documentPanels`: AI-generated notes (nested: `{ [doc_id]: { [panel_id]: panel } }`)

3. **For each transcript**
   - Check if folder exists (incremental skip)
   - Infer speakers from metadata
   - Parse TipTap JSON to Markdown
   - Link AI panels to meeting
   - Write 3 files: metadata.json, transcript.txt, notes.md

4. **Update INDEX.md**
   - Append new calls to table
   - Sort by date (newest first)
   - Update "Last updated" timestamp

## Output Structure

```
/context/calls/
├── INDEX.md                              # Searchable index
├── README.md                             # Usage documentation
├── 2025-01-15_acme-corp-founder/
│   ├── metadata.json                     # Structured data
│   ├── transcript.txt                    # [Speaker] Dialogue format
│   └── notes.md                          # AI + manual notes (Markdown)
└── 2025-01-14_john-catch-up/
    ├── metadata.json
    ├── transcript.txt
    └── notes.md
```

### metadata.json Schema

```json
{
  "id": "uuid",
  "title": "Meeting Title",
  "date": "2025-01-15T14:30:00Z",
  "attendees": [
    {
      "email": "john@example.com",
      "details": {
        "person": {
          "name": {
            "fullName": "John Smith"
          }
        }
      }
    }
  ],
  "inferred_speakers": {
    "self": "Alex Doe",
    "other": "John Smith"
  }
}
```

### transcript.txt Format

```
[Alex Doe] Thanks for taking the time today. I wanted to discuss your funding round.

[John Smith] Happy to chat! We're raising a $5M seed round...

[Alex Doe] What's your current ARR?
```

### notes.md Format

```markdown
# Manual Notes

[User's manual notes in Markdown]

# AI-Enhanced Notes

## Summary
[AI-generated summary]

## Action Items
- [Action 1]
- [Action 2]

## Key Discussion Points
[AI-generated key points]
```

### INDEX.md Format

```markdown
# Granola Calls Index

Last updated: 2025-01-15 16:45

## Calls

| Date | Title | Attendees | Path |
|------|-------|-----------|------|
| 2025-01-15 | Acme Corp Founder Call | John Smith (john@acme.com) | [📁](./2025-01-15_acme-corp-founder/) |
| 2025-01-14 | Weekly Catch-up | Sarah Lee | [📁](./2025-01-14_weekly-catch-up/) |
| 2025-01-10 | Tech Deep Dive | Mike Chen, Alice Wong | [📁](./2025-01-10_tech-deep-dive/) |

Total calls: 3
```

## Implementation Details

### 1. TipTap JSON Parser

TipTap stores rich text as nested JSON nodes. Parser must handle:

**Node Types:**
- `text`: leaf node with optional marks (bold, italic, code)
- `paragraph`: container for text nodes
- `heading`: heading with level (1-6)
- `bulletList` / `orderedList`: list containers
- `listItem`: list item container
- `codeBlock`: code block
- `blockquote`: quote block
- `horizontalRule`: separator

**Marks:**
- `bold`: `**text**`
- `italic`: `*text*`
- `code`: `` `text` ``

**Algorithm:**
```typescript
function parseTipTapNode(node: any): string {
  if (!node || typeof node !== 'object') return '';

  const type = node.type || '';
  const content = node.content || [];

  // Recurse through children
  const childTexts = content.map(child => parseTipTapNode(child));

  switch (type) {
    case 'text':
      let text = node.text || '';
      // Apply marks
      for (const mark of (node.marks || [])) {
        if (mark.type === 'bold') text = `**${text}**`;
        if (mark.type === 'italic') text = `*${text}*`;
        if (mark.type === 'code') text = `\`${text}\``;
      }
      return text;

    case 'paragraph':
      return childTexts.join('');

    case 'heading':
      const level = node.attrs?.level || 1;
      return `${'#'.repeat(level)} ${childTexts.join('')}`;

    case 'bulletList':
      return content.map(item => {
        const itemContent = parseTipTapNode(item);
        return `- ${itemContent}`;
      }).join('\n');

    // ... handle other node types

    default:
      return childTexts.join('');
  }
}
```

### 2. Speaker Inference

**Problem:** Transcript segments often have `speaker: null` or generic values.

**Solution:** Use `source` field + document metadata:

```typescript
function inferSpeakers(doc: any): { self: string; other: string } {
  let self = "You";
  let other = "Speaker";

  const creator = doc?.people?.creator?.name;
  const attendees = doc?.people?.attendees || [];

  if (creator) {
    self = creator;
  }

  const others = attendees
    .map(att => att.details?.person?.name?.fullName || att.email)
    .filter(name => name && name !== self);

  if (others.length === 1) {
    other = others[0];
  } else if (others.length > 1) {
    other = others.join(' / ');
  }

  return { self, other };
}

function formatTranscript(segments: any[], self: string, other: string): string {
  return segments.map(seg => {
    const text = seg.text || seg.content || '';
    if (!text) return null;

    let speaker = 'Unknown';
    if (seg.speaker) {
      speaker = seg.speaker;
    } else if (seg.source === 'microphone') {
      speaker = self;
    } else if (seg.source === 'system') {
      speaker = other;
    }

    return `[${speaker}] ${text}`;
  }).filter(Boolean).join('\n\n');
}
```

### 3. Incremental Extraction

**Algorithm:**
1. Iterate through `state.transcripts`
2. For each transcript:
   - Get associated document
   - Generate folder name: `MMDD-safe-title-YY`
   - Check if folder exists
   - If exists: skip (already extracted)
   - If not exists: extract and write files
3. Track count of newly extracted calls
4. Update INDEX.md with new entries only

**Folder Naming:**
```typescript
function safeFilename(name: string): string {
  if (!name) return 'untitled';
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special chars
    .replace(/\s+/g, '-')              // Spaces to hyphens
    .toLowerCase()
    .slice(0, 100);                    // Limit length
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Keep as ISO format for extraction
  } catch {
    return 'unknown-date';
  }
}

const folderName = `${formatDate(createdAt)}_${safeFilename(title)}`;
```

### 4. Error Handling

**Cache File Issues:**
```typescript
function loadGranolaCache(path: string): any | null {
  if (!existsSync(path)) {
    console.error('⚠️ Granola cache not found at:', path);
    return null;
  }

  try {
    const raw = readFileSync(path, 'utf-8');
    const data = JSON.parse(raw);

    // Handle double-encoding
    if (data.cache && typeof data.cache === 'string') {
      const inner = JSON.parse(data.cache);
      return inner.state || inner;
    }

    return data.state || data;
  } catch (err) {
    console.error('⚠️ Granola cache corrupted:', err.message);
    return null;
  }
}
```

**Parsing Failures:**
- TipTap parsing errors: skip that section, log warning, continue
- Missing metadata: use fallback values ("Unknown Meeting", "unknown-date")
- Invalid JSON: catch and log, skip that call

**File System Errors:**
- Can't create directory: log error, skip that call, continue
- Can't write file: log error, skip that file, continue with next

### 5. INDEX.md Generation

**Algorithm:**
1. Read existing INDEX.md (if exists)
2. Parse existing table entries
3. Add new call entries
4. Sort by date descending (newest first)
5. Regenerate table with updated timestamp
6. Write back to INDEX.md

```typescript
interface IndexEntry {
  date: string;
  title: string;
  attendees: string;
  path: string;
}

function updateIndex(newCalls: IndexEntry[]): void {
  const indexPath = '/context/calls/INDEX.md';
  let existingEntries: IndexEntry[] = [];

  // Parse existing index if it exists
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf-8');
    existingEntries = parseIndexTable(content);
  }

  // Merge with new calls
  const allEntries = [...existingEntries, ...newCalls];

  // Sort by date descending
  allEntries.sort((a, b) => b.date.localeCompare(a.date));

  // Generate markdown
  const markdown = generateIndexMarkdown(allEntries);

  writeFileSync(indexPath, markdown, 'utf-8');
}

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
```

## Integration Points

### SessionStart Hook

Update `.claude/hooks/load-context.ts`:

```typescript
// After existing context loading
try {
  const extractionResult = await runGranolaExtraction();
  if (extractionResult.newCalls > 0) {
    console.log(`✓ Extracted ${extractionResult.newCalls} new Granola calls`);
  }
} catch (err) {
  // Silent failure - don't break session
  console.error('⚠️ Granola extraction failed:', err.message);
}
```

### Slash Command

Create `.claude/commands/cyber-save-calls.md`:

```markdown
You are executing the cyber-save-calls command to extract Granola meeting transcripts.

## Task

Run the Granola extraction script and report results to the user.

## Steps

1. Execute: `bun scripts/extract-granola.ts`
2. Report summary:
   - Number of new calls extracted
   - Any errors or warnings
   - Total calls now in index

## Example Output

"Extracted 3 new calls:
- 2025-01-15: Acme Corp Founder Call
- 2025-01-14: Weekly Catch-up
- 2025-01-13: Technical Deep Dive

Total calls in index: 47"
```

### Claude's Auto-Search Behavior

When user mentions a person or company name in their prompt:

1. **Detection triggers:**
   - "Prepare for call with [Name]"
   - "Write memo based on [Name] conversation"
   - "[Company] founder discussion"

2. **Automatic workflow:**
   ```
   a. Read /context/calls/INDEX.md
   b. Search table for matching attendee or title
   c. If matches found:
      - Read those call folders (transcript + notes)
      - Use as context for response
   d. Respond with context-aware answer
   ```

3. **Example:**
   ```
   User: "Prepare for my call with John tomorrow"

   Claude:
   - Reads INDEX.md
   - Finds: "2025-01-14 | Weekly Catch-up | John Smith"
   - Reads /context/calls/2025-01-14_weekly-catch-up/
   - Responds: "Based on your last call with John on Jan 14,
     you discussed his Series A plans. Here's what to follow up on..."
   ```

### README.md Documentation

Create `/context/calls/README.md`:

```markdown
# Granola Calls

This directory contains automatically extracted meeting transcripts and notes from Granola.

## Structure

Each call is stored in a folder: `MMDD-meeting-title-YY/`
- `metadata.json` - Structured data (attendees, date, IDs)
- `transcript.txt` - Full dialogue with speaker names
- `notes.md` - Manual + AI-generated notes in Markdown

## Index

`INDEX.md` provides a searchable table of all calls.

## Usage

### Manual Reference
```
@context/calls/INDEX.md                    # See all calls
@context/calls/2025-01-15_acme-founder/    # Specific call
```

### Auto-Search (Claude)
Claude automatically searches the index when you mention people or companies:
- "Prepare for call with John" → finds John's previous calls
- "Memo based on Acme Corp discussion" → finds Acme Corp calls

### Example Workflows
- **Call prep:** "Prepare for my call with Sarah tomorrow"
- **Memo writing:** "Write DD memo using my calls with Acme Corp founder"
- **Follow-up:** "What did we discuss with Mike last week?"

## Extraction

- **Auto:** Runs on every session start (incremental, silent)
- **Manual:** `/cyber-save-calls` command

## Source

Data extracted from: `~/Library/Application Support/Granola/cache-v3.json`
```

## Testing Strategy

### Test Data

Create test Granola cache JSON in `/docs/Granola-parsing-feature/test-data/sample-cache.json`:

```json
{
  "cache": "{\"state\":{\"documents\":{\"test-id-1\":{\"id\":\"test-id-1\",\"title\":\"Test Meeting\",\"created_at\":\"2025-01-15T14:30:00Z\",\"people\":{\"creator\":{\"name\":\"Alex Doe\"},\"attendees\":[{\"email\":\"john@test.com\",\"details\":{\"person\":{\"name\":{\"fullName\":\"John Test\"}}}}]},\"notes\":{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Test notes\"}]}]}}},\"transcripts\":{\"test-id-1\":[{\"text\":\"Hello\",\"source\":\"microphone\"},{\"text\":\"Hi there\",\"source\":\"system\"}]},\"documentPanels\":{\"test-id-1\":{\"panel-1\":{\"id\":\"panel-1\",\"document_id\":\"test-id-1\",\"title\":\"Summary\",\"content\":{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Test summary\"}]}]}}}}}}}"
}
```

### Unit Tests

Create `scripts/extract-granola.test.ts`:

```typescript
import { test, expect } from 'bun:test';
import {
  parseTipTapNode,
  inferSpeakers,
  formatTranscript,
  safeFilename,
  formatDate
} from './extract-granola';

test('parseTipTapNode - paragraph', () => {
  const node = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Hello world' }
    ]
  };
  expect(parseTipTapNode(node)).toBe('Hello world');
});

test('parseTipTapNode - bold text', () => {
  const node = {
    type: 'text',
    text: 'bold',
    marks: [{ type: 'bold' }]
  };
  expect(parseTipTapNode(node)).toBe('**bold**');
});

test('parseTipTapNode - heading', () => {
  const node = {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Title' }]
  };
  expect(parseTipTapNode(node)).toBe('## Title');
});

test('inferSpeakers - single attendee', () => {
  const doc = {
    people: {
      creator: { name: 'Alex' },
      attendees: [
        { details: { person: { name: { fullName: 'John' } } } }
      ]
    }
  };
  const result = inferSpeakers(doc);
  expect(result).toEqual({ self: 'Alex', other: 'John' });
});

test('safeFilename', () => {
  expect(safeFilename('Acme Corp!')).toBe('acme-corp');
  expect(safeFilename('Test & Meeting')).toBe('test--meeting');
});

test('formatDate', () => {
  expect(formatDate('2025-01-15T14:30:00Z')).toBe('2025-01-15');
});
```

### Integration Test

Create `scripts/test-extraction.ts`:

```typescript
// Run extraction against test cache
import { extractGranolaCalls } from './extract-granola';

const testCachePath = './docs/Granola-parsing-feature/test-data/sample-cache.json';
const testOutputPath = './test-output/calls';

const result = await extractGranolaCalls({
  cachePath: testCachePath,
  outputPath: testOutputPath
});

console.log('Test Results:');
console.log(`- New calls extracted: ${result.newCalls}`);
console.log(`- Errors: ${result.errors.length}`);
console.log(`- Output directory: ${testOutputPath}`);

// Verify output structure
const fs = await import('fs');
const indexExists = fs.existsSync(`${testOutputPath}/INDEX.md`);
console.log(`- INDEX.md created: ${indexExists}`);
```

### Manual Testing Checklist

- [ ] Run against actual Granola cache
- [ ] Verify all calls extracted correctly
- [ ] Check speaker names are accurate
- [ ] Verify TipTap parsing preserves formatting
- [ ] Test incremental behavior (doesn't re-extract)
- [ ] Test SessionStart hook integration
- [ ] Test `/cyber-save-calls` command
- [ ] Verify INDEX.md sorting (newest first)
- [ ] Test with missing cache file (graceful failure)
- [ ] Test with corrupted cache (graceful failure)
- [ ] Verify Claude can search index automatically

## Implementation Phases

### Phase 1: Core Extraction Script
**Files:** `scripts/extract-granola.ts`

**Tasks:**
- [ ] Implement TipTap parser (all node types + marks)
- [ ] Implement speaker inference logic
- [ ] Implement transcript formatting
- [ ] Implement folder naming (safe filenames, dates)
- [ ] Implement incremental extraction (skip existing)
- [ ] Write metadata.json, transcript.txt, notes.md
- [ ] Unit tests for all functions
- [ ] Integration test with sample data

**Estimated Complexity:** High (core logic, parsing)

### Phase 2: INDEX.md Generation
**Files:** `scripts/extract-granola.ts` (extend)

**Tasks:**
- [ ] Implement index parsing from existing INDEX.md
- [ ] Implement index entry generation
- [ ] Implement merge + sort logic
- [ ] Implement markdown table generation
- [ ] Test index updates (add new, preserve old)
- [ ] Test sorting (newest first)

**Estimated Complexity:** Medium

### Phase 3: Hook Integration
**Files:** `.claude/hooks/load-context.ts`

**Tasks:**
- [ ] Import/call extraction script
- [ ] Silent execution (no output unless new calls)
- [ ] Error handling (graceful failure)
- [ ] Test hook doesn't break session startup
- [ ] Test hook output for new calls

**Estimated Complexity:** Low (integration only)

### Phase 4: Slash Command
**Files:** `.claude/commands/cyber-save-calls.md`

**Tasks:**
- [ ] Create command markdown file
- [ ] Implement execution of extraction script
- [ ] Format user-friendly output
- [ ] Test command execution
- [ ] Test output formatting

**Estimated Complexity:** Low

### Phase 5: Documentation
**Files:** `/context/calls/README.md`

**Tasks:**
- [ ] Document structure and files
- [ ] Document INDEX.md usage
- [ ] Document Claude auto-search behavior
- [ ] Document example workflows
- [ ] Add to main CLAUDE.md (reference)

**Estimated Complexity:** Low

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/granola-extraction

# Commit after each phase
git add scripts/extract-granola.ts
git commit -m "Phase 1: Implement core Granola extraction script"

git add scripts/extract-granola.ts
git commit -m "Phase 2: Add INDEX.md generation"

git add .claude/hooks/load-context.ts
git commit -m "Phase 3: Integrate extraction into SessionStart hook"

git add .claude/commands/cyber-save-calls.md
git commit -m "Phase 4: Add /cyber-save-calls slash command"

git add context/calls/README.md CLAUDE.md
git commit -m "Phase 5: Add documentation for call extraction"

# Final test and merge
git checkout master
git merge feature/granola-extraction
```

## Success Criteria

- [ ] Extraction runs on every session start (silent, incremental)
- [ ] `/cyber-save-calls` command works
- [ ] Calls extracted to `/context/calls/[date]_[title]/`
- [ ] INDEX.md auto-updates with new calls
- [ ] Speaker names correctly inferred
- [ ] TipTap formatting preserved in notes.md
- [ ] Graceful failure if Granola cache missing
- [ ] Claude can search index when user mentions names
- [ ] All tests pass
- [ ] Documentation complete

## Future Enhancements (Post-MVP)

- Daily scheduled extraction (cron job)
- Topic/tag extraction from AI notes
- Full-text search across all transcripts
- Link calls to deals automatically (name matching)
- Export calls to other formats (PDF, JSON)
- Call analytics (duration, frequency, participants)
