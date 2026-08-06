import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/error";
import { UAParser } from "ua-parser-js";

type Breakdown = Record<string, number>;

export interface AnalyticsSummary {
  total: number;
  totalUrls?: number;
  timeline: Record<string, number>;
  devices: Breakdown;
  browsers: Breakdown;
  oses: Breakdown;
  referrers: Breakdown;
  recent: RecentClick[];
}

interface RecentClick {
  time: string;
  browser: string;
  device: string;
  referrer: string;
}

// Group by UTC calendar day — consistent with the worker storing clickedAt
// as an ISO string (UTC).
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Empty referer = direct visit; otherwise surface the referring hostname.
function hostnameOf(referer: string | null): string {
  if (!referer) return "direct";
  try {
    return new URL(referer).hostname || "direct";
  } catch {
    // Not a parseable URL — keep the raw value so nothing is silently lost.
    return referer;
  }
}

// Turns raw analytics rows into the shape the client renders. UA parsing
// happens once here so the API returns counts, not raw user-agent strings.
function aggregate(
  rows: { createdAt: Date; userAgent: string | null; referer: string | null }[]
): Omit<AnalyticsSummary, "total" | "totalUrls"> {
  const timeline: Record<string, number> = {};
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const oses: Record<string, number> = {};
  const referrers: Record<string, number> = {};
  const recent: RecentClick[] = [];

  for (const row of rows) {
    const day = dayKey(row.createdAt);
    timeline[day] = (timeline[day] ?? 0) + 1;

    let device = "desktop";
    let browser = "Unknown";
    let os = "Unknown";
    if (row.userAgent) {
      const parsed = new UAParser(row.userAgent).getResult();
      device = parsed.device?.type || "desktop";
      browser = parsed.browser?.name || "Unknown";
      os = parsed.os?.name || "Unknown";
    }
    devices[device] = (devices[device] ?? 0) + 1;
    browsers[browser] = (browsers[browser] ?? 0) + 1;
    oses[os] = (oses[os] ?? 0) + 1;

    const ref = hostnameOf(row.referer);
    referrers[ref] = (referrers[ref] ?? 0) + 1;

    if (recent.length < 20) {
      recent.push({ time: row.createdAt.toISOString(), browser, device, referrer: ref });
    }
  }

  return { timeline, devices, browsers, oses, referrers, recent };
}

// Owner-scoped analytics for a single link.
export async function getLinkAnalytics(shortCode: string, userId: string) {
  const url = await prisma.url.findFirst({
    where: { shortCode, userId },
    select: { id: true, clickCount: true },
  });
  if (!url) {
    throw new AppError(404, "URL not found");
  }

  const rows = await prisma.analytics.findMany({
    where: { urlId: url.id },
    orderBy: { createdAt: "desc" },
    take: 2000, // cap breakdowns; total is authoritative via clickCount
    select: { createdAt: true, userAgent: true, referer: true },
  });

  return { total: url.clickCount, ...aggregate(rows) };
}

// Aggregated analytics across every link the user owns (default "All Links" view).
export async function getOverviewAnalytics(userId: string) {
  const urls = await prisma.url.findMany({
    where: { userId },
    select: { clickCount: true },
  });
  const total = urls.reduce((sum, url) => sum + url.clickCount, 0);

  const rows = await prisma.analytics.findMany({
    where: { url: { userId } },
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: { createdAt: true, userAgent: true, referer: true },
  });

  return { total, totalUrls: urls.length, ...aggregate(rows) };
}
