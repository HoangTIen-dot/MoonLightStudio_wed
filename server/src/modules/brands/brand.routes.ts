import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { BrandModel } from './brand.model.js';

const createBrandSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url(),
  logoPublicId: z.string().min(1),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const updateBrandSchema = createBrandSchema.partial();

export const publicBrandRoutes = Router();
export const adminBrandRoutes = Router();

publicBrandRoutes.get('/', async (_req, res, next) => {
  try {
    const brands = await BrandModel.find({ isPublished: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ brands });
  } catch (error) {
    next(error);
  }
});

adminBrandRoutes.get('/', async (_req, res, next) => {
  try {
    const brands = await BrandModel.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ brands });
  } catch (error) {
    next(error);
  }
});

adminBrandRoutes.post('/', async (req, res, next) => {
  const result = createBrandSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid brand payload' });
    return;
  }

  try {
    const brand = await BrandModel.create(result.data);
    res.status(201).json({ brand });
  } catch (error) {
    next(error);
  }
});

adminBrandRoutes.patch('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid brand id' });
    return;
  }

  const result = updateBrandSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid brand payload' });
    return;
  }

  try {
    const brand = await BrandModel.findByIdAndUpdate(req.params.id, result.data, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }

    res.json({ brand });
  } catch (error) {
    next(error);
  }
});

adminBrandRoutes.delete('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid brand id' });
    return;
  }

  try {
    const brand = await BrandModel.findByIdAndDelete(req.params.id);

    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
