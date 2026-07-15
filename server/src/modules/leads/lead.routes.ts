import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { sendLeadNotification } from './lead-notification.js';
import { LeadModel } from './lead.model.js';

const createLeadSchema = z
  .object({
    name: z.string().min(1).max(80),
    company: z.string().max(100).optional().or(z.literal('')),
    email: z.string().email().max(120).optional().or(z.literal('')),
    phone: z.string().max(40).optional().or(z.literal('')),
    message: z.string().min(1).max(1200),
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'Email or phone is required',
    path: ['email'],
  });

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']),
});

export const publicLeadRoutes = Router();
export const adminLeadRoutes = Router();

publicLeadRoutes.post('/', async (req, res, next) => {
  const result = createLeadSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid lead payload',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const lead = await LeadModel.create(result.data);
    const notificationResult = await sendLeadNotification({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      createdAt: lead.createdAt,
    });

    if (notificationResult.status === 'skipped') {
      console.warn(`Lead notification skipped: ${notificationResult.reason}`);
    }

    if (notificationResult.status === 'failed') {
      console.error(`Lead notification failed: ${notificationResult.reason}`);
    }

    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

adminLeadRoutes.get('/', async (_req, res, next) => {
  try {
    const leads = await LeadModel.find().sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    next(error);
  }
});

adminLeadRoutes.patch('/:id', async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid lead id' });
    return;
  }

  const result = updateLeadSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ message: 'Invalid lead payload' });
    return;
  }

  try {
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, result.data, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    res.json({ lead });
  } catch (error) {
    next(error);
  }
});
