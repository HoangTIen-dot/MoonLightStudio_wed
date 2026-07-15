import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError, nowIso } from '../lib/http';
import { boolToInt, intToBool } from '../lib/sql';
import { booleanValue, optionalString, requireString, requireUrl } from '../lib/validation';

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  brand_id: string | null;
  category: string;
  thumbnail_url: string;
  thumbnail_public_id: string;
  is_featured: number;
  is_published: number;
  created_at: string;
  updated_at: string;
  brand_name: string | null;
  brand_logo_url: string | null;
  brand_logo_public_id: string | null;
  brand_website_url: string | null;
  brand_is_published: number | null;
  brand_display_order: number | null;
  brand_created_at: string | null;
  brand_updated_at: string | null;
};

export function serializeProject(row: ProjectRow) {
  const brand = row.brand_id
    ? {
        _id: row.brand_id,
        name: row.brand_name ?? '',
        logoUrl: row.brand_logo_url ?? '',
        logoPublicId: row.brand_logo_public_id ?? '',
        websiteUrl: row.brand_website_url ?? '',
        isPublished: intToBool(row.brand_is_published),
        displayOrder: row.brand_display_order ?? 0,
        createdAt: row.brand_created_at ?? row.created_at,
        updatedAt: row.brand_updated_at ?? row.updated_at,
      }
    : null;

  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    brandId: brand,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    thumbnailPublicId: row.thumbnail_public_id,
    isFeatured: intToBool(row.is_featured),
    isPublished: intToBool(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const projectSelect = `
  SELECT projects.*,
    brands.name AS brand_name,
    brands.logo_url AS brand_logo_url,
    brands.logo_public_id AS brand_logo_public_id,
    brands.website_url AS brand_website_url,
    brands.is_published AS brand_is_published,
    brands.display_order AS brand_display_order,
    brands.created_at AS brand_created_at,
    brands.updated_at AS brand_updated_at
  FROM projects
  LEFT JOIN brands ON brands.id = projects.brand_id
`;

export const publicProjectRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
export const adminProjectRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

publicProjectRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    `${projectSelect} WHERE projects.is_published = 1 ORDER BY projects.is_featured DESC, projects.created_at DESC`,
  ).all<ProjectRow>();
  return c.json({ projects: result.results.map(serializeProject) });
});

publicProjectRoutes.get('/:id', async (c) => {
  const project = await c.env.DB.prepare(`${projectSelect} WHERE projects.id = ? AND projects.is_published = 1`)
    .bind(c.req.param('id'))
    .first<ProjectRow>();

  if (!project) {
    return jsonError(c, 404, 'Project not found');
  }

  return c.json({ project: serializeProject(project) });
});

adminProjectRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(`${projectSelect} ORDER BY projects.created_at DESC`).all<ProjectRow>();
  return c.json({ projects: result.results.map(serializeProject) });
});

adminProjectRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const title = requireString(body.title, 90);
  const description = requireString(body.description, 360);
  const category = requireString(body.category, 40);
  const thumbnailUrl = requireUrl(body.thumbnailUrl);
  const thumbnailPublicId = requireString(body.thumbnailPublicId, 240);

  if (!title || !description || !category || !thumbnailUrl || !thumbnailPublicId) {
    return jsonError(c, 400, 'Invalid project payload');
  }

  const id = crypto.randomUUID();
  const now = nowIso();
  await c.env.DB.prepare(
    'INSERT INTO projects (id, title, description, brand_id, category, thumbnail_url, thumbnail_public_id, is_featured, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      id,
      title,
      description,
      typeof body.brandId === 'string' && body.brandId ? body.brandId : null,
      category,
      thumbnailUrl,
      thumbnailPublicId,
      boolToInt(booleanValue(body.isFeatured, false)),
      boolToInt(booleanValue(body.isPublished, false)),
      now,
      now,
    )
    .run();

  const project = await c.env.DB.prepare(`${projectSelect} WHERE projects.id = ?`).bind(id).first<ProjectRow>();
  return c.json({ project: serializeProject(project as ProjectRow) }, 201);
});

adminProjectRoutes.patch('/:id', async (c) => {
  const existing = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(c.req.param('id')).first<ProjectRow>();

  if (!existing) {
    return jsonError(c, 404, 'Project not found');
  }

  const body = await c.req.json<Record<string, unknown>>();
  const nextThumbnail = body.thumbnailUrl === undefined ? existing.thumbnail_url : requireUrl(body.thumbnailUrl);

  if (body.thumbnailUrl !== undefined && !nextThumbnail) {
    return jsonError(c, 400, 'Invalid project payload');
  }

  await c.env.DB.prepare(
    'UPDATE projects SET title = ?, description = ?, brand_id = ?, category = ?, thumbnail_url = ?, thumbnail_public_id = ?, is_featured = ?, is_published = ?, updated_at = ? WHERE id = ?',
  )
    .bind(
      body.title === undefined ? existing.title : requireString(body.title, 90) ?? existing.title,
      body.description === undefined ? existing.description : requireString(body.description, 360) ?? existing.description,
      body.brandId === undefined ? existing.brand_id : typeof body.brandId === 'string' && body.brandId ? body.brandId : null,
      body.category === undefined ? existing.category : requireString(body.category, 40) ?? existing.category,
      nextThumbnail,
      body.thumbnailPublicId === undefined
        ? existing.thumbnail_public_id
        : requireString(body.thumbnailPublicId, 240) ?? existing.thumbnail_public_id,
      boolToInt(body.isFeatured === undefined ? intToBool(existing.is_featured) : booleanValue(body.isFeatured)),
      boolToInt(body.isPublished === undefined ? intToBool(existing.is_published) : booleanValue(body.isPublished)),
      nowIso(),
      existing.id,
    )
    .run();

  const project = await c.env.DB.prepare(`${projectSelect} WHERE projects.id = ?`).bind(existing.id).first<ProjectRow>();
  return c.json({ project: serializeProject(project as ProjectRow) });
});

adminProjectRoutes.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(c.req.param('id')).run();

  if (!result.meta.changes) {
    return jsonError(c, 404, 'Project not found');
  }

  return c.body(null, 204);
});
