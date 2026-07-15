# Public Launch Readiness Design

## Goal

Make the MoonLight Studio website ready for a real public launch using Cloudflare Pages for the frontend and Render for the backend API. The launch version must protect admin workflows, notify the studio when leads arrive, support English/Vietnamese public content, and document production deployment clearly.

## Confirmed Decisions

- Frontend hosting: Cloudflare Pages.
- Backend hosting: Render Node service.
- Initial public domain: Cloudflare Pages temporary domain.
- Lead notifications: Gmail SMTP through environment variables, with no hardcoded email addresses.
- Admin accounts: seed the first `owner`, then manage additional admins from the CMS.
- Roles: `owner` can manage admin users; `admin` can manage content and leads only.
- Public language scope: homepage only. Admin UI remains English.

## Non-Goals

- Do not migrate the Express backend to Cloudflare Workers.
- Do not add billing, analytics dashboards, or client accounts.
- Do not implement full i18n for admin UI.
- Do not deploy from this implementation unless explicitly requested after the code is ready.
- Do not hardcode real Gmail credentials or production URLs.

## Architecture

The existing Vite React frontend and Express/Mongo backend remain the base architecture.

Frontend:

- Cloudflare Pages serves the static `client/dist` output.
- `client/public/_redirects` keeps SPA routes working on refresh.
- Public homepage reads language copy from local translation data.
- Language preference is stored in `localStorage` under `moonlightLanguage`.
- Admin routes keep their existing URL structure and are protected by the existing `AdminAuthGate`.

Backend:

- Render runs the compiled Express API from `server/dist`.
- MongoDB Atlas stores CMS content, leads, and admin users.
- Cloudinary remains the media upload provider.
- Gmail SMTP is used only for lead notification email.
- JWT auth remains in place for this launch, with role-aware authorization.

## Backend Security

Add production hardening without changing the basic auth model:

- Use `helmet` for common HTTP security headers.
- Use `express-rate-limit` for global API protection.
- Add stricter rate limits for:
  - `POST /api/auth/login`
  - `POST /api/public/leads`
- Keep CORS restricted to `CLIENT_ORIGIN`.
- Keep JSON request body limit at `2mb`.
- Ensure auth middleware exposes `res.locals.admin` with `userId` and role.
- Add `requireOwner` middleware for owner-only routes.

This launch keeps JWT in localStorage because replacing it with HttpOnly cookies would expand scope and require deeper frontend/API session changes. The remaining risk must be documented in the README roadmap.

## Lead Notification

When a public lead is created:

- Save the lead to MongoDB first.
- Attempt to send a Gmail notification email after the save succeeds.
- If SMTP env is missing, skip email and log a clear warning.
- If email sending fails, keep the saved lead and log the error; do not fail the user-facing form after persistence.

Environment variables:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER`
- `SMTP_APP_PASSWORD`
- `LEAD_NOTIFICATION_TO`
- `LEAD_NOTIFICATION_FROM`

Email content should include name, company, email, phone, message, status, and created timestamp.

## Admin Users

Extend the admin user model:

- Roles: `owner` and `admin`.
- Seed script reads `ADMIN_ROLE`, defaulting to `owner`.
- Existing admin JWT payload includes role.

Add backend routes under `/api/admin/users`:

- `GET /api/admin/users` lists admin users without password hashes.
- `POST /api/admin/users` creates an admin user with email, password, and role.
- `PATCH /api/admin/users/:id` updates email, role, and optionally password.
- `DELETE /api/admin/users/:id` deletes an admin user.

Rules:

- Only `owner` can access these routes.
- Prevent deleting the last owner.
- Prevent an owner from removing their own owner role if that would leave no owner.
- Passwords must be at least 12 characters.
- Email is normalized to lowercase.
- Never return `passwordHash`.

Add frontend:

- Dashboard card for `Admin Users`.
- Admin Users page at `/admin/users`.
- Page loads only for owners. Non-owner users should see an access error or be redirected to dashboard after API denies access.
- Create/edit/delete admin accounts with clear loading and error states.

## Public Homepage I18n

Add a minimal i18n layer for the public homepage only:

- Default language: English.
- Available languages: `en`, `vi`.
- Language switcher visible on the homepage.
- Store preference in `localStorage` as `moonlightLanguage`.
- Use browser storage only on the client, with English fallback.

Translation scope:

- Hero section visible copy.
- Marquee/service/project/contact section headings and body copy.
- Contact form labels, placeholders, validation messages, button text, and success/error copy.
- Static fallback project/service copy.

CMS content remains user-authored and is not automatically translated.

## SEO and Deploy Config

Add a small public site config so placeholder URLs are easy to replace:

- `VITE_PUBLIC_SITE_URL` for canonical/sitemap instructions.
- README must explain using the Cloudflare Pages URL first, then replacing it with a custom domain later.
- Keep `robots.txt`, `sitemap.xml`, and `_redirects` in `client/public`.
- Update README with Render backend steps and Cloudflare Pages frontend steps.

If runtime canonical tags are added, they should use the configured site URL with a safe fallback.

## Performance

Reduce launch-impacting image weight where it can be done safely:

- Identify local images imported into the production client bundle.
- Replace oversized images with WebP versions sized for actual display usage when generated output preserves visual quality.
- Keep source/original assets only if they are still needed and not imported by the bundle.
- Re-run production build and compare asset sizes.

The launch target is to remove multi-megabyte images from the initial production bundle where practical.

## Verification

Required verification before completion:

- `npm.cmd test -- AdminAuthGate` in `client`.
- Client i18n tests if a focused test can be added without excessive scaffolding.
- `npm.cmd test -- public-video-response` in `server`.
- Server admin user route/helper tests.
- `npm.cmd run build` in `client`.
- `npm.cmd run build` in `server`.
- Manual code review of environment examples and README deploy steps.

## Success Criteria

- Public homepage can switch between English and Vietnamese.
- Contact form still stores leads and can send Gmail notifications when SMTP env is configured.
- Missing or failing SMTP does not lose leads.
- Admin pages validate session before rendering.
- Owners can manage admin users from the CMS.
- Admin users cannot manage other admin accounts.
- Public videos do not expose unpublished projects.
- Cloudflare Pages refreshes on SPA routes without 404.
- README and `.env.example` files cover Cloudflare Pages, Render, MongoDB, Cloudinary, Gmail SMTP, and owner seeding.
- Client and server builds pass.
