import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { securityHeadersMiddleware, rateLimiterMiddleware } from './middlewares/security';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { globalErrorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes';

export function createApp(): Application {
  const app = express();

  // 1. Security & Transport Middlewares
  app.use(helmet());
  app.use(securityHeadersMiddleware);
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })
  );
  app.use(rateLimiterMiddleware);

  // 2. Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // 3. Root API Route Mounting
  app.use(config.server.apiPrefix, apiRoutes);

  // 4. Fallback 404 & Centralized Error Handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
