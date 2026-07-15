import { describe, expect, it } from 'vitest';
import app from './index';

describe('worker API', () => {
  it('responds to health checks', async () => {
    const response = await app.request('/api/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
