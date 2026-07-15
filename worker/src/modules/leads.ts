import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError, nowIso } from '../lib/http';
import { optionalString, requireString } from '../lib/validation';

type LeadRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
  updated_at: string;
};

function serializeLead(row: LeadRow) {
  return {
    _id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const publicLeadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
export const adminLeadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

publicLeadRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const name = requireString(body.name, 80);
  const message = requireString(body.message, 1200);
  const email = optionalString(body.email, 120).toLowerCase();
  const phone = optionalString(body.phone, 40);

  if (!name || !message || (!email && !phone)) {
    return jsonError(c, 400, 'Invalid lead payload');
  }

  const id = crypto.randomUUID();
  const now = nowIso();
  await c.env.DB.prepare(
    'INSERT INTO leads (id, name, company, email, phone, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, name, optionalString(body.company, 100), email, phone, message, 'new', now, now)
    .run();

  const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first<LeadRow>();
  return c.json({ lead: serializeLead(lead as LeadRow) }, 201);
});

adminLeadRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all<LeadRow>();
  return c.json({ leads: result.results.map(serializeLead) });
});

adminLeadRoutes.patch('/:id', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const status = body.status === 'contacted' || body.status === 'closed' ? body.status : body.status === 'new' ? 'new' : null;

  if (!status) {
    return jsonError(c, 400, 'Invalid lead payload');
  }

  const result = await c.env.DB.prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, nowIso(), c.req.param('id'))
    .run();

  if (!result.meta.changes) {
    return jsonError(c, 404, 'Lead not found');
  }

  const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(c.req.param('id')).first<LeadRow>();
  return c.json({ lead: serializeLead(lead as LeadRow) });
});
