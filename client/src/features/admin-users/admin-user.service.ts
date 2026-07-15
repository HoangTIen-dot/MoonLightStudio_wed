import { apiRequest } from '../../shared/lib/api';

export type AdminRole = 'owner' | 'admin';

export type AdminUser = {
  _id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminUsers() {
  return apiRequest<{ users: AdminUser[] }>('/admin/users');
}

export async function createAdminUser(payload: { email: string; password: string; role: AdminRole }) {
  return apiRequest<{ user: AdminUser }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  id: string,
  payload: { email?: string; password?: string; role?: AdminRole },
) {
  return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string) {
  return apiRequest<void>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}
