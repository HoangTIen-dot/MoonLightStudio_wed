import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middlewares/auth.middleware.js';
import { loginAdmin } from './auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = Router();

authRoutes.post('/login', async (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid login payload' });
    return;
  }

  try {
    const response = await loginAdmin(result.data.email, result.data.password);
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid admin credentials') {
      res.status(401).json({ message: 'Invalid admin credentials' });
      return;
    }

    next(error);
  }
});

authRoutes.get('/me', requireAdmin, (_req, res) => {
  res.json({ admin: res.locals.admin });
});
