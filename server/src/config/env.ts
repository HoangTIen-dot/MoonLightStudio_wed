import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_APP_PASSWORD: z.string().min(1).optional(),
  LEAD_NOTIFICATION_TO: z.string().email().optional(),
  LEAD_NOTIFICATION_FROM: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
