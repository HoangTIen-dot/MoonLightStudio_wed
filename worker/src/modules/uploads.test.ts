import { describe, expect, it } from 'vitest';
import { createCloudinarySignature } from './uploads';

describe('Cloudinary upload signing', () => {
  it('creates a deterministic SHA-1 signature from sorted params', async () => {
    const signature = await createCloudinarySignature(
      {
        timestamp: 1710000000,
        folder: 'moonlight-cms/images',
      },
      'secret',
    );

    expect(signature).toBe('34d58c4da7f334af41d74be07b9f25dfb75fee48');
  });
});
