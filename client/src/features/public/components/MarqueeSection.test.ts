import { describe, expect, it } from 'vitest';
import { getBrandTileUrl } from './MarqueeSection';

describe('getBrandTileUrl', () => {
  it('keeps uploaded brand tile URLs unchanged', () => {
    const url = 'https://res.cloudinary.com/nchaubz0/image/upload/v1784109000/moonlight-cms/images/milo-brand-tile.webp';

    expect(getBrandTileUrl(url)).toBe(url);
  });
});
