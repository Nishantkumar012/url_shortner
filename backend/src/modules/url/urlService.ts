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
const GUEST_URL_LIMIT = 2;
const GUEST_URL_TTL = 24 * 60 * 60; // 24 hours

export async function createGuestUrl(
  originalUrl: string,
  clientIp: string
): Promise<{ url: Url; remaining: number }> {
  const guestKey = `guest:${clientIp}`;

  // Atomically increment the guest request count
  const currentCount = await redis.incr(guestKey);

  // Set expiry only when the key is created
  if (currentCount === 1) {
    await redis.expire(guestKey, GUEST_URL_TTL);
  }

  // Guest limit reached
  if (currentCount > GUEST_URL_LIMIT) {
    // Roll back the increment because this request is rejected
    await redis.decr(guestKey);

    throw new AppError(
      403,
      "Guest limit reached. Please sign up to create more URLs."
    );
  }

  // Generate unique short code
  const shortCode = await generateUniqueShortCode();

  try {
    // Create guest URL
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId: null,
      },
    });

    // Cache URL for fast redirects
    await redis.set(
      `url/${shortCode}`,
      JSON.stringify({
        originalUrl,
        expiresAt: null,
      })
    );

    return {
      url,
      remaining: GUEST_URL_LIMIT - currentCount,
    };
  } catch (error) {
    // DB failed, so give the guest their attempt back
    await redis.decr(guestKey);

    throw error;
  }
}





// Returns how many guest URLs the given IP still has left. The client calls
// this on load so the "free links left" counter is authoritative from the
// server (and survives a refresh / different browser on the same IP), instead
// of trusting per-browser localStorage.
export async function getGuestRemaining(clientIp: string): Promise<number> {
  const currentCount = parseInt((await redis.get(`guest:${clientIp}`)) || "0", 10);
  return Math.max(0, GUEST_URL_LIMIT - currentCount);
}