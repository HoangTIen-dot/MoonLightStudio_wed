const LOCAL_API_BASE_URL = 'http://localhost:4000/api';
const PRODUCTION_API_BASE_URL = 'https://moonlight-worker-api.huynhtien2809202.workers.dev/api';

const isLocalHost = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1';

const getCurrentHostname = () => (typeof window === 'undefined' ? 'localhost' : window.location.hostname);

export function resolveApiBaseUrl(configuredUrl?: string, hostname = getCurrentHostname()) {
  if (configuredUrl) {
    return configuredUrl;
  }

  return isLocalHost(hostname) ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string; errors?: Array<{ path: string; message: string }> };

      if (errorBody.message) {
        message = errorBody.message;
      }

      if (errorBody.errors?.length) {
        message = `${message}: ${errorBody.errors.map((error) => `${error.path} ${error.message}`).join(', ')}`;
      }
    } catch {
      // Keep the status-based fallback when the response body is not JSON.
    }

    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('adminToken');
      window.location.assign('/admin/login');
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
