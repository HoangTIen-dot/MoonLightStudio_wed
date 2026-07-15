import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { jsonError } from '../lib/http';

type SignatureParams = Record<string, string | number>;

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createCloudinarySignature(params: SignatureParams, apiSecret: string) {
  const payload = `${Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}${apiSecret}`;
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(payload));
  return bytesToHex(new Uint8Array(digest));
}

export const uploadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

uploadRoutes.post('/signature', async (c) => {
  const body = (await c.req.json<Record<string, unknown>>().catch(() => ({}))) as Record<string, unknown>;
  const resourceType = body.resourceType === 'image' ? 'image' : 'video';

  if (!c.env.CLOUDINARY_CLOUD_NAME || !c.env.CLOUDINARY_API_KEY || !c.env.CLOUDINARY_API_SECRET) {
    return jsonError(c, 500, 'Cloudinary is not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${c.env.CLOUDINARY_UPLOAD_FOLDER ?? 'moonlight-cms'}/${resourceType}s`;
  const paramsToSign = { folder, timestamp };
  const signature = await createCloudinarySignature(paramsToSign, c.env.CLOUDINARY_API_SECRET);

  return c.json({
    apiKey: c.env.CLOUDINARY_API_KEY,
    cloudName: c.env.CLOUDINARY_CLOUD_NAME,
    folder,
    resourceType,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${c.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
  });
});
