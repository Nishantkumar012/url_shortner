import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../utils/adminToken";
import { AppError } from "../common/error";

// Runs AFTER the admin token is already verified (see adminRoutes).
// Ensures the request carries a valid admin-scoped token before the
// data-fetching controller executes.

export const adminAuthGuard = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Unauthorized");
  }

  const token = header.split(" ")[1];

  if (!token) {
    throw new AppError(401, "Unauthorized");
  }

  try {
    const decoded = verifyAdminToken(token);
    req.userId = decoded.sub; // reuse for downstream logging
  } catch {
    // jwt.verify throws (expired / malformed / wrong secret) — surface as 401.
    throw new AppError(401, "Unauthorized");
  }

  next();
};
