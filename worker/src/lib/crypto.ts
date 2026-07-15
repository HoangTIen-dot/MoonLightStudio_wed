import { base64ToBytes, bytesToBase64, textToBytes } from './encoding';

const PBKDF2_ITERATIONS = 210_000;
const HASH_LENGTH_BITS = 256;

export type PasswordHash = {
  passwordHash: string;
  passwordSalt: string;
};

async function derivePasswordHash(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey('raw', textToBytes(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    HASH_LENGTH_BITS,
  );

  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }

  return diff === 0;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);

  return {
    passwordHash: bytesToBase64(hash),
    passwordSalt: bytesToBase64(salt),
  };
}

export async function verifyPassword(password: string, stored: PasswordHash) {
  const salt = base64ToBytes(stored.passwordSalt);
  const expected = base64ToBytes(stored.passwordHash);
  const actual = await derivePasswordHash(password, salt);
  return timingSafeEqual(actual, expected);
}
