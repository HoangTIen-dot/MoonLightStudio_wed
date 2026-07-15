import { apiRequest } from '../../shared/lib/api';

export type AdminSession = {
  userId: string;
  role: 'owner' | 'admin';
};

export async function loginAdmin(email: string, password: string) {
  return apiRequest<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentAdmin() {
  return apiRequest<{ admin: AdminSession }>('/auth/me');
}

export function saveAdminToken(token: string) {
  localStorage.setItem('adminToken', token);
}

export function clearAdminToken() {
  localStorage.removeItem('adminToken');
}

export function hasAdminToken() {
  return Boolean(localStorage.getItem('adminToken'));
}
