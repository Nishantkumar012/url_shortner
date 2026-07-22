# 🗺️ PHASES — Task Tracker

> Cross off `- [ ]` → `- [x]` as you complete each step.
> This file is the **progress tracker**; the canonical architecture & specs live in
> **[PLANNING.md](./PLANNING.md)** and the overview in **[README.md](./README.md)**.

---

## 🔄 Recommended Build Cadence

Backend-learning focus → **backend-first, thin frontend MVP, then scale**:

| Stage | Phases | Frontend? | Goal |
|-------|--------|-----------|------|
| 1. Core engine | 1 → 4 | None | Backend runnable & tested via Swagger/Postman |
| 2. Thin MVP | — | **Light** | Login + create/list URLs + working redirect (demoable) |
| 3. Scale backend | 5 → 14 | Minimal | Advanced modules, mostly backend-only |
| 4. Frontend polish | — | **Full** | Dashboard, billing, workspace, admin UIs |

See **Frontend Milestones** at the bottom for exactly when to build UI.

---

## Phase 1 — Project Foundation

- [ x] Initialize Node + TypeScript project (`package.json`, `tsconfig`, ESLint, Prettier)
- [ x] Create folder structure (`core/`, `config/`, `modules/`, `workers/`, `jobs/`, `utils/`, `common/`, `types/`)
- [ x] Set up Prisma + PostgreSQL (`schema.prisma`, initial models: User, Url, …)
- [ x] zod-validated `config/env.ts` (typed config loader)
- [ x] Core singletons: `App`, `Server`, `Database`, `Redis`, `Queue`, `Logger`
- [ x] Middlewares: `helmet`, `cors`, `logger` (pino-http), `errorHandler`, `validate`
- [ x] Docker + `docker-compose.yml` (PostgreSQL + Redis for local dev)
- [ ] Health checks: `/healthz` (liveness), `/readyz` (readiness)
- [ x] Graceful shutdown (close server, Prisma, Redis, Queue on SIGTERM/SIGINT)
- [ x] ✅ App boots; verify with `curl localhost:3000/healthz`

---

## Phase 2 — Authentication

- [ x] Register endpoint (+ Zod validation)
- [ x] Login endpoint
- [ x] JWT access token (short-lived)
- [ x] Refresh token (rotating, server-tracked in Redis/DB)
- [ x] Logout (revoke refresh)
- [ x] Password hashing (argon2)
- [ x] Centralized `AppError` + error handler middleware
- [ ] Email verification (token + SMTP send)
- [ ] Password reset (request + confirm via SMTP)
- [ x] `authGuard` middleware (attach user to request)
- [ ] *(Optional)* Google / Gmail OAuth social login
- [ ] Swagger docs for auth routes
- [ ] Integration tests: register → login → protected route → refresh → logout

---

## Phase 3 — URL Management

- [ x] Create URL endpoint
- [ x] Update URL endpoint
- [ x] Delete URL endpoint
- [ ] Custom alias (+ reserved-word blocklist: `api`, `admin`, `docs`, `healthz`…)
- [ ] Password protection on URLs
- [ ] Expiration (TTL / expiry date)
- [ ] Tags
- [ ] Folders
- [ ] Short-code generation strategy (base62 random + collision handling + DB uniqueness)
- [ ] Integration tests for CRUD + alias collision + expiry

---

## Phase 4 — Redirect Service

- [ ] Alias / shortCode lookup route (`GET /:code`)
- [ ] Redirect validation (expiry, password gate, active flag)
- [ ] Fast redirect response (301/302)
- [ ] Enqueue analytics job (fire-and-forget, non-blocking)
- [ ] Swagger / manual test: short link resolves correctly
- [ ] Integration test: expired / password-protected / inactive URLs behave correctly

> 🎯 **After Phase 4 → build the Thin Frontend MVP (see Frontend Milestones).**

---

## Phase 5 — Analytics

- [ ] Click tracking (job consumer persists)
- [ ] Visitor tracking (dedupe by visitor id / IP+UA)
- [ ] Browser detection (UA parse)
- [ ] Country detection (geo from IP / proxy header)
- [ ] Device detection
- [ ] Aggregation queries (totals, time-series)
- [ ] Integration test: redirect enqueues + worker persists analytics

---

## Phase 6 — Redis Integration

