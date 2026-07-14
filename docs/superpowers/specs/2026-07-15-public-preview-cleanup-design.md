# Public Preview Cleanup Design

## Goal

Prepare the MoonLight Studio portfolio for a clean pre-public preview without expanding the product scope. This phase fixes visible issues, documents setup/deploy assumptions, and adds minimal public-site readiness files so the project is easier to review before a full production launch.

## Scope

This phase includes:

- Fix visible mojibake or broken text encoding in the current UI, starting with the admin login page.
- Add setup and preview documentation for the existing React/Vite frontend and Express/Mongo backend.
- Add environment variable examples for both client and server.
- Add basic public SEO support files: `robots.txt` and `sitemap.xml` with clearly editable production-domain placeholders.
- Review large local image assets and either create safe optimized replacements or document exact optimization work needed when image replacement would risk visual regressions.
- Verify that client and server production builds still pass.

This phase explicitly does not include:

- Gmail notification for lead submissions.
- Full bilingual EN/VI content system.
- Admin Users page, multiple admin management, or owner/admin roles.
- Full production security hardening such as rate limiting, Helmet, CAPTCHA, session redesign, or HttpOnly cookies.
- Cloudflare Pages deployment execution.

Those items remain in a later public-launch phase.

## Architecture

The existing architecture stays unchanged:

- Frontend: Vite, React, Tailwind, static build output from `client`.
- Backend: Express, TypeScript, MongoDB/Mongoose, Cloudinary signed uploads, build output from `server`.
- Deployment target assumption for later: Cloudflare Pages for frontend and a separate Node host for the backend API.

No new runtime service is introduced in this cleanup phase.

## Documentation

Add a root `README.md` that explains:

- Project purpose: MoonLight Studio portfolio and CMS.
- Local setup for `client` and `server`.
- Required environment variables.
- Admin seed command.
- Build commands.
- Preview/deploy notes for the planned Cloudflare Pages plus Node API host setup.
- Phase 2 roadmap items.

Add:

- `client/.env.example` with `VITE_API_BASE_URL`.
- `server/.env.example` with `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, Cloudinary variables, and admin seed variables.

## SEO Files

Add static files under `client/public`:

- `robots.txt` allowing normal indexing and pointing to the sitemap URL.
- `sitemap.xml` with placeholder production domain entries for the home page and admin login excluded from indexing.

The placeholder domain must be easy to find and replace before final public deployment.

## Performance

The current local image assets are several megabytes each. This phase should avoid risky visual changes unless optimized replacements can be generated safely and verified by build output. If image replacement is not completed, the README must include a short performance note listing the heavy assets and recommended target formats/sizes.

## Verification

Run these checks before marking the cleanup complete:

- `npm.cmd run build` in `client`.
- `npm.cmd run build` in `server`.

If any check cannot run, record the reason in the final handoff.

## Success Criteria

- No obvious broken mojibake remains in reviewed UI text.
- New contributors can understand how to configure and build the project from the README and `.env.example` files.
- Basic SEO files exist for the public site preview.
- The project still builds successfully.
- Later production work remains clearly separated from this preview cleanup.
