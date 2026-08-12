import { Router } from "express";
import * as ctrl from "./adminController";
import { adminAuthGuard } from "../../middlewares/adminAuthGuard";

export const adminRoutes = Router();

// ── Public (no auth) ────────────────────────────────────────────────────────
adminRoutes.post("/login", ctrl.login);

// ── Admin-only (token required) ─────────────────────────────────────────────
adminRoutes.get("/stats", adminAuthGuard, ctrl.stats);
adminRoutes.get("/users", adminAuthGuard, ctrl.users);
adminRoutes.get("/urls", adminAuthGuard, ctrl.urls);
