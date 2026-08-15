import Router from "express";
import {
  createShortUrl,
  updateShortUrl,
  deleteShortUrl,
  getAllShortUrl,
  createGuestShortUrl,
  getGuestRemainingHandler
} from "./urlController";
import { redirectController } from "../redirect/redirectController";
import { authGuard } from "../../middlewares/authGuard";
import { validateBody } from "../../middlewares/validate";
import { urlAliasSchema, urlUpdateSchema, guestUrlSchema } from "./urlSchema";


export const urlRoutes = Router();

// Guest URLs - no auth required. The quota-lookup route must come before the
// `/:shortCode` catch-all below.
urlRoutes.get("/guest/remaining", getGuestRemainingHandler);
urlRoutes.post("/guest", validateBody(guestUrlSchema), createGuestShortUrl);

// All URL-management routes are authenticated and owner-scoped.
urlRoutes.post("/", authGuard, validateBody(urlAliasSchema), createShortUrl);
urlRoutes.patch(
  "/:shortCode",
  authGuard,
  validateBody(urlUpdateSchema),
  updateShortUrl
);
urlRoutes.delete("/:shortCode", authGuard, deleteShortUrl);

urlRoutes.get("/",authGuard, getAllShortUrl);

// Public redirect - no auth required
urlRoutes.get("/:shortCode",   redirectController);