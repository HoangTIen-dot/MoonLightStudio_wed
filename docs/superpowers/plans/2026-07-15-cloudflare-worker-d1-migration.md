# Cloudflare Worker D1 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Cloudflare Worker + D1 backend that can replace the paid Node backend for public launch while preserving the existing Express backend as fallback.

**Architecture:** Create a new `worker/` project using Hono, D1 migrations, and Worker-compatible Web Crypto helpers. Keep frontend API shapes compatible with the existing `client` services and keep `server/` untouched except for docs if needed.

**Tech Stack:** Cloudflare Workers, Hono, D1, TypeScript, Vitest, Web Crypto, Cloudinary signed upload API.

## Global Constraints

- Keep `server/` in the repository.
- Add a new `worker/` backend.
- D1 starts empty; no MongoDB data migration.
- Email notification is deferred to a later phase.
- Cloudinary signed uploads must work from Worker runtime.
- Frontend continues to use `VITE_API_BASE_URL`.
- Do not deploy unless explicitly requested.

---

### Task 1: Worker Project Scaffold And D1 Schema

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/vitest.config.ts`
- Create: `worker/wrangler.toml`
- Create: `worker/src/index.ts`
- Create: `worker/src/types.ts`
- Create: `worker/migrations/0001_initial.sql`

**Interfaces:**
- Produces Worker app mounted at `/api`.
- Produces D1 binding name `DB`.

- [ ] Add dependencies: `hono`, `@cloudflare/workers-types`, `typescript`, `vitest`, `wrangler`.
- [ ] Create D1 schema with tables and indexes.
- [ ] Add health route `GET /api/health`.
- [ ] Add scripts: `dev`, `test`, `typecheck`, `deploy`.
- [ ] Verify `npm.cmd test` and `npm.cmd run typecheck` in `worker`.

### Task 2: Worker Crypto, Auth, And Seed Helpers

**Files:**
- Create: `worker/src/lib/crypto.ts`
- Create: `worker/src/lib/crypto.test.ts`
- Create: `worker/src/lib/jwt.ts`
- Create: `worker/src/lib/jwt.test.ts`
- Create: `worker/src/modules/auth.ts`
- Create: `worker/src/modules/admin-users.ts`

**Interfaces:**
- Produces `hashPassword`, `verifyPassword`.
- Produces `signJwt`, `verifyJwt`.
- Produces `POST /api/auth/login`, `GET /api/auth/me`.
- Produces admin user CRUD routes and seed helper route/command support.

- [ ] Implement PBKDF2 password hashing with per-user salt.
- [ ] Implement HMAC SHA-256 JWT signing and verification.
- [ ] Add owner/admin role checks.
- [ ] Add admin users repository functions against D1.
- [ ] Add owner-only admin user routes.
- [ ] Add tests for password and JWT helpers.

### Task 3: Worker Public CMS Routes

**Files:**
- Create: `worker/src/modules/brands.ts`
- Create: `worker/src/modules/projects.ts`
- Create: `worker/src/modules/videos.ts`
- Create: `worker/src/modules/leads.ts`
- Create: `worker/src/lib/validation.ts`

**Interfaces:**
- Produces public routes compatible with current frontend.
- Produces admin CRUD routes for brands/projects/videos/leads.

- [ ] Implement brand public/admin routes.
- [ ] Implement project public/admin routes with brand nesting.
- [ ] Implement video public/admin routes with Vimeo normalization.
- [ ] Implement lead public create/admin list/update routes.
- [ ] Preserve response shapes `{ brands }`, `{ projects }`, `{ videos }`, `{ leads }`.
- [ ] Filter public videos by published project.

### Task 4: Worker Cloudinary Signed Upload

**Files:**
- Create: `worker/src/modules/uploads.ts`
- Create: `worker/src/modules/uploads.test.ts`

**Interfaces:**
- Produces `POST /api/admin/uploads/signature`.

- [ ] Implement Cloudinary SHA-1 signature with Web Crypto.
- [ ] Return the same upload signature response shape as the existing backend.
- [ ] Add tests for deterministic signature generation.

### Task 5: Frontend And Docs For Worker Deployment

**Files:**
- Modify: `README.md`
- Modify: `client/.env.example`
- Add or modify docs under `docs/` if helpful.

**Interfaces:**
- Documents Cloudflare Worker + D1 deployment.

- [ ] Document `wrangler d1 create`.
- [ ] Document applying migrations.
- [ ] Document Worker secrets and vars.
- [ ] Document owner seeding workflow.
- [ ] Document setting `VITE_API_BASE_URL` to Worker `/api` URL.

### Task 6: Full Verification

**Files:**
- No new source files unless fixing verification failures.

**Interfaces:**
- Consumes completed Tasks 1-5.

- [ ] Run `npm.cmd test` in `worker`.
- [ ] Run `npm.cmd run typecheck` in `worker`.
- [ ] Run `npm.cmd test` in `client`.
- [ ] Run `npm.cmd run build` in `client`.
- [ ] Run `npm.cmd test` in `server`.
- [ ] Run `npm.cmd run build` in `server`.
- [ ] Review `git diff --stat`.
- [ ] Commit logical checkpoints.
