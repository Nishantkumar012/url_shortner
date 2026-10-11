import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/error";
import { redis } from "../../core/redis";
import { enqueueAnalytics } from "../../jobs/analyticsJobs";
import { hashVisitorToken } from "../../utils/visitorToken";
import { getCountry } from "../../utils/geoip";

export async function redirectUrl(
  shortCode: string,
  ip?: string,
  userAgent?: string,
  referer?: string,
  headers?: Record<string, string | string[] | undefined>
): Promise<string> {
  const cached = await redis.get(`url/${shortCode}`);

  if (cached) {
    const url = JSON.parse(cached);

    // Check expiration
    if (url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()) {
      throw new AppError(410, "URL expired");
    }

    // Extract visitor token from custom header (set by frontend)
    const visitorTokenRaw = typeof headers?.["x-visitor-token"] === "string"
      ? headers["x-visitor-token"]
      : undefined;
    const hashedToken = visitorTokenRaw ? hashVisitorToken(visitorTokenRaw) : undefined;
    const { country } = getCountry(headers ?? {});

    enqueueAnalytics({
      shortCode,
      ip,
      userAgent,
      referer,
      visitorToken: hashedToken,
      country,
      clickedAt: new Date().toISOString(),
    });

    return url.originalUrl;
  }

  const url = await prisma.url.findUnique({
    where: { shortCode },
    select: {
      originalUrl: true,
      expiresAt: true,
      clickCount: true,
    },
  });

  if (!url) {
    throw new AppError(404, "URL not found");
  }

  if (url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()) {
    throw new AppError(410, "URL expired");
  }

  // Store in Redis for next time
  await redis.set(`url/${shortCode}`, JSON.stringify(url));

  // Extract visitor token from custom header (set by frontend)
  const visitorTokenRaw = typeof headers?.["x-visitor-token"] === "string"
    ? headers["x-visitor-token"]
    : undefined;
  const hashedToken = visitorTokenRaw ? hashVisitorToken(visitorTokenRaw) : undefined;
  const { country } = getCountry(headers ?? {});

  enqueueAnalytics({
    shortCode,
    ip,
    userAgent,
    referer,
    visitorToken: hashedToken,
    country,
    clickedAt: new Date().toISOString(),
  });

  return url.originalUrl;
}
