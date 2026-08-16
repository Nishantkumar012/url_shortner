import type { Request, Response } from "express";
import type { z } from "zod";
import { createUrl, updateUrl, deleteUrl, getAllUrl, createGuestUrl, getGuestRemaining } from "./urlService";
import { urlAliasSchema, urlUpdateSchema } from "./urlSchema";
import { AppError } from "../../common/error";

type UrlInput = z.infer<typeof urlAliasSchema>;
type UrlUpdateInput = z.infer<typeof urlUpdateSchema>;

// Named `createShortUrl` to avoid colliding with the imported `createUrl`
// from urlService (which would otherwise shadow it and recurse infinitely).
// No try/catch here on purpose: errors bubble to the global errorHandler,
// which maps AppError -> proper status. Input is validated by the
// `validateBody(urlAliasSchema)` middleware on the route.
export async function createShortUrl(req: Request, res: Response) {
  // authGuard has already verified the token and set req.userId.
  const userId = req.userId as string;

  const input = req.body as UrlInput;

  const url = await createUrl(input.originalUrl, userId, input.alias,input.expiresAt);

  res.status(201).json({ status: "success", data: url });
}




// Owner-only. `:shortCode` identifies the URL; new destination comes from the
// body (validated by `validateBody(urlUpdateSchema)`).
export async function updateShortUrl(req: Request, res: Response) {
  const userId = req.userId as string;
  const shortCode = req.params.shortCode;
  if (typeof shortCode !== "string") {
    throw new AppError(400, "shortCode is required");
  }

  const input = req.body as UrlUpdateInput;

  const url = await updateUrl(shortCode, userId, input.originalUrl);

  res.status(200).json({ status: "success", data: url });
}





// Owner-only. `:shortCode` identifies the URL to delete.
export async function deleteShortUrl(req: Request, res: Response) {
  const userId = req.userId as string;
  const shortCode = req.params.shortCode;
  if (typeof shortCode !== "string") {
    throw new AppError(400, "shortCode is required");
  }

  const url = await deleteUrl(shortCode, userId);
  console.log("url is", url);

  res.status(200).json({ status: "success", data: url });
}



export async function getAllShortUrl(req:Request,res:Response){

   const userId = req.userId as string;

    const urls = await getAllUrl(userId);

    res.status(200).json({ status: "success", data: urls});

}



// Guest URL creation - no auth required, IP-based rate limiting
export async function createGuestShortUrl(req: Request, res: Response) {
  const { originalUrl, ip } = req.body as { originalUrl: string; ip?: string };

  // Prefer the explicitly-provided IP (from the client fingerprint), then fall
  // back to proxy-forwarded / socket address. Used to rate-limit guests.
  const clientIp =
    ip ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const result = await createGuestUrl(originalUrl, clientIp);

  res.status(201).json({
    status: "success",
    data: result.url,
    meta: { remaining: result.remaining }
  });
}

// Public guest quota lookup. Given an IP, returns how many free links remain.
// Used on page load so the "free links left" counter is authoritative (and
// stays correct across browsers/devices sharing an IP), not just localStorage.
export async function getGuestRemainingHandler(req: Request, res: Response) {
  const { ip } = req.query as { ip?: string };

  const clientIp =
    ip ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const remaining = await getGuestRemaining(clientIp);

  res.status(200).json({
    status: "success",
    meta: { remaining }
  });
}