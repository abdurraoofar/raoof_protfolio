import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username.trim().toLowerCase() === 'admin' && password === '1234') {
    res.status(200).json({
      success: true,
      data: {
        token: 'portfolio-admin-session-token',
        user: {
          username: 'admin',
          role: 'admin',
          authenticatedAt: new Date().toISOString()
        }
      },
      message: 'Admin authentication successful'
    });
    return;
  }

  throw AppError.unauthorized('Invalid username or password');
});
