import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

const currentEnv = process.env.NODE_ENV || 'development';
const envFile = currentEnv === 'production' ? '.env.production' : '.env.development';

dotenv.config({
  path: path.resolve(__dirname, '../../', envFile)
});
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().min(1).default('/api/v1'),
  DATABASE_URL: z.string().min(10, 'DATABASE_URL must be a valid PostgreSQL connection string'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  STORAGE_PROVIDER: z.enum(['cloudinary', 'supabase', 'local']).default('local'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default('placeholder-cloud'),
  CLOUDINARY_API_KEY: z.string().optional().default('placeholder-key'),
  CLOUDINARY_API_SECRET: z.string().optional().default('placeholder-secret'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:', parsedEnv.error.format());
  throw new Error('Environment validation failed. Check your .env files.');
}

export type EnvConfig = z.infer<typeof envSchema>;
export const env: EnvConfig = parsedEnv.data;
