import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './crypto';

describe('password crypto helpers', () => {
  it('verifies a password against its PBKDF2 hash and salt', async () => {
    const result = await hashPassword('change_me_min_12');

    expect(result.passwordHash).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(result.passwordSalt).toMatch(/^[A-Za-z0-9+/=]+$/);
    await expect(verifyPassword('change_me_min_12', result)).resolves.toBe(true);
    await expect(verifyPassword('wrong_password', result)).resolves.toBe(false);
  });
});
