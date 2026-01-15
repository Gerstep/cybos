/**
 * Entity Extractor
 *
 * Imports entities from:
 * 1. Existing .index.json file (primary source)
 * 2. Manual entity files in /context/entities/{people,orgs}/*.md
 *
 * Creates entity_aliases from the aliases array.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { query, queryOne } from "../client";

const ENTITIES_DIR = join(process.cwd(), "context/entities");
const INDEX_PATH = join(ENTITIES_DIR, ".index.json");

// Type mapping from old format to new format
const TYPE_MAP: Record<string, string> = {
  person: "person",
  org: "company", // Map org -> company
  group: "group",
  company: "company",
};

interface LegacyEntity {
  name: string;
  type: string;
  aliases?: string[];
  email?: string | null;
  telegram?: string | null;
  sources?: {
    deal?: string | null;
    calls?: string[];
    entity_file?: string | null;
    telegram_log?: string | null;
  };
}

interface LegacyIndex {
  generated: string;
  entities: Record<string, LegacyEntity>;
  lookups: {
    telegram: Record<string, string>;
    email: Record<string, string>;
  };
}

export interface ExtractResult {
  entitiesCreated: number;
  entitiesUpdated: number;
  aliasesCreated: number;
  errors: string[];
}

/**
 * Import entities from .index.json
 */
