import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/error";

export async function redirectUrl(shortCode: string): Promise<string> {
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

  // Check expiration - convert both to timestamps for comparison
  if (url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()) {
    throw new AppError(410, "URL expired");
  }

  // Increment click count (fire and forget)
  prisma.url.update({
    where: { shortCode },
    data: { clickCount: { increment: 1 } },
  }).catch(() => {}); // Ignore increment errors

  return url.originalUrl;
}