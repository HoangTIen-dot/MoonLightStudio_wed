import { describe, expect, it } from 'vitest';
import { prepareBrandUploadFile } from './AdminBrandsPage';

describe('prepareBrandUploadFile', () => {
  it('keeps the selected brand image unchanged so website cropping matches local assets', async () => {
    const file = new File(['brand'], 'milo.png', { type: 'image/png' });

    await expect(prepareBrandUploadFile(file)).resolves.toBe(file);
  });
});
