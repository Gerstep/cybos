You are executing the **cyber-save-calls** command to extract Granola meeting transcripts and AI notes.

## Task

Run the Granola extraction script and report results to the user.

## Usage

- **Normal extraction**: `bun scripts/extract-granola.ts`
- **Force re-extract recent calls**: `bun scripts/extract-granola.ts --force [N]`

The `--force` (or `-f`) flag re-extracts the N most recent calls (default: 2). Use this when:
- A call was indexed during an active meeting (incomplete transcript)
- You want to refresh transcripts with updated content from Granola

## Steps

1. Check if user requested force reindex (look for `--force` in their message)
2. Execute the appropriate command:
   - Normal: `bun scripts/extract-granola.ts`
   - Force: `bun scripts/extract-granola.ts --force N`
3. Parse the output to identify:
   - Number of new calls extracted (or re-extracted)
   - Any errors or warnings
   - Total calls in the index
4. Report a clear summary to the user

## Example Output

If new calls were extracted:
```
Extracted 3 new calls:
- 2025-01-15: Acme Corp Founder Call
- 2025-01-14: Weekly Catch-up
- 2025-01-13: Technical Deep Dive

Total calls in index: 47
Search calls: bun scripts/db/query.ts find-interactions --type call
```

If no new calls:
```
No new calls to extract. All Granola calls are up to date.

Total calls in index: 44
Search calls: bun scripts/db/query.ts find-interactions --type call
```

If force re-extracting:
```
Force re-extracted 2 calls:
- 2025-01-15: Acme Corp Founder Call (updated)
- 2025-01-14: Weekly Catch-up (updated)

Total calls in index: 44
Search calls: bun scripts/db/query.ts find-interactions --type call
```

If errors occurred:
```
Extracted 2 new calls, but encountered 1 error:
- Meeting "Bug Triage" failed: invalid date format

Search calls: bun scripts/db/query.ts find-interactions --type call
```

## Notes

- **Normal mode**: Incremental - only NEW calls are processed, existing folders skipped
- **Force mode**: Removes and re-extracts the N most recent calls to get updated transcripts
- The startup hook uses normal mode (no --force) to avoid overwriting
- The script saves calls to ~/CybosVault/private/context/calls/ folders (indexed by database)
