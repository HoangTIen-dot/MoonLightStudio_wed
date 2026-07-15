import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requireAdmin, requireOwner } from './middlewares/auth.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { adminUserRoutes } from './modules/admin-users/admin-user.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { adminBrandRoutes, publicBrandRoutes } from './modules/brands/brand.routes.js';
import { adminLeadRoutes, publicLeadRoutes } from './modules/leads/lead.routes.js';
import { adminProjectRoutes, publicProjectRoutes } from './modules/projects/project.routes.js';
import { uploadRoutes } from './modules/uploads/upload.routes.js';
import { adminVideoRoutes, publicVideoRoutes } from './modules/videos/video.routes.js';

export const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const createLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(globalLimiter);
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/public/brands', publicBrandRoutes);
app.use('/api/public/leads', createLeadLimiter, publicLeadRoutes);
app.use('/api/public/projects', publicProjectRoutes);
app.use('/api/public/videos', publicVideoRoutes);

app.use('/api/admin/brands', requireAdmin, adminBrandRoutes);
app.use('/api/admin/leads', requireAdmin, adminLeadRoutes);
app.use('/api/admin/projects', requireAdmin, adminProjectRoutes);
app.use('/api/admin/uploads', requireAdmin, uploadRoutes);
app.use('/api/admin/users', requireAdmin, requireOwner, adminUserRoutes);
app.use('/api/admin/videos', requireAdmin, adminVideoRoutes);

app.use(errorMiddleware);
