import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

const cloudinaryConfigSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1).refine((value) => !value.startsWith('your_'), {
    message: 'CLOUDINARY_CLOUD_NAME must be configured',
  }),
  CLOUDINARY_API_KEY: z.string().min(1).refine((value) => !value.startsWith('your_'), {
    message: 'CLOUDINARY_API_KEY must be configured',
  }),
  CLOUDINARY_API_SECRET: z.string().min(1).refine((value) => !value.startsWith('your_'), {
    message: 'CLOUDINARY_API_SECRET must be configured',
  }),
});

export function getCloudinaryConfig() {
  const config = cloudinaryConfigSchema.parse(process.env);

  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return config;
}

export { cloudinary };
