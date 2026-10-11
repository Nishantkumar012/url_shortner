/**
 * Visitor token management for analytics.
 *
 * Generates a unique UUID v4 token stored in a first-party cookie.
 * This token is used to track unique visitors across multiple clicks.
 */

/**
 * Generate a UUID v4 token.
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a visitor token stored in localStorage.
 * Returns the existing token if valid, or generates a new one.
 */
export function getVisitorToken(): string {
  const STORAGE_KEY = "snaplink_visitor_token";

  let token = localStorage.getItem(STORAGE_KEY);

  if (!token || !isValidUUID(token)) {
    token = generateUUID();
    localStorage.setItem(STORAGE_KEY, token);
  }

  return token;
}

/**
 * Validate UUID v4 format.
 */
function isValidUUID(token: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(token);
}

/**
 * Attach visitor token to request headers (for API calls).
 * The token is sent via a custom header that the backend can read from cookies.
 */
export function attachVisitorToken(headers: Record<string, string>): Record<string, string> {
  const token = getVisitorToken();
  // Send as a custom header that the redirect endpoint can use
  return {
    ...headers,
    "x-visitor-token": token,
  };
}
