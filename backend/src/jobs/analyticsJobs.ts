import { analyticsQueue } from "../core/queue";
import { logger } from "../core/logger";

export type AnalyticsJobData = {
  shortCode: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  referer?: string | undefined;
  clickedAt: string; // ISO
};

/**
 * Fire-and-forget: enqueue a click record for the analytics worker.
 * Never awaited — a slow Redis must not block the redirect hot path.
 */
export function enqueueAnalytics(data: AnalyticsJobData): void {
  logger.debug(
    { shortCode: data.shortCode, ip: data.ip, userAgent: data.userAgent, referer: data.referer },
    "Analytics: enqueuing click job"
  );

  analyticsQueue
    .add("track-click", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 3600, count: 5000 },
    })
    .then((job) =>
      logger.debug({ jobId: job.id, shortCode: data.shortCode }, "Analytics: job enqueued")
    )
    .catch((err) => logger.error({ err }, "Analytics: failed to enqueue job"));
}
