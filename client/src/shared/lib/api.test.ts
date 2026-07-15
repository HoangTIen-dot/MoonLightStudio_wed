import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './api';

describe('resolveApiBaseUrl', () => {
  it('uses configured API URLs when provided', () => {
    expect(resolveApiBaseUrl('https://api.example.com/api', 'moonlightstudio-wed.pages.dev')).toBe(
      'https://api.example.com/api',
    );
  });

  it('uses the local API during localhost development', () => {
    expect(resolveApiBaseUrl(undefined, 'localhost')).toBe('http://localhost:4000/api');
  });

  it('uses the Worker API for deployed pages when no env value is configured', () => {
    expect(resolveApiBaseUrl(undefined, 'moonlightstudio-wed.pages.dev')).toBe(
      'https://moonlight-worker-api.huynhtien2809202.workers.dev/api',
    );
  });
});
