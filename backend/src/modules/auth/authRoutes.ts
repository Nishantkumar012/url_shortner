
import Router from "express";
import { login, register, logout, refresh, getMe } from "./authController";
import { authGuard } from "../../middlewares/authGuard";
import { validateBody } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./authSchema";


export const authRoutes = Router();


authRoutes.post("/register", validateBody(registerSchema), register);

authRoutes.post("/login", validateBody(loginSchema), login);

// Refresh token comes from the httpOnly cookie, so no body validation needed.
authRoutes.post("/logout", authGuard, logout);

// Get new access token using refresh token from httpOnly cookie
authRoutes.post("/refresh", refresh);

// Get current authenticated user's profile
authRoutes.get("/me", authGuard, getMe);




