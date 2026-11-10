import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address format'),
    subject: z.string().optional(),
    message: z.string().min(5, 'Message must be at least 5 characters')
  })
});

export const getPortfolio = asyncHandler(async (_req: Request, res: Response) => {
  const [profile, projects, skills, experiences, educations, socialLinks, activeResume] =
    await Promise.all([
      prisma.profile.findFirst(),
      prisma.project.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.skill.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.experience.findMany({
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.education.findMany({
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.socialLink.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.resume.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

  res.status(200).json({
    success: true,
    data: {
      profile,
      projects,
      skills,
      experiences,
      educations,
      socialLinks,
      activeResume
    },
    message: 'Portfolio data retrieved from PostgreSQL'
  });
});

export const getProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' }
  });

  res.status(200).json({
    success: true,
    data: projects,
    message: 'Projects retrieved from PostgreSQL'
  });
});

export const getActiveResume = asyncHandler(async (_req: Request, res: Response) => {
  const resume = await prisma.resume.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' }
  });

  if (!resume) {
    throw AppError.notFound('No active resume record found');
  }

  res.status(200).json({
    success: true,
    data: resume,
    message: 'Active resume retrieved from PostgreSQL'
  });
});

export const postContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  const newMessage = await prisma.contactMessage.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Portfolio Inquiry',
      message: message.trim(),
      status: 'UNREAD',
      ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
      userAgent
    }
  });

  res.status(201).json({
    success: true,
    data: newMessage,
    message: 'Inquiry received and recorded in PostgreSQL'
  });
});