- [ ] Write-through cache for redirect lookups (Redis primary, DB on miss)
- [ ] Cache invalidation on URL update / delete
- [ ] TTL policy (e.g. 24h) + re-hydrate on miss
- [ ] Cache hit/miss logging (for tuning)
- [ ] Integration test: second redirect hits cache (DB not queried)

---

## Phase 7 — Background Workers

- [ ] BullMQ connection + queue factories (`Queue.ts`)
- [ ] Retry + dead-letter (failed-job) configuration
- [ ] Worker: analytics ingestion
- [ ] Worker: email sending
- [ ] Worker: notifications
- [ ] Job payload types + enqueue helper functions
- [ ] Integration test: enqueue → worker processes → effect persisted

---

## Phase 8 — API Keys

- [ ] Generate API key (hashed storage, show once)
- [ ] Rotate key
- [ ] Revoke key
- [ ] `apiKeyGuard` middleware (alternative auth path)
- [ ] Scoping/limits per key
- [ ] Integration tests: valid / revoked / missing key behavior

---

## Phase 9 — Rate Limiting

- [ ] Redis-backed rate limiter middleware
- [ ] Per-route limits
- [ ] Per-user limits
- [ ] Per-API-key limits
- [ ] Plan-based quota enforcement (Free vs Pro)
- [ ] Integration test: exceeding limit returns 429 with `Retry-After`

---

## Phase 10 — Workspace

- [ ] Teams (create/join)
- [ ] Members (invite / remove)
- [ ] Roles (owner / admin / member)
- [ ] Permissions (RBAC guards on URL operations)
- [ ] URLs owned by workspace
- [ ] Integration tests: role permissions enforced

---

## Phase 11 — Subscriptions

- [ ] Free Plan definition
- [ ] Pro Plan definition
- [ ] Plan upgrade
- [ ] Plan downgrade
- [ ] Usage quotas (URL count, API calls)
- [ ] Quota enforcement in guards
- [ ] Integration tests: quota blocks at limit

---

## Phase 12 — Payments

- [ ] Create Razorpay order
- [ ] Payment signature verification
- [ ] Webhook endpoint (payment / subscription events)
- [ ] **Idempotency** (key on `razorpay_order_id` — handle duplicates)
- [ ] Subscription activation on success
- [ ] Integration tests: verify + duplicate-webhook safety

---

## Phase 13 — Notifications

- [ ] Email templates (verification, reset, reports, alerts)
- [ ] Periodic report jobs (usage summary)
- [ ] Subscription alert jobs (renewal / expiry)
- [ ] Wire to notification worker (Phase 7)
- [ ] Integration test: report job sends expected email

---

## Phase 14 — Admin Panel (backend)

- [ ] User management endpoints
- [ ] URL management endpoints
- [ ] Reports endpoints
- [ ] Abuse detection (rate spikes, flagged content)
- [ ] Platform statistics endpoints
- [ ] Admin-only guard
- [ ] Integration tests: non-admin blocked, admin actions work

---

## Phase 15 — Production Readiness

- [ ] Docker multi-stage image
- [ ] Structured logging (Pino) with per-env log levels
- [ ] Monitoring / observability hooks (metrics-ready)
- [ ] Harden health checks (`/readyz` checks DB + Redis)
- [ ] Testing suite (unit + integration) gating CI
- [ ] CI/CD pipeline (lint → test → build → deploy)
- [ ] Deploy to Render
- [ ] ✅ Live: short link resolves from production URL

---

## 🎨 Frontend Milestones

Built only at the two checkpoints in the cadence table above.

### MVP Frontend — after Phase 4 (Stage 2)

- [ ] Project scaffold (Vite + React/Next — your choice)
- [ ] Auth screens: Register / Login / Forgot password
- [ ] Dashboard: create short URL (form)
- [ ] Dashboard: list & copy & delete user's URLs
- [ ] Verify a redirect works end-to-end in the browser
- [ ] Wire API client to backend (token storage, refresh)

### Full Frontend — after Phase 14 (Stage 4)

- [ ] Analytics dashboard (clicks, browsers, countries, devices, charts)
- [ ] API Keys page (generate / rotate / revoke)
- [ ] Workspace UI (teams, members, roles)
- [ ] Billing page (plans, Razorpay checkout, webhook status)
- [ ] Admin panel UI (users, URLs, reports, abuse)
- [ ] Polish: loading/error states, responsive layout

---

## 📊 Progress Legend

- `- [ ]` not started
- `- [x]` done
- Optional items (OAuth, etc.) can stay unchecked without blocking the phase.
