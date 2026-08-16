import { Request, Response, NextFunction } from "express";
import { redirectUrl } from "../redirect/redirectService";
import { AppError } from "../../common/error";

export async function redirectController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const shortCode = req.params.shortCode as string;
    if (!shortCode) {
      throw new AppError(400, "shortCode is required");
    }
      
    const originalUrl = await redirectUrl(
      shortCode,
      req.ip,
      req.headers["user-agent"],
      req.headers.referer
    );
    // 302 (Found), NOT 301: a 301 is permanently cached by the browser, so
    // repeat clicks would bypass the backend entirely and no analytics /
    // clickCount would be recorded. A 302 keeps every click flowing through
    // the redirect handler where analytics is enqueued.
    return res.redirect(302, originalUrl);
  } catch (err) {
    next(err);
  }
}