async function importFromIndexJson(): Promise<ExtractResult> {
  const result: ExtractResult = {
    entitiesCreated: 0,
    entitiesUpdated: 0,
    aliasesCreated: 0,
    errors: [],
  };

  if (!existsSync(INDEX_PATH)) {
    console.log("No .index.json found, skipping legacy import");
    return result;
  }

  const indexData: LegacyIndex = JSON.parse(readFileSync(INDEX_PATH, "utf-8"));
  console.log(`Found ${Object.keys(indexData.entities).length} entities in .index.json`);

  for (const [slug, entity] of Object.entries(indexData.entities)) {
    try {
      const mappedType = TYPE_MAP[entity.type] || entity.type;

      // Check if entity already exists
      const existing = await queryOne<{ slug: string }>(
        "SELECT slug FROM entities WHERE slug = $1",
        [slug]
      );

      if (existing) {
        // Update existing entity
        await query(
          `UPDATE entities SET
            name = $2,
            type = $3,
            email = COALESCE($4, email),
            telegram = COALESCE($5, telegram),
            source = COALESCE(source, 'manual'),
            last_activity = NOW()
          WHERE slug = $1`,
          [
            slug,
            entity.name,
            mappedType,
            entity.email || null,
            entity.telegram || null,
          ]
        );
        result.entitiesUpdated++;
      } else {
        // Insert new entity
        await query(
          `INSERT INTO entities (slug, name, type, email, telegram, source, confidence)
           VALUES ($1, $2, $3, $4, $5, 'manual', 1.0)`,
          [
            slug,
            entity.name,
            mappedType,
            entity.email || null,
            entity.telegram || null,
          ]
        );
        result.entitiesCreated++;
      }

      // Import aliases
      if (entity.aliases && entity.aliases.length > 0) {
        for (const alias of entity.aliases) {
          const aliasId = `${slug}-alias-${alias.toLowerCase().replace(/\s+/g, "-")}`;

          // Check if alias already exists
          const existingAlias = await queryOne(
            "SELECT id FROM entity_aliases WHERE id = $1",
            [aliasId]
          );

          if (!existingAlias) {
            await query(
              `INSERT INTO entity_aliases (id, entity_slug, alias, alias_type, confidence)
               VALUES ($1, $2, $3, 'nickname', 1.0)
               ON CONFLICT (id) DO NOTHING`,
              [aliasId, slug, alias]
            );
            result.aliasesCreated++;
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Entity ${slug}: ${error.message}`);
    }
  }

  return result;
}

/**
 * Import entities from markdown files in people/orgs folders
 */
async function importFromFiles(): Promise<ExtractResult> {
  const result: ExtractResult = {
    entitiesCreated: 0,
    entitiesUpdated: 0,
    aliasesCreated: 0,
    errors: [],
  };

  const folders = [
    { path: join(ENTITIES_DIR, "people"), type: "person" },
    { path: join(ENTITIES_DIR, "orgs"), type: "company" },
  ];

  for (const { path: folderPath, type } of folders) {
    if (!existsSync(folderPath)) continue;

    const files = readdirSync(folderPath).filter(
      (f) => f.endsWith(".md") && !f.startsWith(".")
    );

    for (const file of files) {
      try {
        const filePath = join(folderPath, file);
        const content = readFileSync(filePath, "utf-8");
        const slug = file.replace(".md", "");

        // Parse frontmatter if exists
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        let email: string | null = null;
        let telegram: string | null = null;

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
          const emailMatch = frontmatter.match(/^email:\s*(.+)$/m);
          const telegramMatch = frontmatter.match(/^telegram:\s*@?(.+)$/m);

          if (nameMatch) name = nameMatch[1].trim();
          if (emailMatch) email = emailMatch[1].trim();
          if (telegramMatch) telegram = telegramMatch[1].trim();
        }

        // Check if entity already exists
        const existing = await queryOne<{ slug: string }>(
          "SELECT slug FROM entities WHERE slug = $1",
          [slug]
        );

        if (existing) {
          // Update with file path
          await query(
            `UPDATE entities SET
              file_path = $2,
              email = COALESCE($3, email),
              telegram = COALESCE($4, telegram)
            WHERE slug = $1`,
            [slug, filePath, email, telegram]
          );
          result.entitiesUpdated++;
        } else {
          // Insert new entity from file
          await query(
            `INSERT INTO entities (slug, name, type, email, telegram, file_path, source, confidence)
             VALUES ($1, $2, $3, $4, $5, $6, 'manual', 1.0)`,
            [slug, name, type, email, telegram, filePath]
          );
          result.entitiesCreated++;
        }
      } catch (error: any) {
        result.errors.push(`File ${file}: ${error.message}`);
      }
    }
  }

  return result;
}

/**
 * Update interaction counts for all entities
 */
async function updateInteractionCounts(): Promise<void> {
  await query(`
    UPDATE entities e SET
      interaction_count = (
        SELECT COUNT(*)
        FROM interactions i
        WHERE i.participants ? e.slug
      )
  `);
}

/**
 * Main extraction function
 */
export async function extractEntities(): Promise<ExtractResult> {
  console.log("\n=== Extracting Entities ===\n");

  // Import from .index.json first (primary source)
  const indexResult = await importFromIndexJson();
  console.log(`From .index.json: ${indexResult.entitiesCreated} created, ${indexResult.entitiesUpdated} updated, ${indexResult.aliasesCreated} aliases`);

  // Then import from files (may update existing)
  const fileResult = await importFromFiles();
  console.log(`From files: ${fileResult.entitiesCreated} created, ${fileResult.entitiesUpdated} updated`);

  // Update interaction counts
  await updateInteractionCounts();
  console.log("Updated interaction counts");

  // Combine results
  return {
    entitiesCreated: indexResult.entitiesCreated + fileResult.entitiesCreated,
    entitiesUpdated: indexResult.entitiesUpdated + fileResult.entitiesUpdated,
    aliasesCreated: indexResult.aliasesCreated + fileResult.aliasesCreated,
    errors: [...indexResult.errors, ...fileResult.errors],
  };
}

// Run if executed directly
if (import.meta.main) {
  const { closePool } = await import("../client");

  try {
    const result = await extractEntities();
    console.log("\n=== Results ===");
    console.log(`Entities created: ${result.entitiesCreated}`);
    console.log(`Entities updated: ${result.entitiesUpdated}`);
    console.log(`Aliases created: ${result.aliasesCreated}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
  } finally {
    await closePool();
  }
}
