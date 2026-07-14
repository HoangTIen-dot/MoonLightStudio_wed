import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { VideoModel } from '../videos/video.model.js';
import { ProjectModel } from './project.model.js';

const objectIdSchema = z.string().refine((value) => isValidObjectId(value), 'Invalid object id');

const createProjectSchema = z.object({
  title: z.string().min(1).max(90),
  description: z.string().min(1).max(360),
  brandId: objectIdSchema.nullable().optional(),
  category: z.string().min(1).max(40),
  thumbnailUrl: z.string().url(),
  thumbnailPublicId: z.string().min(1),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export const publicProjectRoutes = Router();
export const adminProjectRoutes = Router();

publicProjectRoutes.get('/', async (_req, res, next) => {
  try {
    const projects = await ProjectModel.find({ isPublished: true })
      .populate('brandId')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

publicProjectRoutes.get('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid project id' });
    return;
  }

  try {
    const project = await ProjectModel.findOne({ _id: req.params.id, isPublished: true }).populate('brandId');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

adminProjectRoutes.get('/', async (_req, res, next) => {
  try {
    const projects = await ProjectModel.find().populate('brandId').sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

adminProjectRoutes.post('/', async (req, res, next) => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid project payload',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const project = await ProjectModel.create(result.data);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

adminProjectRoutes.patch('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid project id' });
    return;
  }

  const result = updateProjectSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid project payload',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const project = await ProjectModel.findByIdAndUpdate(req.params.id, result.data, {
      new: true,
      runValidators: true,
    }).populate('brandId');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

adminProjectRoutes.delete('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid project id' });
    return;
  }

  try {
    const project = await ProjectModel.findByIdAndDelete(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    await VideoModel.deleteMany({ projectId: project._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
