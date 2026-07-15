import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError, nowIso } from '../lib/http';
import { boolToInt, intToBool } from '../lib/sql';
import { booleanValue, integerValue, optionalString, requireString, requireUrl } from '../lib/validation';
import { serializeProject } from './projects';

type VideoRow = {
  id: string;
  project_id: string;
  title: string;
  video_provider: 'vimeo' | 'youtube' | 'upload';
  video_id: string;
  video_url: string;
  embed_url: string;
  video_public_id: string;
  thumbnail_url: string;
  thumbnail_public_id: string;
  display_order: number;
  is_published: number;
  created_at: string;
  updated_at: string;
  project_title: string;
  project_description: string;
  project_brand_id: string | null;
  project_category: string;
  project_thumbnail_url: string;
  project_thumbnail_public_id: string;
  project_is_featured: number;
  project_is_published: number;
  project_created_at: string;
  project_updated_at: string;
  brand_name: string | null;
  brand_logo_url: string | null;
  brand_logo_public_id: string | null;
  brand_website_url: string | null;
  brand_is_published: number | null;
  brand_display_order: number | null;
  brand_created_at: string | null;
  brand_updated_at: string | null;
};

function parseVimeoVideoId(videoUrl: string) {
  const url = new URL(videoUrl);
  if (!['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
    return null;
  }
  return url.pathname.match(/(?:\/video)?\/(\d+)/)?.[1] ?? null;
}

function normalizeVideoPayload(body: Record<string, unknown>) {
  const videoUrl = requireUrl(body.videoUrl);
  const provider = body.videoProvider === 'youtube' || body.videoProvider === 'upload' ? body.videoProvider : 'vimeo';

  if (!videoUrl) {
    return null;
  }

  if (provider === 'vimeo') {
    const videoId = typeof body.videoId === 'string' ? body.videoId : parseVimeoVideoId(videoUrl);
    if (!videoId) return null;
    return {
      videoProvider: 'vimeo' as const,
      videoId,
      videoUrl: `https://vimeo.com/${videoId}`,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      videoPublicId: typeof body.videoPublicId === 'string' ? body.videoPublicId : videoId,
    };
  }

  const videoId = requireString(body.videoId, 240);
  const embedUrl = requireUrl(body.embedUrl);
  if (!videoId || !embedUrl) return null;
  return {
    videoProvider: provider,
    videoId,
    videoUrl,
    embedUrl,
    videoPublicId: typeof body.videoPublicId === 'string' ? body.videoPublicId : videoId,
  };
}

function serializeVideo(row: VideoRow) {
  return {
    _id: row.id,
    projectId: serializeProject({
      id: row.project_id,
      title: row.project_title,
      description: row.project_description,
      brand_id: row.project_brand_id,
      category: row.project_category,
      thumbnail_url: row.project_thumbnail_url,
      thumbnail_public_id: row.project_thumbnail_public_id,
      is_featured: row.project_is_featured,
      is_published: row.project_is_published,
      created_at: row.project_created_at,
      updated_at: row.project_updated_at,
      brand_name: row.brand_name,
      brand_logo_url: row.brand_logo_url,
      brand_logo_public_id: row.brand_logo_public_id,
      brand_website_url: row.brand_website_url,
      brand_is_published: row.brand_is_published,
      brand_display_order: row.brand_display_order,
      brand_created_at: row.brand_created_at,
      brand_updated_at: row.brand_updated_at,
    }),
    title: row.title,
    videoProvider: row.video_provider,
    videoId: row.video_id,
    videoUrl: row.video_url,
    embedUrl: row.embed_url,
    videoPublicId: row.video_public_id,
    thumbnailUrl: row.thumbnail_url,
    thumbnailPublicId: row.thumbnail_public_id,
    displayOrder: row.display_order,
    isPublished: intToBool(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const videoSelect = `
  SELECT videos.*,
    projects.title AS project_title,
    projects.description AS project_description,
    projects.brand_id AS project_brand_id,
    projects.category AS project_category,
    projects.thumbnail_url AS project_thumbnail_url,
    projects.thumbnail_public_id AS project_thumbnail_public_id,
    projects.is_featured AS project_is_featured,
    projects.is_published AS project_is_published,
    projects.created_at AS project_created_at,
    projects.updated_at AS project_updated_at,
    brands.name AS brand_name,
    brands.logo_url AS brand_logo_url,
    brands.logo_public_id AS brand_logo_public_id,
    brands.website_url AS brand_website_url,
    brands.is_published AS brand_is_published,
    brands.display_order AS brand_display_order,
    brands.created_at AS brand_created_at,
    brands.updated_at AS brand_updated_at
  FROM videos
  INNER JOIN projects ON projects.id = videos.project_id
  LEFT JOIN brands ON brands.id = projects.brand_id
`;

export const publicVideoRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
export const adminVideoRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

publicVideoRoutes.get('/', async (c) => {
  const projectId = c.req.query('projectId');
  const where = projectId
    ? 'WHERE videos.is_published = 1 AND projects.is_published = 1 AND videos.project_id = ?'
    : 'WHERE videos.is_published = 1 AND projects.is_published = 1';
  const query = c.env.DB.prepare(`${videoSelect} ${where} ORDER BY videos.display_order ASC, videos.created_at DESC`);
  const result = projectId ? await query.bind(projectId).all<VideoRow>() : await query.all<VideoRow>();
  return c.json({ videos: result.results.map(serializeVideo) });
});

adminVideoRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(`${videoSelect} ORDER BY videos.display_order ASC, videos.created_at DESC`).all<VideoRow>();
  return c.json({ videos: result.results.map(serializeVideo) });
});

adminVideoRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>();
  const projectId = requireString(body.projectId, 80);
  const title = requireString(body.title, 160);
  const normalized = normalizeVideoPayload(body);
  if (!projectId || !title || !normalized) return jsonError(c, 400, 'Invalid video payload');
  const id = crypto.randomUUID();
  const now = nowIso();
  await c.env.DB.prepare(
    'INSERT INTO videos (id, project_id, title, video_provider, video_id, video_url, embed_url, video_public_id, thumbnail_url, thumbnail_public_id, display_order, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      id,
      projectId,
      title,
      normalized.videoProvider,
      normalized.videoId,
      normalized.videoUrl,
      normalized.embedUrl,
      normalized.videoPublicId,
      optionalString(body.thumbnailUrl, 500),
      optionalString(body.thumbnailPublicId, 240),
      integerValue(body.displayOrder, 0),
      boolToInt(booleanValue(body.isPublished, false)),
      now,
      now,
    )
    .run();
  const video = await c.env.DB.prepare(`${videoSelect} WHERE videos.id = ?`).bind(id).first<VideoRow>();
  return c.json({ video: serializeVideo(video as VideoRow) }, 201);
});

