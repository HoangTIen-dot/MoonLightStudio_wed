import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AdminUserModel } from './admin-user.model.js';

type AdminJwtPayload = {
  userId: string;
  role: 'admin';
};

const TOKEN_EXPIRES_IN = '7d';

export async function loginAdmin(email: string, password: string): Promise<{ token: string }> {
  const admin = await AdminUserModel.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  if (!admin) {
    throw new Error('Invalid admin credentials');
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatches) {
    throw new Error('Invalid admin credentials');
  }

  const payload: AdminJwtPayload = {
    userId: admin._id.toString(),
    role: 'admin',
  };

  return {
    token: jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN }),
  };
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (!isAdminJwtPayload(payload)) {
    throw new Error('Invalid admin token');
  }

  return payload;
}

function isAdminJwtPayload(payload: string | jwt.JwtPayload): payload is AdminJwtPayload {
  return typeof payload !== 'string' && typeof payload.userId === 'string' && payload.role === 'admin';
}
