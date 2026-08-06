import Router from "express";
import { getAnalyticsOverview, getLinkAnalyticsController } from "./analyticsController";
import { authGuard } from "../../middlewares/authGuard";

export const analyticsRoutes = Router();

// Both routes are authenticated and owner-scoped.
// `/overview` is registered before `/:shortCode` so it isn't captured by the
// param route (Express matches in registration order).
analyticsRoutes.get("/overview", authGuard, getAnalyticsOverview);
analyticsRoutes.get("/:shortCode", authGuard, getLinkAnalyticsController);
