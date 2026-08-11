import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

let transporter: Transporter | null = null;

/**
 * Lazy singleton SMTP transporter. Falls back to "log-only" mode in
 * development when SMTP_HOST is not configured (emails are logged instead of
 * sent) so the enqueue → worker flow can be exercised without real credentials.
 * In production a missing SMTP config is a hard error.
 */
function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!env.SMTP_HOST) {
    if (env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST is not configured but NODE_ENV=production");
    }
    logger.warn(
      "SMTP_HOST not set — emails are logged, not sent. Configure SMTP_* in .env."
    );
    // Return a no-op-like stream transport that never leaves the machine.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });

  return transporter;
}

function verificationHtml(name: string, link: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827; margin: 0 0 16px;">Verify your email</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #374151; line-height: 1.6;">
        Welcome to ${env.APP_NAME}! Please confirm your email address by clicking
        the button below. The link is valid for 24 hours.
      </p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
          Verify email
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        If you didn't create an account with ${env.APP_NAME}, you can safely ignore
        this email.
      </p>
    </div>
  `;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const info = await getTransporter().sendMail({
    from: env.MAIL_FROM,
    to,
    subject: `Verify your email — ${env.APP_NAME}`,
    html: verificationHtml(name, link),
  });

  logger.info({ to, messageId: info.messageId }, "Verification email sent");
}
