// Words that must not be usable as a custom short-code alias because they
// collide with existing routes or are otherwise reserved.
const RESERVED = new Set<string>([
  "api",
  "auth",
  "health",
  "login",
  "register",
  "logout",
  "refresh",
  "admin",
  "url",
  "urls",
  "user",
  "users",
  "me",
  "stats",
]);

export function isReservedWord(alias: string): boolean {
  return RESERVED.has(alias.toLowerCase());
}
