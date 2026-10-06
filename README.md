# 🔗[SnapLink](https://url-shortner-pi-ecru.vercel.app)

> A backend-focused URL Shortener SaaS built with TypeScript, Node.js, PostgreSQL, Redis, and BullMQ.

SnapLink is a URL shortener project built to learn and implement real-world backend engineering concepts. The project focuses on authentication, database design, caching, background jobs, and scalable backend architecture.

The project is being developed incrementally, with each phase focusing on implementing and understanding a specific backend concept.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Access token and refresh token flow
* Refresh token storage and hashing
* Protected routes
* Password hashing using Argon2
* Request validation using Zod
* Logout
* Refresh token handling

### 🔗 URL Management

* Create short URLs
* Generate unique short codes
* Custom short codes
* Update URLs
* Delete URLs
* User-specific URL management
* URL expiration
* Soft deletion

### ⚡ Redis Caching

Redis is used to cache URL mappings and improve redirect performance.

```text
Client
   │
   ▼
Short URL
   │
   ▼
Redis
   │
   ├── Cache Hit ──────► Original URL
   │
   └── Cache Miss
           │
           ▼
       PostgreSQL
           │
           ▼
      Store in Redis
           │
           ▼
       Original URL
```

Cache invalidation is performed when URLs are updated or deleted to prevent stale redirect data.

### 📨 Background Jobs

BullMQ is used for asynchronous background processing.

Current implementation includes:

* Redis-backed queues
* Background job processing
* Email-related job infrastructure

Background jobs allow non-critical operations to be processed outside the main API request flow.

### 🏗️ Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Each layer has a specific responsibility:

* **Controller** — Handles HTTP requests and responses
* **Service** — Contains application and business logic
* **Repository** — Handles database operations
* **Prisma** — Provides database access
* **Middleware/Guards** — Handles authentication and request protection

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Authentication & Security

* JWT
* Argon2
* Zod

### Infrastructure

* Redis
* BullMQ

### Logging

* Pino

---

## 📚 Backend Concepts Implemented

* REST API design
* JWT authentication
* Access and refresh tokens
* Password hashing
* Request validation with Zod
* Layered backend architecture
* Repository pattern
* Prisma ORM
* PostgreSQL database design
* Redis caching
* Cache invalidation
* Background processing with BullMQ
* Soft deletion
* URL expiration
* Error handling
* Environment-based configuration
* Structured logging

---

## 🚧 Coming Soon

The following features are planned for future phases and are **not implemented yet**.

### 📊 Analytics

* Click tracking
* Unique visitors
* Browser and device statistics
* Country statistics
* Referrer analytics
* Daily, weekly, and monthly reports

### 🔑 Developer API

* API key generation
* API key rotation
* API key revocation
* Redis-backed rate limiting

### 👥 Team & Workspace

* Workspaces
* Member management
* Role-based access control
* Shared URL management

### 💳 SaaS & Payments

* Free and Pro plans
* Monthly and yearly subscriptions
* Razorpay integration
* Payment verification
* Idempotent payment webhooks
* Subscription lifecycle management

### 🔒 Advanced URL Features

* Password-protected URLs
* Enable/disable URLs
* Tags
* Folders
* Reserved alias blocklist

### 👨‍💼 Admin Panel

* User management
* URL management
* Abuse detection
* Admin reports

### 🚀 Infrastructure

* Docker
* CI/CD
* Production monitoring
* Health checks
* Graceful shutdown
* Swagger/OpenAPI documentation

---

## 🚀 Development Status

SnapLink is currently under active development.

The project is being built incrementally instead of implementing all planned SaaS features at once.

Implemented features are documented in the **Features** section, while planned functionality is listed under **Coming Soon**.

---

## 🎯 Goal

The goal of SnapLink is to gain practical experience building a realistic backend system while learning:

* Backend architecture
* Authentication and security
* Database design
* Caching
* Background processing
* API design
* Scalable backend patterns
* Production engineering

The project will continue to evolve as new backend concepts and features are implemented.

---

## 📄 License

This project is currently built for learning purposes and may evolve into a production-ready SaaS application.
