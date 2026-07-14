# Public Preview Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the MoonLight Studio portfolio for a clean pre-public preview without adding the later production features.

**Architecture:** Keep the existing Vite React frontend and Express/Mongo backend unchanged. Add documentation, static SEO files, and safe UI copy fixes only.

**Tech Stack:** React 18, Vite, Tailwind CSS, Express, TypeScript, MongoDB/Mongoose, Cloudinary.

## Global Constraints

- Do not add Gmail notification in this phase.
- Do not add bilingual EN/VI infrastructure in this phase.
- Do not add Admin Users, multiple admin management, or owner/admin roles in this phase.
- Do not add full production security hardening such as rate limiting, Helmet, CAPTCHA, session redesign, or HttpOnly cookies in this phase.
- Do not execute Cloudflare Pages deployment in this phase.
- Verify with `npm.cmd run build` in both `client` and `server`.

---

### Task 1: Fix Visible Text Encoding

**Files:**
- Modify: `client/src/pages/admin/AdminLoginPage.tsx`

**Interfaces:**
- Consumes: Existing `loginAdmin(email, password)` and `saveAdminToken(token)`.
- Produces: Same AdminLoginPage component with readable UI copy.

- [ ] **Step 1: Inspect broken strings**

Run: `rg "Ã|Ä|Â|áº|á»|Æ|�" client/src server/src -n`
Expected: Matches only in `client/src/pages/admin/AdminLoginPage.tsx`.

- [ ] **Step 2: Replace the broken Vietnamese copy**

Use this exact copy in `AdminLoginPage.tsx`:

```tsx
setError('Email hoặc mật khẩu admin không đúng.');
```

```tsx
<p className="mt-1 text-sm text-white/50">Quản lý project, brand và video.</p>
```

```tsx
{isSubmitting ? 'Đang đăng nhập' : 'Đăng nhập'}
```

- [ ] **Step 3: Re-scan for mojibake**

Run: `rg "Ã|Ä|Â|áº|á»|Æ|�" client/src server/src -n`
Expected: No matches.

### Task 2: Complete Preview Documentation

**Files:**
- Modify: `README.md`
- Modify: `client/.env.example`
- Modify: `server/.env.example`

**Interfaces:**
- Consumes: Existing npm scripts in `client/package.json` and `server/package.json`.
- Produces: Setup documentation and env examples for local preview and later deployment.

- [ ] **Step 1: Expand `README.md`**

Replace the placeholder README with sections for overview, project structure, requirements, local setup, environment variables, admin seed, build verification, Cloudflare preview notes, performance notes, and phase 2 roadmap.

- [ ] **Step 2: Confirm client env example**

Ensure `client/.env.example` contains:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

- [ ] **Step 3: Confirm server env example**

Ensure `server/.env.example` contains:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/moonlight_cms
JWT_SECRET=replace_with_at_least_32_characters
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Used only by `npm run seed:admin`
ADMIN_EMAIL=admin@moonlight.vn
ADMIN_PASSWORD=change_me_min_12_characters
```

### Task 3: Add Basic SEO Files

**Files:**
- Create: `client/public/robots.txt`
- Create: `client/public/sitemap.xml`

**Interfaces:**
- Consumes: Static public asset behavior from Vite.
- Produces: SEO files copied into the client build output.

- [ ] **Step 1: Add `robots.txt`**

Create:

```txt
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://example.com/sitemap.xml
```

- [ ] **Step 2: Add `sitemap.xml`**

Create:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 3: Note placeholder replacement**

Document in `README.md` that `https://example.com` must be replaced with the production domain before launch.

### Task 4: Verify Build Output

**Files:**
- No source files modified.

**Interfaces:**
- Consumes: Completed Tasks 1-3.
- Produces: Build verification evidence.

- [ ] **Step 1: Build client**

Run: `npm.cmd run build` in `client`.
Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 2: Build server**

Run: `npm.cmd run build` in `server`.
Expected: TypeScript build complete successfully.

- [ ] **Step 3: Review git diff**

Run: `git status --short` and `git diff --stat`.
Expected: Only planned files are changed.
