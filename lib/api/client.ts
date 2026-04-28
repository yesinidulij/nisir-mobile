import { loadAuthState, clearAuthState } from '@/lib/auth/storage';
import { API_BASE_URL } from '@/constants/Config';

export { API_BASE_URL };

export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly payload: T | null;

  constructor(message: string, status: number, payload: T | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export interface ApiFetchOptions extends RequestInit {
  baseUrl?: string;
}

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== 'undefined' && body instanceof FormData;

const buildUrl = (path: string, baseUrl: string) => {
  if (path.startsWith('http')) return path;
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.replace(/^\//, '');
  return `${normalizedBase}/${normalizedPath}`;
};

export const buildQueryString = (params: Record<string, unknown> = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null) searchParams.append(key, String(entry));
      });
      return;
    }
    searchParams.set(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { baseUrl = API_BASE_URL, headers, body, ...rest } = options;

  const requestHeaders = new Headers(headers);

  // Add auth token
  if (!requestHeaders.has('Authorization')) {
    const authState = await loadAuthState();
    if (authState?.accessToken) {
      requestHeaders.set('Authorization', `Bearer ${authState.accessToken}`);
    }
  }

  if (!isFormData(body) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, baseUrl), {
    ...rest,
    headers: requestHeaders,
    body,
  });

  let payload: T | null = null;
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type');
    const isJsonResponse = contentType?.includes('application/json');
    payload = isJsonResponse
      ? ((await response.json()) as T)
      : ((await response.text()) as unknown as T);
  }

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthState();
    }
    throw new ApiError(response.statusText || 'Request failed', response.status, payload);
  }

  return (payload ?? (undefined as T)) as T;
}
