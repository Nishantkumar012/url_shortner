import Router from "express";
import {
  createShortUrl,
  updateShortUrl,
  deleteShortUrl,
  getAllShortUrl
} from "./urlController";
import { redirectController } from "./redirectController";
import { authGuard } from "../../middlewares/authGuard";
import { validateBody } from "../../middlewares/validate";
import { urlAliasSchema, urlUpdateSchema } from "./urlSchema";


export const urlRoutes = Router();

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