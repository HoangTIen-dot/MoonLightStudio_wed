import { describe, expect, it } from 'vitest';
import app from './index';

describe('worker API', () => {
  it('responds to health checks', async () => {
    const response = await app.request('/api/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('allows Cloudflare Pages to preflight admin login requests', async () => {
    const response = await app.request('/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://moonlightstudio-wed.pages.dev',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://moonlightstudio-wed.pages.dev',
    );
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
    expect(response.headers.get('access-control-allow-headers')).toContain('Content-Type');
  });
});
