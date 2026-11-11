import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding portfolio database...');

  // 1. Clean existing records to allow idempotent re-seeding
  await prisma.certification.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.admin.deleteMany({});

  // 2. Admin User
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required to seed the administrator account.');
  }
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!rawPassword) {
    throw new Error('ADMIN_INITIAL_PASSWORD environment variable is required to seed the administrator account.');
  }
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      username: 'admin',
      passwordHash,
      name: 'Abdur Raoof A R',
      role: 'ADMIN'
    }
  });
  console.log(`✓ Seeded Admin: ${admin.email}`);

  // 3. Profile
  const profile = await prisma.profile.create({
    data: {
      fullName: 'Abdur Raoof A R',
      headline: 'Information Technology Graduate & Full-Stack Developer',
      bio: 'I am an Information Technology graduate based in Chennai, India, passionate about engineering scalable web applications, intuitive user experiences, and modern software architectures.',
      aboutParagraph1:
        "Hey! I'm Abdur Raoof A R. I completed my B.Tech in Information Technology at B. S. Abdur Rahman Crescent Institute of Science and Technology in Chennai.",
      aboutParagraph2:
        'I love building full-stack web applications that look clean, feel responsive, and work reliably. On the frontend, I build with React.js, TypeScript, and Tailwind CSS. On the backend, I create modular REST APIs with Node.js and Express.js, and manage data with PostgreSQL, MongoDB, MySQL, and Prisma ORM.',
      location: 'Chennai, India',
      locationFull: 'Chennai, Tamil Nadu, India',
      email: 'raoofwebdev@gmail.com',
      phone: '+91 98765 43210',
      statusBadge: 'Available for Software Engineer Roles',
      heroHeading: 'Full-Stack Software Engineer',
      heroSubheading:
        'Crafting high-performance web applications, type-safe backend systems, and intuitive user experiences across the entire stack.',
      avatarUrl: '/portrait_light_cutout.png',
      educationShort: 'B.Tech IT',
      institutionShort: 'Crescent Institute'
    }
  });
  console.log(`✓ Seeded Profile: ${profile.fullName}`);

  // 4. Projects (4 items across Web, AI, Dashboard)
  const projectsData = [
    {
      title: 'Modern E-Commerce Engine',
      slug: 'modern-ecommerce-engine',
      summary:
        'High-concurrency digital store with type-safe REST APIs, Stripe checkout, and real-time inventory management.',
      description:
        'Full-stack commerce engine featuring atomic PostgreSQL transactions, caching, responsive catalog filtering, and comprehensive admin inventory analytics.',
      category: 'Web',
      coverImageUrl:
        'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
      demoUrl: 'https://ecommerce.abdurraoof.dev',
      githubUrl: 'https://github.com/Abdurraoof/ecommerce-engine',
      technologies: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      featured: true,
      isPublished: true,
      displayOrder: 1,
      year: '2025'
    },
    {
      title: 'AI Analytics Copilot',
      slug: 'ai-analytics-copilot',
      summary:
        'Intelligent natural language query interface parsing enterprise datasets with interactive charts.',
      description:
        'Built with streaming completions, query compilation into SQL, and interactive charts for instant data exploration.',
      category: 'AI',
      coverImageUrl:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      demoUrl: 'https://ai-copilot.abdurraoof.dev',
      githubUrl: 'https://github.com/Abdurraoof/ai-analytics-copilot',
      technologies: ['Next.js', 'TypeScript', 'Python', 'Prisma', 'Tailwind CSS'],
      featured: true,
      isPublished: true,
      displayOrder: 2,
      year: '2025'
    },
    {
      title: 'DevOps & Telemetry Dashboard',
      slug: 'devops-telemetry-dashboard',
      summary:
        'Distributed microservice health monitor tracking latency, CPU, and database query throughput.',
      description:
        'Real-time metrics visualizer with automated alerts, Docker container tracking, and incident logging.',
      category: 'Dashboard',
      coverImageUrl:
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
      demoUrl: 'https://telemetry.abdurraoof.dev',
      githubUrl: 'https://github.com/Abdurraoof/devops-dashboard',
      technologies: ['React.js', 'TypeScript', 'Docker', 'Express.js', 'PostgreSQL'],
      featured: true,
      isPublished: true,
      displayOrder: 3,
      year: '2024'
    },
    {
      title: 'Healthcare Appointment Hub',
      slug: 'healthcare-appointment-hub',
      summary:
        'Patient scheduling platform with automated appointment slots, doctor availability, and notifications.',
      description:
        'HIPAA-conscious appointment scheduler with calendar sync, secure medical document attachments, and role-based access.',
      category: 'Web',
      coverImageUrl:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      demoUrl: 'https://healthhub.abdurraoof.dev',
      githubUrl: 'https://github.com/Abdurraoof/healthcare-hub',
      technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      featured: false,
      isPublished: true,
      displayOrder: 4,
      year: '2024'
    }
  ];

  for (const p of projectsData) {
    await prisma.project.create({ data: p });
  }
  console.log(`✓ Seeded ${projectsData.length} Projects`);

  // 5. Skills (10 items across Frontend, Backend, Database)
  const skillsData = [
    {
      name: 'React.js',
      category: 'Frontend',
      proficiency: 92,
      detail: 'Component architecture, Hooks, state management, SPA',
      code: 'FE-01',
      displayOrder: 1
    },
    {
      name: 'TypeScript',
      category: 'Frontend',
      proficiency: 90,
      detail: 'Strict static typing, interfaces, type inference',
      code: 'FE-02',
      displayOrder: 2
    },
    {
      name: 'Tailwind CSS',
      category: 'Frontend',
      proficiency: 95,
      detail: 'Utility-first styling, responsive layouts, theme tokens',
      code: 'FE-03',
      displayOrder: 3
    },
    {
      name: 'HTML5 & Modern CSS',
      category: 'Frontend',
      proficiency: 95,
      detail: 'Semantic markup, Flexbox, CSS Grid, animations',
      code: 'FE-04',
      displayOrder: 4
    },
    {
      name: 'Node.js & Express.js',
      category: 'Backend',
      proficiency: 88,
      detail: 'REST APIs, middleware pipelines, MVC pattern',
      code: 'BE-01',
      displayOrder: 5
    },
    {
      name: 'REST API & JWT Auth',
      category: 'Backend',
      proficiency: 87,
      detail: 'Token authentication, HTTP-only cookies, security',
      code: 'BE-02',
      displayOrder: 6
    },
    {
      name: 'PostgreSQL',
      category: 'Database',
      proficiency: 86,
      detail: 'Relational data modeling, SQL queries, relational integrity',
      code: 'DB-01',
      displayOrder: 7
    },
    {
      name: 'MongoDB',
      category: 'Database',
      proficiency: 84,
      detail: 'NoSQL document modeling, JSON collections, queries',
      code: 'DB-02',
      displayOrder: 8
    },
    {
      name: 'MySQL',
      category: 'Database',
      proficiency: 85,
      detail: 'Relational database schemas, joins, transactions',
      code: 'DB-03',
      displayOrder: 9
    },
    {
      name: 'Prisma ORM',
      category: 'Database',
      proficiency: 90,
      detail: 'Type-safe database client, migrations, schema modeling',
      code: 'DB-04',
      displayOrder: 10
    }
  ];

  for (const s of skillsData) {
    await prisma.skill.create({ data: s });
  }
  console.log(`✓ Seeded ${skillsData.length} Skills`);

  // 6. Experience
  await prisma.experience.create({
    data: {
      role: 'Full-Stack Developer Intern',
      company: 'NextGen Tech Solutions',
      companyUrl: 'https://nextgentech.example',
      period: 'Jan 2024 — Jun 2024',
      location: 'Chennai, India',
      employmentType: 'Internship',
      isCurrent: false,
      description:
        'Engineered responsive web applications and backend REST APIs in an agile engineering environment.',
      highlights: [
        'Engineered responsive React components and state management pipelines with high test coverage.',
        'Built and secured modular RESTful endpoints with Node.js, Express, and JWT middleware.',
        'Collaborated on database query optimization and API error-handling conventions.'
      ],
      displayOrder: 1
    }
  });
  console.log('✓ Seeded Experience');

  // 7. Education
  await prisma.education.create({
    data: {
      degree: 'B.Tech in Information Technology',
      institution: 'B. S. Abdur Rahman Crescent Institute of Science and Technology',
      institutionUrl: 'https://crescent.education',
      period: '2021 — 2025',
      location: 'Chennai, India',
      startYear: 2021,
      endYear: 2025,
      grade: 'First Class with Distinction',
      details:
        'Coursework in Full-Stack Web Engineering, Relational Database Management Systems, Software Architecture, and Machine Learning.',
      displayOrder: 1
    }
  });
  console.log('✓ Seeded Education: B.Tech IT at Crescent Institute');

  // 8. Active Resume
  await prisma.resume.create({
    data: {
      fileName: 'Abdur_Raoof_A_R_Resume.pdf',
      fileUrl: '/Abdur_Raoof_Resume.pdf',
      fileSize: '185 KB',
      mimeType: 'application/pdf',
      version: '2026.1',
      isActive: true
    }
  });
  console.log('✓ Seeded Active Resume');

  // 9. Social Links
  const socials = [
    {
      platform: 'GitHub',
      url: 'https://github.com/Abdurraoof',
      icon: 'Github',
      displayOrder: 1
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/abdurraoof',
      icon: 'Linkedin',
      displayOrder: 2
    },
    {
      platform: 'Email',
      url: 'mailto:raoofwebdev@gmail.com',
      icon: 'Mail',
      displayOrder: 3
    }
  ];
  for (const s of socials) {
    await prisma.socialLink.create({ data: s });
  }

  // 10. Certifications
  const certsData = [
    {
      title: 'Meta Certified Front-End Developer',
      issuer: 'Meta (Coursera)',
      issueDate: '2024',
      credentialId: 'META-FE-92841',
      credentialUrl: 'https://www.coursera.org',
      description: 'React, modern JavaScript, UI/UX engineering, state management, and responsive design systems.',
      displayOrder: 1
    },
    {
      title: 'PostgreSQL Relational Database & SQL Mastery',
      issuer: 'Udemy / Database Architecture',
      issueDate: '2024',
      credentialId: 'PG-SQL-77192',
      credentialUrl: 'https://www.udemy.com',
      description: 'Advanced relational modeling, complex SQL joins, indexing, and high-performance querying.',
      displayOrder: 2
    },
    {
      title: 'Full-Stack JavaScript & Express Web Engineering',
      issuer: 'FreeCodeCamp / Open Tech',
      issueDate: '2023',
      credentialId: 'FCC-FS-55104',
      credentialUrl: 'https://www.freecodecamp.org',
      description: 'Node.js, Express REST APIs, JWT authentication, and security middleware pipelines.',
      displayOrder: 3
    }
  ];
  for (const c of certsData) {
    await prisma.certification.create({ data: c });
  }
  console.log('✓ Seeded Social Links');

  // 10. Sample Contact Message
  await prisma.contactMessage.create({
    data: {
      name: 'Sarah Jenkins',
      email: 's.jenkins@techcorp.io',
      subject: 'Full-Stack Software Engineer Opportunity',
      message:
        'Hi Abdur Raoof, we reviewed your portfolio and were impressed by your React and Node.js projects. Would love to schedule a technical chat for our engineering team in Chennai.',
      status: 'UNREAD'
    }
  });
  console.log('✓ Seeded Contact Message');

  console.log('\n=== Database Seeding Complete ===');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
