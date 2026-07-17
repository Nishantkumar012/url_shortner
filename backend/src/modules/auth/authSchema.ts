import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z.string().min(1, "Password must be at least 1 characters"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password must be at least 1 characters"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(1, "Password must be at least 1 characters"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});



