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
- Gmail account with an App Password if lead notification email should be enabled.

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
- `VITE_PUBLIC_SITE_URL` - public site URL for launch metadata, for example the Cloudflare Pages URL first and the custom domain later.

Server:

- `NODE_ENV` - `development`, `test`, or `production`.
- `PORT` - API port.
- `MONGODB_URI` - MongoDB connection string.
- `JWT_SECRET` - secret with at least 32 characters.
- `CLIENT_ORIGIN` - allowed frontend origin for CORS.
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name.
- `CLOUDINARY_API_KEY` - Cloudinary API key.
- `CLOUDINARY_API_SECRET` - Cloudinary API secret.
- `SMTP_HOST` - Gmail SMTP host, normally `smtp.gmail.com`.
- `SMTP_PORT` - Gmail SMTP port, normally `465`.
- `SMTP_SECURE` - `true` for Gmail port `465`.
- `SMTP_USER` - Gmail address used to send lead notifications.
- `SMTP_APP_PASSWORD` - Gmail App Password, not the normal Gmail login password.
- `LEAD_NOTIFICATION_TO` - destination email for new lead notifications.
- `LEAD_NOTIFICATION_FROM` - sender label/address for lead notifications.
- `ADMIN_EMAIL` - used only by `npm run seed:admin`.
- `ADMIN_PASSWORD` - used only by `npm run seed:admin`; must be at least 12 characters.
- `ADMIN_ROLE` - used only by `npm run seed:admin`; use `owner` for the first account.

## Admin Seed

Create or update the initial owner account:

```bash
cd server
npm run seed:admin
```

Use `ADMIN_ROLE=owner` for the first account. After that, the owner can manage additional `owner` and `admin` accounts from `/admin/users`.

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
- Backend API on Render.
- Database on MongoDB Atlas.
- Media uploads through Cloudinary.
- Lead notifications through Gmail SMTP.

For Cloudflare Pages:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `client`
- Set `VITE_API_BASE_URL` to the production API URL ending in `/api`.
- Set `VITE_PUBLIC_SITE_URL` to the Cloudflare Pages URL first. Replace it with the custom domain later.
- Keep `client/public/_redirects` so direct visits to `/admin` and other SPA routes resolve to `index.html`.

For Render:

- Root directory: `server`
- Build command: `npm run build`
- Start command: `npm run start`
- Set `CLIENT_ORIGIN` to the Cloudflare Pages production URL.
- Add all server environment variables from `server/.env.example`.
- Run `npm run seed:admin` once from a local machine or a Render shell with `ADMIN_ROLE=owner`.

The SEO files in `client/public/robots.txt` and `client/public/sitemap.xml` currently use `https://example.com`. Replace that placeholder with the real production domain before launch.

The canonical URL in `client/index.html` also uses `https://example.com/`. Replace it with the Cloudflare Pages URL for the first launch, then with the custom domain later.

## Gmail App Password

To enable lead notification email:

1. Enable 2-Step Verification on the Gmail account.
2. Create an App Password in the Google Account security settings.
3. Set `SMTP_USER` to the Gmail address.
4. Set `SMTP_APP_PASSWORD` to the generated app password.
5. Set `LEAD_NOTIFICATION_TO` to the inbox that should receive new leads.

If SMTP variables are missing or delivery fails, the API still stores the lead in MongoDB and logs the notification status.

## Performance Notes

The production bundle imports resized WebP images for the hero and UI logos. Original high-resolution PNG/JPG assets remain in `client/src/assets/images` as source artwork, but they are not imported by the launch UI.

## Phase 2 Roadmap

These items are intentionally outside the current launch readiness work:

- Replace JWT localStorage auth with HttpOnly cookie sessions.
- Add CAPTCHA or a honeypot to the public contact form if spam appears after launch.
- Add analytics and uptime monitoring.
- Replace the Cloudflare Pages temporary domain with the final custom domain.
