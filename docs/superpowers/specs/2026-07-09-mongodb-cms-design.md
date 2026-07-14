# MongoDB CMS Design

## Goal

Turn the current one-page React/Vite landing page into a full-stack portfolio CMS where only the site owner/admin can upload product videos, manage completed projects, and update brands that have collaborated with the studio.

## Product Scope

The public website remains a polished landing/portfolio page. Visitors can view published projects, videos, and brands. Admin users can log in to a protected dashboard to create, update, publish, unpublish, and delete content.

The first implementation is admin-only. It does not support public user accounts, creator profiles, public submissions, payments, comments, or approval workflows.

## Architecture

Use a two-app repository:

- `client/`: React/Vite frontend migrated from the current root app.
- `server/`: Node.js, Express, and TypeScript backend.

The backend owns authentication, authorization, database access, and signed Cloudinary upload authorization. The frontend calls backend REST APIs for application data and asks the backend for signed upload parameters before sending large media files directly to Cloudinary.

MongoDB stores structured metadata. Cloudinary stores uploaded videos, thumbnails, and brand logos. Large files must upload directly from the browser to Cloudinary with a backend-generated signature. The database stores Cloudinary URLs and public IDs, not binary media files.

## Technology

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, lucide-react.
- Backend: Node.js, Express, TypeScript.
- Database: MongoDB Atlas with Mongoose.
- Media storage: Cloudinary.
- Admin authentication: email/password login with bcrypt password hashes and JWT access tokens.

## Data Model

### AdminUser

- `email`: unique admin email.
- `passwordHash`: bcrypt hash.
- `role`: initially `admin`.
- `createdAt`, `updatedAt`.

### Brand

- `name`: brand display name.
- `logoUrl`: Cloudinary-hosted logo URL.
- `logoPublicId`: Cloudinary public ID for cleanup.
- `websiteUrl`: optional external URL.
- `isPublished`: controls public visibility.
- `displayOrder`: controls sorting.
- `createdAt`, `updatedAt`.

### Project

- `title`: project title.
- `description`: project summary.
- `brandId`: optional reference to `Brand`.
- `category`: project category.
- `thumbnailUrl`: Cloudinary-hosted image URL.
- `thumbnailPublicId`: Cloudinary public ID for cleanup.
- `isFeatured`: controls highlighted display.
- `isPublished`: controls public visibility.
- `createdAt`, `updatedAt`.

### Video

- `projectId`: reference to `Project`.
- `title`: video title.
- `videoUrl`: Cloudinary-hosted video URL.
- `videoPublicId`: Cloudinary public ID for cleanup.
- `thumbnailUrl`: optional Cloudinary-hosted thumbnail URL.
- `thumbnailPublicId`: optional Cloudinary public ID.
- `displayOrder`: controls sorting inside a project.
- `isPublished`: controls public visibility.
- `createdAt`, `updatedAt`.

## API Surface

Public endpoints:

- `GET /api/health`
- `GET /api/public/brands`
- `GET /api/public/projects`
- `GET /api/public/projects/:id`
- `GET /api/public/videos`

Admin endpoints:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/admin/brands`
- `POST /api/admin/brands`
- `PATCH /api/admin/brands/:id`
- `DELETE /api/admin/brands/:id`
- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `GET /api/admin/videos`
- `POST /api/admin/videos`
- `PATCH /api/admin/videos/:id`
- `DELETE /api/admin/videos/:id`
- `POST /api/admin/uploads/signature`

## Security

Only authenticated admin users can call admin endpoints. Passwords are never stored in plain text. JWT secrets and database credentials live in `.env` files that are not committed.

Public endpoints only return records where `isPublished = true`. Delete operations must also remove associated Cloudinary media when a stored public ID exists.

Cloudinary API secrets must never be exposed to the browser. The browser receives only signed upload parameters generated after admin authentication. This keeps the backend from streaming large production-house video files while still enforcing admin-only uploads.

## Frontend Structure

The existing landing page should be preserved during the first refactor. The app will be moved into `client/`, then split into public and admin areas:

- `client/src/pages/public/HomePage.tsx`
- `client/src/pages/admin/AdminLoginPage.tsx`
- `client/src/pages/admin/AdminDashboardPage.tsx`
- `client/src/features/brands`
- `client/src/features/projects`
- `client/src/features/videos`
- `client/src/features/auth`
- `client/src/shared`

The frontend should call typed API service modules instead of scattering `fetch` calls across visual components.

## Testing And Verification

Each milestone must leave the project buildable. The minimum verification for the initial repository restructuring is:

- `npm.cmd run build` from `client/`
- `npm.cmd run build` from `server/`

Once backend routes exist, add API tests for health, auth, public reads, and protected admin writes.
