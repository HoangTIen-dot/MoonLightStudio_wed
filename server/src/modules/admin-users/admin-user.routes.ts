import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser } from './admin-user.service.js';

const roleSchema = z.enum(['owner', 'admin']);

const createAdminUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  role: roleSchema.default('admin'),
});

const updateAdminUserSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(12).optional().or(z.literal('')),
    role: roleSchema.optional(),
  })
  .transform((value) => ({
    ...value,
    password: value.password || undefined,
  }));

export const adminUserRoutes = Router();

adminUserRoutes.get('/', async (_req, res, next) => {
  try {
    res.json({ users: await listAdminUsers() });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.post('/', async (req, res, next) => {
  const result = createAdminUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid admin user payload' });
    return;
  }

  try {
    const user = await createAdminUser(result.data);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.patch('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid admin user id' });
    return;
  }

  const result = updateAdminUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid admin user payload' });
    return;
  }

  try {
    const user = await updateAdminUser(req.params.id, result.data);

    if (!user) {
      res.status(404).json({ message: 'Admin user not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Cannot ')) {
      res.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
});

adminUserRoutes.delete('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid admin user id' });
    return;
  }

  try {
    const user = await deleteAdminUser(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'Admin user not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Cannot ')) {
      res.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
});
