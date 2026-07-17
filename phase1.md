# 🟦 Phase 1 — Project Foundation (What To Be Done)

> Goal: a **runnable Express + TypeScript backend** that boots, connects to
> PostgreSQL, exposes health checks, and shuts down gracefully — with the folder
> skeleton and tooling in place for every later phase.
>
> This phase produces **no business features** — only foundation. Verify the boot
> gate at the end before moving to Phase 2.
>
> Cross-off items as you complete them. (Full tracker: `PHASES.md`; work log: `progress.md`.)

---

## 1. Tooling & Project Init

- [ ] **Initialize `package.json`** in `backend/`
  - `name`, `version`, `"type": "module"`, `scripts`:
    - `dev` → run with `tsx watch` (or `ts-node-dev`) on `src/index.ts`
    - `build` → `tsc -p tsconfig.json`
    - `start` → `node dist/index.js`
    - `lint` → `eslint .`
    - `format` → `prettier --write .`
    - `prisma:generate` → `prisma generate`
    - `prisma:migrate` → `prisma migrate dev`
    - `test` → `vitest`
- [ ] **`tsconfig.json`** (strict, modern):
  - `target` ES2022, `module` NodeNext, `moduleResolution` NodeNext
  - `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`
  - `outDir: dist`, `rootDir: src`, `sourceMap: true`
  - `baseUrl: src` + `@/*` path alias (used by all modules)
- [ ] **ESLint + Prettier** configs (TypeScript rules, import sorting, 100-col)
- [ ] **`.gitignore`** → `node_modules/`, `dist/`, `.env`, `*.log`
- [ ] **`.nvmrc`** + `engines.node` (e.g. `>=18`) for reproducible env
- [ ] **Install dependencies**
  - runtime: `express`, `cors`, `helmet`, `zod`, `@prisma/client`,
    `pino`, `pino-http`, `ioredis`, `bullmq`, `dotenv`
  - dev: `typescript`, `tsx`, `prisma`, `eslint`, `prettier`,
    `@types/express`, `@types/cors`, `@types/node`, `vitest`

---

## 2. Folder Structure (already created)

- [ ] Confirm the `backend/` tree from `PLANNING.md` exists:
  `src/{core,config,middlewares,routes,modules/*,common,workers,jobs,utils,types}`,
  `prisma/`, `tests/`
- [ ] (No code yet — this just confirms where things go. `.gitkeep` files keep
  empty dirs tracked once git is initialized.)

---

## 3. Prisma + PostgreSQL

- [ ] Add `prisma` + `@prisma/client`; run `prisma init` (or hand-write `schema.prisma`)
- [ ] **`prisma/schema.prisma`** with:
  - `datasource db { provider = "postgresql"; url = env("DATABASE_URL") }`
  - `generator client { provider = "prisma-client-js" }`
  - **Initial models for Phase 1–2 foundation** (keep minimal now; extend later):
    - `User` (id, email unique, passwordHash, name, role, createdAt, updatedAt)
    - `RefreshToken` (id, tokenHash, userId→User, expiresAt, revoked, createdAt)
    - `Url` can wait for Phase 3, but you may stub it now if desired
- [ ] **`.env`** (and `.env.example`) with:
  - `DATABASE_URL="postgresql://user:pass@localhost:5432/linkforge?schema=public"`
  - `PORT=3000`, `NODE_ENV=development`
  - `REDIS_URL="redis://localhost:6379"` (used from Phase 6; set now)
- [ ] **First migration**: `npx prisma migrate dev --name init` (creates `prisma/migrations/`)
- [ ] **`prisma generate`** to emit the client

---

## 4. Typed Config — `src/config/env.ts`

- [ ] Create `src/config/env.ts` that:
  - loads `process.env` (via `dotenv` at entry only)
  - validates with a **Zod schema** (`port`, `nodeEnv`, `databaseUrl`, `redisUrl`, `logLevel`, `corsOrigin`, `apiPrefix`)
  - `throw`s a clear error on missing/invalid vars (fails fast at boot)
  - exports a typed `env` object used everywhere instead of `process.env`
- [ ] Reference `env` from `core/*` (never read `process.env` directly elsewhere)

---

## 5. Core Singletons — `src/core/`

