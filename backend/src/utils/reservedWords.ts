// Words that must not be usable as a custom short-code alias because they
// collide with existing routes or are otherwise reserved.
const RESERVED = new Set<string>([
  // Framework & API
  "api",
  "v1",
  "v2",
  "v3",
  "v4",
  "graphql",
  "rest",
  "rpc",

  // Authentication & Authorization
  "auth",
  "login",
  "logout",
  "signin",
  "signout",
  "signup",
  "register",
  "refresh",
  "oauth",
  "oauth2",
  "callback",
  "verify",
  "verification",
  "password",
  "forgot",
  "reset",

  // Admin & Dashboard
  "admin",
  "dashboard",
  "settings",
  "account",
  "accounts",
  "profile",
  "user",
  "users",
  "me",

  // URL & Shortening
  "url",
  "urls",
  "shorten",
  "redirect",
  "short",
  "link",
  "links",

  // Static & Assets
  "favicon",
  "robots",
  "sitemap",
  "css",
  "js",
  "images",
  "image",
  "img",
  "static",
  "assets",
  "public",
  "files",
  "downloads",

  // Health & Status
  "health",
  "healthz",
  "status",
  "metrics",
  "monitor",
  "ping",

  // Documentation
  "docs",
  "documentation",
  "swagger",
  "openapi",
  "redoc",
  "api-docs",

  // Webhooks & Integrations
  "webhook",
  "webhooks",
  "integrations",
  "callback",

  // System & Infrastructure
  "admin",
  "api",
  "support",
  "about",
  "contact",
  "privacy",
  "terms",
  "tos",
  "legal",
  "faq",
  "help",
]);

export function isReservedWord(alias: string): boolean {
  return RESERVED.has(alias.toLowerCase());
}
