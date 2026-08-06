import type { Request, Response } from "express";
import { AppError } from "../../common/error";
import { getLinkAnalytics, getOverviewAnalytics } from "./analyticsService";

// AuthGuard has already verified the token and set req.userId.
export async function getAnalyticsOverview(req: Request, res: Response) {
  const userId = req.userId as string;

  const data = await getOverviewAnalytics(userId);

  res.status(200).json({ status: "success", data });
}

export async function getLinkAnalyticsController(req: Request, res: Response) {
  const userId = req.userId as string;
  const shortCode = req.params.shortCode;
  if (typeof shortCode !== "string") {
    throw new AppError(400, "shortCode is required");
  }

  const data = await getLinkAnalytics(shortCode, userId);

  res.status(200).json({ status: "success", data });
}
