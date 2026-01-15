/**
 * Deal Extractor
 *
 * Imports deals from /deals/ folders.
 * Parses .cybos/context.md for metadata when present.
 * Links deals to entities with matching slugs.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { query, queryOne } from "../client";

const DEALS_DIR = join(process.cwd(), "deals");

export interface DealExtractResult {
  dealsCreated: number;
  dealsUpdated: number;
  errors: string[];
}

interface DealMetadata {
  name?: string;
  status?: string;
  stage?: string;
  raising?: string;
  valuation?: string;
  sector?: string;
  thesis_fit?: string;
  lead_partner?: string;
  introduced_by?: string;
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
        case "raising":
          metadata.raising = value.trim();
          break;
        case "valuation":
          metadata.valuation = value.trim();
          break;
        case "sector":
          metadata.sector = value.trim();
          break;
        case "thesis_fit":
        case "thesis":
          metadata.thesis_fit = value.trim();
          break;
        case "lead_partner":
        case "lead":
          metadata.lead_partner = value.trim();
          break;
        case "introduced_by":
        case "intro":
          metadata.introduced_by = value.trim();
          break;
      }
    }
  }

  return metadata;
}

/**
 * Count research files in a deal folder
 */
function countResearchFiles(dealPath: string): number {
  const researchPath = join(dealPath, "research");
  if (!existsSync(researchPath)) return 0;

  try {
    return readdirSync(researchPath).filter(
      (f) => f.endsWith(".md") && !f.startsWith(".")
    ).length;
  } catch {
    return 0;
  }
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
 */
export async function extractDeals(): Promise<DealExtractResult> {
  console.log("\n=== Extracting Deals ===\n");

  const result: DealExtractResult = {
    dealsCreated: 0,
    dealsUpdated: 0,
    errors: [],
  };

  if (!existsSync(DEALS_DIR)) {
    console.log("No deals folder found");
    return result;
  }

  // Get all deal folders
  const dealFolders = readdirSync(DEALS_DIR).filter((f) => {
    const fullPath = join(DEALS_DIR, f);
    return statSync(fullPath).isDirectory() && !f.startsWith(".");
  });

  console.log(`Found ${dealFolders.length} deal folders`);

  for (const slug of dealFolders) {
    try {
      const dealPath = join(DEALS_DIR, slug);
      const contextPath = join(dealPath, ".cybos", "context.md");

      // Parse metadata from context.md if exists
      const metadata = parseContextFile(contextPath);

      // Get name from metadata or convert from slug
      const name = metadata.name || slugToName(slug);

      // Count research files
      const researchCount = countResearchFiles(dealPath);

      // Check if entity with same slug exists (for linking)
      const linkedEntity = await queryOne<{ slug: string }>(
        "SELECT slug FROM entities WHERE slug = $1",
        [slug]
      );

      // Check if deal already exists
      const existing = await queryOne<{ slug: string }>(
        "SELECT slug FROM deals WHERE slug = $1",
        [slug]
      );

      // Resolve introduced_by to entity slug if possible
      let introducedBySlug: string | null = null;
      if (metadata.introduced_by) {
        const introducer = await queryOne<{ slug: string }>(
          "SELECT slug FROM find_entity($1, 'person')",
          [metadata.introduced_by]
        );
        if (introducer) {
          introducedBySlug = introducer.slug;
        }
      }

      if (existing) {
        // Update existing deal
        await query(
          `UPDATE deals SET
            name = $2,
            status = COALESCE($3, status),
            stage = COALESCE($4, stage),
            raising = COALESCE($5, raising),
            valuation = COALESCE($6, valuation),
            sector = COALESCE($7, sector),
            thesis_fit = COALESCE($8, thesis_fit),
            lead_partner = COALESCE($9, lead_partner),
            introduced_by = COALESCE($10, introduced_by),
            folder_path = $11,
            research_count = $12,
            primary_contact = COALESCE($13, primary_contact),
            last_activity = NOW()
          WHERE slug = $1`,
          [
            slug,
            name,
            metadata.status || null,
            metadata.stage || null,
            metadata.raising || null,
            metadata.valuation || null,
            metadata.sector || null,
            metadata.thesis_fit || null,
            metadata.lead_partner || null,
            introducedBySlug,
            dealPath,
            researchCount,
            linkedEntity?.slug || null,
          ]
        );
        result.dealsUpdated++;
      } else {
        // Insert new deal
        await query(
          `INSERT INTO deals (slug, name, status, stage, raising, valuation, sector, thesis_fit, lead_partner, introduced_by, folder_path, research_count, primary_contact, first_contact)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            slug,
            name,
            metadata.status || null,
            metadata.stage || null,
            metadata.raising || null,
            metadata.valuation || null,
            metadata.sector || null,
            metadata.thesis_fit || null,
            metadata.lead_partner || null,
            introducedBySlug,
            dealPath,
            researchCount,
            linkedEntity?.slug || null,
          ]
        );
        result.dealsCreated++;
      }

      console.log(`  ${slug}: ${name} (${researchCount} research files)`);
    } catch (error: any) {
      result.errors.push(`Deal ${slug}: ${error.message}`);
    }
  }

  return result;
}

// Run if executed directly
if (import.meta.main) {
  const { closePool } = await import("../client");

  try {
    const result = await extractDeals();
    console.log("\n=== Results ===");
    console.log(`Deals created: ${result.dealsCreated}`);
    console.log(`Deals updated: ${result.dealsUpdated}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    await closePool();
  }
}
