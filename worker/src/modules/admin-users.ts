import { Hono } from 'hono';
import type { AdminRole, Env, Variables } from '../types';
import { hashPassword } from '../lib/crypto';
import { jsonError, nowIso, requireOwner } from '../lib/http';
import { verifyPassword } from '../lib/crypto';
import { signJwt } from '../lib/jwt';

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
};

function serializeUser(row: AdminUserRow) {
  return {
    _id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function countOwners(db: D1Database) {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM admin_users WHERE role = 'owner'").first<{ count: number }>();
  return row?.count ?? 0;
}

export async function findAdminUserByEmail(db: D1Database, email: string) {
  return db.prepare('SELECT * FROM admin_users WHERE email = ?').bind(normalizeEmail(email)).first<AdminUserRow>();
}

export async function findAdminUserById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM admin_users WHERE id = ?').bind(id).first<AdminUserRow>();
}

export const adminUsersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

adminUsersRoutes.use('*', requireOwner);

adminUsersRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM admin_users ORDER BY role DESC, email ASC').all<AdminUserRow>();
  return c.json({ users: result.results.map(serializeUser) });
});

adminUsersRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role === 'owner' ? 'owner' : 'admin';

  if (!email || !email.includes('@') || password.length < 12) {
    return jsonError(c, 400, 'Invalid admin user payload');
  }

  const { passwordHash, passwordSalt } = await hashPassword(password);
  const now = nowIso();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO admin_users (id, email, password_hash, password_salt, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, email, passwordHash, passwordSalt, role, now, now)
    .run();

  const user = await findAdminUserById(c.env.DB, id);
  return c.json({ user: serializeUser(user as AdminUserRow) }, 201);
});

adminUsersRoutes.patch('/:id', async (c) => {
  const user = await findAdminUserById(c.env.DB, c.req.param('id'));

  if (!user) {
    return jsonError(c, 404, 'Admin user not found');
  }

  const body = await c.req.json<Record<string, unknown>>();
  const nextRole = body.role === 'owner' || body.role === 'admin' ? body.role : user.role;
  const nextEmail = typeof body.email === 'string' && body.email.includes('@') ? normalizeEmail(body.email) : user.email;
  const nextPassword = typeof body.password === 'string' && body.password.length >= 12 ? body.password : '';

  if (user.role === 'owner' && nextRole !== 'owner' && (await countOwners(c.env.DB)) <= 1) {
    return jsonError(c, 409, 'Cannot remove the last owner');
  }

  let passwordHash = user.password_hash;
  let passwordSalt = user.password_salt;

  if (nextPassword) {
    const hashed = await hashPassword(nextPassword);
    passwordHash = hashed.passwordHash;
    passwordSalt = hashed.passwordSalt;
  }

  await c.env.DB.prepare(
    'UPDATE admin_users SET email = ?, password_hash = ?, password_salt = ?, role = ?, updated_at = ? WHERE id = ?',
  )
    .bind(nextEmail, passwordHash, passwordSalt, nextRole, nowIso(), user.id)
    .run();

  const updated = await findAdminUserById(c.env.DB, user.id);
  return c.json({ user: serializeUser(updated as AdminUserRow) });
});

adminUsersRoutes.delete('/:id', async (c) => {
  const user = await findAdminUserById(c.env.DB, c.req.param('id'));

  if (!user) {
    return jsonError(c, 404, 'Admin user not found');
  }

  if (user.role === 'owner' && (await countOwners(c.env.DB)) <= 1) {
    return jsonError(c, 409, 'Cannot delete the last owner');
  }

  await c.env.DB.prepare('DELETE FROM admin_users WHERE id = ?').bind(user.id).run();
  return c.body(null, 204);
});

export async function loginAdmin(db: D1Database, email: string, password: string, jwtSecret: string) {
  const user = await findAdminUserByEmail(db, email);

  if (!user) {
    throw new Error('Invalid admin credentials');
  }

  const passwordMatches = await verifyPassword(password, {
    passwordHash: user.password_hash,
    passwordSalt: user.password_salt,
  });

  if (!passwordMatches) {
    throw new Error('Invalid admin credentials');
  }

  return signJwt({ userId: user.id, role: user.role }, jwtSecret);
}
