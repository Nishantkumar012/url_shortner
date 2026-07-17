# 📊 progress.md — What's Done So Far

> Plain status log of completed work. The phase-by-phase plan lives in
> **[PHASES.md](./PHASES.md)**; the architecture spec is in **[PLANNING.md](./PLANNING.md)**.

_Last updated: 2026-07-14_

---

## ✅ Done

### Project docs
- `README.md` — overview + getting started
- `PLANNING.md` — architecture, module specs, 15-phase spec
- `PHASES.md` — phase task tracker
- `phase1.md` — Phase 1 "what to be done" spec
- `progress.md` — this file
- `backend/` directory tree created (`src/`, `modules/*`, `prisma/`, `tests/`, etc.)
- `backend/.gitignore` — node_modules, dist, .env, logs, coverage, editor/OS

### Backend — Phase 1 (partial)
- `package.json` — deps: express, @prisma/client, @prisma/adapter-pg, pg, dotenv,
  + dev: typescript, tsx, prisma, @types/*
- `tsconfig.json` — configured; fixed two errors (see below)
- `.env` — `DATABASE_URL` set to Neon Postgres
- `src/utils/prisma.ts` — Prisma client singleton using `PrismaPg` driver adapter
- Prisma client **generated** (via local binary `./node_modules/.bin/prisma generate`)
- `tsc --noEmit` passes with **0 errors**

---

## ⚠️ Issues fixed
- **tsconfig `verbatimModuleSyntax`** conflicted with `"type": "commonjs"` → removed it.
- **tsconfig `rootDir: ./src`** rejected `prisma.config.ts` at backend root (TS6059)
  → added `"exclude": ["node_modules", "dist", "prisma.config.ts"]`.
- **`npx prisma generate` hangs** (npx re-fetches) → use local binary instead.

---

## 🚧 Not done yet (Phase 1 remainder)
- `schema.prisma` has **no models yet** (currently empty — `prisma.user` is `undefined`
  until User/RefreshToken models are added and regenerated)
- Core singletons: `App`, `Server`, `Database`, `Redis`, `Queue`, `Logger`
- Middlewares: helmet, cors, error handler, validate
- Health checks (`/healthz`, `/readyz`) + graceful shutdown
- `Dockerfile` + `docker-compose.yml` (pg + redis)
- Phase 2+ (Auth, URL, Redirect, …) not started

---

## 📝 Notes
- Prisma version is **7.8.0** — uses driver adapters by default; client generated into
  `node_modules/.prisma/client`.
- `prisma.user` is `undefined` right now **only because the schema has no models**,
  not because of `prisma.ts`.
