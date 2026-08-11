# 🔗 LinkForge

> A production-ready URL Shortener SaaS built to learn advanced backend engineering, scalable architecture, and real-world software development practices.

---

## 📖 Overview

SnapLink is more than just a URL shortener.

The primary goal of this project is to build a **production-grade SaaS application** while learning how modern backend systems are designed, developed, and scaled.

This project focuses on writing clean, maintainable code and implementing real-world backend concepts such as authentication, caching, background jobs, analytics, payments, and scalable architecture.

> 📌 The authoritative architecture, module specs, and phased build order live in **[PLANNING.md](./PLANNING.md)**. Read that alongside this file.

---

## 🎯 Objectives

- Learn advanced backend development
- Build a production-ready SaaS application
- Apply clean architecture & SOLID principles
- Understand scalable system design
- Practice production engineering concepts
- Create a strong portfolio project

---

## ✨ Planned Features

### Authentication

- User Registration
- Login
- Access & Refresh Tokens (rotating)
- Logout
- Protected Routes
- Email Verification
- Password Reset
- *(Optional: Google / Gmail OAuth social login)*

### URL Management

- Generate Short URLs
- Custom Alias (with reserved-word blocklist)
- Edit / Delete URLs
- Password Protected URLs
- URL Expiration
- Enable / Disable URLs
- Tags & Folders

### Redirect Service

- Fast URL Redirection (Redis-cached)
- HTTP 301 / 302 Redirects
- Alias Resolution
- Expiration & Password Validation

### Analytics

- Total Clicks
- Unique Visitors
- Browser / Device / Country Statistics
- Referrer Analytics
- Daily / Weekly / Monthly Reports

### API Platform

- API Keys (generate / rotate / revoke)
- Rate Limiting (Redis-backed)
- Developer APIs

### Team Collaboration

- Workspaces
- Member Management
- Role-Based Access (RBAC)

### Subscription System

- Free Plan
- Pro Plan
- Monthly / Yearly Billing
- Plan Upgrade / Downgrade

### Payments

- Razorpay Integration
- Payment Verification (signature check)
- Webhooks (idempotent)
- Subscription Activation

### Admin Panel

- User Management
- URL Management
- Reports
- Abuse Detection

> 💡 **Dashboard, QR Codes, and advanced search/filtering** are part of the broader product vision and may be added after the core backend modules in `PLANNING.md` are complete.

---

## 🏗️ Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- JWT
- Refresh Tokens
- *(Optional: Google OAuth)*

### Cache

- Redis

### Queue

- BullMQ

### Validation

- Zod

### Logging

- Pino

### Documentation

- Swagger / OpenAPI

### Payments

- Razorpay

### Deployment

- Docker (multi-stage image)
- Render (backend hosting)
- *(Optional future: Vercel for a separate frontend)*

---

## 📚 Backend Concepts Covered

- REST API Design
- Authentication & Authorization
- Refresh Token Rotation
- Role-Based Access Control (RBAC)
- Clean Architecture & SOLID
- Repository Pattern
- Service Layer
- Manual Dependency Injection
- Middleware & Guards
- Database Indexing
- Redis Caching (write-through + invalidation)
- Background Workers (BullMQ)
- Queue Processing
- Rate Limiting
- Payment Webhooks (idempotency)
- Subscription Billing
- Pagination
- Search & Filtering
- Structured Logging (Pino)
- Health Checks & Graceful Shutdown
- Docker
- CI/CD
- Production Deployment

---

## 🚀 Getting Started

> 🛠️ Scaffolding lands in **Phase 1** of `PLANNING.md`. The commands below reflect the *target* setup.

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- (Optional) Docker + Docker Compose

### Target Setup

```bash
# from the backend/ directory
cp .env.example .env
docker compose up -d          # starts PostgreSQL + Redis
npm install
npx prisma migrate dev
npm run dev
```

The API will be available at `http://localhost:3000` and Swagger docs at `http://localhost:3000/docs`.

---

## 📁 Documentation

- **README.md** — This overview
- **[PLANNING.md](./PLANNING.md)** — Canonical architecture, module specs & phased roadmap
- **[PHASES.md](./PHASES.md)** — Phase-by-phase cross-off task tracker
- **[progress.md](./progress.md)** — Work-done tracker (completed items)
- *DECISIONS.md* (planned) — Key architectural decisions & trade-offs

---

## 📈 Development Status

This project is currently under active development.

Development follows the phase-by-phase roadmap in `PLANNING.md`, with each phase focusing on a specific backend concept before moving to the next. Current phase: **Phase 1 — Project Foundation** (not yet scaffolded).

---

## 🎓 Learning Outcome

By the end of this project, the goal is to gain hands-on experience with:

- Advanced Backend Development
- SaaS Architecture
- Scalable System Design
- Production Best Practices
- High-Performance API Development
- Real-World Software Engineering

---

## 📄 License

This project is built for learning purposes and may evolve into a production-ready SaaS application.
