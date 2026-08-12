import { z } from "zod";

// Create payload without a custom alias — a random short code is generated.
export const urlSchema = z.object({
  originalUrl: z.url("Must be a valid URL"),
});

// Create payload with an OPTIONAL custom alias. The alias becomes the short
// code; reserved-word and uniqueness checks happen in the service. Validation
// here only enforces shape — semantic rules (reserved/unique) live in the service.
export const urlAliasSchema = z.object({
  originalUrl: z.url("Must be a valid URL"),
  alias: z
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(32, "Alias must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Alias may only contain letters, numbers, - and _"
    )
    .optional(),
    expiresAt: z
    .string()
    .regex(/^\d+(m|h|d)$/, "Use format like 30m,2h,15d")
    .optional(),
    
});

// Update payload: only the new destination URL.
export const urlUpdateSchema = z.object({
  originalUrl: z.url("Must be a valid URL"),
});
