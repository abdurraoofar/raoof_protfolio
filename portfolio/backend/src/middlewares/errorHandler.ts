import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { logger } from '../utils/logger';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected server error occurred';
  let details: Array<{ field: string; message: string }> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request payload failed validation';
    details = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON in request body';
  } else if (config.isDevelopment) {
    message = err.message || message;
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${statusCode} [${errorCode}]: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    errorCode
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && details.length > 0 ? { details } : {}),
      ...(config.isDevelopment && err.stack ? { stack: err.stack } : {})
    }
  });
}
