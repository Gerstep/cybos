/**
 * Database Client for Context Graph
 *
 * Shared connection pool for PostgreSQL.
 * Uses environment variables for configuration with sensible defaults.
 * Supports DATABASE_URL for single-string configuration.
 */

import { Pool, type PoolConfig, type QueryResult } from "pg";

const connectionString = process.env.DATABASE_URL;

// Connection configuration
const config: PoolConfig = {
  ...(connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || "localhost",
        port: parseInt(process.env.PGPORT || "5433"), // 5433 to avoid conflict with local postgres
        database: process.env.PGDATABASE || "cybos",
        user: process.env.PGUSER || "cybos",
        password: process.env.PGPASSWORD || "cybos_dev",
      }),

  // Pool settings
  max: 10, // Max connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail connection after 5s
};

// Create singleton pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(config);

    // Log connection errors
    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err);
    });
  }
  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = getPool();
  const start = Date.now();
  const result = await client.query<T>(text, params);
  const duration = Date.now() - start;

  // Log slow queries (> 100ms) in development
  if (duration > 100 && process.env.NODE_ENV !== "production") {
    console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
  }

  return result;
}

/**
 * Get a single row from a query
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Get all rows from a query
 */
export async function queryAll<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  fn: (client: Pool) => Promise<T>
): Promise<T> {
  const client = getPool();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Check if database is reachable
 */
export async function isConnected(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get database connection info
 */
export function getConnectionInfo(): string {
  if (connectionString) {
    try {
      const url = new URL(connectionString);
      return `postgresql://${url.username}@${url.hostname}:${url.port}${url.pathname}`;
    } catch {
      return connectionString;
    }
  }
  return `postgresql://${config.user}@${config.host}:${config.port}/${config.database}`;
}

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Default export for convenience
export default {
  getPool,
  query,
  queryOne,
  queryAll,
  transaction,
  isConnected,
  getConnectionInfo,
  closePool,
};
