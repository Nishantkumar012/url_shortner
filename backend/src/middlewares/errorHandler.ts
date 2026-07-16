

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
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(500).json({ status: "error", message });
};