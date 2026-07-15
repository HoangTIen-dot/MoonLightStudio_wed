import { describe, expect, it } from 'vitest';
import {
  canDeleteAdminUser,
  canUpdateAdminUserRole,
  serializeAdminUser,
  type AdminUserRecord,
} from './admin-user.service.js';

const owner: AdminUserRecord = {
  _id: 'owner-1',
  email: 'owner@example.com',
  role: 'owner',
  createdAt: new Date('2026-07-15T00:00:00.000Z'),
  updatedAt: new Date('2026-07-15T00:00:00.000Z'),
  passwordHash: 'secret-hash',
};

describe('admin user service helpers', () => {
  it('serializes admin users without password hashes', () => {
    expect(serializeAdminUser(owner)).toEqual({
      _id: 'owner-1',
      email: 'owner@example.com',
      role: 'owner',
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: '2026-07-15T00:00:00.000Z',
    });
  });

  it('prevents deleting the last owner', () => {
    expect(canDeleteAdminUser(owner, 1)).toEqual({
      allowed: false,
      reason: 'Cannot delete the last owner',
    });
  });

  it('allows deleting an admin user even when there is one owner', () => {
    expect(canDeleteAdminUser({ role: 'admin' }, 1)).toEqual({
      allowed: true,
    });
  });

  it('prevents demoting the last owner', () => {
    expect(canUpdateAdminUserRole(owner, 'admin', 1)).toEqual({
      allowed: false,
      reason: 'Cannot remove the last owner',
    });
  });
});
