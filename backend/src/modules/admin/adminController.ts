import type { Request, Response } from "express";
import { adminLogin, getStats, getAllUsers, getAllUrls } from "./adminService";
import { AppError } from "../../common/error";

// No try/catch on purpose: errors bubble to the global errorHandler,
// which maps AppError -> proper status (see errorHandler.ts).

export async function login(req: Request, res: Response) {
  // Client IP for rate limiting. Behind a proxy you'd read X-Forwarded-For;
  // for a direct connection req.ip is fine.
  const clientIp = req.ip || "unknown";
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError(400, "email and password are required");
  }

  const { token } = await adminLogin(email, password, clientIp);

  res.status(200).json({ status: "success", data: { token } });
}

export async function stats(_req: Request, res: Response) {
  const data = await getStats();
  res.status(200).json({ status: "success", data });
}

export async function users(_req: Request, res: Response) {
  const data = await getAllUsers();
  res.status(200).json({ status: "success", data });
}

export async function urls(_req: Request, res: Response) {
  const data = await getAllUrls();
  res.status(200).json({ status: "success", data });
}
