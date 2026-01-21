/**
 * Database Indexer - Main Orchestrator (SQLite v2.1)
 *
 * Runs all extractors in sequence to populate the context graph.
 * Can run specific extractors or full indexing.
 *
 * Usage:
 *   bun scripts/db/index.ts              # Full index (no LLM extraction)
 *   bun scripts/db/index.ts entities     # Only entities
 *   bun scripts/db/index.ts --extract    # Run with LLM extraction
 *   bun scripts/db/index.ts --extract-only # Only run LLM extraction
 */

import db from "./client-sqlite";
import { extractEntities } from "./extractors/entities";
import { extractDeals } from "./extractors/deals";
import { extractCalls } from "./extractors/calls";
import { extractEmails } from "./extractors/emails";
import { extractTelegram } from "./extractors/telegram";
import { runExtraction, type ExtractionStats } from "./extract-llm";

interface IndexResult {
  duration: number;
  entities: { created: number; updated: number; aliases: number };
  deals: { created: number; updated: number };
  calls: { created: number; updated: number; skipped: number };
  emails: { created: number; updated: number; skipped: number };
  telegram: { created: number; updated: number; skipped: number };
  extraction?: ExtractionStats;
  errors: string[];
}

type ExtractorName = "entities" | "deals" | "calls" | "emails" | "telegram";

const EXTRACTORS: Record<ExtractorName, () => any> = {
  entities: extractEntities,
  deals: extractDeals,
  calls: extractCalls,
  emails: extractEmails,
  telegram: extractTelegram,
};

/**
 * Log batch run to database
 */
function logBatchRun(
  startTime: Date,
  result: IndexResult
): void {
  const runId = `run-${startTime.toISOString().replace(/[:.]/g, "-")}`;

  const entitiesProcessed = result.entities.created + result.entities.updated;
  const interactionsProcessed =
    result.calls.created + result.calls.updated +
    result.emails.created + result.emails.updated +
    result.telegram.created + result.telegram.updated;

  db.run(
    `INSERT INTO batch_runs (id, started_at, ended_at, type, status, entities_processed, interactions_processed, error)
     VALUES (?, ?, datetime('now'), 'reindex', 'completed', ?, ?, ?)`,
    [
      runId,
      startTime.toISOString(),
      entitiesProcessed,
      interactionsProcessed,
      result.errors.length > 0 ? result.errors.join("; ") : null,
    ]
  );
}

interface IndexerOptions {
  extractorNames?: ExtractorName[];
  runExtraction?: boolean;
  extractionOnly?: boolean;
}

/**
 * Run full indexing or specific extractors
 */
