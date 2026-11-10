import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError } from '../utils/AppError';

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader('X-Request-Id', String(requestId));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

export function rateLimiterMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.maxRequests;

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  record.count += 1;
  if (record.count > maxRequests) {
    next(AppError.tooManyRequests('API rate limit exceeded. Please wait before retrying.'));
    return;
  }

  next();
}
