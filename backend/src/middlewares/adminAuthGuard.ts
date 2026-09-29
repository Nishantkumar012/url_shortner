import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../utils/adminToken";
import { AppError } from "../common/error";
import { prisma } from "../utils/prisma";

// Verifies that:
// 1. A valid admin token is present
// 2. The userId in the token corresponds to a real user
// 3. The user's current role in the database is ADMIN
//
// This ensures that if a user's role changes in the database,
// their token will be invalidated on the next request.

export const adminAuthGuard = async (
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
    const userId = decoded.sub;

    // Fetch user from database to verify current role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    if (user.role !== "ADMIN") {
      throw new AppError(403, "Admin access required");
    }

    // Token is valid and user is an admin
    req.userId = userId;
  } catch (error) {
    // jwt.verify throws (expired / malformed / wrong secret) — surface as 401.
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Unauthorized");
  }

  next();
};

