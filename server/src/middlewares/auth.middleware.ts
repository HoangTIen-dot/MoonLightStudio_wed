import type { RequestHandler } from 'express';
import { verifyAdminToken } from '../modules/auth/auth.service.js';

export const requireAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    res.locals.admin = verifyAdminToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
