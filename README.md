# MoonLight Studio Website

Portfolio and lightweight CMS for MoonLight Studio. The public site presents studio services and selected work, while the admin area manages brands, projects, videos, and leads.

## Project Structure

- `client/` - Vite, React, Tailwind frontend.
- `server/` - Express, TypeScript, MongoDB API.
- `docs/superpowers/specs/` - approved design notes.
- `docs/superpowers/plans/` - implementation plans.

## Requirements

- Node.js 20 or newer.
- npm.
- MongoDB Atlas or another MongoDB connection string.
- Cloudinary account for CMS media uploads.

## Local Setup

Install dependencies in each app:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

Create local env files from the examples:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Update `server/.env` with real MongoDB, JWT, and Cloudinary values.

## Environment Variables

Client:

- `VITE_API_BASE_URL` - API base URL, for example `http://localhost:4000/api`.

Server:

- `NODE_ENV` - `development`, `test`, or `production`.
- `PORT` - API port.
- `MONGODB_URI` - MongoDB connection string.
- `JWT_SECRET` - secret with at least 32 characters.
- `CLIENT_ORIGIN` - allowed frontend origin for CORS.
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name.
- `CLOUDINARY_API_KEY` - Cloudinary API key.
- `CLOUDINARY_API_SECRET` - Cloudinary API secret.
- `ADMIN_EMAIL` - used only by `npm run seed:admin`.
- `ADMIN_PASSWORD` - used only by `npm run seed:admin`; must be at least 12 characters.

## Admin Seed

Create or update the initial admin user:

```bash
cd server
npm run seed:admin
```

## Development

Run the API:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:4000/api/health`
- Admin login: `http://localhost:5173/admin/login`

## Build Verification

Build the frontend:

```bash
cd client
npm run build
```

Build the backend:

```bash
cd server
npm run build
```

## Preview Deploy Notes

The intended public setup is:

- Frontend on Cloudflare Pages.
- Backend API on a separate Node host such as Render, Railway, or Fly.
- Database on MongoDB Atlas.
- Media uploads through Cloudinary.

For Cloudflare Pages:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `client`
- Set `VITE_API_BASE_URL` to the production API URL ending in `/api`.

For the backend host:

- Root directory: `server`
- Build command: `npm run build`
- Start command: `npm run start`
- Set `CLIENT_ORIGIN` to the Cloudflare Pages production URL.

The SEO files in `client/public/robots.txt` and `client/public/sitemap.xml` currently use `https://example.com`. Replace that placeholder with the real production domain before launch.

## Performance Notes

Several local image assets are still too large for a polished public launch:

- `client/src/assets/images/LOGO.png` - about 8.4 MB.
- `client/src/assets/images/LogoML_16x9.png` - about 9.9 MB.
- `client/src/assets/images/LOGO_MoonLight.png` - about 5.7 MB.
- `client/src/assets/images/ML_Alpha.png` - about 9.1 MB.
- `client/src/assets/images/moon.jpg` - about 7.1 MB.
- `client/src/assets/images/moon.png` - about 8.6 MB.

Before final production, replace these with resized WebP or AVIF assets sized for their actual display usage. Keep the original files outside the deployed bundle if they are needed as source artwork.

## Phase 2 Roadmap

These items are intentionally outside the current preview cleanup:

- Gmail notification when a new lead is submitted.
- English default public content with Vietnamese toggle.
- Admin Users page with `owner` and `admin` roles.
- Production security hardening: rate limits, Helmet, CAPTCHA or honeypot, and stronger admin session handling.
- Final Cloudflare Pages deployment and custom domain configuration.
