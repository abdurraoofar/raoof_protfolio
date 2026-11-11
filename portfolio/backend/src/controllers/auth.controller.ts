import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required')
  })
});

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const identifier = (email || username || '').trim();

  if (!identifier) {
    throw AppError.badRequest('Username or email is required');
  }

  // 1. Look up existing admin in PostgreSQL
  let admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: 'insensitive' } },
        { username: { equals: identifier, mode: 'insensitive' } }
      ]
    }
  });

  let isValid = false;
  if (admin) {
    isValid = await bcrypt.compare(password, admin.passwordHash);
  }

  // 2. Verified via secure environment variables
  const envAdminEmail = process.env.ADMIN_EMAIL;
  const envAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!isValid && envAdminEmail && envAdminPassword && (identifier.toLowerCase() === envAdminEmail.toLowerCase() || identifier.toLowerCase() === 'admin')) {
    if (password === envAdminPassword) {
      isValid = true;
      if (!admin) {
        admin = await prisma.admin.create({
          data: {
            email: envAdminEmail,
            username: 'admin',
            passwordHash: await bcrypt.hash(envAdminPassword, 10),
            name: 'Abdur Raoof A R',
            role: 'ADMIN'
          }
        });
      }
    }
  }

  if (!isValid || !admin) {
    throw AppError.unauthorized('Invalid credentials');
  }

  // 3. Issue genuine signed JWT
  const token = jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn as any }
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role
      }
    },
    message: 'Authentication successful'
  });
});

