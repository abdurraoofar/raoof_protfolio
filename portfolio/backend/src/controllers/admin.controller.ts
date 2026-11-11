import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

// ---------------------------------------------
// Validation Schemas
// ---------------------------------------------
export const loginSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required')
  })
});

export const projectSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    slug: z.string().optional(),
    summary: z.string().min(5, 'Summary is required'),
    description: z.string().min(5, 'Description is required'),
    category: z.string().default('Web'),
    coverImageUrl: z.string().url('Cover image must be a valid URL'),
    demoUrl: z.string().optional().nullable(),
    githubUrl: z.string().optional().nullable(),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    isPublished: z.boolean().default(true),
    displayOrder: z.number().int().default(0),
    year: z.string().optional().nullable()
  })
});

export const skillSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Skill name is required'),
    category: z.string().default('Frontend'),
    proficiency: z.number().int().min(1).max(100).default(80),
    detail: z.string().optional().nullable(),
    iconName: z.string().optional().nullable(),
    isVisible: z.boolean().default(true),
    displayOrder: z.number().int().default(0),
    code: z.string().optional().nullable()
  })
});

export const experienceSchema = z.object({
  body: z.object({
    role: z.string().min(2, 'Role is required'),
    company: z.string().min(2, 'Company is required'),
    companyUrl: z.string().optional().nullable(),
    period: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    employmentType: z.string().optional().nullable(),
    isCurrent: z.boolean().default(false),
    description: z.string().optional().nullable(),
    highlights: z.array(z.string()).default([]),
    displayOrder: z.number().int().default(0)
  })
});

export const educationSchema = z.object({
  body: z.object({
    degree: z.string().min(2, 'Degree is required'),
    institution: z.string().min(2, 'Institution is required'),
    institutionUrl: z.string().optional().nullable(),
    period: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    startYear: z.number().int().optional().nullable(),
    endYear: z.number().int().optional().nullable(),
    grade: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
    displayOrder: z.number().int().default(0)
  })
});

export const profileSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    headline: z.string().optional(),
    bio: z.string().optional(),
    aboutParagraph1: z.string().optional(),
    aboutParagraph2: z.string().optional(),
    location: z.string().optional(),
    locationFull: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    statusBadge: z.string().optional(),
    heroHeading: z.string().optional(),
    heroSubheading: z.string().optional(),
    avatarUrl: z.string().optional(),
    educationShort: z.string().optional(),
    institutionShort: z.string().optional()
  })
});

export const socialLinkSchema = z.object({
  body: z.object({
    platform: z.string().min(1, 'Platform is required'),
    url: z.string().min(1, 'URL is required'),
    icon: z.string().optional().nullable(),
    isVisible: z.boolean().default(true),
    displayOrder: z.number().int().default(0)
  })
});

export const certificationSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    issuer: z.string().min(2, 'Issuer is required'),
    issueDate: z.string().optional().nullable(),
    expiryDate: z.string().optional().nullable(),
    credentialId: z.string().optional().nullable(),
    credentialUrl: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    displayOrder: z.number().int().default(0)
  })
});

// ---------------------------------------------
// Authentication Controllers
// ---------------------------------------------
export const postAdminRegister = asyncHandler(async (_req: Request, _res: Response) => {
  throw new AppError('Public administrator registration is disabled', 403, 'FORBIDDEN');
});

export const postAdminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || '').trim();

  if (!identifier) {
    throw AppError.badRequest('Email or username is required');
  }

  // Look up admin by email or username
  let admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: 'insensitive' } },
        { username: { equals: identifier, mode: 'insensitive' } }
      ]
    }
  });

  // Verify credentials
  let isValid = false;
  if (admin) {
    isValid = await bcrypt.compare(password, admin.passwordHash);
  }

  // Fallback to initial credentials from environment if not yet matched
  const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
  const envAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!isValid && envAdminPassword && (identifier.toLowerCase() === envAdminEmail.toLowerCase() || identifier.toLowerCase() === 'admin')) {
    if (password === envAdminPassword) {
      isValid = true;
      if (!admin) {
        admin = await prisma.admin.create({
          data: {
            email: envAdminEmail,
            username: 'admin',
            passwordHash: await bcrypt.hash(password, 10),
            name: 'Abdur Raoof A R',
            role: 'ADMIN'
          }
        });
      }
    }
  }

  if (!isValid || !admin) {
    throw AppError.unauthorized('Invalid email/username or password');
  }

  // Generate JWT access token
  const accessToken = jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    },
    config.jwt.accessSecret,
    { expiresIn: '15m' }
  );

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    },
    message: 'Authentication successful'
  });
});

// ---------------------------------------------
// Projects CRUD
// ---------------------------------------------
export const getAdminProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  res.status(200).json({ success: true, data: projects });
});

