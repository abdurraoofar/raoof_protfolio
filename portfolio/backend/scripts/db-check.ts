import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function runCheck() {
  console.log('\n========================================');
  console.log('   PostgreSQL Database Health & Integrity');
  console.log('========================================');
  console.log(`Target: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    console.log(`Connection Status: CONNECTED (${latency}ms)`);
  } catch (err: any) {
    console.error('Connection FAILED:', err.message);
    process.exit(1);
  }

  // Check each of the 9 tables
  const [
    adminCount,
    profileCount,
    projectCount,
    skillCount,
    experienceCount,
    educationCount,
    resumeCount,
    socialLinkCount,
    contactMessageCount
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

  const tables = [
    { table: 'admins', model: 'Admin', count: adminCount, expectedMin: 1 },
    { table: 'profiles', model: 'Profile', count: profileCount, expectedMin: 1 },
    { table: 'projects', model: 'Project', count: projectCount, expectedMin: 4 },
    { table: 'skills', model: 'Skill', count: skillCount, expectedMin: 10 },
    { table: 'experiences', model: 'Experience', count: experienceCount, expectedMin: 1 },
    { table: 'educations', model: 'Education', count: educationCount, expectedMin: 1 },
    { table: 'resumes', model: 'Resume', count: resumeCount, expectedMin: 1 },
    { table: 'social_links', model: 'SocialLink', count: socialLinkCount, expectedMin: 1 },
    { table: 'contact_messages', model: 'ContactMessage', count: contactMessageCount, expectedMin: 1 }
  ];

  console.log('\n--- Table Verification (9 Tables) ---');
  let allPassed = true;
  for (const t of tables) {
    const passed = t.count >= t.expectedMin;
    if (!passed) allPassed = false;
    const status = passed ? '✓ PASS' : '✗ FAIL';
    console.log(` ${status}  ${t.table.padEnd(18)} : ${t.count} records (Expected >= ${t.expectedMin})`);
  }

  // Inspect seeded items
  const profile = await prisma.profile.findFirst();
  const education = await prisma.education.findFirst();
  const activeResume = await prisma.resume.findFirst({ where: { isActive: true } });
  const admin = await prisma.admin.findFirst();

  console.log('\n--- Portfolio Seed Identity ---');
  console.log(` Profile Name    : ${profile?.fullName} (${profile?.location})`);
  console.log(` Education       : ${education?.degree} - ${education?.institution}`);
  console.log(` Active Resume   : ${activeResume?.fileName} (${activeResume?.fileUrl})`);
  console.log(` Admin User      : ${admin?.email} (${admin?.name})`);

  if (allPassed) {
    console.log('\n✓ ALL 9 TABLES VERIFIED & SEED DATA INTACT\n');
  } else {
    console.error('\n✗ SOME TABLES MISSING REQUIRED SEED DATA\n');
    process.exit(1);
  }
}

runCheck()
  .catch((e) => {
    console.error('db:check error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
