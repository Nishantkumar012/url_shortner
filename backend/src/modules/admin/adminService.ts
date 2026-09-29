import { prisma } from "../../utils/prisma";
import { env } from "../../config/env";
import { signAdminToken } from "../../utils/adminToken";
import { AppError } from "../../common/error";
import { verifyPassword } from "../../utils/password";
import crypto from "crypto";

// ── Brute-force protection (in-memory) ──────────────────────────────────────
// Max 5 failed attempts per IP per 15-minute window. Resets on success.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const failedAttempts = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    failedAttempts.set(ip, { count: 0, windowStart: now });
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, windowStart: now });
    return;
  }

  record.count += 1;
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

// ── Admin login ─────────────────────────────────────────────────────────────
export async function adminLogin(
  email: string | undefined,
  password: string | undefined,
  clientIp: string,
) {
  if (isRateLimited(clientIp)) {
    throw new AppError(
      429,
      "Too many failed attempts. Please try again later.",
    );
  }

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    recordFailedAttempt(clientIp);
    throw new AppError(401, "Invalid credentials");
  }

  // Fetch user from database by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      role: true,
    },
  });

  // User doesn't exist or password is wrong
  if (!user) {
    recordFailedAttempt(clientIp);
    throw new AppError(401, "Invalid credentials");
  }

  // Verify password
  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
  if (!isPasswordCorrect) {
    recordFailedAttempt(clientIp);
    throw new AppError(401, "Invalid credentials");
  }

  // Check if user has ADMIN role
  if (user.role !== "ADMIN") {
    recordFailedAttempt(clientIp);
    throw new AppError(403, "Admin access required");
  }

  clearFailedAttempts(clientIp);

  // Generate admin token with userId included
  const token = signAdminToken(user.id);

  return { token };
}

// ── Data queries ────────────────────────────────────────────────────────────
export async function getStats() {
  const [totalUsers, totalLinks, clickSum] = await Promise.all([
    prisma.user.count(),
    prisma.url.count(),
    prisma.url.aggregate({ _sum: { clickCount: true } }),
  ]);

  return {
    totalUsers,
    totalLinks,
    totalClicks: clickSum._sum.clickCount ?? 0,
  };
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { urls: true } },
    },
  });

  // Per-user total clicks in one query instead of N.
  const clicks = await prisma.url.groupBy({
    by: ["userId"],
    _sum: { clickCount: true },
  });

  const clickMap = new Map(
    clicks.map((c) => [c.userId, c._sum.clickCount ?? 0]),
  );

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    urlCount: u._count.urls,
    totalClicks: clickMap.get(u.id) ?? 0,
  }));
}

export async function getAllUrls() {
  return prisma.url.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
      clickCount: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}

export async function getUserUrls(userId: string) {
  // First verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Fetch all URLs for this specific user
  return prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
      clickCount: true,
      createdAt: true,
      isDeleted: true,
    },
  });
}
