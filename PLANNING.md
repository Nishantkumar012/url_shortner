# 📋 Project Planning — URL Shortener SaaS

> A production-ready URL Shortener built to learn scalable backend engineering.
> This document is the single source of truth for architecture, scope, and the build order.

---

## Vision

Build a **production-ready URL Shortener SaaS** while learning the advanced backend
engineering concepts used in modern software companies.

Rather than a simple CRUD app, this project emphasizes **scalability, maintainability,
clean architecture, and production best practices**. Every feature is implemented
incrementally, with the focus on *understanding the underlying concept* — not just
making it work.

---

## Primary Goals

- Build a production-ready backend
- Learn scalable system design
- Write clean, maintainable, type-safe code
- Follow SOLID & Clean Architecture principles
- Practice real-world backend architecture (layered, modular, tested)
- Build a portfolio-worthy SaaS application

---

## Engineering Principles

These govern **every** decision in the codebase:

- **SOLID Principles**
- **Clean Architecture** (dependencies point inward)
- **Layered Architecture** (Controllers → Services → Repositories)
- **Repository Pattern** (data access isolated behind interfaces)
- **Service Layer Pattern** (business logic lives in services)
- **Manual Dependency Injection** (no magic container; wire deps explicitly)
- **Single Responsibility** (one reason to change per module)
- **Feature-Based Modular Design** (each domain is its own folder)
- **Type Safety** (TypeScript everywhere, Zod at the boundaries)
- **Consistent Error Handling** (typed `AppError`, centralized handler)
- **Centralized Validation** (Zod schemas per route/use-case)
- **Reusable Components** (middleware, guards, utils shared across modules)

---

## Technology Stack

### Backend

| Concern        | Choice                                   |
|----------------|------------------------------------------|
| Runtime        | Node.js                                  |
| Framework      | Express.js                               |
| Language       | TypeScript                               |

### Database

- **PostgreSQL** (primary datastore)
- **Prisma ORM** (type-safe queries, migrations)

### Cache

- **Redis** (redirect lookups, rate-limit counters, sessions)

### Queue / Workers

- **BullMQ** (analytics ingestion, email jobs, async notifications)

### Authentication

- **JWT** (access tokens, short-lived)
- **Refresh Tokens** (rotating, stored server-side or in Redis)
- *(Optional add-on: Google / Gmail OAuth — see Auth note)*

### Validation

- **Zod** (schema-first request validation)

### Logging

- **Pino** (structured, fast JSON logging)

### Documentation

- **Swagger / OpenAPI** (auto-served at `/docs`)

### Payments

- **Razorpay** (orders, verification, webhooks)

### Deployment

- **Docker** (multi-stage image)
- **Render** (hosting)

### Cross-cutting (security & ops)

- `helmet` (secure HTTP headers)
- `cors` (configured allowlist)
- Input sanitization
- Health checks (`/healthz`, `/readyz`)
- Graceful shutdown

---

## High-Level Architecture

```
                Client
                   │
          HTTP / REST API  (CORS, helmet, rate-limit)
                   │
             Express Server
        (middlewares → routes → controllers)
                   │
      ┌────────────┴────────────┐
      │                         │
 Controllers              Middlewares
      │                         │
 Services (business logic)
      │
Repositories (data access interfaces)
      │
 Prisma ORM
      │
 PostgreSQL

      │
      ├────────────── Redis        (cache, sessions, rate-limit counters)
      │
      ├────────────── BullMQ       (analytics, emails, notifications)
      │
      └────────────── External APIs (Razorpay, SMTP/email, OAuth provider)
```

**Dependency rule:** outer layers depend on inner layers; inner layers never import
outer ones (no `service` importing `express`, no `repository` importing a controller).

---

## Backend Folder Structure

