import { apiRequest } from '../../shared/lib/api';

export type Brand = {
  _id: string;
  name: string;
  logoUrl: string;
  logoPublicId: string;
  websiteUrl: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BrandPayload = {
  name: string;
  logoUrl: string;
  logoPublicId: string;
  websiteUrl?: string;
  isPublished?: boolean;
  displayOrder?: number;
};

export async function getPublicBrands() {
  return apiRequest<{ brands: Brand[] }>('/public/brands');
}

export async function getAdminBrands() {
  return apiRequest<{ brands: Brand[] }>('/admin/brands');
}

export async function createBrand(payload: BrandPayload) {
  return apiRequest<{ brand: Brand }>('/admin/brands', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBrand(id: string, payload: Partial<BrandPayload>) {
  return apiRequest<{ brand: Brand }>(`/admin/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteBrand(id: string) {
  return apiRequest<void>(`/admin/brands/${id}`, {
    method: 'DELETE',
  });
}
