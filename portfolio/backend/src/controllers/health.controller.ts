import { Request, Response } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { checkDatabaseHealth } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';

export const healthEchoSchema = z.object({
  body: z.object({
    ping: z.string().min(2, 'Ping message must be at least 2 characters'),
    clientTimestamp: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const getHealthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseHealth();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'portfolio-backend-api',
      environment: config.env,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      security: {
        corsConfigured: true,
        jwtSecretsConfigured: Boolean(config.jwt.accessSecret && config.jwt.refreshSecret),
        rateLimitingActive: true
      },
      system: {
        nodeVersion: process.version,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100
      }
    },
    message: 'Portfolio Backend API is operational'
  });
});

export const getHealthDb = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseHealth();
  const statusCode = dbStatus.status === 'connected' ? 200 : 503;
  res.status(statusCode).json({
    success: dbStatus.status === 'connected',
    data: dbStatus,
    message: dbStatus.message
  });
});

export const postHealthEcho = asyncHandler(async (req: Request, res: Response) => {
  const { ping, clientTimestamp } = req.body;
  res.status(200).json({
    success: true,
    data: {
      echo: ping,
      clientTimestamp: clientTimestamp || null,
      serverTimestamp: new Date().toISOString(),
      environment: config.env
    },
    message: 'Zod validation passed and payload echoed'
  });
});
