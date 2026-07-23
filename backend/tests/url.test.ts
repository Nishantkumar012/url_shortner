/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from "vitest";
import { Prisma } from "@prisma/client";

import {
  createUrl,
  updateUrl,
  deleteUrl,
} from "../src/modules/url/urlService";

import { redirectUrl } from "../src/modules/url/redirectService";

import { prisma } from "../src/utils/prisma";
import {
  generateUniqueShortCode,
  isAvailable,
} from "../src/utils/shortCode";
import { isReservedWord } from "../src/utils/reservedWords";

vi.mock("../src/utils/prisma", () => ({
  prisma: {
    url: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../src/utils/shortCode", () => ({
  generateUniqueShortCode: vi.fn(),
  isAvailable: vi.fn(),
}));

vi.mock("../src/utils/reservedWords", () => ({
  isReservedWord: vi.fn(),
}));

const mockUrl = {
  id: "url-1",
  shortCode: "abc123",
  originalUrl: "https://google.com",
  userId: "user-1",
  expiresAt: null,
  clickCount: 0,
};

describe("URL Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(generateUniqueShortCode).mockResolvedValue("abc123");
    vi.mocked(isAvailable).mockResolvedValue(true);
    vi.mocked(isReservedWord).mockReturnValue(false);
  });

  describe("createUrl", () => {
    it("should create url with generated shortcode", async () => {
      vi.mocked(prisma.url.create).mockResolvedValue(mockUrl as any);

      const result = await createUrl(
        "https://google.com",
        "user-1"
      );

      expect(generateUniqueShortCode).toHaveBeenCalled();

      expect(prisma.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: "https://google.com",
          shortCode: "abc123",
          userId: "user-1",
          expiresAt: null,
        },
      });

      expect(result).toEqual(mockUrl);
    });

    it("should create url using custom alias", async () => {
      vi.mocked(prisma.url.create).mockResolvedValue({
        ...mockUrl,
        shortCode: "myalias",
      } as any);

      const result = await createUrl(
        "https://google.com",
        "user-1",
        "myalias"
      );

      expect(isReservedWord).toHaveBeenCalledWith("myalias");
      expect(isAvailable).toHaveBeenCalledWith("myalias");

      expect(result.shortCode).toBe("myalias");
    });

    it("should throw when alias is reserved", async () => {
      vi.mocked(isReservedWord).mockReturnValue(true);

      await expect(
        createUrl(
          "https://google.com",
          "user-1",
          "admin"
        )
      ).rejects.toThrow("This alias is reserved");
    });

    it("should throw when alias already exists", async () => {
      vi.mocked(isAvailable).mockResolvedValue(false);

      await expect(
        createUrl(
          "https://google.com",
          "user-1",
          "google"
        )
      ).rejects.toThrow("This alias is already taken");
    });

    it("should create url with expiry", async () => {
      vi.mocked(prisma.url.create).mockResolvedValue(mockUrl as any);

      await createUrl(
        "https://google.com",
        "user-1",
        undefined,
        "15m"
      );

      expect(prisma.url.create).toHaveBeenCalled();
    });

    it("should retry on generated shortcode conflict", async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        "duplicate",
        {
          code: "P2002",
          clientVersion: "1",
        }
      );

      vi.mocked(prisma.url.create)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockUrl as any);

      vi.mocked(generateUniqueShortCode)
        .mockResolvedValueOnce("abc123")
        .mockResolvedValueOnce("xyz999");

      const result = await createUrl(
        "https://google.com",
        "user-1"
      );

      expect(result).toEqual(mockUrl);
      expect(generateUniqueShortCode).toHaveBeenCalledTimes(2);
    });

    it("should throw duplicate alias on P2002", async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        "duplicate",
        {
          code: "P2002",
          clientVersion: "1",
        }
      );

      vi.mocked(prisma.url.create).mockRejectedValue(error);

      await expect(
        createUrl(
          "https://google.com",
          "user-1",
          "alias"
        )
      ).rejects.toThrow("This alias is already taken");
    });
  });

  describe("updateUrl", () => {
    it("should update url", async () => {
      vi.mocked(prisma.url.findFirst).mockResolvedValue(mockUrl as any);

      vi.mocked(prisma.url.update).mockResolvedValue({
        ...mockUrl,
        originalUrl: "https://github.com",
      } as any);

      const result = await updateUrl(
        "abc123",
        "user-1",
        "https://github.com"
      );

      expect(result.originalUrl).toBe("https://github.com");
    });

    it("should throw when url not found", async () => {
      vi.mocked(prisma.url.findFirst).mockResolvedValue(null);

      await expect(
        updateUrl(
          "abc123",
          "user-1",
          "https://github.com"
        )
      ).rejects.toThrow("URL not found");
    });
  });

  describe("deleteUrl", () => {
    it("should delete url", async () => {
      vi.mocked(prisma.url.findFirst).mockResolvedValue(mockUrl as any);

      vi.mocked(prisma.url.delete).mockResolvedValue(mockUrl as any);

      const result = await deleteUrl(
        "abc123",
        "user-1"
      );

      expect(result).toEqual(mockUrl);
    });

    it("should throw when url not found", async () => {
      vi.mocked(prisma.url.findFirst).mockResolvedValue(null);

      await expect(
        deleteUrl(
          "abc123",
          "user-1"
        )
      ).rejects.toThrow("URL not found");
    });
  });
});

describe("Redirect Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect successfully", async () => {
    vi.mocked(prisma.url.findUnique).mockResolvedValue({
      originalUrl: "https://google.com",
      expiresAt: null,
      clickCount: 5,
    } as any);

    vi.mocked(prisma.url.update).mockResolvedValue({} as any);

    const result = await redirectUrl("abc123");

    expect(result).toBe("https://google.com");

    expect(prisma.url.update).toHaveBeenCalledWith({
      where: {
        shortCode: "abc123",
      },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  });

  it("should throw when url not found", async () => {
    vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

    await expect(
      redirectUrl("abc123")
    ).rejects.toThrow("URL not found");
  });

  it("should throw when url expired", async () => {
    vi.mocked(prisma.url.findUnique).mockResolvedValue({
      originalUrl: "https://google.com",
      expiresAt: new Date(Date.now() - 1000),
      clickCount: 0,
    } as any);

    await expect(
      redirectUrl("abc123")
    ).rejects.toThrow("URL expired");
  });
});