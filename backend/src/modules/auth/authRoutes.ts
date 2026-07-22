
import Router from "express";
import { login, register, logout } from "./authController";
import { authGuard } from "../../middlewares/authGuard";


export const authRoutes = Router();


authRoutes.post("/register",register);

authRoutes.post("/login", login);

// Refresh token comes from the httpOnly cookie, so no body validation needed.
authRoutes.post("/logout", authGuard, logout);




