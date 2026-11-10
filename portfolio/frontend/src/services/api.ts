import { frontendConfig } from '../config/env';
import { ApiResponse, ApiErrorResponse, HealthCheckData } from '../types/api.types';

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    code = 'API_ERROR',
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${frontendConfig.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    const errPayload = payload as ApiErrorResponse;
    throw new ApiClientError(
      errPayload?.error?.message || `HTTP Error ${response.status}`,
      response.status,
      errPayload?.error?.code || 'HTTP_ERROR',
      errPayload?.error?.details
    );
  }

  return payload as ApiResponse<T>;
}

export const healthService = {
  getHealth: () => apiRequest<HealthCheckData>('/health'),
  postEcho: (ping: string) =>
    apiRequest<{ echo: string; serverTimestamp: string; environment: string }>('/health/echo', {
      method: 'POST',
      body: JSON.stringify({ ping, clientTimestamp: new Date().toISOString() })
    })
};
