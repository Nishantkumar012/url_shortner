import { prisma } from "../../utils/prisma";
import { hashPassword } from "../../utils/password";
import { AppError } from "../../common/error";
import type { z } from "zod";
import { loginSchema, registerSchema } from "./authSchema";
import { signRefreshToken,hashToken, signAccessToken } from "../../utils/jwt";
import { verifyPassword } from "../../utils/password";
import { env} from "../../config/env";










type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

async function createSession(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  const tokenHash = await hashToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshTokens.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  const tokens = await createSession(user.id);

  return {
    user,
    ...tokens,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new AppError(401, "Invalid credentials");
  }

  const tokens = await createSession(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    ...tokens,
  };
}