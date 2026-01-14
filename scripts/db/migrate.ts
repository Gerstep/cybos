/**
 * Migration Script
 *
 * Migrates from markdown-based indexes to PostgreSQL database.
 * Runs full indexer and verifies data integrity.
 *
 * Usage:
 *   bun scripts/db/migrate.ts              # Run migration
 *   bun scripts/db/migrate.ts --verify     # Verify only (no changes)
 *   bun scripts/db/migrate.ts --cleanup    # Remove old index files after migration
 */

import { existsSync, readFileSync, unlinkSync, renameSync } from "fs";
import { join } from "path";
import { query, queryOne, closePool } from "./client";
import { runIndexer } from "./index";

const ENTITIES_DIR = join(process.cwd(), "context/entities");
const INDEX_PATH = join(ENTITIES_DIR, ".index.json");
const CALLS_INDEX = join(process.cwd(), "context/calls/INDEX.md");

interface MigrationResult {
  success: boolean;
  oldEntityCount: number;
  newEntityCount: number;
  oldInteractionCount: number;
  newInteractionCount: number;
  missingEntities: string[];
  errors: string[];
}

/**
 * Count entities in old .index.json
 */
function countOldEntities(): number {
  if (!existsSync(INDEX_PATH)) {
    return 0;
  }

  try {
    const data = JSON.parse(readFileSync(INDEX_PATH, "utf-8"));
    return Object.keys(data.entities || {}).length;
  } catch {
    return 0;
  }
}

/**
 * Get entity slugs from old index
 */
function getOldEntitySlugs(): string[] {
  if (!existsSync(INDEX_PATH)) {
    return [];
  }

  try {
    const data = JSON.parse(readFileSync(INDEX_PATH, "utf-8"));
    return Object.keys(data.entities || {});
  } catch {
    return [];
  }
}

/**
 * Count entries in old calls INDEX.md
 */
function countOldCalls(): number {
  if (!existsSync(CALLS_INDEX)) {
    return 0;
  }

  try {
    const content = readFileSync(CALLS_INDEX, "utf-8");
    // Count table rows (lines starting with |)
    const rows = content.split("\n").filter(
      (line) => line.startsWith("|") && !line.includes("---") && !line.includes("Date")
    );
    return rows.length;
  } catch {
    return 0;
  }
}

/**
 * Count entities in database
 */
async function countDbEntities(): Promise<number> {
  const result = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM entities"
  );
  return parseInt(result?.count || "0", 10);
}

/**
 * Count interactions in database
 */
async function countDbInteractions(): Promise<number> {
  const result = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM interactions"
  );
  return parseInt(result?.count || "0", 10);
}

/**
 * Check which old entities are missing in new database
 */
async function findMissingEntities(oldSlugs: string[]): Promise<string[]> {
  const missing: string[] = [];

  for (const slug of oldSlugs) {
    const exists = await queryOne<{ slug: string }>(
      "SELECT slug FROM entities WHERE slug = $1",
      [slug]
    );
    if (!exists) {
      missing.push(slug);
    }
  }

  return missing;
}

/**
 * Run the full migration
 */
