import type { Context, Next } from 'hono';
import type { Env, Variables } from '../types';
import { verifyJwt } from './jwt';

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export function nowIso() {
  return new Date().toISOString();
}

export function jsonError(c: AppContext, status: 400 | 401 | 403 | 404 | 409 | 500, message: string) {
  return c.json({ message }, status);
}

export async function requireAdmin(c: AppContext, next: Next) {
  const authHeader = c.req.header('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  if (!token) {
    return jsonError(c, 401, 'Authentication required');
  }

  try {
    c.set('admin', await verifyJwt(token, c.env.JWT_SECRET));
    return next();
  } catch {
    return jsonError(c, 401, 'Invalid or expired token');
  }
}

export async function requireOwner(c: AppContext, next: Next) {
  if (c.get('admin')?.role !== 'owner') {
    return jsonError(c, 403, 'Owner access required');
  }

  return next();
}
