import { describe, expect, it } from 'vitest';
import { signJwt, verifyJwt } from './jwt';

describe('worker JWT helpers', () => {
  it('signs and verifies an admin payload', async () => {
    const token = await signJwt({ userId: 'user-1', role: 'owner' }, 'secret-at-least-32-characters-long', 60);
    const payload = await verifyJwt(token, 'secret-at-least-32-characters-long');

    expect(payload.userId).toBe('user-1');
    expect(payload.role).toBe('owner');
  });

  it('rejects tokens signed with a different secret', async () => {
    const token = await signJwt({ userId: 'user-1', role: 'admin' }, 'secret-at-least-32-characters-long', 60);

    await expect(verifyJwt(token, 'different-secret-at-least-32-characters')).rejects.toThrow('Invalid token signature');
  });
});
