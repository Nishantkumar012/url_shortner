import { emailQueue } from "../core/queue";
import { logger } from "../core/logger";

export type EmailJobData = {
  type: "verify-email" | "reset-password";
  email: string;
  name: string;
  token: string;
};

/**
 * Fire-and-forget: enqueue an email for the email worker to send.
 * Never awaited — a slow Redis must not block the register/request-password-reset path.
 */
export function enqueueEmail(data: EmailJobData): void {
  logger.debug(
    { type: data.type, email: data.email, name: data.name },
    "Email: enqueuing email job"
  );

  emailQueue
    .add(data.type, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 3600, count: 5000 },
    })
    .then((job) =>
      logger.debug({ jobId: job.id, type: data.type, email: data.email }, "Email: job enqueued")
    )
    .catch((err) => logger.error({ err }, "Email: failed to enqueue job"));
}
