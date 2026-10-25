

import type { ErrorRequestHandler } from "express";
import { logger } from "../core/logger";
import { env } from "../config/env";
import { AppError } from "../common/error";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn({ err }, "Handled application error");
    res.status(err.statusCode).json({ status: "error", message: err.message });
    return;
  }

  logger.error({ err }, "Unhandled error");

  // Always hide sensitive error details from client in production
  // Even in development, sanitize Prisma/database errors
  let message = "Internal server error";
  if (env.NODE_ENV === "development" && err instanceof Error && !err.message.includes("prisma")) {
    message = err.message;
  }

  res.status(500).json({ status: "error", message });
};