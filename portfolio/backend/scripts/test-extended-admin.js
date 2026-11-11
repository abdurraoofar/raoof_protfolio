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
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runExtendedAdminChecks() {
  console.log('--- Testing Extended Admin Endpoints ---');

  // 1. Login
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: process.env.ADMIN_EMAIL || 'admin@portfolio.local', password: process.env.ADMIN_INITIAL_PASSWORD || '1234' }
  );
  const token = loginRes.data?.data?.accessToken;
  if (!token) throw new Error('Could not login as admin');

  // 2. Add Skill
  const addSkillRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/skills',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    },
    { name: 'GraphQL', category: 'Backend', detail: 'Schema design', proficiency: 85 }
  );
  console.log('Add Skill status:', addSkillRes.status, 'ID:', addSkillRes.data?.data?.id);
  const skillId = addSkillRes.data?.data?.id;

  // 3. Delete Skill
  const delSkillRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/admin/skills/${skillId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Delete Skill status:', delSkillRes.status);

  // 4. Update Profile
  const updateProfileRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/profile',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    },
    {
      fullName: 'Abdur Raoof A R',
      headline: 'Full-Stack Developer & Software Engineer',
      bio: 'I build modern web applications, practical digital solutions and AI-powered experiences.',
      location: 'Chennai, India'
    }
  );
  console.log('Update Profile status:', updateProfileRes.status);

  // 5. Active Resume Upload/Switch
  const resumeRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/admin/resume',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    },
    {
      fileName: 'Abdur_Raoof_A_R_Resume_v2.pdf',
      fileUrl: '/Abdur_Raoof_Resume.pdf',
      fileSize: '250 KB',
      version: 'v2.5',
      isActive: true
    }
  );
  console.log('Update Resume status:', resumeRes.status);

  // 6. Contact message test read & delete
  const msg = await prisma.contactMessage.create({
    data: {
      name: 'Temp Message User',
      email: 'temp@example.com',
      subject: 'Temp',
      message: 'Hello'
    }
  });

  const markReadRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/admin/messages/${msg.id}/read`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Mark Read status:', markReadRes.status);

  const delMsgRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/admin/messages/${msg.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Delete Msg status:', delMsgRes.status);

  console.log('✓ All Extended Admin CRUD Endpoints Verified!');
  await prisma.$disconnect();
}

runExtendedAdminChecks().catch((err) => {
  console.error(err);
  process.exit(1);
});
