#!/usr/bin/env bun
/**
 * Initialize Context Graph Database
 *
 * Usage: bun scripts/db/init.ts [--reset]
 *
 * Options:
 *   --reset    Drop all tables and recreate schema
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPool, query, isConnected, closePool, getConnectionInfo } from "./client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(__dirname, "schema.sql");

async function checkConnection(): Promise<boolean> {
  console.log(`\nConnecting to: ${getConnectionInfo()}`);

  const connected = await isConnected();
  if (!connected) {
    console.error("ERROR: Cannot connect to PostgreSQL");
    console.error("Make sure the database is running:");
    console.error("  cd scripts/db && docker compose up -d");
    return false;
  }

  console.log("Connected to PostgreSQL");
  return true;
}

async function dropAllTables(): Promise<void> {
  console.log("\nDropping existing tables...");

  // Get all tables
  const tables = await query<{ tablename: string }>(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  `);

  if (tables.rows.length === 0) {
    console.log("No tables to drop");
    return;
  }

  // Drop all tables with CASCADE
  for (const table of tables.rows) {
    await query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
    console.log(`  Dropped: ${table.tablename}`);
  }

  // Drop views
  const views = await query<{ viewname: string }>(`
    SELECT viewname FROM pg_views
    WHERE schemaname = 'public'
  `);

  for (const view of views.rows) {
    await query(`DROP VIEW IF EXISTS "${view.viewname}" CASCADE`);
    console.log(`  Dropped view: ${view.viewname}`);
  }

  // Drop functions
  const functions = [
    "update_entity_search_vector",
    "update_interaction_search_vector",
    "update_research_search_vector",
    "update_content_search_vector",
    "generate_slug",
    "find_entity",
  ];

  for (const fn of functions) {
    await query(`DROP FUNCTION IF EXISTS ${fn} CASCADE`);
  }
  console.log("  Dropped functions");
}

async function runSchema(): Promise<void> {
  console.log("\nRunning schema.sql via psql...");

  // Use psql directly to handle complex SQL with $$ delimited functions
  const { spawn } = await import("child_process");

  return new Promise((resolve, reject) => {
    const psql = spawn("docker", [
      "exec",
      "-i",
      "cybos-postgres",
      "psql",
      "-U",
      "cybos",
      "-d",
      "cybos",
      "-f",
      "-", // Read from stdin
    ]);

    const schema = readFileSync(SCHEMA_PATH, "utf-8");
    let stderr = "";
    let stdout = "";

    psql.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    psql.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    psql.on("close", (code) => {
      if (code !== 0) {
        console.error("psql stderr:", stderr);
        reject(new Error(`psql exited with code ${code}`));
      } else {
        // Count successful operations from stdout
        const creates = (stdout.match(/CREATE/g) || []).length;
        const notices = (stdout.match(/NOTICE/g) || []).length;
        console.log(`Schema executed: ${creates} operations, ${notices} notices`);
        resolve();
      }
    });

    psql.stdin.write(schema);
    psql.stdin.end();
  });
}

async function verifySchema(): Promise<boolean> {
  console.log("\nVerifying schema...");

  const expectedTables = [
    "files",
    "entities",
    "entity_aliases",
    "interactions",
    "extracted_items",
    "relationships",
    "deals",
    "research",
    "content",
    "batch_runs",
    "sessions",
  ];

  const result = await query<{ tablename: string }>(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  const tables = result.rows.map((r) => r.tablename);

  let allPresent = true;
  for (const expected of expectedTables) {
    if (tables.includes(expected)) {
      console.log(`  ✓ ${expected}`);
    } else {
      console.log(`  ✗ ${expected} MISSING`);
      allPresent = false;
    }
  }

  // Check views
  const views = await query<{ viewname: string }>(`
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
  `);
  const viewNames = views.rows.map((r) => r.viewname);

  console.log("\nViews:");
  for (const view of ["pending_items", "entity_context"]) {
    if (viewNames.includes(view)) {
      console.log(`  ✓ ${view}`);
    } else {
      console.log(`  ✗ ${view} MISSING`);
      allPresent = false;
    }
  }

  // Check extensions
  const extensions = await query<{ extname: string }>(`
    SELECT extname FROM pg_extension WHERE extname IN ('vector', 'pg_trgm')
  `);
  const extNames = extensions.rows.map((r) => r.extname);

  console.log("\nExtensions:");
  for (const ext of ["vector", "pg_trgm"]) {
    if (extNames.includes(ext)) {
      console.log(`  ✓ ${ext}`);
    } else {
      console.log(`  ✗ ${ext} MISSING`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");

  console.log("=== Context Graph Database Initialization ===");

  // Check connection
  if (!(await checkConnection())) {
    process.exit(1);
  }

  // Reset if requested
  if (reset) {
    console.log("\n⚠️  RESET MODE: Dropping all tables...");
    await dropAllTables();
  }

  // Run schema
  await runSchema();

  // Verify
  const valid = await verifySchema();

  if (valid) {
    console.log("\n✅ Database initialized successfully");
  } else {
    console.log("\n❌ Database initialization incomplete");
    process.exit(1);
  }

  await closePool();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
