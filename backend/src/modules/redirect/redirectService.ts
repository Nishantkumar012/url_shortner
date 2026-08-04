import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/error";
import {redis} from "../../core/redis"
import { enqueueAnalytics } from "../../jobs/analyticsJobs";



export async function redirectUrl(shortCode: string, ip?: string,
    userAgent?: string,
    referer?: string): Promise<string> {
  const cached = await redis.get(`url/${shortCode}`);

  if (cached) {
    const url = JSON.parse(cached);

    // Check expiration
    if (url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()) {
      throw new AppError(410, "URL expired");
    }

    console.log("Before enqueue");
    
    enqueueAnalytics({
      shortCode,
      ip,
      userAgent,
      referer,
      clickedAt: new Date().toISOString(),
    });
     
console.log("After enqueue");

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
  await redis.set(
    `url/${shortCode}`,
    JSON.stringify(url)
  );
       
     console.log("before queue");
  enqueueAnalytics({
    shortCode,
    ip,
    userAgent,
    referer,
    clickedAt: new Date().toISOString(),
  });
  
     console.log("after queue");
   
  return url.originalUrl;
}