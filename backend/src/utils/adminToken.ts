import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { StringValue } from "ms";

// Admin tokens include the userId so we can verify the user's current role
// from the database on each request. The token is deliberately separate from
// user access/refresh tokens: a different secret + a `scope: "admin"` claim
// means an admin token can never be confused with a user token (and vice-versa).

export function signAdminToken(userId: string): string {
  return jwt.sign({ sub: userId, scope: "admin" }, env.ADMIN_TOKEN_SECRET, {
    expiresIn: env.ADMIN_TOKEN_TTL as StringValue,
  });
}

export function verifyAdminToken(token: string): { sub: string; scope: string } {
  return jwt.verify(token, env.ADMIN_TOKEN_SECRET) as {
    sub: string;
    scope: string;
  };
}
