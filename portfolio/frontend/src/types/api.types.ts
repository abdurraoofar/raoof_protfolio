export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    stack?: string;
  };
}

export interface HealthCheckData {
  status: 'healthy' | 'degraded';
  service: string;
  environment: 'development' | 'production' | 'test';
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: 'connected' | 'configured_standby' | 'error';
    provider: 'postgresql';
    latencyMs: number;
    message: string;
  };
  security: {
    corsConfigured: boolean;
    jwtSecretsConfigured: boolean;
    rateLimitingActive: boolean;
  };
  system: {
    nodeVersion: string;
    rssMb: number;
    heapUsedMb: number;
  };
}
