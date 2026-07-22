import { prisma } from "./prisma";

// base62: A-Z, a-z, 0-9 = 62 characters
const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

const DEFAULT_LENGTH = 7;
const MAX_RETRIES = 10;

/**
 * Generates a random base62 short code of the given length.
 * Pure function — no DB access, so it's easy to unit test.
 */
export const generateShortCode = (length: number = DEFAULT_LENGTH): string => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += BASE62[Math.floor(Math.random() * BASE62.length)];
  }
  return code;
};

/**
 * Checks whether a short code is free to use (not already in the DB).
 */
export async function isAvailable(shortCode: string): Promise<boolean> {
  const existing = await prisma.url.findUnique({
    where: { shortCode },
    select: { id: true },
  });
  return existing === null;
}

/**
 * Generates a guaranteed-unique short code by retrying on collision.
 * DB-level @unique on shortCode is the second layer of safety against races.
 */
export async function generateUniqueShortCode(
  length: number = DEFAULT_LENGTH
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generateShortCode(length);
    if (await isAvailable(code)) {
      return code;
    }
  }
  throw new Error(
    `Failed to generate a unique short code after ${MAX_RETRIES} attempts`
  );
}
