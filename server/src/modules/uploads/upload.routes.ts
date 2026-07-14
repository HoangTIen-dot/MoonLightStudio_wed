import { Router } from 'express';
import { ZodError } from 'zod';
import { z } from 'zod';
import { cloudinary, getCloudinaryConfig } from '../../config/cloudinary.js';

const DEFAULT_UPLOAD_FOLDER = 'moonlight-cms';

const signedUploadSchema = z.object({
  resourceType: z.enum(['image', 'video']).default('video'),
});

export const uploadRoutes = Router();

uploadRoutes.post('/signature', (req, res) => {
  let cloudinaryConfig: ReturnType<typeof getCloudinaryConfig>;

  try {
    cloudinaryConfig = getCloudinaryConfig();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(500).json({ message: 'Cloudinary is not configured' });
      return;
    }

    throw error;
  }

  const result = signedUploadSchema.safeParse(req.body ?? {});

  if (!result.success) {
    res.status(400).json({ message: 'Invalid upload signature payload' });
    return;
  }

  const { resourceType } = result.data;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${DEFAULT_UPLOAD_FOLDER}/${resourceType}s`;
  const paramsToSign = {
    folder,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinaryConfig.CLOUDINARY_API_SECRET);

  res.json({
    apiKey: cloudinaryConfig.CLOUDINARY_API_KEY,
    cloudName: cloudinaryConfig.CLOUDINARY_CLOUD_NAME,
    folder,
    resourceType,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryConfig.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
  });
});