async function runIndexer(options: IndexerOptions = {}): Promise<void> {
  const startTime = new Date();
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Context Graph Indexer - ${startTime.toISOString()}`);
  console.log(`${"=".repeat(50)}\n`);

  const result: IndexResult = {
    duration: 0,
    entities: { created: 0, updated: 0, aliases: 0 },
    deals: { created: 0, updated: 0 },
    calls: { created: 0, updated: 0, skipped: 0 },
    emails: { created: 0, updated: 0, skipped: 0 },
    telegram: { created: 0, updated: 0, skipped: 0 },
    errors: [],
  };

  // Skip file extractors if extraction-only mode
  if (!options.extractionOnly) {
    // Determine which extractors to run
    const toRun = options.extractorNames || (Object.keys(EXTRACTORS) as ExtractorName[]);

    for (const name of toRun) {
      try {
        const extractor = EXTRACTORS[name];
        if (!extractor) {
          console.error(`Unknown extractor: ${name}`);
          continue;
        }

        const extractResult = extractor();

        // Aggregate results based on extractor type
        switch (name) {
          case "entities":
            result.entities.created = extractResult.entitiesCreated || 0;
            result.entities.updated = extractResult.entitiesUpdated || 0;
            result.entities.aliases = extractResult.aliasesCreated || 0;
            if (extractResult.errors) result.errors.push(...extractResult.errors);
            break;
          case "deals":
            result.deals.created = extractResult.dealsCreated || 0;
            result.deals.updated = extractResult.dealsUpdated || 0;
            if (extractResult.errors) result.errors.push(...extractResult.errors);
            break;
          case "calls":
            result.calls.created = extractResult.callsCreated || 0;
            result.calls.updated = extractResult.callsUpdated || 0;
            result.calls.skipped = extractResult.callsSkipped || 0;
            if (extractResult.errors) result.errors.push(...extractResult.errors);
            break;
          case "emails":
            result.emails.created = extractResult.emailsCreated || 0;
            result.emails.updated = extractResult.emailsUpdated || 0;
            result.emails.skipped = extractResult.emailsSkipped || 0;
            if (extractResult.errors) result.errors.push(...extractResult.errors);
            break;
          case "telegram":
            result.telegram.created = extractResult.conversationsCreated || 0;
            result.telegram.updated = extractResult.conversationsUpdated || 0;
            result.telegram.skipped = extractResult.conversationsSkipped || 0;
            if (extractResult.errors) result.errors.push(...extractResult.errors);
            break;
        }
      } catch (error: any) {
        console.error(`Error running ${name} extractor:`, error.message);
        result.errors.push(`${name}: ${error.message}`);
      }
    }
  } // End of if (!options.extractionOnly)

  // Run LLM extraction if requested
  if (options.runExtraction || options.extractionOnly) {
    try {
      result.extraction = await runExtraction();
      if (result.extraction.errors.length > 0) {
        result.errors.push(...result.extraction.errors);
      }
    } catch (error: any) {
      console.error("LLM extraction failed:", error.message);
      result.errors.push(`extraction: ${error.message}`);
    }
  }

  // Calculate duration
  result.duration = Date.now() - startTime.getTime();

  // Log batch run
  try {
    logBatchRun(startTime, result);
  } catch (error: any) {
    console.error("Failed to log batch run:", error.message);
  }

  // Print summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("INDEXER RESULTS");
  console.log(`${"=".repeat(50)}\n`);

  console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`);
  console.log("");

  console.log("Entities:");
  console.log(`  Created: ${result.entities.created}`);
  console.log(`  Updated: ${result.entities.updated}`);
  console.log(`  Aliases: ${result.entities.aliases}`);

  console.log("\nDeals:");
  console.log(`  Created: ${result.deals.created}`);
  console.log(`  Updated: ${result.deals.updated}`);

  console.log("\nCalls:");
  console.log(`  Created: ${result.calls.created}`);
  console.log(`  Updated: ${result.calls.updated}`);
  console.log(`  Skipped: ${result.calls.skipped}`);

  console.log("\nEmails:");
  console.log(`  Created: ${result.emails.created}`);
  console.log(`  Updated: ${result.emails.updated}`);
  console.log(`  Skipped: ${result.emails.skipped}`);

  console.log("\nTelegram:");
  console.log(`  Created: ${result.telegram.created}`);
  console.log(`  Updated: ${result.telegram.updated}`);
  console.log(`  Skipped: ${result.telegram.skipped}`);

  if (result.extraction) {
    console.log("\nLLM Extraction:");
    console.log(`  Interactions: ${result.extraction.interactionsProcessed}`);
    console.log(`  Items extracted: ${result.extraction.itemsExtracted}`);
    console.log(`  Entities resolved: ${result.extraction.entitiesResolved}`);
    console.log(`  Entities created: ${result.extraction.entitiesCreated}`);
    console.log(`  Cost: $${result.extraction.costUsd.toFixed(4)}`);
  }

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  } else {
    console.log("\nNo errors.");
  }

  console.log("");
}

// Main entry point
if (import.meta.main) {
  // Parse command line arguments
  const args = process.argv.slice(2);

  const options: IndexerOptions = {};

  // Parse flags
  if (args.includes("--extract")) {
    options.runExtraction = true;
  }
  if (args.includes("--extract-only")) {
    options.extractionOnly = true;
    options.runExtraction = true;
  }

  // Filter out flags and get extractor names
  const names = args.filter((a) => !a.startsWith("-"));
  if (names.length > 0) {
    options.extractorNames = names as ExtractorName[];
  }

  try {
    await runIndexer(options);
  } finally {
    db.close();
  }
}

export { runIndexer };
