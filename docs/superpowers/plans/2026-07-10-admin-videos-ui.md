# Admin Videos UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/admin/videos` so admins can upload large videos directly to Cloudinary and save metadata through the backend API.

**Architecture:** Keep upload bytes out of Express. The client asks the backend for signed Cloudinary upload parameters, uploads the file directly from the browser to Cloudinary, then saves `videoUrl` and `videoPublicId` through `POST /api/admin/videos`.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, existing Express API, Cloudinary signed upload.

## Global Constraints

- Admin-only CMS for the first release.
- Large media files must use signed direct upload to Cloudinary instead of passing through the Express server.
- Keep API calls in service modules, not scattered through presentational components.
- Run a fresh client build after implementation.

---

### Task 1: Add Direct Upload Client

**Files:**
- Modify: `client/src/features/videos/video.service.ts`

**Interfaces:**
- Consumes: `createUploadSignature(resourceType: 'image' | 'video')`.
- Produces: `uploadFileToCloudinary(file, resourceType, onProgress)`.

- [x] Add a Cloudinary response type.
- [x] Add `uploadFileToCloudinary` using `XMLHttpRequest` so upload progress can be tracked.

### Task 2: Add Admin Videos Page

**Files:**
- Create: `client/src/pages/admin/AdminVideosPage.tsx`

**Interfaces:**
- Consumes: `getAdminProjects`, `getAdminVideos`, `createVideo`, `uploadFileToCloudinary`, `hasAdminToken`.
- Produces: `/admin/videos` page UI.

- [x] Load projects and videos on mount.
- [x] Add a form for title, project, publish state, display order, and video file.
- [x] Upload directly to Cloudinary, then save metadata through the API.
- [x] Show upload progress and errors.

### Task 3: Wire Navigation

**Files:**
- Modify: `client/src/app/App.tsx`
- Modify: `client/src/pages/admin/AdminDashboardPage.tsx`

**Interfaces:**
- Produces: route switching for `/admin/videos` and dashboard link to the page.

- [x] Add `/admin/videos` branch to `App`.
- [x] Link dashboard video card to `/admin/videos`.
- [x] Replace corrupted dashboard copy with clean ASCII text.

### Task 4: Verify

**Files:**
- Modify: plan checkbox state after build passes.

- [x] Run `npm.cmd run build` in `client`.
- [x] Confirm TypeScript and Vite build exit code is `0`.

## Self-Review

- Spec coverage: direct upload flow, metadata save, route wiring, progress and errors are covered.
- Placeholder scan: no unfinished markers.
- Type consistency: service function names match page imports.
