import bcrypt from 'bcryptjs';
import { AdminUserModel, type AdminRole } from '../auth/admin-user.model.js';

export type AdminUserRecord = {
  _id: string;
  email: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
};

export type SerializedAdminUser = {
  _id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export function serializeAdminUser(user: AdminUserRecord): SerializedAdminUser {
  return {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function canDeleteAdminUser(user: Pick<AdminUserRecord, 'role'>, ownerCount: number) {
  if (user.role === 'owner' && ownerCount <= 1) {
    return { allowed: false as const, reason: 'Cannot delete the last owner' };
  }

  return { allowed: true as const };
}

export function canUpdateAdminUserRole(user: Pick<AdminUserRecord, 'role'>, nextRole: AdminRole, ownerCount: number) {
  if (user.role === 'owner' && nextRole !== 'owner' && ownerCount <= 1) {
    return { allowed: false as const, reason: 'Cannot remove the last owner' };
  }

  return { allowed: true as const };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function countOwners() {
  return AdminUserModel.countDocuments({ role: 'owner' });
}

export async function listAdminUsers() {
  const users = await AdminUserModel.find().sort({ role: -1, email: 1 });
  return users.map((user) => serializeAdminUser(user as unknown as AdminUserRecord));
}

export async function createAdminUser(input: { email: string; password: string; role: AdminRole }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await AdminUserModel.create({
    email: normalizeEmail(input.email),
    passwordHash,
    role: input.role,
  });

  return serializeAdminUser(user as unknown as AdminUserRecord);
}

export async function updateAdminUser(
  id: string,
  input: { email?: string; password?: string; role?: AdminRole },
) {
  const user = await AdminUserModel.findById(id);

  if (!user) {
    return null;
  }

  if (input.role) {
    const roleCheck = canUpdateAdminUserRole(user as unknown as AdminUserRecord, input.role, await countOwners());

    if (!roleCheck.allowed) {
      throw new Error(roleCheck.reason);
    }

    user.role = input.role;
  }

  if (input.email) {
    user.email = normalizeEmail(input.email);
  }

  if (input.password) {
    user.passwordHash = await bcrypt.hash(input.password, 12);
  }

  await user.save();

  return serializeAdminUser(user as unknown as AdminUserRecord);
}

export async function deleteAdminUser(id: string) {
  const user = await AdminUserModel.findById(id);

  if (!user) {
    return null;
  }

  const deleteCheck = canDeleteAdminUser(user as unknown as AdminUserRecord, await countOwners());

  if (!deleteCheck.allowed) {
    throw new Error(deleteCheck.reason);
  }

  const serializedUser = serializeAdminUser(user as unknown as AdminUserRecord);
  await user.deleteOne();
  return serializedUser;
}
