import { apiRequest } from '../../shared/lib/api';
import type { Brand } from '../brands/brand.service';

export type Project = {
  _id: string;
  title: string;
  description: string;
  brandId: string | Brand | null;
  category: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectPayload = {
  title: string;
  description: string;
  brandId?: string | null;
  category: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  isFeatured?: boolean;
  isPublished?: boolean;
};

export async function getPublicProjects() {
  return apiRequest<{ projects: Project[] }>('/public/projects');
}

export async function getPublicProject(id: string) {
  return apiRequest<{ project: Project }>(`/public/projects/${id}`);
}

export async function getAdminProjects() {
  return apiRequest<{ projects: Project[] }>('/admin/projects');
}

export async function createProject(payload: ProjectPayload) {
  return apiRequest<{ project: Project }>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProject(id: string, payload: Partial<ProjectPayload>) {
  return apiRequest<{ project: Project }>(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(id: string) {
  return apiRequest<void>(`/admin/projects/${id}`, {
    method: 'DELETE',
  });
}
