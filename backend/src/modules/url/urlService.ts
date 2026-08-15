import { prisma } from "../../utils/prisma";
import { generateUniqueShortCode, isAvailable } from "../../utils/shortCode";
import { isReservedWord } from "../../utils/reservedWords";
import { AppError } from "../../common/error";
import { Prisma } from "@prisma/client";
import ms, { type StringValue} from "ms"
import {redis} from "../../core/redis"
import type { Url } from "@prisma/client"


// Creates a URL for the given owner. If `alias` is supplied it becomes the
// short code (after reserved-word + uniqueness checks); otherwise a random
// unique code is generated. The DB `@unique` on shortCode is the final safety
// net against race conditions.
export async function createUrl(
  originalUrl: string,
  userId: string,
  alias?: string,
  expiresAt?: string
): Promise<Url> {
  let shortCode: string;

  if (alias) {
    if (isReservedWord(alias)) {
      throw new AppError(400, "This alias is reserved");
    }
    if (!(await isAvailable(alias))) {
      throw new AppError(409, "This alias is already taken");
    }
    shortCode = alias;
  } else {
    shortCode = await generateUniqueShortCode();
  }

  const expires = expiresAt ? new Date(Date.now() + ms(expiresAt as StringValue)) : null;

  try {
    const url = await prisma.url.create({
      data: { originalUrl, shortCode, userId, expiresAt: expires },
    });

    await redis.set(`url/${shortCode}`, JSON.stringify({
      originalUrl,
      expiresAt: expires,
    }));

    return url;
  } catch (err) {
    // Race-condition safety: a concurrent create could have claimed the code
    // between our check and the insert. For an auto-generated code we retry
    // with a fresh one; for a user alias we surface the conflict.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      if (alias) {
        throw new AppError(409, "This alias is already taken");
      }
      const code = await generateUniqueShortCode();
      return prisma.url.create({ data: { originalUrl, shortCode: code, userId } });
    }
    throw err;
  }
}

// Updates the destination of a URL. Scoped to the owner so a user can only
// edit their own links.
export async function updateUrl(
  shortCode: string,
  userId: string,
  newOriginalUrl: string
) {
  const existing = await prisma.url.findFirst({ where: { shortCode, userId } });
  if (!existing) {
    throw new AppError(404, "URL not found");
  }

  const update = await prisma.url.update({
    where: { id: existing.id },
    data: { originalUrl: newOriginalUrl },
  });

  await redis.del(`url/${shortCode}`);

    return update;
}




// Deletes a URL. Scoped to the owner.
export async function deleteUrl(shortCode: string, userId: string) {
  const existing = await prisma.url.findFirst({ where: { shortCode, userId } });
  if (!existing) {
    throw new AppError(404, "URL not found");
  }

   const deletedurl = await prisma.url.update({
  where: {
    id: existing.id
  },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
    
  }
});

return deletedurl

}




export async function getAllUrl(userId: string) {
  const existing = await prisma.url.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("correct urls", existing);

  return existing;
}

// Guest URL creation - creates temporary URLs without authentication
// Uses IP-based rate limiting stored in Redis
const GUEST_URL_LIMIT = 2; // Max 2 URLs per guest per 24 hours

export async function createGuestUrl(
  originalUrl: string,
  clientIp: string
): Promise<{ url: Url; remaining: number }> {
  const guestKey = `guest:${clientIp}`;
  const currentCount = parseInt((await redis.get(guestKey)) || "0", 10);

  if (currentCount >= GUEST_URL_LIMIT) {
    throw new AppError(403, "Guest limit reached. Please sign up to create more URLs.");
  }

  // Generate short code
  const shortCode = await generateUniqueShortCode();

  // Create a guest user ID based on IP (or use a system guest user)
  // For simplicity, we'll create a deterministic guest user ID
  const guestUserId = `guest-${clientIp.replace(/[:.]/g, "-")}`;

  // Check if guest user exists, if not create one
  let guestUser = await prisma.user.findUnique({
    where: { id: guestUserId },
  });

  if (!guestUser) {
    try {
      guestUser = await prisma.user.create({
        data: {
          id: guestUserId,
          email: `${guestUserId}@guest.local`,
          passwordHash: "guest",
          name: "Guest User",
          isVerified: false,
        },
      });
    } catch {
      // User might already exist due to race condition
      guestUser = await prisma.user.findUnique({
        where: { id: guestUserId },
      });
    }
  }

  if (!guestUser) {
    throw new AppError(500, "Failed to create guest user");
  }

  const url = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
      userId: guestUser.id,
    },
  });

  // Increment guest count in Redis (24 hour expiry)
  await redis.set(guestKey, (currentCount + 1).toString(), "EX", 86400);

  // Cache the URL (key must match what redirectService reads)
  await redis.set(
    `url/${shortCode}`,
    JSON.stringify({
      originalUrl,
      expiresAt: null,
    })
  );

  return { url, remaining: GUEST_URL_LIMIT - currentCount - 1 };
}

// Returns how many guest URLs the given IP still has left. The client calls
// this on load so the "free links left" counter is authoritative from the
// server (and survives a refresh / different browser on the same IP), instead
// of trusting per-browser localStorage.
export async function getGuestRemaining(clientIp: string): Promise<number> {
  const currentCount = parseInt((await redis.get(`guest:${clientIp}`)) || "0", 10);
  return Math.max(0, GUEST_URL_LIMIT - currentCount);
}