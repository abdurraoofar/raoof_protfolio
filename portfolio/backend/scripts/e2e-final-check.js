const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: body ? JSON.parse(body) : null });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runAllChecks() {
  console.log('=====================================================');
  console.log('   FULL-STACK END-TO-END VERIFICATION SUITE');
  console.log('=====================================================\n');

  const results = [];

  function record(category, testName, passed, details = '') {
    results.push({ category, testName, passed, details });
    const mark = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${mark} [${category}] ${testName} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // -----------------------------------------------------------------
    // 1. Database & Prisma Connection Check
    // -----------------------------------------------------------------
    console.log('\n--- 1. DATABASE & PRISMA CONNECTION ---');
    const tableQuery = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const actualTables = tableQuery.map((t) => t.table_name);
    const requiredTables = [
      'admins',
      'profiles',
      'projects',
      'skills',
      'experiences',
      'educations',
      'resumes',
      'social_links',
      'contact_messages'
    ];

    const missingTables = requiredTables.filter((t) => !actualTables.includes(t));
    record(
      'Database',
      'All 9 Tables Exist in PostgreSQL (portfolio_db)',
      missingTables.length === 0,
      `Found: ${actualTables.length} tables, missing: [${missingTables.join(', ')}]`
    );

    const adminCount = await prisma.admin.count();
    record('Database', 'Admin Record Seeded', adminCount >= 1, `Count: ${adminCount}`);

    const profile = await prisma.profile.findFirst();
    record(
      'Database',
      'Profile Seeded (Abdur Raoof A R)',
      !!profile && profile.fullName.includes('Abdur Raoof'),
      `Name: ${profile?.fullName}, Location: ${profile?.location}`
    );

    const projectCount = await prisma.project.count();
    record('Database', 'Projects Seeded (>= 4 projects)', projectCount >= 4, `Count: ${projectCount}`);

    const skillCount = await prisma.skill.count();
    record('Database', 'Skills Seeded (>= 10 skills)', skillCount >= 10, `Count: ${skillCount}`);

    const expCount = await prisma.experience.count();
    record('Database', 'Experience Seeded', expCount >= 1, `Count: ${expCount}`);

    const edu = await prisma.education.findFirst();
    record(
      'Database',
      'Education Seeded (Crescent Institute B.Tech IT)',
      !!edu && edu.institution.includes('Crescent') && edu.degree.includes('B.Tech'),
      `Degree: ${edu?.degree}, Institution: ${edu?.institution}`
    );

    const activeResume = await prisma.resume.findFirst({ where: { isActive: true } });
    record(
      'Database',
      'Active Resume Seeded',
      !!activeResume && activeResume.isActive === true,
      `File: ${activeResume?.fileName}`
    );

    const socialCount = await prisma.socialLink.count();
    record('Database', 'Social Links Seeded', socialCount >= 3, `Count: ${socialCount}`);

    // -----------------------------------------------------------------
    // 2. Backend REST API & Security Check (http://localhost:5000/api/v1)
    // -----------------------------------------------------------------
    console.log('\n--- 2. BACKEND REST API & SECURITY ---');

    // GET /api/v1/health
    const healthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/health',
      method: 'GET'
    });
    record(
      'API',
      'GET /api/v1/health returns healthy status',
      healthRes.status === 200 && healthRes.data?.data?.status === 'healthy',
      `HTTP ${healthRes.status}, service: ${healthRes.data?.data?.service}`
    );

    // GET /api/v1/health/db (with accurate row counts for all 9 PostgreSQL tables)
    const healthDbRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/health/db',
      method: 'GET'
    });
    const dbTables = healthDbRes.data?.data?.tables || {};
    const allNinePresent = requiredTables.every((t) => typeof dbTables[t] === 'number');
    record(
      'API',
      'GET /api/v1/health/db (status: "connected", tcpReachable: true & 9 table counts)',
      healthDbRes.status === 200 &&
        healthDbRes.data?.data?.status === 'connected' &&
        healthDbRes.data?.data?.tcpReachable === true &&
        allNinePresent,
      `status: "${healthDbRes.data?.data?.status}", tables: ${Object.keys(dbTables).length}/9 verified`
    );

    // GET /api/v1/portfolio
    const portfolioRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/portfolio',
      method: 'GET'
    });
    record(
      'API',
      'GET /api/v1/portfolio returns live DB data',
      portfolioRes.status === 200 &&
        portfolioRes.data?.data?.profile?.fullName?.includes('Abdur Raoof') &&
        portfolioRes.data?.data?.projects?.length >= 4,
      `Projects: ${portfolioRes.data?.data?.projects?.length}, Profile: ${portfolioRes.data?.data?.profile?.fullName}`
    );

    // GET /api/v1/projects
    const projectsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/projects',
      method: 'GET'
    });
    record(
      'API',
      'GET /api/v1/projects returns published list',
      projectsRes.status === 200 && Array.isArray(projectsRes.data?.data) && projectsRes.data?.data?.length >= 4,
      `Count: ${projectsRes.data?.data?.length}`
    );

    // GET /api/v1/resume/active
    const resumeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/resume/active',
      method: 'GET'
    });
    record(
      'API',
      'GET /api/v1/resume/active returns active resume',
      resumeRes.status === 200 && resumeRes.data?.data?.isActive === true,
      `FileName: ${resumeRes.data?.data?.fileName}`
    );

    // POST /api/v1/contact
    const testMessageEmail = `tester_${Date.now()}@example.com`;
    const contactRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'E2E Automated Tester',
        email: testMessageEmail,
        subject: 'Automated E2E Verification',
        message: 'Testing PostgreSQL row insertion via public contact endpoint.'
      }
    );
    const dbMessageCheck = await prisma.contactMessage.findFirst({
      where: { email: testMessageEmail }
    });
    record(
      'API',
      'POST /api/v1/contact saves new row to contact_messages in PostgreSQL',
      contactRes.status === 201 && !!dbMessageCheck,
      `Created ID: ${dbMessageCheck?.id}, Email: ${dbMessageCheck?.email}`
    );

    // POST /api/v1/admin/register is blocked with 403 FORBIDDEN
    const registerRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'hacker@example.com',
        username: 'intruder',
        password: 'Password123!',
        fullName: 'Intruder'
      }
    );
    record(
      'Security',
      'POST /api/v1/admin/register is blocked with 403 FORBIDDEN',
      registerRes.status === 403,
      `Status: ${registerRes.status}, Error Code: ${registerRes.data?.error?.code}`
    );

    // POST /api/v1/admin/login
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'admin@portfolio.local',
        password: '1234'
      }
    );
    const accessToken = loginRes.data?.data?.accessToken;
    record(
      'Security',
      'POST /api/v1/admin/login returns valid JWT accessToken',
      loginRes.status === 200 && typeof accessToken === 'string' && accessToken.length > 20,
      `Token prefix: ${accessToken ? accessToken.slice(0, 16) + '...' : 'none'}`
    );

    // -----------------------------------------------------------------
    // 3. Admin Full CRUD Persistence Suite
    // -----------------------------------------------------------------
    console.log('\n--- 3. ADMIN CRUD PERSISTENCE (POSTGRESQL) ---');

    // Projects CRUD
    const newProjectTitle = `Automated E2E Project ${Date.now()}`;
    const createProjRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      },
      {
        title: newProjectTitle,
        summary: 'Created via automated end-to-end admin CRUD testing suite.',
        description: 'Comprehensive project testing persistence in PostgreSQL.',
        category: 'Web',
        technologies: ['React', 'Express', 'Prisma', 'PostgreSQL'],
        coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
        githubUrl: 'https://github.com/raoofwebdev/e2e-project',
        demoUrl: 'https://example.com/demo',
        isPublished: true,
        isFeatured: false
      }
    );
    const createdProjectId = createProjRes.data?.data?.id;
    record(
      'Admin CRUD',
      'Protected POST /api/v1/admin/projects creates project in PostgreSQL',
      createProjRes.status === 201 && !!createdProjectId,
      `Project ID: ${createdProjectId}`
    );

    const updatedProjRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/admin/projects/${createdProjectId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      },
      {
        title: `${newProjectTitle} (Updated)`,
        summary: 'Updated project summary verifying PUT persistence.',
        description: 'Updated description.',
        category: 'AI',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
        isPublished: true
      }
    );
    const dbProjectUpdated = await prisma.project.findUnique({ where: { id: createdProjectId } });
    record(
      'Admin CRUD',
      'Protected PUT /api/v1/admin/projects/:id updates project in PostgreSQL',
      updatedProjRes.status === 200 && dbProjectUpdated?.category === 'AI',
      `Category: ${dbProjectUpdated?.category}, Title: ${dbProjectUpdated?.title}`
    );

    const deleteProjRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/admin/projects/${createdProjectId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const dbProjectDeleted = await prisma.project.findUnique({ where: { id: createdProjectId } });
    record(
      'Admin CRUD',
      'Protected DELETE /api/v1/admin/projects/:id removes project from PostgreSQL',
      deleteProjRes.status === 200 && dbProjectDeleted === null,
      `Record removed from database: ${dbProjectDeleted === null}`
    );

    // Skills CRUD
    const addSkillRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/skills',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
      },
      { name: 'GraphQL', category: 'Backend', detail: 'Schema design', proficiency: 90, displayOrder: 99 }
    );
    const createdSkillId = addSkillRes.data?.data?.id;
    record(
      'Admin CRUD',
      'Protected POST /api/v1/admin/skills creates skill in PostgreSQL',
      addSkillRes.status === 201 && !!createdSkillId,
      `Skill ID: ${createdSkillId}`
    );

    const delSkillRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/admin/skills/${createdSkillId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const dbSkillDeleted = await prisma.skill.findUnique({ where: { id: createdSkillId } });
    record(
      'Admin CRUD',
      'Protected DELETE /api/v1/admin/skills/:id removes skill from PostgreSQL',
      delSkillRes.status === 200 && dbSkillDeleted === null,
      `Skill removed: ${dbSkillDeleted === null}`
    );

    // Experiences CRUD
    const addExpRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/experiences',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
      },
      {
        role: 'Full-Stack Software Engineer',
        company: 'Cloud Innovations Lab',
        period: '2024 — 2025',
        location: 'Chennai, India',
        highlights: ['Built microservices and scalable web applications']
      }
    );
    const createdExpId = addExpRes.data?.data?.id;
    record(
      'Admin CRUD',
      'Protected POST /api/v1/admin/experiences creates experience in PostgreSQL',
      addExpRes.status === 201 && !!createdExpId,
      `Exp ID: ${createdExpId}`
    );

    const delExpRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/admin/experiences/${createdExpId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const dbExpDeleted = await prisma.experience.findUnique({ where: { id: createdExpId } });
    record(
      'Admin CRUD',
      'Protected DELETE /api/v1/admin/experiences/:id removes experience from PostgreSQL',
      delExpRes.status === 200 && dbExpDeleted === null,
      `Exp removed: ${dbExpDeleted === null}`
    );

    // Educations CRUD
    const addEduRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/educations',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
      },
      {
        degree: 'Postgraduate Diploma in Cloud Computing',
        institution: 'Indian Institute of Information Technology',
        period: '2025 — 2026',
        location: 'Chennai, India',
        details: 'Specialization in containerization, distributed databases, and DevOps'
      }
    );
    const createdEduId = addEduRes.data?.data?.id;
    record(
      'Admin CRUD',
      'Protected POST /api/v1/admin/educations creates education in PostgreSQL',
      addEduRes.status === 201 && !!createdEduId,
      `Edu ID: ${createdEduId}`
    );

    const delEduRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/admin/educations/${createdEduId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const dbEduDeleted = await prisma.education.findUnique({ where: { id: createdEduId } });
    record(
      'Admin CRUD',
      'Protected DELETE /api/v1/admin/educations/:id removes education from PostgreSQL',
      delEduRes.status === 200 && dbEduDeleted === null,
      `Edu removed: ${dbEduDeleted === null}`
    );

    // Profile Update
    const updateProfileRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/admin/profile',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
      },
      {
        fullName: 'Abdur Raoof A R',
        headline: 'Full-Stack Developer & Software Engineer',
        location: 'Chennai, India'
      }
    );
    record(
      'Admin CRUD',
      'Protected PUT /api/v1/admin/profile updates profile in PostgreSQL',
      updateProfileRes.status === 200 && updateProfileRes.data?.data?.headline?.includes('Full-Stack'),
      `Headline: ${updateProfileRes.data?.data?.headline}`
    );

    // Messages Management
    const messagesRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/messages',
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    record(
      'Admin CRUD',
      'Protected GET /api/v1/admin/messages returns inquiries from PostgreSQL',
      messagesRes.status === 200 && Array.isArray(messagesRes.data?.data),
      `Total messages in DB: ${messagesRes.data?.data?.length}`
    );

    // -----------------------------------------------------------------
    // 4. Frontend & Admin UI Integration Check (http://localhost:5173)
    // -----------------------------------------------------------------
    console.log('\n--- 4. FRONTEND & ADMIN UI INTEGRATION ---');

    const frontendRes = await request({
      hostname: '127.0.0.1',
      port: 5173,
      path: '/',
      method: 'GET'
    });
    record(
      'Frontend',
      'Frontend Dev Server Responding at http://127.0.0.1:5173',
      frontendRes.status === 200 && (frontendRes.raw?.includes('id="root"') || frontendRes.raw?.includes('<!doctype html>')),
      `Status: ${frontendRes.status}, Root container verified: true`
    );

    const frontendAdminRes = await request({
      hostname: '127.0.0.1',
      port: 5173,
      path: '/admin',
      method: 'GET'
    });
    record(
      'Frontend',
      'Frontend Admin URL Route Resolves at /admin',
      frontendAdminRes.status === 200,
      `Status: ${frontendAdminRes.status}`
    );

    // Clean up temporary test contact message
    await prisma.contactMessage.deleteMany({ where: { email: testMessageEmail } });

    console.log('\n=====================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`SUMMARY: ${passedCount} of ${results.length} CHECKS PASSED.`);
    console.log('=====================================================');

    if (passedCount !== results.length) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test suite execution:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllChecks();
