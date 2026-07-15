import { Hono } from 'hono';
import type { Env, Variables } from './types';
import { adminUsersRoutes } from './modules/admin-users';
import { authRoutes } from './modules/auth';
import { adminBrandRoutes, publicBrandRoutes } from './modules/brands';
import { adminLeadRoutes, publicLeadRoutes } from './modules/leads';
import { adminProjectRoutes, publicProjectRoutes } from './modules/projects';
import { seedRoutes } from './modules/seed';
import { uploadRoutes } from './modules/uploads';
import { adminVideoRoutes, publicVideoRoutes } from './modules/videos';
import { requireAdmin } from './lib/http';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();
const FALLBACK_ALLOWED_ORIGINS = ['https://moonlightstudio-wed.pages.dev', 'http://localhost:5173'];
const CORS_METHODS = 'GET,POST,PATCH,DELETE,OPTIONS';
const CORS_HEADERS = 'Content-Type, Authorization';

const resolveAllowedOrigin = (requestOrigin: string | undefined, configuredOrigin: string | undefined) => {
  if (!requestOrigin) {
    return null;
  }

  const allowedOrigins = new Set([configuredOrigin, ...FALLBACK_ALLOWED_ORIGINS].filter(Boolean));
  return allowedOrigins.has(requestOrigin) ? requestOrigin : null;
};

const getCorsHeaders = (allowedOrigin: string) => ({
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': CORS_METHODS,
  'Access-Control-Allow-Headers': CORS_HEADERS,
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

app.options('/api/*', (c) => {
  const allowedOrigin = resolveAllowedOrigin(c.req.header('Origin'), c.env?.CLIENT_ORIGIN);

  if (!allowedOrigin) {
    return c.body(null, 204);
  }

  return c.body(null, 204, getCorsHeaders(allowedOrigin));
});

app.use('/api/*', async (c, next) => {
  const allowedOrigin = resolveAllowedOrigin(c.req.header('Origin'), c.env?.CLIENT_ORIGIN);

  await next();

  if (allowedOrigin) {
    c.header('Access-Control-Allow-Origin', allowedOrigin);
    c.header('Vary', 'Origin');
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.route('/api/seed', seedRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/public/brands', publicBrandRoutes);
app.route('/api/public/leads', publicLeadRoutes);
app.route('/api/public/projects', publicProjectRoutes);
app.route('/api/public/videos', publicVideoRoutes);

const adminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
adminRoutes.use('*', requireAdmin);
adminRoutes.route('/brands', adminBrandRoutes);
adminRoutes.route('/leads', adminLeadRoutes);
adminRoutes.route('/projects', adminProjectRoutes);
adminRoutes.route('/uploads', uploadRoutes);
adminRoutes.route('/users', adminUsersRoutes);
adminRoutes.route('/videos', adminVideoRoutes);
app.route('/api/admin', adminRoutes);

app.notFound((c) => c.json({ message: 'Not found' }, 404));

export default app;
