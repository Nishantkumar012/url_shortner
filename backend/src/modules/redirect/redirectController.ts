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
    return res.redirect(301, originalUrl);
  } catch (err) {
    next(err);
  }
}