import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma__ ||
  new PrismaClient({
    log: config.isDevelopment ? ['query', 'warn', 'error'] : ['error']
  });

if (!config.isProduction) {
  global.__prisma__ = prisma;
}

export interface DatabaseStatus {
  status: 'connected' | 'configured_standby' | 'error';
  provider: 'postgresql';
  latencyMs: number;
  message: string;
  tcpReachable: boolean;
  tables?: {
    admins: number;
    profiles: number;
    projects: number;
    skills: number;
    experiences: number;
    educations: number;
    resumes: number;
    social_links: number;
    contact_messages: number;
  };
}

export async function checkDatabaseHealth(): Promise<DatabaseStatus> {
  const start = Date.now();
  try {
    const [
      admins,
      profiles,
      projects,
      skills,
      experiences,
      educations,
      resumes,
      social_links,
      contact_messages
    ] = await Promise.all([
      prisma.admin.count(),
      prisma.profile.count(),
      prisma.project.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.education.count(),
      prisma.resume.count(),
      prisma.socialLink.count(),
      prisma.contactMessage.count()
    ]);

    return {
      status: 'connected',
      provider: 'postgresql',
      latencyMs: Date.now() - start,
      message: 'PostgreSQL connection active',
      tcpReachable: true,
      tables: {
        admins,
        profiles,
        projects,
        skills,
        experiences,
        educations,
        resumes,
        social_links,
        contact_messages
      }
    };
  } catch (err: any) {
    logger.error('Database connection check failed', { error: err.message });
    return {
      status: 'error',
      provider: 'postgresql',
      latencyMs: Date.now() - start,
      message: `Database error: ${err.message}`,
      tcpReachable: false
    };
  }
}
