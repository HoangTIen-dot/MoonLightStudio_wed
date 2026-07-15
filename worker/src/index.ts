import { Hono } from 'hono';
import type { Env, Variables } from './types';
import { adminUsersRoutes } from './modules/admin-users';
import { authRoutes } from './modules/auth';
import { requireAdmin } from './lib/http';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.route('/api/auth', authRoutes);
app.route('/api/admin/users', new Hono<{ Bindings: Env; Variables: Variables }>().use('*', requireAdmin).route('/', adminUsersRoutes));

app.notFound((c) => c.json({ message: 'Not found' }, 404));

export default app;