```
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│
│   ├── core/
│   │   ├── App.ts            # assembles Express app (middlewares, routes)
│   │   ├── Server.ts         # HTTP server + listen + graceful shutdown
│   │   ├── Database.ts       # Prisma client singleton
│   │   ├── Redis.ts          # Redis/IORedis singleton
│   │   ├── Queue.ts          # BullMQ connection + queue factories
│   │   └── Logger.ts         # Pino instance + child loggers
│   │
│   ├── config/
│   │   └── env.ts            # typed env loader (zod-validated config)
│   │
│   ├── middlewares/
│   │   ├── authGuard.ts      # attach authenticated user
│   │   ├── errorHandler.ts   # centralized AppError → HTTP response
│   │   ├── validate.ts       # zod request validation
│   │   ├── rateLimit.ts      # redis-backed limiter
│   │   ├── helmet.ts         # security headers
│   │   └── logger.ts         # request logging (pino-http)
│   │
│   ├── routes/               # versioned route aggregation (v1)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── url/
│   │   ├── redirect/
│   │   ├── analytics/
│   │   ├── api-key/
│   │   ├── subscription/
│   │   ├── payment/
│   │   ├── notification/
│   │   ├── admin/
│   │   └── workspace/
│   │
│   ├── common/               # shared: AppError, result types, base repo, guards
│   ├── workers/              # BullMQ processors
│   ├── jobs/                 # job payload types + enqueue helpers
│   ├── utils/                # short-code gen, hashing, time, etc.
│   ├── types/                # global type declarations
│   └── index.ts              # entrypoint → Server.boot()
│
├── tests/                    # unit + integration (vitest)
├── Dockerfile
├── docker-compose.yml        # pg + redis for local dev
└── package.json
```

### Each `module/` follows the same internal shape

```
modules/url/
├── url.controller.ts
├── url.service.ts
├── url.repository.ts
├── url.routes.ts
├── url.validation.ts         # zod schemas
├── url.types.ts
└── index.ts                  # barrel: wires deps, exports router
```

---

## Module Responsibilities

### Auth
Authentication & authorization.
- Register
- Login
- Access Token (JWT, short-lived)
- Refresh Token (rotating, server-tracked)
- Logout
- Password Hashing (argon2 / bcrypt)
- Email Verification
- Password Reset
- *(Optional: Google / Gmail OAuth — social login extension)*

> **Auth note — credentials first, OAuth later.**
> Build email+password+JWT+refresh as the core (Phase 2). It teaches hashing,
> token rotation, protected routes — the real fundamentals. Add Google OAuth
> afterward as an *optional* social-login path once credentials work. Don't let
> OAuth block the core flow.

### User
Profile management.
- Profile (read)
- Update Profile
- Change Password
- Delete Account

### URL
URL lifecycle management.
- Create URL
- Update URL
- Delete URL
- Custom Alias (user-chosen, validated)
- Password Protection
- Expiration (TTL / expiry date)
- Tags
- Folders

> **Short-code generation strategy (decide early, Phase 3).**
> - **Random base62** short codes (e.g. 7 chars) → collision-resistant, opaque.
> - On collision, regenerate; enforce uniqueness at DB level.
> - **Custom alias** reserved-word blocklist (`api`, `admin`, `healthz`, `docs`, `auth`…)
>   so redirect routing never clashes with system routes.
> - Store both `shortCode` (random) and optional `customAlias` (unique) — redirect
>   lookup checks alias first, then shortCode.

### Redirect
Fast, hot-path redirection.
- Alias / shortCode Lookup
- **Cache Lookup** (Redis — primary; DB only on miss)
- Redirect Validation (expiry, password, active flag)
- Redirect Response (301/302 + analytics enqueue)

> **Caching strategy (the core scalability lesson, Phase 6).**
> - On redirect hit: read Redis first, fallback to PostgreSQL, then **write-through** to Redis.
> - On URL update/delete: **invalidate** the Redis key (cache eviction).
> - TTL policy: cache entries expire (e.g. 24h) to bound memory; re-hydrate on miss.
> - Track cache hit/miss ratio in logs for tuning.

### Analytics
Click & visitor tracking (async, via BullMQ).
- Click Tracking
- Visitor Tracking
- Browser Detection (UA parsing)
- Country Detection (geo from IP / proxy header)
- Device Detection

> Analytics writes are **fire-and-forget**: the redirect path enqueues a job;
> a worker persists. Never block a redirect on analytics DB writes.

### API Keys
Developer API access.
- Generate API Keys
- Rotate Keys
- Revoke Keys
- (Key used as Bearer / `x-api-key` alternative auth path)

### Subscription
Plans & billing state.
- Free Plan
- Pro Plan
- Plan Upgrade
- Plan Downgrade
- Usage quotas (URL count, API calls) enforced via guards

### Payment
Razorpay integration.
- Create Razorpay Order
- Payment Verification (signature check)
- Webhooks (payment/subscription events)
- Subscription Activation

> **Idempotency (real production lesson).**
> Razorpay webhooks can deliver the same event more than once. Key every order
> and webhook handler on an **idempotency key** (e.g. `razorpay_order_id`) so
> duplicate deliveries never double-activate a subscription.