export const createAdminProject = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const baseSlug = (data.slug || data.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'project';
  
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${Date.now().toString(36)}-${counter++}`;
  }

  const project = await prisma.project.create({
    data: {
      ...data,
      slug
    }
  });
  res.status(201).json({ success: true, data: project, message: 'Project created' });
});

export const updateAdminProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await prisma.project.update({
    where: { id },
    data: req.body
  });
  res.status(200).json({ success: true, data: project, message: 'Project updated' });
});

export const deleteAdminProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.project.delete({ where: { id } });
  res.status(200).json({ success: true, data: { id }, message: 'Project deleted' });
});

// ---------------------------------------------
// Contact Messages CRUD
// ---------------------------------------------
export const getAdminMessages = asyncHandler(async (_req: Request, res: Response) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: messages });
});

export const deleteAdminMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.contactMessage.delete({ where: { id } });
  res.status(200).json({ success: true, data: { id }, message: 'Message deleted' });
});

export const patchAdminMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status: 'READ' }
  });
  res.status(200).json({ success: true, data: message });
});

// ---------------------------------------------
// Skills CRUD
// ---------------------------------------------
export const getAdminSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({ orderBy: { displayOrder: 'asc' } });
  res.status(200).json({ success: true, data: skills });
});

export const createAdminSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await prisma.skill.create({ data: req.body });
  res.status(201).json({ success: true, data: skill, message: 'Skill created' });
});

export const updateAdminSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await prisma.skill.update({ where: { id }, data: req.body });
  res.status(200).json({ success: true, data: skill, message: 'Skill updated' });
});

export const deleteAdminSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.skill.delete({ where: { id } });
  res.status(200).json({ success: true, data: { id }, message: 'Skill deleted' });
});

// ---------------------------------------------
// Experiences CRUD
// ---------------------------------------------
export const getAdminExperiences = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.experience.findMany({ orderBy: { displayOrder: 'asc' } });
  res.status(200).json({ success: true, data: items });
});

export const createAdminExperience = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.experience.create({ data: req.body });
  res.status(201).json({ success: true, data: item, message: 'Experience created' });
});

export const updateAdminExperience = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.experience.update({ where: { id }, data: req.body });
  res.status(200).json({ success: true, data: item, message: 'Experience updated' });
});

export const deleteAdminExperience = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.experience.delete({ where: { id } });
  res.status(200).json({ success: true, data: { id }, message: 'Experience deleted' });
});

// ---------------------------------------------
// Educations CRUD
// ---------------------------------------------
export const getAdminEducations = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.education.findMany({ orderBy: { displayOrder: 'asc' } });
  res.status(200).json({ success: true, data: items });
});

export const createAdminEducation = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.education.create({ data: req.body });
  res.status(201).json({ success: true, data: item, message: 'Education created' });
});

export const updateAdminEducation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.education.update({ where: { id }, data: req.body });
  res.status(200).json({ success: true, data: item, message: 'Education updated' });
});

export const deleteAdminEducation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.education.delete({ where: { id } });
  res.status(200).json({ success: true, data: { id }, message: 'Education deleted' });
});

// ---------------------------------------------
// Profile & Resume
// ---------------------------------------------
export const getAdminProfile = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await prisma.profile.findFirst();
  res.status(200).json({ success: true, data: profile });
});

export const updateAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  let profile = await prisma.profile.findFirst();
  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: req.body
    });
  } else {
    profile = await prisma.profile.create({
      data: {
        fullName: 'Abdur Raoof A R',
        headline: 'IT Graduate',
        bio: 'Bio',
        location: 'Chennai',
        email: 'raoofwebdev@gmail.com',
        statusBadge: 'Active',
        heroHeading: 'Software Engineer',
        heroSubheading: 'Full-Stack Developer',
        ...req.body
      }
    });
  }
  res.status(200).json({ success: true, data: profile, message: 'Profile updated' });
});

export const getAdminResumes = asyncHandler(async (_req: Request, res: Response) => {
  const resumes = await prisma.resume.findMany({ orderBy: { createdAt: 'desc' } });
  res.status(200).json({ success: true, data: resumes });
});

export const createAdminResume = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  if (data.isActive) {
    await prisma.resume.updateMany({ data: { isActive: false } });
  }
  const resume = await prisma.resume.create({ data });
  res.status(201).json({ success: true, data: resume, message: 'Resume created' });
});

export const activateAdminResume = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.resume.updateMany({ data: { isActive: false } });
  const resume = await prisma.resume.update({
    where: { id },
    data: { isActive: true }
  });
  res.status(200).json({ success: true, data: resume, message: 'Resume activated' });
});

export const getAdminSocialLinks = asyncHandler(async (_req: Request, res: Response) => {
  const links = await prisma.socialLink.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  res.status(200).json({ success: true, data: links });
});

export const createAdminSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await prisma.socialLink.create({
    data: req.body
  });
  res.status(201).json({ success: true, data: link, message: 'Social link created' });
});

export const updateAdminSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const link = await prisma.socialLink.update({
    where: { id },
    data: req.body
  });
  res.status(200).json({ success: true, data: link, message: 'Social link updated' });
});

export const deleteAdminSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.socialLink.delete({
    where: { id }
  });
  res.status(200).json({ success: true, message: 'Social link deleted' });
});

export const getAdminCertifications = asyncHandler(async (_req: Request, res: Response) => {
  const certifications = await prisma.certification.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  res.status(200).json({ success: true, data: certifications });
});

export const createAdminCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await prisma.certification.create({
    data: req.body
  });
  res.status(201).json({ success: true, data: certification, message: 'Certification created' });
});

export const updateAdminCertification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const certification = await prisma.certification.update({
    where: { id },
    data: req.body
  });
  res.status(200).json({ success: true, data: certification, message: 'Certification updated' });
});

export const deleteAdminCertification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.certification.delete({
    where: { id }
  });
  res.status(200).json({ success: true, message: 'Certification deleted' });
});
