
import type { RequestHandler } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../common/error";

// Validates req.body with a zod schema; replaces req.body with the parsed data.
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(400, "Validation failed"));
      return;
    }
    req.body = result.data;
    next();
  };
}