adminVideoRoutes.patch('/:id', async (c) => {
  const existing = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(c.req.param('id')).first<VideoRow>();
  if (!existing) return jsonError(c, 404, 'Video not found');
  const body = await c.req.json<Record<string, unknown>>();
  const normalized = body.videoUrl ? normalizeVideoPayload(body) : null;
  if (body.videoUrl && !normalized) return jsonError(c, 400, 'Invalid video URL');
  await c.env.DB.prepare(
    'UPDATE videos SET project_id = ?, title = ?, video_provider = ?, video_id = ?, video_url = ?, embed_url = ?, video_public_id = ?, thumbnail_url = ?, thumbnail_public_id = ?, display_order = ?, is_published = ?, updated_at = ? WHERE id = ?',
  )
    .bind(
      body.projectId === undefined ? existing.project_id : requireString(body.projectId, 80) ?? existing.project_id,
      body.title === undefined ? existing.title : requireString(body.title, 160) ?? existing.title,
      normalized?.videoProvider ?? existing.video_provider,
      normalized?.videoId ?? existing.video_id,
      normalized?.videoUrl ?? existing.video_url,
      normalized?.embedUrl ?? existing.embed_url,
      normalized?.videoPublicId ?? existing.video_public_id,
      body.thumbnailUrl === undefined ? existing.thumbnail_url : optionalString(body.thumbnailUrl, 500),
      body.thumbnailPublicId === undefined ? existing.thumbnail_public_id : optionalString(body.thumbnailPublicId, 240),
      body.displayOrder === undefined ? existing.display_order : integerValue(body.displayOrder),
      body.isPublished === undefined ? existing.is_published : boolToInt(booleanValue(body.isPublished)),
      nowIso(),
      existing.id,
    )
    .run();
  const video = await c.env.DB.prepare(`${videoSelect} WHERE videos.id = ?`).bind(existing.id).first<VideoRow>();
  return c.json({ video: serializeVideo(video as VideoRow) });
});

adminVideoRoutes.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(c.req.param('id')).run();
  if (!result.meta.changes) return jsonError(c, 404, 'Video not found');
  return c.body(null, 204);
});
