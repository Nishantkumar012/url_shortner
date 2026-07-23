import type { CookieOptions, Request, Response } from "express";
import type { z } from "zod";
import { loginUser, registerUser, logOut } from "./authService";
import { loginSchema, registerSchema } from "./authSchema";
import { env } from "../../config/env";

type RegisterInput = z.infer<typeof registerSchema>;

type LoginInput = z.infer<typeof loginSchema>;


const REFRESH_COOKIE = "refreshToken";

// Shared cookie flags. `secure` is off in dev so the cookie works over http,
// on in production where everything is served over https.
function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshCookieOptions(),
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  // Must match the flags used when setting (except maxAge) for the browser
  // to actually remove the cookie.
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
}


export async function register(req: Request, res: Response) {
  // req.body is already validated + parsed by the `validateBody` middleware,
  // so we can trust its shape here.
  const input = req.body as RegisterInput;

  const { refreshToken, ...data } = await registerUser(input);

  setRefreshCookie(res, refreshToken);

  res.status(201).json({ status: "success", data });
}


export async function login(req: Request, res: Response) {
  const input = req.body as LoginInput;

  const { refreshToken, ...data } = await loginUser(input);
            
  // console.log("copy data from conttroller",data);
  setRefreshCookie(res, refreshToken);

  res.status(200).json({ status: "success", data });
}


export async function logout(req: Request, res: Response) {
  // authGuard has already verified the access token and set req.userId.
  const userId = req.userId as string;
  const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (refreshToken) {
    await logOut(userId, refreshToken);
  }

  clearRefreshCookie(res);

  res.status(200).json({ status: "success", message: "Logged out" });
}