### Workspace
Collaboration.
- Teams
- Members
- Roles
- Permissions (RBAC on URLs within a workspace)

### Notification
Outbound messaging.
- Emails (verification, password reset, reports)
- Reports (periodic usage)
- Subscription Alerts (renewal, expiry)
- Implemented via BullMQ email worker.

### Admin
Platform administration.
- Users
- URLs
- Reports
- Abuse Detection (rate spikes, flagged content)
- Statistics (platform-wide metrics)

---

## Development Phases

> Build order. Each phase ends with a runnable, tested increment.

### Phase 1 — Project Foundation
- Project Setup (Node + TS + ESLint/Prettier)
- Folder Structure (as above)
- Prisma + PostgreSQL schema (core models)
- Environment Variables (zod-validated `config/env.ts`)
- Core singletons (App, Server, Database, Redis, Queue, Logger)
- Docker + docker-compose (pg, redis)
- **Health checks** (`/healthz`, `/readyz`) — pulled earlier, not Phase 15
- Graceful shutdown (close server, prisma, redis, queue on SIGTERM)

### Phase 2 — Authentication
- Register / Login / Logout
- JWT access + rotating refresh tokens
- Password hashing (argon2)
- Zod validation + centralized error handling
- Email Verification + Password Reset (SMTP)
- *(Optional: Google OAuth social login)*

### Phase 3 — URL Management
- Create / Update / Delete URL
- Custom Alias (+ reserved-word blocklist)
- Password Protection, Expiration, Tags, Folders
- Short-code generation strategy implemented + uniqueness enforced

### Phase 4 — Redirect Service
- Alias / shortCode lookup
- Redirect validation (expiry, password, active)
- Fast redirect response; analytics enqueue (no blocking)

### Phase 5 — Analytics
- Click / visitor / browser / country / device tracking
- BullMQ worker persists analytics (non-blocking)

### Phase 6 — Redis Integration
- **Write-through cache** for redirect lookups
- Cache invalidation on URL update/delete
- TTL policy + hit/miss logging

### Phase 7 — Background Workers
- BullMQ queue setup (connection, retry, dead-letter)
- Workers: analytics, email, notifications
- Job payload types + enqueue helpers

### Phase 8 — API Keys
- Generate / Rotate / Revoke
- API-key auth path (middleware)

### Phase 9 — Rate Limiting
- Redis-backed rate limiter middleware
- Per-route + per-user + per-API-key limits
- Plan-based quota enforcement

### Phase 10 — Workspace
- Teams / Members / Roles / Permissions
- RBAC guards on URL operations

### Phase 11 — Subscriptions
- Free / Pro plans
- Upgrade / Downgrade
- Usage quotas + enforcement

### Phase 12 — Payments
- Razorpay orders + signature verification
- Webhooks + **idempotency**
- Subscription activation

### Phase 13 — Notifications
- Email templates (verification, reset, reports, alerts)
- Report + subscription-alert jobs

### Phase 14 — Admin Panel
- User / URL / Report management
- Abuse detection
- Platform statistics

### Phase 15 — Production Readiness
- Docker multi-stage image
- Structured logging (Pino) + log levels per env
- Monitoring / observability hooks
- Health checks (already in Phase 1, harden here)
- Testing (unit + integration, CI)
- CI/CD pipeline
- Deployment to Render

---

## Testing Strategy

- **Unit:** services & utils (short-code gen, hashing, validation) — fast, no I/O.
- **Integration:** routes against a test DB (migrate + seed per run).
- **Contract:** Swagger spec matches routes (generated from code).
- Tooling: **Vitest**; coverage gate in CI.

---

## API Conventions

- Versioned base path: `/api/v1/...`
- Auth: `Authorization: Bearer <accessToken>` (or `x-api-key` for key auth)
- Errors: consistent JSON shape
  ```json
  { "error": { "code": "URL_NOT_FOUND", "message": "..." } }
  ```
- Pagination: `?page=&limit=` with `{ data, meta: { page, limit, total } }`
- Docs: Swagger UI at `/docs`

---

## End Goal

By completing this project, the backend should demonstrate the same architectural
principles used in modern production systems — while remaining **easy to understand,
maintain, and extend**. It should be:

- Type-safe end-to-end
- Tested at unit + integration level
- Containerized and deployable
- Documented via Swagger
- Observable (logs, health, metrics-ready)

A backend you can confidently put in a portfolio and explain, layer by layer.
