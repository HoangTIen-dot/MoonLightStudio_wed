import { apiRequest } from '../../shared/lib/api';
import type { Project } from '../projects/project.service';

export type Video = {
  _id: string;
  projectId: string | Project;
  title: string;
  videoProvider: 'vimeo' | 'youtube' | 'upload';
  videoId: string;
  videoUrl: string;
  embedUrl: string;
  videoPublicId: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VideoPayload = {
  projectId: string;
  title: string;
  videoProvider?: 'vimeo' | 'youtube' | 'upload';
  videoId?: string;
  videoUrl: string;
  embedUrl?: string;
  videoPublicId?: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  displayOrder?: number;
  isPublished?: boolean;
};

export type UploadSignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: 'image' | 'video';
  signature: string;
  timestamp: number;
  uploadUrl: string;
};

export type CloudinaryUploadResult = {
  bytes: number;
  public_id: string;
  resource_type: 'image' | 'video';
  secure_url: string;
};

export async function getPublicVideos(projectId?: string) {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return apiRequest<{ videos: Video[] }>(`/public/videos${query}`);
}

export async function getAdminVideos() {
  return apiRequest<{ videos: Video[] }>('/admin/videos');
}

export async function createVideo(payload: VideoPayload) {
  return apiRequest<{ video: Video }>('/admin/videos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateVideo(id: string, payload: Partial<VideoPayload>) {
  return apiRequest<{ video: Video }>(`/admin/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteVideo(id: string) {
  return apiRequest<void>(`/admin/videos/${id}`, {
    method: 'DELETE',
  });
}

export async function createUploadSignature(resourceType: 'image' | 'video') {
  return apiRequest<UploadSignature>('/admin/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ resourceType }),
  });
}

export async function uploadFileToCloudinary(
  file: File,
  resourceType: 'image' | 'video',
  onProgress?: (progress: number) => void,
) {
  const signature = await createUploadSignature(resourceType);
  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('folder', signature.folder);
  formData.append('signature', signature.signature);
  formData.append('timestamp', String(signature.timestamp));

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('POST', signature.uploadUrl);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(JSON.parse(request.responseText) as CloudinaryUploadResult);
        return;
      }

      let responseMessage = '';

      try {
        const response = JSON.parse(request.responseText) as { error?: { message?: string }; message?: string };
        responseMessage = response.error?.message ?? response.message ?? '';
      } catch {
        responseMessage = request.responseText;
      }

      reject(new Error(responseMessage || `Cloudinary upload failed: ${request.status}`));
    };

    request.onerror = () => reject(new Error('Cloudinary upload failed'));
    request.send(formData);
  });
}
