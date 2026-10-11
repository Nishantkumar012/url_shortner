import crypto from "crypto";

/**
 * Utilities for unique visitor tracking via first-party anonymous tokens.
 *
 * Strategy:
 * - Frontend generates and stores a UUID v4 token in localStorage
 * - Token is sent to backend via custom header on redirect
 * - Backend hashes the token and stores it with each analytics record
 * - Per-URL per-day unique count: GROUP BY visitorToken with COUNT(DISTINCT ...)
 *
 * Privacy:
 * - No personally identifiable information collected
 * - Tokens are hashed before storage (one-way function)
 * - No IP addresses linked to tokens
 */

/**
 * Hash a visitor token for storage.
 * Uses SHA-256 to create a one-way hash of the token value.
 * This prevents raw tokens from being readable in the database.
 */
export function hashVisitorToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate a visitor token format (should be a UUID v4).
 * Expected format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function isValidVisitorToken(token: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(token);
}