async function runMigration(
  options: { verify?: boolean; cleanup?: boolean } = {}
): Promise<MigrationResult> {
  console.log("\n" + "=".repeat(60));
  console.log("CONTEXT GRAPH MIGRATION");
  console.log("=".repeat(60) + "\n");

  const result: MigrationResult = {
    success: false,
    oldEntityCount: 0,
    newEntityCount: 0,
    oldInteractionCount: 0,
    newInteractionCount: 0,
    missingEntities: [],
    errors: [],
  };

  try {
    // Step 1: Count old data
    console.log("Step 1: Analyzing old indexes...\n");
    result.oldEntityCount = countOldEntities();
    result.oldInteractionCount = countOldCalls();
    const oldSlugs = getOldEntitySlugs();

    console.log(`  Old entities (.index.json): ${result.oldEntityCount}`);
    console.log(`  Old calls (INDEX.md): ${result.oldInteractionCount}`);

    // Step 2: Run indexer (unless verify-only)
    if (!options.verify) {
      console.log("\nStep 2: Running database indexer...\n");
      await runIndexer({});
    } else {
      console.log("\nStep 2: Skipped (verify mode)\n");
    }

    // Step 3: Count new data
    console.log("\nStep 3: Verifying database...\n");
    result.newEntityCount = await countDbEntities();
    result.newInteractionCount = await countDbInteractions();

    console.log(`  Database entities: ${result.newEntityCount}`);
    console.log(`  Database interactions: ${result.newInteractionCount}`);

    // Step 4: Check for missing entities
    console.log("\nStep 4: Checking entity coverage...\n");
    result.missingEntities = await findMissingEntities(oldSlugs);

    if (result.missingEntities.length > 0) {
      console.log(`  Missing entities: ${result.missingEntities.length}`);
      for (const slug of result.missingEntities.slice(0, 10)) {
        console.log(`    - ${slug}`);
      }
      if (result.missingEntities.length > 10) {
        console.log(`    ... and ${result.missingEntities.length - 10} more`);
      }
    } else {
      console.log("  All old entities are present in database ✓");
    }

    // Step 5: Cleanup old files (if requested)
    if (options.cleanup && !options.verify) {
      console.log("\nStep 5: Cleaning up old indexes...\n");

      // Backup and remove .index.json
      if (existsSync(INDEX_PATH)) {
        const backupPath = INDEX_PATH + ".backup";
        renameSync(INDEX_PATH, backupPath);
        console.log(`  Backed up .index.json to .index.json.backup`);
      }

      // Note: We don't remove INDEX.md files as they may still be useful
      console.log("  Kept INDEX.md files (still useful for reference)");
    } else if (options.cleanup) {
      console.log("\nStep 5: Skipped cleanup (verify mode)\n");
    }

    // Determine success
    result.success =
      result.newEntityCount >= result.oldEntityCount &&
      result.missingEntities.length === 0;

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("MIGRATION SUMMARY");
    console.log("=".repeat(60) + "\n");

    console.log(`Status: ${result.success ? "✓ SUCCESS" : "⚠ NEEDS ATTENTION"}`);
    console.log(`\nEntities:`);
    console.log(`  Old: ${result.oldEntityCount} → New: ${result.newEntityCount}`);
    console.log(`\nInteractions:`);
    console.log(`  Old calls: ${result.oldInteractionCount} → New total: ${result.newInteractionCount}`);

    if (!result.success) {
      console.log(`\n⚠ Some entities may need manual review`);
    }

    if (result.missingEntities.length > 0) {
      console.log(`\nMissing entities: ${result.missingEntities.length}`);
    }

    console.log("\n");
  } catch (error: any) {
    console.error("Migration error:", error.message);
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Show database status
 */
async function showStatus(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("DATABASE STATUS");
  console.log("=".repeat(60) + "\n");

  // Entity counts by type
  const entityCounts = await query<{ type: string; count: string }>(
    "SELECT type, COUNT(*) as count FROM entities GROUP BY type ORDER BY type"
  );
  console.log("Entities:");
  for (const row of entityCounts.rows) {
    console.log(`  ${row.type}: ${row.count}`);
  }

  // Interaction counts by type
  const interactionCounts = await query<{ type: string; count: string }>(
    "SELECT type, COUNT(*) as count FROM interactions GROUP BY type ORDER BY type"
  );
  console.log("\nInteractions:");
  for (const row of interactionCounts.rows) {
    console.log(`  ${row.type}: ${row.count}`);
  }

  // Deal count
  const dealCount = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM deals"
  );
  console.log(`\nDeals: ${dealCount?.count || 0}`);

  // Extracted items count
  const itemCount = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM extracted_items"
  );
  console.log(`Extracted items: ${itemCount?.count || 0}`);

  // Batch runs
  const lastRun = await queryOne<{ started_at: Date; status: string }>(
    "SELECT started_at, status FROM batch_runs ORDER BY started_at DESC LIMIT 1"
  );
  if (lastRun) {
    console.log(`\nLast indexer run: ${lastRun.started_at.toISOString()} (${lastRun.status})`);
  }

  // Old index status
  console.log("\nOld indexes:");
  console.log(`  .index.json: ${existsSync(INDEX_PATH) ? "exists" : "not found"}`);
  console.log(`  INDEX.md (calls): ${existsSync(CALLS_INDEX) ? "exists" : "not found"}`);

  console.log("\n");
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2);

  const options = {
    verify: args.includes("--verify"),
    cleanup: args.includes("--cleanup"),
    status: args.includes("--status"),
  };

  try {
    if (options.status) {
      await showStatus();
    } else {
      await runMigration(options);
    }
  } finally {
    await closePool();
  }
}

export { runMigration, showStatus };
