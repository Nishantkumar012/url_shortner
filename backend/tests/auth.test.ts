/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  registerUser,
  loginUser,
  logOut,
} from "../src/modules/auth/authService";

import { prisma } from "../src/utils/prisma";
import {
  hashPassword,
  verifyPassword,
} from "../src/utils/password";

import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyHashToken,
} from "../src/utils/jwt";

/* -------------------------------------------------------------------------- */
/*                                  MOCKS                                     */
/* -------------------------------------------------------------------------- */

vi.mock("../src/utils/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("../src/utils/jwt", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  hashToken: vi.fn(),
  verifyHashToken: vi.fn(),
}));

vi.mock("../src/utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshTokens: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockUser = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
  isVerified: true,
  createdAt: new Date(),
};

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hashPassword).mockResolvedValue("hashedPassword");

    vi.mocked(verifyPassword).mockResolvedValue(true);

    vi.mocked(signAccessToken).mockReturnValue("access-token");

    vi.mocked(signRefreshToken).mockReturnValue("refresh-token");

    vi.mocked(hashToken).mockResolvedValue("hashed-refresh-token");

    vi.mocked(verifyHashToken).mockResolvedValue(true);
  });

  it("should register a new user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

    vi.mocked(prisma.refreshTokens.create).mockResolvedValue({} as any);

    const input = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
    };

    const result = await registerUser(input);

    expect(hashPassword).toHaveBeenCalledWith(input.password);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: input.email,
      },
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: "hashedPassword",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    expect(signAccessToken).toHaveBeenCalledWith(mockUser.id);

    expect(signRefreshToken).toHaveBeenCalledWith(mockUser.id);

    expect(hashToken).toHaveBeenCalledWith("refresh-token");

    expect(prisma.refreshTokens.create).toHaveBeenCalled();

    expect(result.user.email).toBe(input.email);

    expect(result.accessToken).toBe("access-token");

    expect(result.refreshToken).toBe("refresh-token");
  });

  it("should throw if email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await expect(
      registerUser({
        name: "John",
        email: "john@example.com",
        password: "Password123!",
      })
    ).rejects.toThrow("Email is already registered");

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("should login successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      passwordHash: "hashedPassword",
    } as any);

    vi.mocked(prisma.refreshTokens.create).mockResolvedValue({} as any);

    const result = await loginUser({
      email: "john@example.com",
      password: "Password123!",
    });

    expect(verifyPassword).toHaveBeenCalledWith(
      "Password123!",
      "hashedPassword"
    );

    expect(signAccessToken).toHaveBeenCalledWith(mockUser.id);

    expect(signRefreshToken).toHaveBeenCalledWith(mockUser.id);

    expect(result.user.email).toBe(mockUser.email);

    expect(result.accessToken).toBe("access-token");

    expect(result.refreshToken).toBe("refresh-token");
  });

  it("should fail login when password is incorrect", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      passwordHash: "hashedPassword",
    } as any);

    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      loginUser({
        email: "john@example.com",
        password: "WrongPassword",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should fail login when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      loginUser({
        email: "abc@test.com",
        password: "Password123!",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should logout successfully", async () => {
    vi.mocked(prisma.refreshTokens.findMany).mockResolvedValue([
      {
        id: "token-id",
        userId: mockUser.id,
        tokenHash: "hashed-refresh-token",
        revoke: false,
      },
    ] as any);

    vi.mocked(prisma.refreshTokens.update).mockResolvedValue({} as any);

    await logOut(mockUser.id, "refresh-token");

    expect(prisma.refreshTokens.update).toHaveBeenCalledWith({
      where: {
        id: "token-id",
      },
      data: {
        revoke: true,
      },
    });
  });

  it("should do nothing if refresh token is invalid", async () => {
    vi.mocked(prisma.refreshTokens.findMany).mockResolvedValue([
      {
        id: "token-id",
        userId: mockUser.id,
        tokenHash: "hashed-refresh-token",
        revoke: false,
      },
    ] as any);

    vi.mocked(verifyHashToken).mockResolvedValue(false);

    await logOut(mockUser.id, "invalid-token");

    expect(prisma.refreshTokens.update).not.toHaveBeenCalled();
  });
});