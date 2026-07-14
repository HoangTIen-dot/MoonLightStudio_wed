# MongoDB CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current Vite landing page into a full-stack admin-only portfolio CMS backed by Express, MongoDB, and Cloudinary.

**Architecture:** Keep the public landing page intact while moving the frontend into `client/` and adding a separate `server/` Express API. The backend owns MongoDB access, signed Cloudinary upload authorization, admin auth, and authorization. Large media files upload directly from the browser to Cloudinary. The frontend consumes backend API services and remains easy to migrate to Next.js later.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Express, Mongoose, MongoDB Atlas, Cloudinary, bcrypt, JWT.

## Global Constraints

- Preserve current landing page behavior during the initial repository restructure.
- Do not store video binaries in MongoDB.
- MongoDB stores metadata and Cloudinary URLs/public IDs.
- Large media files must use signed direct upload to Cloudinary instead of passing through the Express server.
- Admin-only CMS for the first release.
- Public endpoints only expose published content.
- Keep API/database calls out of presentational React components.
- Run a fresh build after every structural milestone.

---

## File Structure

The target repository layout is:

```txt
client/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  src/
    app/
      App.tsx
    pages/
      public/
        HomePage.tsx
      admin/
        AdminLoginPage.tsx
        AdminDashboardPage.tsx
    features/
      auth/
      brands/
      projects/
      videos/
    shared/
      components/
      lib/
      styles/
        index.css
    assets/
      images/
        LogoML_16x9.png
        moon.jpg
    main.tsx
    vite-env.d.ts
server/
  package.json
  tsconfig.json
  src/
    app.ts
    server.ts
    config/
      database.ts
      env.ts
      cloudinary.ts
    middlewares/
      auth.middleware.ts
      error.middleware.ts
    modules/
      auth/
      brands/
      projects/
      videos/
      uploads/
    shared/
      utils/
      types/
```

## Task 1: Move Existing Frontend Into `client/`

**Files:**
- Move: root Vite files into `client/`
- Move: `src/` into `client/src/`
- Modify: `client/src/main.tsx`
- Modify: `client/src/app/App.tsx`
- Modify: `client/src/shared/styles/index.css`

**Interfaces:**
- Consumes: existing Vite app.
- Produces: `client/` app that builds with the same landing page.

- [x] **Step 1: Create `client/` structure**

Move these root files into `client/`:

```txt
index.html
package.json
package-lock.json
postcss.config.js
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
vite.config.js
vite.config.d.ts
src/
```

- [x] **Step 2: Move CSS into shared styles**

Move:

```txt
client/src/index.css
```

to:

```txt
client/src/shared/styles/index.css
```

Update `client/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './shared/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [x] **Step 3: Move app component**

Move:

```txt
client/src/App.tsx
```

to:

```txt
client/src/app/App.tsx
```

Update image imports in `client/src/app/App.tsx`:

```tsx
import heroBaseImage from '../assets/images/LogoML_16x9.png';
import heroRevealImage from '../assets/images/moon.jpg';
```

- [x] **Step 4: Move images**

Move:

```txt
client/src/assets/LogoML_16x9.png
client/src/assets/moon.jpg
```

to:

```txt
client/src/assets/images/LogoML_16x9.png
client/src/assets/images/moon.jpg
```

- [x] **Step 5: Verify frontend build**

Run:

```bash
cd client
npm.cmd run build
```

Expected: Vite build exits with code `0`.

## Task 2: Split Landing Page Into Focused Components

**Files:**
- Create: `client/src/pages/public/HomePage.tsx`
- Create: `client/src/features/public/components/HeroSection.tsx`
- Create: `client/src/features/public/components/RevealLayer.tsx`
- Create: `client/src/features/public/components/MarqueeSection.tsx`
- Create: `client/src/features/public/components/AboutSection.tsx`
- Create: `client/src/features/public/components/ServicesSection.tsx`
- Create: `client/src/features/public/components/ProjectsSection.tsx`
- Create: `client/src/shared/components/ContactButton.tsx`
- Create: `client/src/shared/components/FadeIn.tsx`
- Create: `client/src/shared/components/LiveProjectButton.tsx`
- Create: `client/src/shared/components/Magnet.tsx`
- Create: `client/src/features/public/homepage.data.ts`
- Modify: `client/src/app/App.tsx`

**Interfaces:**
- Consumes: existing JSX and arrays from `App.tsx`.
- Produces: `HomePage` rendered by `App`.

- [x] **Step 1: Extract static arrays**

Create `client/src/features/public/homepage.data.ts` exporting:

```ts
export const marqueeRows = [/* existing marqueeRows data */];
export const decorativeImages = [/* existing decorativeImages data */];
export const services = [/* existing services data */];
export const projects = [/* existing projects data */];
```

- [x] **Step 2: Extract common components**

Move the existing implementations of `ContactButton`, `LiveProjectButton`, `FadeIn`, and `Magnet` into matching files under `client/src/shared/components/`.

- [x] **Step 3: Extract public sections**

Move the existing implementations of `RevealLayer`, `HeroSection`, `MarqueeSection`, `AboutSection`, `ServicesSection`, `ProjectCard`, and `ProjectsSection` into files under `client/src/features/public/components/`.

- [x] **Step 4: Create HomePage**

Create `client/src/pages/public/HomePage.tsx`:

```tsx
import { AboutSection } from '../../features/public/components/AboutSection';
import { HeroSection } from '../../features/public/components/HeroSection';
import { MarqueeSection } from '../../features/public/components/MarqueeSection';
import { ProjectsSection } from '../../features/public/components/ProjectsSection';
import { ServicesSection } from '../../features/public/components/ServicesSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </>
  );
}
```

- [x] **Step 5: Reduce App**

Update `client/src/app/App.tsx`:

```tsx
import { HomePage } from '../pages/public/HomePage';

