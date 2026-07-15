# Public Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MoonLight Studio website ready for a real public launch on Cloudflare Pages with a Render-hosted API.

**Architecture:** Keep the existing Vite React frontend and Express/Mongo backend. Add production hardening, Gmail lead notification, owner/admin management, public homepage i18n, deploy documentation, and practical performance cleanup without migrating runtimes.

**Tech Stack:** React 18, Vite, Tailwind CSS, Express 4, TypeScript, MongoDB/Mongoose, Cloudinary, Gmail SMTP/Nodemailer, Vitest.

## Global Constraints

- Frontend hosting: Cloudflare Pages.
- Backend hosting: Render Node service.
- Initial public domain: Cloudflare Pages temporary domain.
- Lead notifications use Gmail SMTP through environment variables, with no hardcoded email addresses.
- Seed the first `owner`, then manage additional admins from the CMS.
- Roles are `owner` and `admin`; only `owner` can manage admin users.
- Public language scope is homepage only. Admin UI remains English.
- Do not migrate Express to Cloudflare Workers.
- Do not deploy unless explicitly requested after code is ready.

---

### Task 1: Backend Security And Lead Notification

**Files:**
- Modify: `server/package.json`
- Modify: `server/package-lock.json`
- Modify: `server/src/config/env.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/modules/leads/lead.routes.ts`
- Create: `server/src/modules/leads/lead-notification.ts`
- Create: `server/src/modules/leads/lead-notification.test.ts`
- Modify: `server/.env.example`

**Interfaces:**
- Produces: `sendLeadNotification(lead: LeadNotificationPayload): Promise<LeadNotificationResult>`.
- Produces: `createLeadLimiter`, `loginLimiter`, and global limiter wired into Express.

- [ ] Install `helmet`, `express-rate-limit`, `nodemailer`, and `@types/nodemailer`.
- [ ] Extend env schema with optional SMTP variables.
- [ ] Add Helmet and global rate limiting in `app.ts`.
- [ ] Add strict rate limit to `POST /api/auth/login`.
- [ ] Add strict rate limit to `POST /api/public/leads`.
- [ ] Save leads before attempting notification.
- [ ] Skip notification with a clear status if SMTP env is incomplete.
- [ ] Log notification failures without failing saved leads.
- [ ] Add tests for configured, missing-config, and failed-email notification behavior.

### Task 2: Owner/Admin Auth Model And API

**Files:**
- Modify: `server/src/modules/auth/admin-user.model.ts`
- Modify: `server/src/modules/auth/auth.service.ts`
- Modify: `server/src/middlewares/auth.middleware.ts`
- Modify: `server/src/scripts/seed-admin.ts`
- Create: `server/src/modules/admin-users/admin-user.routes.ts`
- Create: `server/src/modules/admin-users/admin-user.service.ts`
- Create: `server/src/modules/admin-users/admin-user.service.test.ts`
- Modify: `server/src/app.ts`
- Modify: `server/.env.example`

**Interfaces:**
- Produces role type `AdminRole = 'owner' | 'admin'`.
- Produces owner-only routes under `/api/admin/users`.

- [ ] Extend admin user schema role enum to `owner | admin`.
- [ ] Include role in JWT payload and `/auth/me`.
- [ ] Add `requireOwner` middleware.
- [ ] Update seed script to read `ADMIN_ROLE`, default `owner`.
- [ ] Add service helpers to normalize email, hash passwords, hide password hashes, prevent last-owner deletion/demotion.
- [ ] Add CRUD routes for admin users.
- [ ] Add focused tests for last-owner protection and serialization.

### Task 3: Admin Users Frontend

**Files:**
- Modify: `client/src/features/auth/auth.service.ts`
- Create: `client/src/features/admin-users/admin-user.service.ts`
- Create: `client/src/pages/admin/AdminUsersPage.tsx`
- Modify: `client/src/pages/admin/AdminDashboardPage.tsx`
- Modify: `client/src/app/App.tsx`

**Interfaces:**
- Consumes `/api/admin/users`.
- Produces `/admin/users` route protected by `AdminAuthGate` and API owner authorization.

- [ ] Update admin session type to role `owner | admin`.
- [ ] Add admin user API client functions.
- [ ] Add dashboard card for Admin Users.
- [ ] Add Admin Users page with list/create/edit/delete flows.
- [ ] Show owner-only access errors cleanly when API denies access.
- [ ] Keep admin UI English.

### Task 4: Public Homepage I18n

**Files:**
- Create: `client/src/features/public/i18n.ts`
- Create: `client/src/features/public/i18n.test.ts`
- Modify: `client/src/pages/public/HomePage.tsx`
- Modify: `client/src/features/public/homepage.data.ts`
- Modify: public section components under `client/src/features/public/components/`

**Interfaces:**
- Produces `usePublicLanguage()` and translation data for `en` and `vi`.
- Stores language preference in `localStorage` key `moonlightLanguage`.

- [ ] Add language union `PublicLanguage = 'en' | 'vi'`.
- [ ] Add safe language read/write helpers with English fallback.
- [ ] Add visible EN/VI switcher.
- [ ] Pass translated copy into public sections.
- [ ] Translate visible static homepage copy, services, fallback projects, contact form labels/messages.
- [ ] Keep CMS project/video content as authored.
- [ ] Add tests for language fallback and storage parsing.

### Task 5: SEO, Deploy Docs, And Performance Cleanup

**Files:**
- Modify: `README.md`
- Modify: `client/.env.example`
- Modify: `server/.env.example`
- Modify: `client/index.html`
- Modify: `client/public/robots.txt`
- Modify: `client/public/sitemap.xml`
- Modify or replace imported image assets when safe.

**Interfaces:**
- Produces documented Render and Cloudflare Pages setup.
- Produces `VITE_PUBLIC_SITE_URL` env example.

- [ ] Add `VITE_PUBLIC_SITE_URL` to client env example.
- [ ] Add Render backend env and deploy steps to README.
- [ ] Add Gmail App Password setup notes to README.
- [ ] Add owner seed notes and phase-2 session risk note to README.
- [ ] Add canonical/site URL guidance.
- [ ] Generate safe resized WebP replacements for imported oversized images where practical.
- [ ] Update imports to optimized images.
- [ ] Rebuild and compare bundle asset sizes.

### Task 6: Full Verification And Integration

**Files:**
- No new source files unless fixing verification failures.

**Interfaces:**
- Consumes completed Tasks 1-5.
- Produces clean working tree commits.

- [ ] Run `npm.cmd test` in `client`.
- [ ] Run `npm.cmd test` in `server`.
- [ ] Run `npm.cmd run build` in `client`.
- [ ] Run `npm.cmd run build` in `server`.
- [ ] Review `git diff --stat`.
- [ ] Commit logical checkpoints.
- [ ] Report remaining deployment-only steps.
