import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError, requireAdmin } from '../lib/http';
import { loginAdmin } from './admin-users';

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

authRoutes.post('/login', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return jsonError(c, 400, 'Invalid login payload');
  }

  try {
    return c.json({ token: await loginAdmin(c.env.DB, email, password, c.env.JWT_SECRET) });
  } catch {
    return jsonError(c, 401, 'Invalid admin credentials');
  }
});

authRoutes.get('/me', requireAdmin, (c) => c.json({ admin: c.get('admin') }));
