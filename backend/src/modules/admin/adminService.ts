import { prisma } from "../../utils/prisma";
import { env } from "../../config/env";
import { signAdminToken } from "../../utils/adminToken";
import { AppError } from "../../common/error";
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

// ── Timing-safe credential compare ──────────────────────────────────────────
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    // Run the comparison anyway to keep timing consistent.
    crypto.timingSafeEqual(
      Buffer.alloc(bufA.length),
      bufB,
    );
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Admin login ─────────────────────────────────────────────────────────────
export function adminLogin(
  username: string | undefined,
  password: string | undefined,
  clientIp: string,
) {
  if (isRateLimited(clientIp)) {
    throw new AppError(
      429,
      "Too many failed attempts. Please try again later.",
    );
  }

  if (
    !username ||
    !password ||
    !safeCompare(username, env.ADMIN_USERNAME) ||
    !safeCompare(password, env.ADMIN_PASSWORD)
  ) {
    recordFailedAttempt(clientIp);
    throw new AppError(401, "Invalid admin credentials");
  }

  clearFailedAttempts(clientIp);

  const token = signAdminToken();

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