- [ ] **`Logger.ts`** — Pino instance; level from `env.logLevel`; export a single
  `logger` + `child()` helper for request/job scoped logs.
- [ ] **`Database.ts`** — `PrismaClient` **singleton** (one instance for the app;
  reuse in repos). Export `prisma`.
- [ ] **`Redis.ts`** — `ioredis` client singleton from `env.redisUrl`; handle
  `connect`/`error` events; export `redis`. (Real caching starts Phase 6.)
- [ ] **`Queue.ts`** — BullMQ `Queue`/`Worker` connection helper (Redis-backed);
  export factories. (Real jobs start Phase 7.)
- [ ] **`App.ts`** — builds the Express `app`:
  - applies `helmet`, `cors`, `pino-http`, `express.json()`
  - mounts `errorHandler` (must be **last**)
  - registers routes from `src/routes`
- [ ] **`Server.ts`** — `http.createServer(app)`, `listen(env.port)`, logs ready
  state, and wires **graceful shutdown** (see step 8).
- [ ] **`src/index.ts`** — entrypoint: `dotenv` → validate `env` → `Server.boot()`.

---

## 6. Shared Error Handling — `src/common/`

- [ ] **`AppError.ts`** — base error class with `statusCode`, `code`, `isOperational`.
  Subclasses/examples: `ValidationError`, `NotFoundError`, `UnauthorizedError`.
- [ ] **`middlewares/errorHandler.ts`** — catches `AppError` (and unknowns), logs
  with `Logger`, returns consistent JSON:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "..." } }
  ```
- [ ] **`middlewares/validate.ts`** — Zod-validate `req.body/params/query`, throw
  `ValidationError` on failure (reused by every route later).

---

## 7. Docker (local dev)

- [ ] **`docker-compose.yml`** at `backend/` (or repo root): services `postgres`
  (image `postgres:16`, port 5432, volume, env) and `redis` (image `redis:7`, port 6379).
- [ ] **`Dockerfile`** — multi-stage (build with `tsc`, run `node dist`). Can be
  minimal now; harden in Phase 15. Add **`.dockerignore`** (`node_modules`, `dist`, `.env`).
- [ ] Verify `docker compose up -d` brings up pg + redis and `DATABASE_URL`/`REDIS_URL` connect.

---

## 8. Health Checks + Graceful Shutdown

- [ ] **`routes/health.routes.ts`** (+ tiny controller):
  - `GET /healthz` → `{ "status": "ok" }` (liveness; no deps)
  - `GET /readyz` → checks `prisma.$queryRaw` / Redis ping; returns 200/503
- [ ] **Graceful shutdown in `Server.ts`**:
  - on `SIGTERM`/`SIGINT`: stop accepting new connections (`server.close`)
  - `await prisma.$disconnect()`, `redis.quit()`, `queue.close()`
  - log shutdown, `process.exit(0)` after clean close (or `1` on timeout)
- [ ] Log unmounted/unhandled: `process.on('unhandledRejection')`, `uncaughtException`

---

## 9. Boot Gate (definition of "Phase 1 done")

- [ ] `npm install` succeeds
- [ ] `docker compose up -d` → pg + redis healthy
- [ ] `npx prisma migrate dev` applies cleanly
- [ ] `npm run dev` starts with **no errors**
- [ ] `curl localhost:3000/healthz` → `200 { "status": "ok" }`
- [ ] `curl localhost:3000/readyz` → `200` (DB + Redis reachable)
- [ ] `Ctrl-C` (SIGINT) → logs graceful shutdown, exits cleanly (no open handles)
- [ ] `npm run build` → `dist/` produced without TS errors

> ✅ When all of the above pass, Phase 1 is complete. **Do not start features
> until this gate is green** — everything later depends on it.

---

## Notes / Decisions to record later
- Package manager choice (npm/pnpm/yarn) — pick one, stay consistent.
- `tsx` vs `ts-node-dev` for `dev` (recommend `tsx`).
- Path alias `@/*` requires `tsconfig` + a runtime resolver (e.g. `tsconfig-paths`
  or build with `tsc` only). Decide now to avoid refactors.
- These belong in `DECISIONS.md` (planned) when you start capturing trade-offs.
