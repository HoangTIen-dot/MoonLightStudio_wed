import type { AdminSession } from '../types';
import { base64UrlToBytes, bytesToBase64Url, bytesToText, textToBytes } from './encoding';

type JwtPayload = AdminSession & {
  exp: number;
};

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey('raw', textToBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(input: string, secret: string) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textToBytes(input));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signJwt(payload: AdminSession, secret: string, expiresInSeconds = 7 * 24 * 60 * 60) {
  const header = bytesToBase64Url(textToBytes(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = bytesToBase64Url(
    textToBytes(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      }),
    ),
  );
  const unsignedToken = `${header}.${body}`;
  return `${unsignedToken}.${await sign(unsignedToken, secret)}`;
}

export async function verifyJwt(token: string, secret: string): Promise<AdminSession> {
  const [header, body, signature] = token.split('.');

  if (!header || !body || !signature) {
    throw new Error('Invalid token');
  }

  const expectedSignature = await sign(`${header}.${body}`, secret);

  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(bytesToText(base64UrlToBytes(body))) as JwtPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  if ((payload.role !== 'owner' && payload.role !== 'admin') || typeof payload.userId !== 'string') {
    throw new Error('Invalid token payload');
  }

  return {
    userId: payload.userId,
    role: payload.role,
  };
}
