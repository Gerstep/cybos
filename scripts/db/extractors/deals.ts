/**
 * Deal Extractor (SQLite v2.1)
 *
 * Imports deals from /deals/ folders as company entities.
 * In v2.1, deals are simplified to company entities - no separate deals table.
 * Parses .cybos/context.md for metadata when present.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import db from "../client-sqlite";
import { getDealsPath, isLegacyMode, getAppRoot } from "../../paths";

function getDealsDir(): string {
  if (isLegacyMode()) {
    return join(getAppRoot(), "deals");
  }
  return getDealsPath();
}

export interface DealExtractResult {
  dealsCreated: number;
  dealsUpdated: number;
  errors: string[];
}

interface DealMetadata {
  name?: string;
  status?: string;
  stage?: string;
  sector?: string;
  website?: string;
}

/**
 * Parse context.md file for deal metadata
 */
function parseContextFile(filePath: string): DealMetadata {
  if (!existsSync(filePath)) return {};

  const content = readFileSync(filePath, "utf-8");
  const metadata: DealMetadata = {};

  // Parse YAML-like frontmatter or key-value pairs
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      const normalizedKey = key.toLowerCase().replace(/-/g, "_");

      switch (normalizedKey) {
        case "name":
          metadata.name = value.trim();
          break;
        case "status":
          metadata.status = value.trim().toLowerCase();
          break;
        case "stage":
          metadata.stage = value.trim().toLowerCase();
          break;
        case "sector":
          metadata.sector = value.trim();
          break;
        case "website":
          metadata.website = value.trim();
          break;
      }
    }
  }

  return metadata;
}

/**
 * Convert slug to display name
 */
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Main extraction function
 * Creates company entities from deal folders
 */
export function extractDeals(): DealExtractResult {
  console.log("\n=== Extracting Deals ===\n");

  const result: DealExtractResult = {
    dealsCreated: 0,
    dealsUpdated: 0,
    errors: [],
  };

  const dealsDir = getDealsDir();
  if (!existsSync(dealsDir)) {
    console.log("No deals folder found");
    return result;
  }

  // Get all deal folders
  const dealFolders = readdirSync(dealsDir).filter((f) => {
    const fullPath = join(dealsDir, f);
    return statSync(fullPath).isDirectory() && !f.startsWith(".");
  });

  console.log(`Found ${dealFolders.length} deal folders`);

  for (const slug of dealFolders) {
    try {
      const dealPath = join(dealsDir, slug);
      const contextPath = join(dealPath, ".cybos", "context.md");

      // Parse metadata from context.md if exists
      const metadata = parseContextFile(contextPath);

      // Get name from metadata or convert from slug
      const name = metadata.name || slugToName(slug);

      // Check if entity with same slug exists
      const existing = db.queryOne<{ slug: string }>(
        "SELECT slug FROM entities WHERE slug = ?",
        [slug]
      );

      if (existing) {
        // Update existing entity with deal info
        db.run(
          `UPDATE entities SET
            name = ?,
            type = 'company',
            website = COALESCE(?, website),
            current_focus = COALESCE(?, current_focus),
            last_activity = datetime('now')
          WHERE slug = ?`,
          [
            name,
            metadata.website || null,
            metadata.sector || null,
            slug,
          ]
        );
        result.dealsUpdated++;
      } else {
        // Insert new company entity from deal
        db.run(
          `INSERT INTO entities (slug, name, type, website, current_focus, last_activity, is_candidate)
           VALUES (?, ?, 'company', ?, ?, datetime('now'), 0)`,
          [
            slug,
            name,
            metadata.website || null,
            metadata.sector || null,
          ]
        );
        result.dealsCreated++;
      }

      console.log(`  ${slug}: ${name}`);
    } catch (error: any) {
      result.errors.push(`Deal ${slug}: ${error.message}`);
    }
  }

  return result;
}

// Run if executed directly
if (import.meta.main) {
  try {
    const result = extractDeals();
    console.log("\n=== Results ===");
    console.log(`Deals created: ${result.dealsCreated}`);
    console.log(`Deals updated: ${result.dealsUpdated}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    db.close();
  }
}
