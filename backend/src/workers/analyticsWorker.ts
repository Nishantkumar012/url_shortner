import { Worker } from "bullmq";
import { redis } from "../core/redis";
import { prisma } from "../utils/prisma";
import { logger } from "../core/logger";
import type { AnalyticsJobData } from "../jobs/analyticsJobs";

export const analyticsWorker = new Worker<AnalyticsJobData>(
  "analytics",
  async (job) => {
    const { shortCode, ip, userAgent, referer, clickedAt } = job.data;

    logger.debug(
      { jobId: job.id, shortCode, ip, userAgent, referer },
      "Analytics: processing click job"
    );

    const url = await prisma.url.findUnique({
      where: { shortCode },
      select: { id: true },
    });
    if (!url) return; // deleted before the job ran — skip

    await prisma.$transaction([
      prisma.analytics.create({
        data: {
          urlId: url.id,
          ip: ip ?? null,
          userAgent: userAgent ?? null,
          referer: referer ?? null,
          createdAt: new Date(clickedAt),
        },
      }),
      prisma.url.update({
        where: { id: url.id },
        data: { clickCount: { increment: 1 } },
      }),
    ]);
  },
  { connection: redis, concurrency: 10 }
);

analyticsWorker.on("ready", () => logger.info("Analytics worker ready"));

analyticsWorker.on("completed", (job) =>
  logger.debug({ jobId: job.id, shortCode: job.data.shortCode }, "Analytics: job completed")
);

analyticsWorker.on("failed", (job, err) =>
  logger.error({ jobId: job?.id, err }, "Analytics job failed")
);

analyticsWorker.on("error", (err) =>
  logger.error({ err }, "Analytics worker error")
);
