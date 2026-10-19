import { describe, it, expect, beforeEach } from "vitest";
import { hashVisitorToken, isValidVisitorToken } from "../../utils/visitorToken";
import { getCountry, detectCountryFromHeaders } from "../../utils/geoip";

describe("Visitor Token Utilities", () => {
  describe("hashVisitorToken", () => {
    it("should hash a valid UUID v4 token", () => {
      const token = "550e8400-e29b-41d4-a716-446655440000";
      const hash = hashVisitorToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 hex is 64 chars
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should produce consistent hashes", () => {
      const token = "550e8400-e29b-41d4-a716-446655440000";
      const hash1 = hashVisitorToken(token);
      const hash2 = hashVisitorToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const token1 = "550e8400-e29b-41d4-a716-446655440000";
      const token2 = "550e8400-e29b-41d4-a716-446655440001";
      const hash1 = hashVisitorToken(token1);
      const hash2 = hashVisitorToken(token2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("isValidVisitorToken", () => {
    it("should validate a correct UUID v4 token", () => {
      const validTokens = [
        "550e8400-e29b-41d4-a716-446655440000",
        "123e4567-e89b-12d3-a456-426614174000",
      ];

      validTokens.forEach((token) => {
        expect(isValidVisitorToken(token)).toBe(true);
      });
    });

    it("should reject invalid tokens", () => {
      const invalidTokens = [
        "not-a-token",
        "550e8400-e29b-31d4-a716-446655440000", // wrong version (3 instead of 4)
        "550e8400-e29b-41d4-c716-446655440000", // wrong variant (c instead of 8-b)
        "",
        "550e8400-e29b-41d4-a716",
      ];

      invalidTokens.forEach((token) => {
        expect(isValidVisitorToken(token)).toBe(false);
      });
    });
  });
});

describe("Geolocation Utilities", () => {
  describe("detectCountryFromHeaders", () => {
    it("should detect country from cf-country header (Cloudflare)", () => {
      const headers = { "cf-country": "US" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("US");
    });

    it("should detect country from x-vercel-geo-country header", () => {
      const headers = { "x-vercel-geo-country": "GB" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("GB");
    });

    it("should detect country from cloudfront-viewer-country header", () => {
      const headers = { "cloudfront-viewer-country": "CA" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("CA");
    });

    it("should normalize to uppercase", () => {
      const headers = { "cf-country": "de" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("DE");
    });

    it("should return Unknown when no headers match", () => {
      const headers = { "user-agent": "Mozilla/5.0" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("Unknown");
    });

    it("should return Unknown for invalid country codes", () => {
      const headers = { "cf-country": "INVALID" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("Unknown");
    });

    it("should prioritize cf-country header", () => {
      const headers = {
        "cf-country": "US",
        "x-vercel-geo-country": "GB",
      };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("US");
    });

    it("should handle case-insensitive header names", () => {
      const headers = { "CF-Country": "FR" };
      const country = detectCountryFromHeaders(headers);

      expect(country).toBe("FR");
    });
  });

  describe("getCountry", () => {
    it("should return a location object with country", () => {
      const headers = { "cf-country": "JP" };
      const result = getCountry(headers);

      expect(result).toHaveProperty("country");
      expect(result.country).toBe("JP");
    });

    it("should return Unknown for empty headers", () => {
      const result = getCountry({});

      expect(result.country).toBe("Unknown");
    });
  });
});

describe("Analytics Integration", () => {
  describe("Unique visitor deduplication", () => {
    it("should count the same visitor token only once per URL per day", () => {
      // This would test the database aggregation in a real test
      // For now, we just verify the hashing is deterministic
      const token = "550e8400-e29b-41d4-a716-446655440000";
      const hash1 = hashVisitorToken(token);
      const hash2 = hashVisitorToken(token);

      expect(hash1).toBe(hash2);
      // In real database: SELECT COUNT(DISTINCT visitor_token) should return 1
    });
  });

  describe("Country and analytics correlation", () => {
    it("should correctly map multiple countries from headers", () => {
      const testCases = [
        { headers: { "cf-country": "US" }, expected: "US" },
        { headers: { "cf-country": "IN" }, expected: "IN" },
        { headers: { "cf-country": "BR" }, expected: "BR" },
        { headers: {}, expected: "Unknown" },
      ];

      testCases.forEach(({ headers, expected }) => {
        const result = getCountry(headers);
        expect(result.country).toBe(expected);
      });
    });
  });
});
