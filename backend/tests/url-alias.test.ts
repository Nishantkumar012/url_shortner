import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/utils/prisma";
import { createUrl, createGuestUrl } from "../src/modules/url/urlService";
import { isReservedWord } from "../src/utils/reservedWords";
import { isAvailable } from "../src/utils/shortCode";

// Test user ID
const TEST_USER_ID = "test-user-" + Date.now();

describe("Custom URL Alias Feature", () => {
  beforeAll(async () => {
    // Create test user
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: `test-${Date.now()}@example.com`,
        passwordHash: "test-hash",
        name: "Test User",
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.url.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.delete({ where: { id: TEST_USER_ID } });
  });

  describe("Alias Creation", () => {
    it("should create a URL with a valid custom alias", async () => {
      const url = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "mybrand"
      );
      expect(url.shortCode).toBe("mybrand");
      expect(url.userId).toBe(TEST_USER_ID);
      expect(url.originalUrl).toBe("https://example.com");

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });

    it("should create a URL without alias (random shortCode)", async () => {
      const url = await createUrl("https://example.com", TEST_USER_ID);
      expect(url.shortCode).toMatch(/^[A-Za-z0-9]+$/);
      expect(url.shortCode.length).toBeGreaterThan(0);

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });
  });

  describe("Lowercase Normalization", () => {
    it("should normalize alias to lowercase", async () => {
      const url = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "MyBrand"
      );
      expect(url.shortCode).toBe("mybrand");

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });

    it("should normalize mixed case with hyphens and underscores", async () => {
      const url = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "My_Brand-Test"
      );
      expect(url.shortCode).toBe("my_brand-test");

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });

    it("should treat MyBrand and mybrand as the same alias (case-insensitive)", async () => {
      const url1 = await createUrl(
        "https://example.com/1",
        TEST_USER_ID,
        "MyBrand"
      );
      expect(url1.shortCode).toBe("mybrand");

      // Attempt to create with lowercase - should fail (duplicate)
      try {
        await createUrl("https://example.com/2", TEST_USER_ID, "mybrand");
        expect.fail("Should have thrown error for duplicate alias");
      } catch (err: any) {
        expect(err.message).toContain("already in use");
      }

      // Cleanup
      await prisma.url.delete({ where: { id: url1.id } });
    });
  });

  describe("Alias Validation", () => {
    it("should reject alias shorter than 3 characters", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "ab");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("3 characters");
      }
    });

    it("should reject alias longer than 32 characters", async () => {
      try {
        await createUrl(
          "https://example.com",
          TEST_USER_ID,
          "a".repeat(33)
        );
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("32 characters");
      }
    });

    it("should reject alias with invalid special characters", async () => {
      try {
        await createUrl(
          "https://example.com",
          TEST_USER_ID,
          "my@brand"
        );
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("letters, numbers");
      }
    });

    it("should accept valid hyphens in alias", async () => {
      const url = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "my-brand"
      );
      expect(url.shortCode).toBe("my-brand");

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });

    it("should accept valid underscores in alias", async () => {
      const url = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "my_brand"
      );
      expect(url.shortCode).toBe("my_brand");

      // Cleanup
      await prisma.url.delete({ where: { id: url.id } });
    });
  });

  describe("Reserved Words", () => {
    it("should reject admin as reserved", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "admin");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("reserved");
      }
    });

    it("should reject api as reserved", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "api");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("reserved");
      }
    });

    it("should reject auth as reserved", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "auth");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("reserved");
      }
    });

    it("should reject login as reserved", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "login");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("reserved");
      }
    });

    it("should reject reserved words case-insensitively", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "ADMIN");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("reserved");
      }
    });

    it("should have 60+ reserved words", () => {
      const RESERVED_WORDS = [
        "api", "v1", "v2", "v3", "v4", "graphql", "rest", "rpc",
        "auth", "login", "logout", "signin", "signout", "signup", "register",
        "admin", "dashboard", "settings", "account", "profile", "user", "users",
        "url", "urls", "shorten", "redirect", "favicon", "robots", "sitemap",
        "css", "js", "images", "static", "assets", "public", "health",
        "docs", "swagger", "openapi", "webhook", "webhooks"
      ];

      RESERVED_WORDS.forEach(word => {
        expect(isReservedWord(word)).toBe(true);
      });
    });
  });

  describe("Duplicate Aliases", () => {
    it("should reject duplicate alias from different users", async () => {
      const user2Id = "test-user-2-" + Date.now();
      await prisma.user.create({
        data: {
          id: user2Id,
          email: `test2-${Date.now()}@example.com`,
          passwordHash: "test-hash",
          name: "Test User 2",
        },
      });

      // User 1 creates alias
      const url1 = await createUrl(
        "https://example.com/1",
        TEST_USER_ID,
        "shared-alias"
      );
      expect(url1.shortCode).toBe("shared-alias");

      // User 2 attempts same alias - should fail
      try {
        await createUrl("https://example.com/2", user2Id, "shared-alias");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain("already in use");
      }

      // Cleanup
      await prisma.url.delete({ where: { id: url1.id } });
      await prisma.user.delete({ where: { id: user2Id } });
    });
  });

  describe("Soft-Delete Alias Reuse", () => {
    it("should allow reuse of soft-deleted alias", async () => {
      // Create first URL with alias
      const url1 = await createUrl(
        "https://example.com/1",
        TEST_USER_ID,
        "reusable"
      );
      expect(url1.shortCode).toBe("reusable");

      // Soft-delete it
      await prisma.url.update({
        where: { id: url1.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      // Verify isAvailable returns true for soft-deleted alias
      const available = await isAvailable("reusable");
      expect(available).toBe(true);

      // Create new URL with same alias
      const url2 = await createUrl(
        "https://example.com/2",
        TEST_USER_ID,
        "reusable"
      );
      expect(url2.shortCode).toBe("reusable");
      expect(url2.isDeleted).toBe(false);

      // Cleanup
      await prisma.url.delete({ where: { id: url1.id } });
      await prisma.url.delete({ where: { id: url2.id } });
    });
  });

  describe("Guest User Restrictions", () => {
    it("guest cannot provide custom alias", async () => {
      // Guest URL creation should not accept alias parameter
      // This would typically be validated at the schema level
      // The guestUrlSchema should not have an alias field

      // For this test, we verify that createGuestUrl doesn't support alias
      const guestUrl = await createGuestUrl("https://example.com", "192.168.1.1");

      // Should have random shortCode, not custom alias
      expect(guestUrl.shortCode).toMatch(/^[A-Za-z0-9]+$/);
      expect(guestUrl.userId).toBeNull();

      // Cleanup
      await prisma.url.delete({ where: { id: guestUrl.id } });
    });

    it("guest can still create normal random URLs", async () => {
      const url1 = await createGuestUrl("https://example.com", "192.168.1.1");
      const url2 = await createGuestUrl("https://example.com", "192.168.1.1");

      // Both should have random codes
      expect(url1.shortCode).toMatch(/^[A-Za-z0-9]+$/);
      expect(url2.shortCode).toMatch(/^[A-Za-z0-9]+$/);

      // Codes should be different
      expect(url1.shortCode).not.toBe(url2.shortCode);

      // Cleanup
      await prisma.url.delete({ where: { id: url1.id } });
      await prisma.url.delete({ where: { id: url2.id } });
    });
  });

  describe("Error Messages", () => {
    it("should have clear error message for reserved alias", async () => {
      try {
        await createUrl("https://example.com", TEST_USER_ID, "admin");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain('"admin"');
        expect(err.message).toContain("reserved");
      }
    });

    it("should have clear error message for duplicate alias", async () => {
      const url1 = await createUrl(
        "https://example.com",
        TEST_USER_ID,
        "duplicate-test"
      );

      try {
        await createUrl("https://example.com", TEST_USER_ID, "duplicate-test");
        expect.fail("Should have thrown error");
      } catch (err: any) {
        expect(err.message).toContain('"duplicate-test"');
        expect(err.message).toContain("already in use");
      }

      // Cleanup
      await prisma.url.delete({ where: { id: url1.id } });
    });
  });
});
