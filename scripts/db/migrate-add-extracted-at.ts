#!/usr/bin/env bun
/**
 * Migration: Add extracted_at column to extracted_items
 *
 * This column tracks when an item was extracted by LLM.
 */

import { query, isConnected, getConnectionInfo } from "./client.ts";

async function migrate() {
  console.log("==================================================");
  console.log("Migration: Add extracted_at to extracted_items");
  console.log("==================================================\n");

  // Check connection
  console.log(`Connecting to: ${getConnectionInfo()}`);
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Cannot connect to database. Is PostgreSQL running?");
  }
  console.log("✓ Connected\n");

  // Add extracted_at column
  console.log("Adding extracted_at column...");
  await query(`
    ALTER TABLE extracted_items
    ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);
  console.log("✓ Added extracted_at column\n");

  console.log("Migration completed successfully!");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