function App() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] font-kanit tracking-[-0.02em]" style={{ overflowX: 'clip' }}>
      <HomePage />
    </main>
  );
}

export default App;
```

- [x] **Step 6: Verify frontend build**

Run:

```bash
cd client
npm.cmd run build
```

Expected: Vite build exits with code `0`.

## Task 3: Scaffold Express TypeScript Server

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/app.ts`
- Create: `server/src/server.ts`
- Create: `server/src/config/env.ts`
- Create: `server/src/config/database.ts`
- Create: `server/src/middlewares/error.middleware.ts`

**Interfaces:**
- Consumes: no frontend code.
- Produces: Express app with `/api/health`.

- [x] **Step 1: Create server package**

Create `server/package.json`:

```json
{
  "name": "moonlight-cms-api",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.5.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

- [x] **Step 2: Create server TypeScript config**

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [x] **Step 3: Create env loader**

Create `server/src/config/env.ts`:

```ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1)
});

export const env = envSchema.parse(process.env);
```

- [x] **Step 4: Create Express app**

Create `server/src/app.ts`:

```ts
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorMiddleware);
```

- [x] **Step 5: Create server entry**

Create `server/src/server.ts`:

```ts
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

await connectDatabase();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
```

- [x] **Step 6: Create database connection**

Create `server/src/config/database.ts`:

```ts
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI);
}
```

- [x] **Step 7: Create error middleware**

Create `server/src/middlewares/error.middleware.ts`:

```ts
import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};
```

- [x] **Step 8: Install server dependencies**

Run:

```bash
cd server
npm.cmd install
```

Expected: `package-lock.json` is created and install exits with code `0`.

- [x] **Step 9: Verify server build**

Run:

```bash
cd server
npm.cmd run build
```

Expected: TypeScript build exits with code `0`.

## Task 4: Add Domain Models

**Files:**
- Create: `server/src/modules/auth/admin-user.model.ts`
- Create: `server/src/modules/brands/brand.model.ts`
- Create: `server/src/modules/projects/project.model.ts`
- Create: `server/src/modules/videos/video.model.ts`

**Interfaces:**
- Consumes: Mongoose connection from Task 3.
- Produces: Mongoose models for auth, brands, projects, videos.

- [x] **Step 1: Create AdminUser model**

Create `server/src/modules/auth/admin-user.model.ts` with fields from the spec: `email`, `passwordHash`, `role`, timestamps.

- [x] **Step 2: Create Brand model**

Create `server/src/modules/brands/brand.model.ts` with fields from the spec: `name`, `logoUrl`, `logoPublicId`, `websiteUrl`, `isPublished`, `displayOrder`, timestamps.

- [x] **Step 3: Create Project model**

Create `server/src/modules/projects/project.model.ts` with fields from the spec: `title`, `description`, `brandId`, `category`, `thumbnailUrl`, `thumbnailPublicId`, `isFeatured`, `isPublished`, timestamps.

- [x] **Step 4: Create Video model**

Create `server/src/modules/videos/video.model.ts` with fields from the spec: `projectId`, `title`, `videoUrl`, `videoPublicId`, `thumbnailUrl`, `thumbnailPublicId`, `displayOrder`, `isPublished`, timestamps.

- [x] **Step 5: Verify server build**

Run:

```bash
cd server
npm.cmd run build
```

Expected: TypeScript build exits with code `0`.

## Task 5: Add Auth And Admin Protection

**Files:**
- Create: `server/src/modules/auth/auth.routes.ts`
- Create: `server/src/modules/auth/auth.service.ts`
- Create: `server/src/middlewares/auth.middleware.ts`
- Modify: `server/src/app.ts`

**Interfaces:**
- Consumes: `AdminUser` model.
- Produces: `POST /api/auth/login`, `GET /api/auth/me`, and `requireAdmin`.

- [x] **Step 1: Implement JWT auth service**

Create functions:

```ts
export async function loginAdmin(email: string, password: string): Promise<{ token: string }>;
export function verifyAdminToken(token: string): { userId: string; role: 'admin' };
```

- [x] **Step 2: Implement auth middleware**

Create `requireAdmin` middleware that reads `Authorization: Bearer <token>`, verifies it, and rejects invalid requests with `401`.

- [x] **Step 3: Add auth routes**

Create `POST /api/auth/login` and `GET /api/auth/me`.

- [x] **Step 4: Register routes**

Update `server/src/app.ts`:

```ts
import { authRoutes } from './modules/auth/auth.routes.js';

