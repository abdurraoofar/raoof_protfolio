import { env } from './env';

export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  server: {
    port: env.PORT,
    apiPrefix: env.API_PREFIX
  },
  database: {
    url: env.DATABASE_URL
  },
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const rawOrigins = process.env.CORS_ORIGIN || env.CORS_ORIGIN || 'http://localhost:5173';
      const allowedOrigins = rawOrigins.split(',').map((o) => o.trim().replace(/\/+$/, ''));

      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');
      let isVercelDomain = false;
      try {
        isVercelDomain = new URL(origin).hostname.endsWith('.vercel.app');
      } catch {}

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:') ||
        isVercelDomain
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  },
  storage: {
    provider: env.STORAGE_PROVIDER,
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET
    }
  },
  logging: {
    level: env.LOG_LEVEL
  }
} as const;

export default config;
