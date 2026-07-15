import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError, nowIso } from '../lib/http';
import { boolToInt, intToBool } from '../lib/sql';
import { booleanValue, integerValue, optionalString, requireString, requireUrl } from '../lib/validation';

type BrandRow = {
  id: string;
  name: string;
  logo_url: string;
  logo_public_id: string;
  website_url: string;
  is_published: number;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export function serializeBrand(row: BrandRow) {
  return {
    _id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    logoPublicId: row.logo_public_id,
    websiteUrl: row.website_url,
    isPublished: intToBool(row.is_published),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const publicBrandRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
export const adminBrandRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

publicBrandRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM brands WHERE is_published = 1 ORDER BY display_order ASC, created_at DESC',
  ).all<BrandRow>();
  return c.json({ brands: result.results.map(serializeBrand) });
});

adminBrandRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM brands ORDER BY display_order ASC, created_at DESC').all<BrandRow>();
  return c.json({ brands: result.results.map(serializeBrand) });
});

adminBrandRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const name = requireString(body.name, 120);
  const logoUrl = requireUrl(body.logoUrl);
  const logoPublicId = requireString(body.logoPublicId, 240);

  if (!name || !logoUrl || !logoPublicId) {
    return jsonError(c, 400, 'Invalid brand payload');
  }

  const now = nowIso();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO brands (id, name, logo_url, logo_public_id, website_url, is_published, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      id,
      name,
      logoUrl,
      logoPublicId,
      optionalString(body.websiteUrl, 240),
      boolToInt(booleanValue(body.isPublished, true)),
      integerValue(body.displayOrder, 0),
      now,
      now,
    )
    .run();

  const brand = await c.env.DB.prepare('SELECT * FROM brands WHERE id = ?').bind(id).first<BrandRow>();
  return c.json({ brand: serializeBrand(brand as BrandRow) }, 201);
});

adminBrandRoutes.patch('/:id', async (c) => {
  const existing = await c.env.DB.prepare('SELECT * FROM brands WHERE id = ?').bind(c.req.param('id')).first<BrandRow>();

  if (!existing) {
    return jsonError(c, 404, 'Brand not found');
  }

  const body = await c.req.json<Record<string, unknown>>();
  const logoUrl = body.logoUrl === undefined ? existing.logo_url : requireUrl(body.logoUrl);

  if (body.logoUrl !== undefined && !logoUrl) {
    return jsonError(c, 400, 'Invalid brand payload');
  }

  await c.env.DB.prepare(
    'UPDATE brands SET name = ?, logo_url = ?, logo_public_id = ?, website_url = ?, is_published = ?, display_order = ?, updated_at = ? WHERE id = ?',
  )
    .bind(
      body.name === undefined ? existing.name : requireString(body.name, 120) ?? existing.name,
      logoUrl,
      body.logoPublicId === undefined ? existing.logo_public_id : requireString(body.logoPublicId, 240) ?? existing.logo_public_id,
      body.websiteUrl === undefined ? existing.website_url : optionalString(body.websiteUrl, 240),
      boolToInt(body.isPublished === undefined ? intToBool(existing.is_published) : booleanValue(body.isPublished)),
      body.displayOrder === undefined ? existing.display_order : integerValue(body.displayOrder),
      nowIso(),
      existing.id,
    )
    .run();

  const brand = await c.env.DB.prepare('SELECT * FROM brands WHERE id = ?').bind(existing.id).first<BrandRow>();
  return c.json({ brand: serializeBrand(brand as BrandRow) });
});

adminBrandRoutes.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM brands WHERE id = ?').bind(c.req.param('id')).run();

  if (!result.meta.changes) {
    return jsonError(c, 404, 'Brand not found');
  }

  return c.body(null, 204);
});
