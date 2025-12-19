# Granola Data Extraction Guide

This document outlines the technical approach and implementation decisions for extracting data from the Granola application. It is intended as a reference for re-implementing this logic in a new application.

## 1. Data Source

The application stores its data in a local JSON cache file.

- **Path**: `~/Library/Application Support/Granola/cache-v3.json`
- **Format**: JSON

> [!IMPORTANT]
> Always read from this global path to ensure you are accessing the latest live data.

## 2. Data Structure & Parsing

The JSON structure has a quirk that requires specific handling: **Double Encoding**.

### The "Cache" Wrapper
The top-level JSON object often contains a `cache` key, which holds a **stringified JSON object**. You must parse this string to access the actual application state.

```python
# Logic:
data = json.load(file)
if 'cache' in data and isinstance(data['cache'], str):
    state = json.loads(data['cache'])['state']
else:
    state = data['state'] # Fallback if not double-encoded
```

### Key State Objects
Once inside `state`, the data is normalized into three main dictionaries:

1.  **`documents`**: Metadata for each meeting (ID, title, date, attendees).
2.  **`transcripts`**: Raw transcript segments keyed by Document ID.
3.  **`documentPanels`**: AI-generated notes and summaries, nested structure: `{ [document_id]: { [panel_id]: panel_object } }`.

## 3. Implementation Decisions & Rationale

### A. Speaker Identification (Critical)
**Problem**: The raw transcript segments often have a `null` or generic `speaker` field.
**Solution**: We infer speakers using the `source` field and `document` metadata.

*   **`source: "microphone"`** → Maps to the **User** (Creator).
*   **`source: "system"`** → Maps to the **Attendee(s)**.

**Algorithm**:
1.  Get the "Creator" name from `document.people.creator`. This is "You".
2.  Get the "Attendee" name(s) from `document.people.attendees`.
3.  Iterate through transcript segments:
    *   If `speaker` is set, use it.
    *   Else if `source == "microphone"`, label as **Creator**.
    *   Else if `source == "system"`, label as **Attendee**.

*Rationale*: This provides a much cleaner reading experience than "Unknown Speaker" or "System Audio", especially for 1-on-1 calls.

### B. Rich Text Parsing (TipTap)
**Problem**: Notes and AI summaries are stored in a complex JSON tree format (TipTap/ProseMirror), not plain text or Markdown.
**Solution**: A recursive parser is required to traverse the node tree and convert it to Markdown.

*   **Nodes**: Handle `paragraph`, `heading`, `bulletList`, `orderedList`, `codeBlock`, `blockquote`.
*   **Marks**: Handle `bold`, `italic`, `code` styling within text nodes.

*Rationale*: Preserving formatting (headers, lists, bold text) is essential for the readability of AI-generated meeting notes.

### C. Linking Transcripts to Meetings
**Problem**: `state.transcripts` keys usually match `state.documents` keys, but not always.
**Solution**:
1.  Primary lookup: `documents.get(transcript_id)`.
2.  Fallback: Check the first segment of the transcript data for an internal `document_id` field.

*Rationale*: Ensures we don't orphan transcripts just because the top-level keys don't perfectly align.

### D. Incremental Extraction
**Decision**: The script checks if a directory `MMDD-Title-YY` already exists before processing.
**Rationale**: The cache file can be large (hundreds of MBs). Re-processing every historical meeting on every run is inefficient. We assume past meetings don't change.

## 4. Output Structure

For a clean, portable export, we organize data by meeting:

```text
context/calls/
├── 2025-12-17_Meeting_Title/
│   ├── metadata.json    # Structured data (IDs, emails, attendees)
│   ├── transcript.txt   # Full dialogue with inferred speaker names
│   └── notes.md         # Combined Manual + AI notes in Markdown
```

This structure separates raw data (`metadata.json`) from human-readable content (`transcript.txt`, `notes.md`), making it easy for downstream apps (like LLMs or search indices) to ingest the specific parts they need.
