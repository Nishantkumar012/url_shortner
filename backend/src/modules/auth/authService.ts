import { prisma } from "../../utils/prisma";
import { hashPassword } from "../../utils/password";
import { AppError } from "../../common/error";
import type { z } from "zod";
import { loginSchema, registerSchema } from "./authSchema";
import { signRefreshToken,hashToken, signAccessToken, verifyHashToken, verifyRefreshToken, signEmailVerificationToken } from "../../utils/jwt";
import { verifyPassword } from "../../utils/password";
import { env} from "../../config/env";
import { enqueueEmail } from "../../jobs/emailJobs";



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

  // Queue the verification email — fire-and-forget, never awaited so a slow
  // Redis/worker must not block registration.
  const emailToken = signEmailVerificationToken(user.id);
  enqueueEmail({
    type: "verify-email",
    email: user.email,
    name: user.name ?? "",
    token: emailToken,
  });

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
   
//    console.log("hash password", user?.passwordHash);
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



export async function logOut(userId: string, refreshToken: string) {
  // Refresh tokens are stored as argon2 hashes (salted), so we can't look one
  // up directly. Fetch this user's active sessions and match by verifying.
  const tokens = await prisma.refreshTokens.findMany({
    where: {
      userId,
      revoke: false,
    },
  });

  for (const token of tokens) {
    const matches = await verifyHashToken(refreshToken, token.tokenHash);

    if (matches) {
      await prisma.refreshTokens.update({
        where: { id: token.id },
        data: { revoke: true },
      });
      return;
    }
  }

  // No matching active session found — token is invalid or already revoked.
  // Treat logout as idempotent instead of throwing.
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify the JWT structure and signature
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const userId = payload.sub;

  // Find active refresh token sessions for this user
  const tokens = await prisma.refreshTokens.findMany({
    where: {
      userId,
      revoke: false,
      expiresAt: { gt: new Date() },
    },
  });

  // Match the provided token against stored hashes
  let matchedTokenId: string | null = null;
  for (const token of tokens) {
    const matches = await verifyHashToken(refreshToken, token.tokenHash);
    if (matches) {
      matchedTokenId = token.id;
      break;
    }
  }

  if (!matchedTokenId) {
    throw new AppError(401, "Invalid or revoked refresh token");
  }

  // Generate new access token
  const accessToken = signAccessToken(userId);

  return { accessToken };
}