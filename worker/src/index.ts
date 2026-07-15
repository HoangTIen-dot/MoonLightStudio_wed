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