app.use('/api/auth', authRoutes);
```

- [x] **Step 5: Verify server build**

Run:

```bash
cd server
npm.cmd run build
```

Expected: TypeScript build exits with code `0`.

## Task 6: Add Brand, Project, And Video APIs

**Files:**
- Create: `server/src/modules/brands/brand.routes.ts`
- Create: `server/src/modules/projects/project.routes.ts`
- Create: `server/src/modules/videos/video.routes.ts`
- Modify: `server/src/app.ts`

**Interfaces:**
- Consumes: domain models and `requireAdmin`.
- Produces: public read routes and protected admin CRUD routes.

- [x] **Step 1: Add public list routes**

Implement:

```txt
GET /api/public/brands
GET /api/public/projects
GET /api/public/projects/:id
GET /api/public/videos
```

All public routes must filter `isPublished: true`.

- [x] **Step 2: Add admin CRUD routes**

Implement:

```txt
GET /api/admin/brands
POST /api/admin/brands
PATCH /api/admin/brands/:id
DELETE /api/admin/brands/:id
GET /api/admin/projects
POST /api/admin/projects
PATCH /api/admin/projects/:id
DELETE /api/admin/projects/:id
GET /api/admin/videos
POST /api/admin/videos
PATCH /api/admin/videos/:id
DELETE /api/admin/videos/:id
```

All admin routes must use `requireAdmin`.

- [x] **Step 3: Register routes in app**

Update `server/src/app.ts` to mount public and admin routes.

- [x] **Step 4: Verify server build**

Run:

```bash
cd server
npm.cmd run build
```

Expected: TypeScript build exits with code `0`.

## Task 7: Add Cloudinary Signed Direct Upload Integration

**Files:**
- Create: `server/src/config/cloudinary.ts`
- Create: `server/src/modules/uploads/upload.routes.ts`
- Modify: `server/src/app.ts`

**Interfaces:**
- Consumes: Cloudinary env variables and `requireAdmin`.
- Produces: protected signed upload authorization route.

- [x] **Step 1: Configure Cloudinary**

Create a Cloudinary client using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

- [x] **Step 2: Add signed upload route**

Create:

```txt
POST /api/admin/uploads/signature
```

The route accepts JSON:

```ts
{
  resourceType: 'image' | 'video';
}
```

The route does not accept the media file. It returns signed parameters that the browser uses to upload directly to Cloudinary:

```ts
{
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: 'image' | 'video';
  signature: string;
  timestamp: number;
  uploadUrl: string;
}
```

The browser then sends a `FormData` request directly to `uploadUrl` with the `file`, `api_key`, `folder`, `signature`, and `timestamp`. Cloudinary returns the final media URL and public ID, and the frontend saves those values through the brand/project/video metadata APIs.

- [x] **Step 3: Verify server build**

Run:

```bash
cd server
npm.cmd run build
```

Expected: TypeScript build exits with code `0`.

## Task 8: Add Client API Layer And Admin Pages

**Files:**
- Create: `client/src/shared/lib/api.ts`
- Create: `client/src/features/auth/auth.service.ts`
- Create: `client/src/features/brands/brand.service.ts`
- Create: `client/src/features/projects/project.service.ts`
- Create: `client/src/features/videos/video.service.ts`
- Create: `client/src/pages/admin/AdminLoginPage.tsx`
- Create: `client/src/pages/admin/AdminDashboardPage.tsx`
- Modify: `client/src/app/App.tsx`

**Interfaces:**
- Consumes: backend REST API.
- Produces: minimal admin login/dashboard shell.

- [x] **Step 1: Create API client**

Create `client/src/shared/lib/api.ts`:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

- [x] **Step 2: Create login service**

Create `client/src/features/auth/auth.service.ts`:

```ts
import { apiRequest } from '../../shared/lib/api';

export async function loginAdmin(email: string, password: string) {
  return apiRequest<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}
```

- [x] **Step 3: Create minimal admin pages**

Create login and dashboard pages with restrained admin UI. Login stores `adminToken` on success. Dashboard shows navigation areas for Brands, Projects, and Videos.

- [x] **Step 4: Add basic route switching**

Until React Router is added, use `window.location.pathname` inside `App` to render `/admin` and `/admin/login` separately from the public home page.

- [x] **Step 5: Verify frontend build**

Run:

```bash
cd client
npm.cmd run build
```

Expected: Vite build exits with code `0`.

## Plan Self-Review

- Spec coverage: repository split, admin-only auth, MongoDB metadata, Cloudinary storage, public published reads, admin CRUD, and frontend API isolation are covered.
- Placeholder scan: no unfinished markers or intentionally incomplete requirements remain. Later tasks describe exact route and file responsibilities without committing to UI details beyond the first shippable shell.
- Type consistency: model names, route names, and service names match the design spec.
