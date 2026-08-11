import { Worker } from "bullmq";
import { redis } from "../core/redis";
import { logger } from "../core/logger";
import type { EmailJobData } from "../jobs/emailJobs";
import { sendVerificationEmail } from "../core/mailer";

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job) => {
    const { type, email, name, token } = job.data;

    logger.debug(
      { jobId: job.id, type, email },
      "Email: processing email job"
    );

    switch (type) {
      case "verify-email":
        await sendVerificationEmail(email, name, token);
        break;
      default:
        logger.warn({ jobId: job.id, type }, "Email: unknown job type, skipping");
    }
  },
  { connection: redis, concurrency: 5 }
);

emailWorker.on("ready", () => logger.info("Email worker ready"));

emailWorker.on("completed", (job) =>
  logger.debug({ jobId: job.id, type: job.data.type }, "Email: job completed")
);

emailWorker.on("failed", (job, err) =>
  logger.error({ jobId: job?.id, type: job?.data.type, err }, "Email job failed")
);

emailWorker.on("error", (err) =>
  logger.error({ err }, "Email worker error")
);
