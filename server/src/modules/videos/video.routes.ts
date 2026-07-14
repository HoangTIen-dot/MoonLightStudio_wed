import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { filterVideosWithPublishedProjects } from './public-video-response.js';
import { VideoModel } from './video.model.js';

const objectIdSchema = z.string().refine((value) => isValidObjectId(value), 'Invalid object id');

const createVideoSchema = z.object({
  projectId: objectIdSchema,
  title: z.string().min(1),
  videoUrl: z.string().url(),
  videoProvider: z.enum(['vimeo', 'youtube', 'upload']).default('vimeo'),
  videoId: z.string().optional(),
  embedUrl: z.string().url().optional(),
  videoPublicId: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  thumbnailPublicId: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

const updateVideoSchema = createVideoSchema.partial();

export const publicVideoRoutes = Router();
export const adminVideoRoutes = Router();

function parseVimeoVideoId(videoUrl: string) {
  const url = new URL(videoUrl);

  if (!['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
    return null;
  }

  const match = url.pathname.match(/(?:\/video)?\/(\d+)/);
  return match?.[1] ?? null;
}

function normalizeCreateVideoPayload(payload: z.infer<typeof createVideoSchema>) {
  if (payload.videoProvider === 'vimeo') {
    const videoId = payload.videoId ?? parseVimeoVideoId(payload.videoUrl);

    if (!videoId) {
      return null;
    }

    return {
      ...payload,
      videoProvider: 'vimeo' as const,
      videoId,
      videoUrl: `https://vimeo.com/${videoId}`,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      videoPublicId: payload.videoPublicId ?? videoId,
    };
  }

  if (!payload.videoId || !payload.embedUrl) {
    return null;
  }

  return {
    ...payload,
    videoPublicId: payload.videoPublicId ?? payload.videoId,
  };
}

function normalizeUpdateVideoPayload(payload: z.infer<typeof updateVideoSchema>) {
  if (payload.videoUrl || payload.videoProvider === 'vimeo') {
    const videoUrl = payload.videoUrl;

    if (!videoUrl) {
      return null;
    }

    const videoId = payload.videoId ?? parseVimeoVideoId(videoUrl);

    if (!videoId) {
      return null;
    }

    return {
      ...payload,
      videoProvider: 'vimeo' as const,
      videoId,
      videoUrl: `https://vimeo.com/${videoId}`,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      videoPublicId: payload.videoPublicId ?? videoId,
    };
  }

  return payload;
}

publicVideoRoutes.get('/', async (req, res, next) => {
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : '';

  if (projectId && !isValidObjectId(projectId)) {
    res.status(400).json({ message: 'Invalid project id' });
    return;
  }

  try {
    const filter = projectId ? { isPublished: true, projectId } : { isPublished: true };
    const videos = await VideoModel.find(filter)
      .populate({
        path: 'projectId',
        match: { isPublished: true },
        populate: {
          path: 'brandId',
          match: { isPublished: true },
        },
      })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({ videos: filterVideosWithPublishedProjects(videos) });
  } catch (error) {
    next(error);
  }
});

adminVideoRoutes.get('/', async (_req, res, next) => {
  try {
    const videos = await VideoModel.find().populate('projectId').sort({ displayOrder: 1, createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    next(error);
  }
});

adminVideoRoutes.post('/', async (req, res, next) => {
  const result = createVideoSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid video payload',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const normalizedPayload = normalizeCreateVideoPayload(result.data);

    if (!normalizedPayload) {
      res.status(400).json({ message: 'Invalid video URL' });
      return;
    }

    const video = await VideoModel.create(normalizedPayload);
    res.status(201).json({ video });
  } catch (error) {
    next(error);
  }
});

adminVideoRoutes.patch('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid video id' });
    return;
  }

  const result = updateVideoSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid video payload',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const normalizedPayload = normalizeUpdateVideoPayload(result.data);

    if (!normalizedPayload) {
      res.status(400).json({ message: 'Invalid video URL' });
      return;
    }

    const video = await VideoModel.findByIdAndUpdate(req.params.id, normalizedPayload, {
      new: true,
      runValidators: true,
    }).populate('projectId');

    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    res.json({ video });
  } catch (error) {
    next(error);
  }
});

adminVideoRoutes.delete('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid video id' });
    return;
  }

  try {
    const video = await VideoModel.findByIdAndDelete(req.params.id);

    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
