import { Hono } from 'hono';
import type { AdminRole, Env, Variables } from '../types';
import { hashPassword } from '../lib/crypto';
import { jsonError, nowIso } from '../lib/http';

export const seedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

seedRoutes.post('/owner', async (c) => {
  try {
    const seedSecret = c.req.header('x-seed-secret');

    if (!c.env.SEED_SECRET || seedSecret !== c.env.SEED_SECRET) {
      return jsonError(c, 403, 'Seed access denied');
    }

    const email = c.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = c.env.ADMIN_PASSWORD;
    const role: AdminRole = c.env.ADMIN_ROLE === 'admin' ? 'admin' : 'owner';

    if (!email || !email.includes('@') || !password || password.length < 12) {
      return jsonError(c, 400, 'Seed admin env is not configured');
    }

    const { passwordHash, passwordSalt } = await hashPassword(password);
    const existing = await c.env.DB.prepare('SELECT id FROM admin_users WHERE email = ?').bind(email).first<{ id: string }>();
    const now = nowIso();

    if (existing) {
      await c.env.DB.prepare(
        'UPDATE admin_users SET password_hash = ?, password_salt = ?, role = ?, updated_at = ? WHERE id = ?',
      )
        .bind(passwordHash, passwordSalt, role, now, existing.id)
        .run();
      return c.json({ seeded: true, email, role, mode: 'updated' });
    }

    await c.env.DB.prepare(
      'INSERT INTO admin_users (id, email, password_hash, password_salt, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(crypto.randomUUID(), email, passwordHash, passwordSalt, role, now, now)
      .run();

    return c.json({ seeded: true, email, role, mode: 'created' }, 201);
  } catch (error) {
    return jsonError(c, 500, error instanceof Error ? error.message : 'Seed failed');
  }
});
