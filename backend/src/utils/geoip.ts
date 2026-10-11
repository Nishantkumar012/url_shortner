/**
 * Geolocation utilities for analytics.
 *
 * Attempts to detect visitor country from:
 * 1. Trusted headers (Vercel, AWS CloudFront, etc.)
 * 2. Falls back to "Unknown" if not available
 *
 * Future: Add optional MaxMind GeoLite2 for self-hosted deployments.
 */

export interface GeoLocation {
  country: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB") or "Unknown"
}

/**
 * Extract country from trusted headers set by hosting platforms.
 *
 * Supported headers:
 * - cf-country: Cloudflare header
 * - x-forwarded-country: Generic forwarding header
 * - x-vercel-geo-country: Vercel header
 * - cloudfront-viewer-country: AWS CloudFront header
 */
export function detectCountryFromHeaders(
  headers: Record<string, string | string[] | undefined>
): string {
  const headerNames = [
    "cf-country",
    "x-forwarded-country",
    "x-vercel-geo-country",
    "cloudfront-viewer-country",
  ];

  for (const headerName of headerNames) {
    const value = headers[headerName.toLowerCase()];
    if (typeof value === "string" && value.length === 2) {
      // Validate it's a valid ISO country code (2 chars, uppercase)
      const code = value.toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        return code;
      }
    }
  }

  return "Unknown";
}

/**
 * Main entry point for geolocation detection.
 */
export function getCountry(
  headers: Record<string, string | string[] | undefined>
): GeoLocation {
  const country = detectCountryFromHeaders(headers);
  return { country };
}
