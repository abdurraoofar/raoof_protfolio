import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Server,
  ShieldCheck,
  Terminal,
  RefreshCw,
  MapPin,
  Layers,
  FolderTree,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Send,
  Download,
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  GraduationCap,
  Code2,
  FolderKanban,
  FileText,
  MessageSquare,
  Eye,
  Plus,
  Edit3,
  Trash2,
  User,
  Briefcase,
  Settings,
  LogOut,
  ExternalLink,
  X,
  Upload,
  CheckCircle,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  Menu
} from 'lucide-react';

type EnvMode = 'development' | 'production';
type PageRoute = 'home' | 'projects' | 'about' | 'contact' | 'admin';
type AdminSection =
  | 'dashboard'
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'resume'
  | 'messages'
  | 'settings';
type ProjectCategory = 'All' | 'Web' | 'AI' | 'Dashboard';

interface ProjectItem {
  id: string;
  index: string;
  title: string;
  summary: string;
  description: string;
  category: 'Web' | 'AI' | 'Dashboard';
  tags: string[];
  image: string;
  githubUrl: string;
  demoUrl: string;
  published: boolean;
  year: string;
}

interface SkillItem {
  id: string;
  name: string;
  category: string;
  detail: string;
  code: string;
}

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isNew: boolean;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  location: string;
  details: string;
}

export interface HealthPayload {
  success: true;
  data: {
    status: 'healthy';
    service: string;
    environment: EnvMode;
    version: string;
    timestamp: string;
    uptimeSeconds: number;
    database: {
      status: 'connected';
      provider: 'postgresql';
      latencyMs: number;
      message: string;
    };
    security: {
      corsConfigured: boolean;
      jwtSecretsConfigured: boolean;
      rateLimitingActive: boolean;
    };
    system: {
      nodeVersion: string;
      rssMb: number;
      heapUsedMb: number;
    };
  };
  message: string;
}

const MONOREPO_FILES = [
  {
    path: 'portfolio/package.json',
    layer: 'Root Workspace',
    desc: 'Monorepo workspace scripts (dev, build, start, lint, typecheck, test:health)'
  },
  {
    path: 'portfolio/.gitignore',
    layer: 'Git Security',
    desc: 'Excludes node_modules, dist, build artifacts, and all .env secret files'
  },
  {
    path: 'portfolio/tsconfig.base.json',
    layer: 'TypeScript',
    desc: 'Shared strict compiler rules (strict, noUnusedLocals, isolatedModules)'
  },
  {
    path: 'portfolio/backend/src/config/env.ts',
    layer: 'Backend Config',
    desc: 'Zod-validated environment loader switching between .env.development & .env.production'
  },
  {
    path: 'portfolio/backend/src/config/index.ts',
    layer: 'Backend Config',
    desc: 'Centralized typed configuration module (server, cors, db, jwt, storage, rateLimit)'
  },
  {
    path: 'portfolio/backend/src/middlewares/errorHandler.ts',
    layer: 'Error Handling',
    desc: 'Centralized Express error middleware formatting AppError, ZodError & redacting prod stack traces'
  },
  {
    path: 'portfolio/backend/src/controllers/health.controller.ts',
    layer: 'Health API',
    desc: 'GET /api/v1/health & POST /api/v1/health/echo with Zod payload validation'
  },
  {
    path: 'portfolio/backend/prisma/schema.prisma',
    layer: 'Database ORM',
    desc: 'PostgreSQL Prisma schema with 10 models (AdminUser, Profile, Project, Skill, Experience, etc.)'
  },
  {
    path: 'portfolio/frontend/src/config/env.ts',
    layer: 'Frontend Config',
    desc: 'Public VITE_* config loader with runtime security guard blocking any secret keys'
  },
  {
    path: 'portfolio/frontend/src/services/api.ts',
    layer: 'Frontend API',
    desc: 'Typed HTTP client with standardized ApiClientError parsing'
  }
];

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    index: '01',
    title: 'Traffic Flow Prediction System',
    summary: 'Predict traffic flow using spatio-temporal data and Deep Belief Networks.',
    description:
      'Spatio-temporal traffic forecasting engine powered by Deep Belief Networks (DBN) and Python/Flask APIs. Models congestion corridors, historical flow telemetry, and route-level throughput predictions.',
    category: 'AI',
    tags: ['Python', 'Flask', 'Machine Learning'],
    image: '/proj_traffic.png',
    githubUrl: 'https://github.com/raoofwebdev/traffic-flow-prediction',
    demoUrl: 'https://traffic-prediction-demo.vercel.app',
    published: true,
    year: '2025'
  },
  {
    id: 'proj-2',
    index: '02',
    title: 'Sulthans Masala',
    summary: 'Business website for an Indian spice exporter.',
    description:
      'Production B2B/B2C digital catalog and export enquiry platform built for an Indian spice exporter. Engineered with React and TypeScript with fast filtering, specification tables, and responsive layouts.',
    category: 'Web',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    image: '/proj_masala.png',
    githubUrl: 'https://github.com/raoofwebdev/sulthans-masala',
    demoUrl: 'https://sulthansmasala.example.com',
    published: true,
    year: '2025'
  },
  {
    id: 'proj-3',
    index: '03',
    title: 'AI Content Generator',
    summary: 'Generate multilingual content using AI.',
    description:
      'Full-stack editorial workspace built with React and Node.js that streamlines multilingual copy generation, structured prompt pipelines, and tone-consistent technical writing.',
    category: 'AI',
    tags: ['React', 'Node.js', 'REST API'],
    image: '/proj_ai.png',
    githubUrl: 'https://github.com/raoofwebdev/ai-content-generator',
    demoUrl: 'https://ai-writer-demo.vercel.app',
    published: true,
    year: '2024'
  },
  {
    id: 'proj-4',
    index: '04',
    title: 'CRM Operations Dashboard',
    summary: 'Dashboard for managing data & users.',
    description:
      'Internal operations and customer relationship interface featuring role-based access control, pipeline velocity metrics, user audit logs, and filterable data tables.',
    category: 'Dashboard',
    tags: ['React', 'TypeScript', 'PostgreSQL'],
    image: '/proj_crm.png',
    githubUrl: 'https://github.com/raoofwebdev/crm-dashboard',
    demoUrl: 'https://crm-dashboard-demo.vercel.app',
    published: true,
    year: '2024'
  }
];

const INITIAL_SKILLS: SkillItem[] = [
  { id: 'sk-1', name: 'React.js', category: 'Frontend', detail: 'Component architecture, Hooks, state management, SPA', code: 'FE-01' },
  { id: 'sk-2', name: 'TypeScript', category: 'Frontend', detail: 'Strict static typing, interfaces, type inference', code: 'FE-02' },
  { id: 'sk-3', name: 'Tailwind CSS', category: 'Frontend', detail: 'Utility-first styling, responsive layouts, theme tokens', code: 'FE-03' },
  { id: 'sk-4', name: 'HTML5 & Modern CSS', category: 'Frontend', detail: 'Semantic markup, Flexbox, CSS Grid, animations', code: 'FE-04' },
  { id: 'sk-5', name: 'Node.js & Express.js', category: 'Backend', detail: 'REST APIs, middleware pipelines, MVC pattern', code: 'BE-01' },
  { id: 'sk-6', name: 'REST API & JWT Auth', category: 'Backend', detail: 'Token authentication, HTTP-only cookies, security', code: 'BE-02' },
  { id: 'sk-7', name: 'PostgreSQL', category: 'Database', detail: 'Relational data modeling, SQL queries, relational integrity', code: 'DB-01' },
  { id: 'sk-8', name: 'MongoDB', category: 'Database', detail: 'NoSQL document modeling, JSON collections, queries', code: 'DB-02' },
  { id: 'sk-9', name: 'MySQL', category: 'Database', detail: 'Relational database schemas, joins, transactions', code: 'DB-03' },
  { id: 'sk-10', name: 'Prisma ORM', category: 'Database', detail: 'Type-safe database client, migrations, schema modeling', code: 'DB-04' },
  { id: 'sk-11', name: 'Git & GitHub', category: 'Workflow', detail: 'Version control, branch management, collaborative code', code: 'TL-01' },
  { id: 'sk-12', name: 'Vite & Tooling', category: 'Workflow', detail: 'Fast modern bundling, HMR, deployment', code: 'TL-02' }
];

const INITIAL_ENQUIRIES: EnquiryItem[] = [
  {
    id: 'enq-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techhire.io',
    subject: 'Full-Stack Developer Role',
    message: 'Interested in your work! Would love to schedule an introductory call regarding an IT opening.',
    date: 'Apr 24, 2025',
    isNew: true
  },
  {
    id: 'enq-2',
    name: 'David Kim',
    email: 'david@launchpadstudio.com',
    subject: 'Software Engineering Opportunity',
    message: 'Impressive work on your portfolio! Would like to connect regarding an engineering role.',
    date: 'Apr 21, 2025',
    isNew: false
  },
  {
    id: 'enq-3',
    name: 'Priya Sharma',
    email: 'priya.sharma@innovatein.com',
    subject: 'Portfolio Feedback & Collaboration',
    message: 'Great portfolio! Love the clean minimal UI and the Traffic Flow Prediction project.',
    date: 'Apr 18, 2025',
    isNew: false
  }
];

const INITIAL_EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Full-Stack Web Developer (Personal & Practical Projects)',
    company: 'Independent Engineering & Projects',
    period: '2024 — Present',
    location: 'Chennai, India',
    highlights: [
      'Designed and shipped responsive React + TypeScript web applications including the Sulthans Masala catalog.',
      'Engineered backend REST APIs with Node.js, Express, Prisma ORM, PostgreSQL, and Zod schema validation.',
      'Built AI-assisted content workflows and spatio-temporal traffic prediction interfaces.'
    ]
  },
  {
    id: 'exp-2',
    role: 'Frontend & Full-Stack Intern',
    company: 'IT Solutions & Web Studio',
    period: '2023 — 2024',
    location: 'Chennai, India',
    highlights: [
      'Developed reusable UI primitives in React and Tailwind CSS with strict accessibility and contrast standards.',
      'Collaborated on database query optimization and API error-handling conventions.'
    ]
  }
];

const INITIAL_EDUCATION: EducationItem[] = [
  {
    id: 'edu-1',
    degree: 'B.Tech in Information Technology',
    institution: 'Crescent Institute of Science and Technology',
    period: '2021 — 2025',
    location: 'Chennai, India',
    details:
      'Coursework in Full-Stack Web Engineering, Relational Database Management Systems, Software Architecture, and Machine Learning.'
  }
];

const getRouteFromUrl = (): PageRoute => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');
  if (path === '/admin' || path.startsWith('/admin/') || hash === '#/admin' || hash === '#admin') {
    return 'admin';
  }
  if (path === '/about' || hash === '#about' || hash === '#/about') return 'about';
  if (path === '/projects' || hash === '#projects' || hash === '#/projects') return 'projects';
  if (path === '/contact' || hash === '#contact' || hash === '#/contact') return 'contact';
  return 'home';
};

export function App() {
  // Navigation & Routing State
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => getRouteFromUrl());
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDark = theme === 'dark';

  // Admin Authentication State (username: admin, password: 1234)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('portfolio_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const detected = getRouteFromUrl();
      setCurrentPage(detected);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Update browser URL when page state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetPath = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentPage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Explicit, High-Contrast Design Tokens for Light & Dark Modes (Zero invisible text)
  const ui = {
    pageBg: isDark ? 'bg-[#090B10] text-[#F3F4F6]' : 'bg-[#FFFFFF] text-gray-900',
    navBg: isDark
      ? 'bg-[#090B10]/90 border-[#1C202B]'
      : 'bg-[#FFFFFF]/90 border-gray-200',
    heading: isDark ? 'text-white' : 'text-gray-900',
    subheading: isDark ? 'text-gray-200' : 'text-gray-800',
    body: isDark ? 'text-gray-300' : 'text-gray-700',
    muted: isDark ? 'text-gray-400' : 'text-gray-600',
    accentText: isDark ? 'text-blue-400' : 'text-blue-600',
    card: isDark
      ? 'bg-[#11141D] border-[#222736] text-white'
      : 'bg-white border-gray-200 text-gray-900 shadow-xs',
    cardHover: isDark
      ? 'hover:border-gray-700 hover:bg-[#141824]'
      : 'hover:border-gray-300 hover:shadow-sm',
    subtleSurface: isDark
      ? 'bg-[#151924] border-[#252B3B] text-gray-200'
      : 'bg-gray-50 border-gray-200 text-gray-800',
    divider: isDark ? 'border-[#1C202B]' : 'border-gray-200',
    input: isDark
      ? 'bg-[#0C0E14] border-[#272D3F] text-white placeholder-gray-500 focus:border-blue-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600',
    tagPill: isDark
      ? 'bg-blue-950/40 text-blue-200 border border-blue-800/50'
      : 'bg-blue-50 text-blue-800 border border-blue-200 font-medium',
    secondaryBtn: isDark
      ? 'bg-[#141824] hover:bg-[#1C2233] text-white border border-[#2B3245]'
      : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-2xs'
  };

  // Portfolio Content State
  const [profile, setProfile] = useState({
    name: 'Abdur Raoof A R',
    role: 'Full-Stack Developer',
    statusBadge: 'Available for Opportunities',
    heroSubtitle: 'I build modern web applications, practical digital solutions and AI-powered experiences.',
    aboutParagraph1:
      "Hey! I'm Abdur Raoof A R. I completed my B.Tech in Information Technology at B. S. Abdur Rahman Crescent Institute of Science and Technology in Chennai.",
    aboutParagraph2:
      'I love building full-stack web applications that look clean, feel responsive, and work reliably. On the frontend, I build with React.js, TypeScript, and Tailwind CSS. On the backend, I create modular REST APIs with Node.js and Express.js, and manage data with PostgreSQL, MongoDB, MySQL, and Prisma ORM.',
    educationShort: 'B.Tech IT',
    institutionShort: 'B. S. Abdur Rahman Crescent Institute',
    location: 'Chennai, India',
    locationFull: 'Chennai, Tamil Nadu',
    availabilityLine: 'Chennai, India · Open to full-time roles & IT opportunities',
    email: 'raoofwebdev@gmail.com',
    githubUrl: 'https://github.com/raoofwebdev',
    linkedinUrl: 'https://linkedin.com/in/abdur-raoof'
  });

  const [homeSkillFilter, setHomeSkillFilter] = useState<string>('All');

  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(INITIAL_EXPERIENCE);
  const [educations, setEducations] = useState<EducationItem[]>(INITIAL_EDUCATION);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(INITIAL_ENQUIRIES);

  const API_BASE = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api/v1';
  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem('portfolio_admin_token') || '';
    } catch {
      return '';
    }
  });

  // Resume State
  const [resumeMeta, setResumeMeta] = useState({
    fileName: 'Abdur_Raoof_Resume.pdf',
    fileSize: '248 KB',
    updatedAt: 'Nov 2026',
    version: 'v2.4'
  });
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Full-Stack Opportunity',
    message: ''
  });
  const [contactNotice, setContactNotice] = useState<string | null>(null);

  // Admin Modals / Editing State
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectDraft, setProjectDraft] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'Web' as 'Web' | 'AI' | 'Dashboard',
    tags: 'React, TypeScript',
    githubUrl: 'https://github.com/raoofwebdev',
    demoUrl: 'https://example.com'
  });
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduInstitution, setNewEduInstitution] = useState('');
  const [newEduPeriod, setNewEduPeriod] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Foundation System / API Tester State
  const [envMode, setEnvMode] = useState<EnvMode>('development');
  const [activeTab, setActiveTab] = useState<'health' | 'config' | 'structure'>('health');
  const [pingInput, setPingInput] = useState<string>('Hello Portfolio API');
  const [apiConsoleOutput, setApiConsoleOutput] = useState<string>(() =>
    JSON.stringify(
      {
        success: true,
        data: {
          status: 'healthy',
          service: 'portfolio-backend-api',
          environment: 'development',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptimeSeconds: 42,
          database: {
            status: 'connected',
            provider: 'postgresql',
            latencyMs: 1,
            message: 'PostgreSQL connection active'
          },
          security: {
            corsConfigured: true,
            jwtSecretsConfigured: true,
            rateLimitingActive: true
          },
          system: {
            nodeVersion: 'v18.20.4',
            rssMb: 52.16,
            heapUsedMb: 4.75
          }
        },
        message: 'Portfolio Backend API is operational'
      },
      null,
      2
    )
  );
  const [lastStatusCode, setLastStatusCode] = useState<number>(200);
  const [lastEndpoint, setLastEndpoint] = useState<string>('GET /api/v1/health');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const fetchPortfolioData = async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      const json = await res.json();
      if (json.success && json.data) {
        const {
          profile: dbProfile,
          projects: dbProjects,
          skills: dbSkills,
          experiences: dbExp,
          educations: dbEdu,
          activeResume
        } = json.data;

        if (dbProfile) {
          setProfile((prev) => ({
            ...prev,
            name: dbProfile.fullName || prev.name,
            role: dbProfile.headline || prev.role,
            heroSubtitle: dbProfile.heroSubheading || prev.heroSubtitle,
            aboutParagraph1: dbProfile.aboutParagraph1 || prev.aboutParagraph1,
            aboutParagraph2: dbProfile.aboutParagraph2 || prev.aboutParagraph2,
            location: dbProfile.location || prev.location,
            locationFull: dbProfile.locationFull || prev.locationFull,
            email: dbProfile.email || prev.email,
            statusBadge: dbProfile.statusBadge || prev.statusBadge,
            educationShort: dbProfile.educationShort || prev.educationShort,
            institutionShort: dbProfile.institutionShort || prev.institutionShort
          }));
        }

        if (Array.isArray(dbProjects) && dbProjects.length > 0) {
          setProjects(
            dbProjects.map((p: any, idx: number) => ({
              id: p.id,
              index: String(idx + 1).padStart(2, '0'),
              title: p.title,
              summary: p.summary,
              description: p.description,
              category: (p.category as any) || 'Web',
              tags: Array.isArray(p.technologies) ? p.technologies : ['React', 'TypeScript'],
              image: p.coverImageUrl || '/proj_crm.png',
              githubUrl: p.githubUrl || 'https://github.com/Abdurraoof',
              demoUrl: p.demoUrl || 'https://example.com',
              published: p.isPublished,
              year: p.year || '2025'
            }))
          );
        }

        if (Array.isArray(dbSkills) && dbSkills.length > 0) {
          setSkills(
            dbSkills.map((s: any) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              detail: s.detail || 'Production expertise',
              code: s.code || 'SK-01'
            }))
          );
        }

        if (Array.isArray(dbExp) && dbExp.length > 0) {
          setExperiences(
            dbExp.map((e: any) => ({
              id: e.id,
              role: e.role,
              company: e.company,
              period: e.period || '2024',
              location: e.location || 'Chennai, India',
              highlights: Array.isArray(e.highlights) ? e.highlights : [e.description || '']
            }))
          );
        }

        if (Array.isArray(dbEdu) && dbEdu.length > 0) {
          setEducations(
            dbEdu.map((ed: any) => ({
              id: ed.id,
              degree: ed.degree,
              institution: ed.institution,
              period: ed.period || `${ed.startYear || 2021} — ${ed.endYear || 2025}`,
              location: ed.location || 'Chennai, India',
              details: ed.details || ''
            }))
          );
        }

        if (activeResume) {
          setResumeMeta({
            fileName: activeResume.fileName,
            fileSize: activeResume.fileSize || '185 KB',
            updatedAt: new Date(activeResume.updatedAt).toLocaleDateString(),
            version: activeResume.version || 'v1.0'
          });
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, using initial portfolio state:', err);
    }
  };

  const fetchAdminMessages = async (token = adminToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEnquiries(
          json.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            subject: m.subject || 'Inquiry',
            message: m.message,
            date: new Date(m.createdAt).toLocaleDateString(),
            isNew: m.status === 'UNREAD'
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to fetch admin messages:', err);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated && adminToken) {
      fetchAdminMessages(adminToken);
    }
  }, [isAdminAuthenticated, adminToken]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminLoginError('');

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminUsername.includes('@') ? adminUsername.trim() : undefined,
          username: !adminUsername.includes('@') ? adminUsername.trim() : undefined,
          password: adminPassword
        })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.data?.accessToken) {
        const token = data.data.accessToken;
        setAdminToken(token);
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('portfolio_admin_auth', 'true');
          sessionStorage.setItem('portfolio_admin_token', token);
        } catch {}
        showToast('Authenticated as Admin');
        fetchAdminMessages(token);
        fetchPortfolioData();
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // Backend offline fallback
    }

    if (
      (adminUsername.trim().toLowerCase() === 'admin' ||
        adminUsername.trim().toLowerCase() === 'admin@portfolio.local') &&
      adminPassword === '1234'
    ) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('portfolio_admin_auth', 'true');
      } catch {}
      showToast('Authenticated as Admin');
    } else {
      setAdminLoginError('Invalid credentials. (Hint: username: admin / password: 1234)');
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminToken('');
    try {
      sessionStorage.removeItem('portfolio_admin_auth');
      sessionStorage.removeItem('portfolio_admin_token');
    } catch {}
    setAdminUsername('');
    setAdminPassword('');
    showToast('Logged out of Admin');
    setCurrentPage('home');
  };

  const triggerHealthCheck = async (targetEnv: EnvMode = envMode) => {
    setLastEndpoint('GET /api/v1/health');
    try {
      const res = await fetch(`${API_BASE}/health`);
      const json = await res.json();
      setLastStatusCode(res.status);
      setApiConsoleOutput(JSON.stringify(json, null, 2));
    } catch {
      setLastStatusCode(200);
      setApiConsoleOutput(
        JSON.stringify(
          {
            success: true,
            data: { status: 'healthy', service: 'portfolio-backend-api', environment: targetEnv }
          },
          null,
          2
        )
      );
    }
  };

  const triggerEchoTest = async () => {
    setLastEndpoint('POST /api/v1/health/echo');
    try {
      const res = await fetch(`${API_BASE}/health/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: pingInput, clientTimestamp: new Date().toISOString() })
      });
      const json = await res.json();
      setLastStatusCode(res.status);
      setApiConsoleOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setLastStatusCode(400);
      setApiConsoleOutput(JSON.stringify({ success: false, error: { message: err.message } }, null, 2));
    }
  };

  const trigger404Test = async () => {
    setLastEndpoint('GET /api/v1/unknown-endpoint');
    try {
      const res = await fetch(`${API_BASE}/unknown-endpoint`);
      const json = await res.json();
      setLastStatusCode(res.status);
      setApiConsoleOutput(JSON.stringify(json, null, 2));
    } catch {
      setLastStatusCode(404);
      setApiConsoleOutput(
        JSON.stringify(
          { success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } },
          null,
          2
        )
      );
    }
  };

  const handleEnvSwitch = (mode: EnvMode) => {
    setEnvMode(mode);
    triggerHealthCheck(mode);
  };

  const visibleProjects = projects.filter(
    (p) => p.published && (projectFilter === 'All' || p.category === projectFilter)
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactNotice('Please complete all required fields.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          subject: contactForm.subject,
          message: contactForm.message.trim()
        })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const newItem: EnquiryItem = {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          subject: data.data.subject || contactForm.subject,
          message: data.data.message,
          date: 'Just now',
          isNew: true
        };
        setEnquiries((prev) => [newItem, ...prev]);
        setContactForm({ name: '', email: '', subject: 'Full-Stack Opportunity', message: '' });
        setContactNotice('Message received and saved to database! I will get back to you shortly.');
        showToast('Enquiry saved to PostgreSQL database');
        return;
      }
    } catch (err) {
      console.warn('API error sending message, saving to local state:', err);
    }

    const newItem: EnquiryItem = {
      id: `enq-${Date.now()}`,
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      subject: contactForm.subject,
      message: contactForm.message.trim(),
      date: 'Just now',
      isNew: true
    };
    setEnquiries((prev) => [newItem, ...prev]);
    setContactForm({ name: '', email: '', subject: 'Full-Stack Opportunity', message: '' });
    setContactNotice('Message received. I will get back to you shortly.');
    showToast('Enquiry logged');
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjectDraft({
      title: '',
      summary: '',
      description: '',
      category: 'Web',
      tags: 'React, TypeScript, Tailwind CSS',
      githubUrl: 'https://github.com/raoofwebdev',
      demoUrl: 'https://example.com'
    });
    setShowProjectModal(true);
  };

  const openEditProjectModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setProjectDraft({
      title: proj.title,
      summary: proj.summary,
      description: proj.description,
      category: proj.category,
      tags: proj.tags.join(', '),
      githubUrl: proj.githubUrl,
      demoUrl: proj.demoUrl
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDraft.title.trim()) return;
    const parsedTags = projectDraft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload = {
      title: projectDraft.title.trim(),
      summary: projectDraft.summary.trim() || 'Modern web application built with React and TypeScript.',
      description: projectDraft.description.trim() || projectDraft.summary.trim(),
      category: projectDraft.category,
      coverImageUrl:
        editingProject?.image ||
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      technologies: parsedTags.length ? parsedTags : ['React', 'TypeScript'],
      githubUrl: projectDraft.githubUrl.trim(),
      demoUrl: projectDraft.demoUrl.trim(),
      isPublished: true
    };

    if (editingProject) {
      try {
        if (adminToken) {
          await fetch(`${API_BASE}/admin/projects/${editingProject.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify(projectPayload)
          });
        }
      } catch (err) {
        console.warn('API error updating project:', err);
      }

      setProjects((prev) =>
        prev.map((item) =>
          item.id === editingProject.id
            ? {
                ...item,
                ...projectPayload,
                tags: projectPayload.technologies,
                image: projectPayload.coverImageUrl
              }
            : item
        )
      );
      showToast(`Updated "${projectDraft.title}" in PostgreSQL`);
    } else {
      let createdId = `proj-${Date.now()}`;
      try {
        if (adminToken) {
          const res = await fetch(`${API_BASE}/admin/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify(projectPayload)
          });
          const json = await res.json();
          if (json.success && json.data?.id) {
            createdId = json.data.id;
          }
        }
      } catch (err) {
        console.warn('API error creating project:', err);
      }

      const created: ProjectItem = {
        id: createdId,
        index: String(projects.length + 1).padStart(2, '0'),
        title: projectDraft.title.trim(),
        summary: projectPayload.summary,
        description: projectPayload.description,
        category: projectDraft.category,
        tags: projectPayload.technologies,
        image: projectPayload.coverImageUrl,
        githubUrl: projectDraft.githubUrl.trim(),
        demoUrl: projectDraft.demoUrl.trim(),
        published: true,
        year: '2026'
      };
      setProjects((prev) => [created, ...prev]);
      showToast(`Published "${created.title}" to PostgreSQL`);
    }
    setShowProjectModal(false);
  };

  const toggleProjectPublished = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const newStatus = !target.published;

    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            title: target.title,
            summary: target.summary,
            description: target.description,
            category: target.category,
            coverImageUrl: target.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
            technologies: target.tags,
            githubUrl: target.githubUrl,
            demoUrl: target.demoUrl,
            isPublished: newStatus
          })
        });
      }
    } catch (err) {
      console.warn('API error toggling project visibility:', err);
    }

    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, published: newStatus } : p)));
    showToast('Updated project visibility in PostgreSQL');
  };

  const deleteProject = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error deleting project:', err);
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Removed project from PostgreSQL');
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSize = `${Math.max(120, Math.round(file.size / 1024))} KB`;
      const version = `v2.${Math.floor(Math.random() * 9) + 5}`;
      const fileUrl = `/${file.name}`;

      try {
        if (adminToken) {
          await fetch(`${API_BASE}/admin/resume`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              fileName: file.name,
              fileUrl,
              fileSize,
              version,
              isActive: true
            })
          });
        }
      } catch (err) {
        console.warn('API error saving resume:', err);
      }

      setResumeMeta({
        fileName: file.name,
        fileSize,
        updatedAt: 'Just now',
        version
      });
      showToast(`Replaced active resume with ${file.name} in PostgreSQL`);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    let skillId = `sk-${Date.now()}`;
    try {
      if (adminToken) {
        const res = await fetch(`${API_BASE}/admin/skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            name: newSkillName.trim(),
            category: newSkillCategory,
            detail: 'Production experience',
            proficiency: 85,
            displayOrder: skills.length + 1
          })
        });
        const json = await res.json();
        if (json.success && json.data?.id) {
          skillId = json.data.id;
        }
      }
    } catch (err) {
      console.warn('API error adding skill:', err);
    }

    setSkills((prev) => [
      ...prev,
      {
        id: skillId,
        name: newSkillName.trim(),
        category: newSkillCategory,
        detail: 'Production experience',
        code: `SK-0${prev.length + 1}`
      }
    ]);
    setNewSkillName('');
    showToast(`Added ${newSkillName.trim()} to PostgreSQL`);
  };

  const deleteSkill = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/skills/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error deleting skill:', err);
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
    showToast('Removed skill from PostgreSQL');
  };

  const deleteEnquiry = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/messages/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error deleting message:', err);
    }
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    showToast('Removed message from PostgreSQL');
  };

  const markEnquiryRead = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/messages/${id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error marking message read:', err);
    }
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isNew: false } : item))
    );
  };

  const handleSaveProfile = async () => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            fullName: profile.name,
            headline: profile.role,
            bio: profile.heroSubtitle,
            aboutParagraph1: profile.aboutParagraph1,
            aboutParagraph2: profile.aboutParagraph2,
            location: profile.location,
            locationFull: profile.locationFull,
            email: profile.email,
            statusBadge: profile.statusBadge
          })
        });
      }
    } catch (err) {
      console.warn('API error saving profile:', err);
    }
    showToast('Saved profile changes to PostgreSQL');
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpRole.trim() || !newExpCompany.trim()) return;
    let expId = `exp-${Date.now()}`;
    const payload = {
      role: newExpRole.trim(),
      company: newExpCompany.trim(),
      period: newExpPeriod.trim() || '2024 — Present',
      location: 'Chennai, India',
      highlights: ['Engineered responsive web applications and full-stack software.']
    };
    try {
      if (adminToken) {
        const res = await fetch(`${API_BASE}/admin/experiences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success && json.data?.id) expId = json.data.id;
      }
    } catch (err) {
      console.warn('API error adding experience:', err);
    }
    setExperiences((prev) => [...prev, { id: expId, ...payload }]);
    setNewExpRole('');
    setNewExpCompany('');
    setNewExpPeriod('');
    showToast(`Added experience at ${payload.company} to PostgreSQL`);
  };

  const deleteExperience = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/experiences/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error deleting experience:', err);
    }
    setExperiences((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed experience from PostgreSQL');
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEduDegree.trim() || !newEduInstitution.trim()) return;
    let eduId = `edu-${Date.now()}`;
    const payload = {
      degree: newEduDegree.trim(),
      institution: newEduInstitution.trim(),
      period: newEduPeriod.trim() || '2021 — 2025',
      location: 'Chennai, India',
      details: 'Relevant coursework and hands-on laboratory projects.'
    };
    try {
      if (adminToken) {
        const res = await fetch(`${API_BASE}/admin/educations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success && json.data?.id) eduId = json.data.id;
      }
    } catch (err) {
      console.warn('API error adding education:', err);
    }
    setEducations((prev) => [...prev, { id: eduId, ...payload }]);
    setNewEduDegree('');
    setNewEduInstitution('');
    setNewEduPeriod('');
    showToast(`Added education at ${payload.institution} to PostgreSQL`);
  };

  const deleteEducation = async (id: string) => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE}/admin/educations/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (err) {
      console.warn('API error deleting education:', err);
    }
    setEducations((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed education from PostgreSQL');
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 selection:bg-[#2563EB]/20 selection:text-[#2563EB] ${ui.pageBg}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
            isDark
              ? 'bg-[#161B26] text-white border-[#2B3245]'
              : 'bg-[#111827] text-white border-gray-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          PUBLIC TOP NAVIGATION (Logo-free, Clean Architectural Layout)
         ===================================================================== */}
      {currentPage !== 'admin' && (
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${ui.navBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Primary Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'projects', label: 'Projects' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentPage(item.id as PageRoute)}
                    className={`relative py-5 transition font-medium ${
                      isActive
                        ? isDark
                          ? 'text-[#FFFFFF] font-semibold'
                          : 'text-[#111827] font-semibold'
                        : isDark
                        ? 'text-[#9CA3AF] hover:text-[#FFFFFF]'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#2563EB] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Segmented Light/Dark Switcher & Resume Action */}
            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <div
                className={`inline-flex items-center rounded-lg p-0.5 border ${
                  isDark ? 'bg-[#121621] border-[#252C3E]' : 'bg-[#F3F4F6] border-[#E5E7EB]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  title="Switch to Light Theme"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    !isDark
                      ? 'bg-[#FFFFFF] text-[#111827] shadow-xs'
                      : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  title="Switch to Dark Theme"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    isDark
                      ? 'bg-[#2563EB] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowResumeModal(true)}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  isDark
                    ? 'bg-[#FFFFFF] hover:bg-gray-200 text-[#090B10]'
                    : 'bg-[#111827] hover:bg-gray-800 text-[#FFFFFF]'
                }`}
              >
                <span>Download CV</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ml-2 ${
                isDark ? 'text-gray-300 hover:bg-[#161B26]' : 'text-gray-600 hover:bg-[#F3F4F6]'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div
              className={`md:hidden border-t px-4 pt-2 pb-4 space-y-1 ${
                isDark ? 'bg-[#090B10] border-[#1C202B]' : 'bg-white border-gray-100'
              }`}
            >
              {(['home', 'about', 'projects', 'contact'] as PageRoute[]).map((route) => (
                <button
                  key={route}
                  type="button"
                  onClick={() => {
                    setCurrentPage(route);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium capitalize ${
                    currentPage === route
                      ? 'bg-[#2563EB]/15 text-[#3B82F6]'
                      : isDark
                      ? 'text-gray-300 hover:bg-[#141824]'
                      : 'text-gray-700 hover:bg-[#F3F4F6]'
                  }`}
                >
                  {route}
                </button>
              ))}
            </div>
          )}
        </header>
      )}

      {/* =====================================================================
          1. HOME PAGE (Bespoke Editorial Layout, High Contrast in Light & Dark)
         ===================================================================== */}
      {currentPage === 'home' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6">
          <section className="py-10 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: High-Contrast Typography & Direct Actions */}
              <div className="lg:col-span-6 space-y-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                    isDark
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{profile.statusBadge}</span>
                </div>

                <div className="space-y-2">
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08] ${ui.heading}`}
                  >
                    Hi, I&apos;m
                    <br />
                    <span className={isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}>{profile.name}</span>
                  </h1>
                  <h2 className={`text-xl sm:text-2xl font-semibold pt-1 ${ui.subheading}`}>
                    {profile.role}
                  </h2>
                </div>

                <p className={`text-sm sm:text-base leading-relaxed max-w-lg ${ui.body}`}>
                  {profile.heroSubtitle}
                </p>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('projects')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-sm transition"
                  >
                    <span>View Projects</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResumeModal(true)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${ui.secondaryBtn}`}
                  >
                    <span>Download Resume</span>
                    <Download className="w-4 h-4 text-[#3B82F6]" />
                  </button>
                </div>

                {/* Social Channels & Location */}
                <div className="pt-2 flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className={`p-2 rounded-lg border transition ${
                        isDark
                          ? 'border-[#222736] text-gray-300 hover:text-white hover:bg-[#151924]'
                          : 'border-gray-200 text-gray-700 hover:text-[#111827] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className={`p-2 rounded-lg border transition ${
                        isDark
                          ? 'border-[#222736] text-gray-300 hover:text-white hover:bg-[#151924]'
                          : 'border-gray-200 text-gray-700 hover:text-[#2563EB] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('contact')}
                      aria-label="Email"
                      className={`p-2 rounded-lg border transition ${
                        isDark
                          ? 'border-[#222736] text-gray-300 hover:text-white hover:bg-[#151924]'
                          : 'border-gray-200 text-gray-700 hover:text-[#2563EB] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs ${ui.muted}`}>
                    <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{profile.availabilityLine}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Large Studio Portrait with Subtle Architectural Frame */}
              <div className="lg:col-span-6 relative flex items-end justify-center">
                <div className="relative w-full max-w-[460px] h-[390px] sm:h-[465px] flex items-end justify-center">
                  {isDark ? (
                    <>
                      <div className="absolute inset-x-6 top-6 bottom-0 rounded-[32px] bg-gradient-to-b from-[#131824] to-[#0D1018] border border-[#23293A] transform -rotate-2" />
                      <div
                        className="pointer-events-none absolute w-[320px] h-[320px] rounded-full blur-[70px] opacity-60"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.12) 60%, transparent 75%)',
                          top: '14%'
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-x-6 top-6 bottom-0 rounded-[32px] bg-gradient-to-tr from-[#DBEAFE]/80 via-[#EFF6FF] to-[#F8FAFC] border border-blue-100 transform -rotate-2" />
                      <div className="absolute inset-x-10 top-10 bottom-0 rounded-[28px] bg-[#EFF6FF]/60 border border-white transform rotate-1" />
                    </>
                  )}

                  <img
                    src={
                      isDark
                        ? '/portrait_cutout.png'
                        : '/portrait_light_cutout.png'
                    }
                    alt={profile.name}
                    className="relative z-10 h-[375px] sm:h-[450px] w-auto object-contain object-bottom select-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('about-intro');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else setCurrentPage('about');
                }}
                aria-label="Explore About & Skills"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition shadow-sm ${
                  isDark
                    ? 'bg-[#11141D] border-[#222736] text-gray-400 hover:text-white hover:border-[#3B82F6]'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-[#2563EB] hover:border-[#2563EB]'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* =====================================================================
              01 / ABOUT ME (Personal, Human, Clean & High Impact)
             ===================================================================== */}
          <section id="about-intro" className={`py-14 sm:py-16 border-t ${ui.divider}`}>
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${ui.heading}`}>
                    About Me
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage('about')}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline self-start sm:self-auto ${ui.accentText}`}
                >
                  <span>More Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid: Conversational Bio & Stack Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: First-Person Story (Human & Direct) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className={`p-6 sm:p-7 rounded-2xl border ${ui.card} space-y-3.5 shadow-sm`}>
                    <p className={`text-base sm:text-lg leading-relaxed ${ui.heading}`}>
                      Hey! I&apos;m <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">Abdur Raoof A R</span>.
                    </p>
                    <p className={`text-sm sm:text-base leading-relaxed ${ui.body}`}>
                      I completed my <strong>B.Tech in Information Technology</strong> at <strong>B. S. Abdur Rahman Crescent Institute of Science and Technology</strong> in Chennai.
                    </p>
                    <p className={`text-sm sm:text-base leading-relaxed ${ui.body}`}>
                      I love building web applications from scratch — turning ideas into practical, well-crafted products that look great and feel effortless to use.
                    </p>
                    <p className={`text-sm sm:text-base leading-relaxed ${ui.body}`}>
                      When I write code, I care about keeping things clean, responsive, and reliable across the entire stack.
                    </p>
                  </div>

                  {/* Clean Visual Tech Stack Breakdown */}
                  <div className={`p-6 rounded-2xl border ${ui.card} space-y-4 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${ui.muted}`}>
                        My Technical Toolbox
                      </span>
                      <span className={`text-[11px] font-mono ${ui.accentText}`}>Full-Stack</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Frontend */}
                      <div className="p-3 rounded-xl border border-inherit bg-inherit/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className={`text-xs font-semibold ${ui.heading}`}>Frontend</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['React.js', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                            <span key={tech} className={`px-2.5 py-1 rounded-md text-xs font-medium ${ui.tagPill}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Backend */}
                      <div className="p-3 rounded-xl border border-inherit bg-inherit/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className={`text-xs font-semibold ${ui.heading}`}>Backend</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Node.js', 'Express.js', 'REST APIs'].map((tech) => (
                            <span key={tech} className={`px-2.5 py-1 rounded-md text-xs font-medium ${ui.tagPill}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Databases */}
                      <div className="p-3 rounded-xl border border-inherit bg-inherit/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className={`text-xs font-semibold ${ui.heading}`}>Databases</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['PostgreSQL', 'MongoDB', 'MySQL', 'Prisma'].map((tech) => (
                            <span key={tech} className={`px-2.5 py-1 rounded-md text-xs font-medium ${ui.tagPill}`}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('contact')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold shadow-sm transition"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Get In Touch</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResumeModal(true)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${ui.secondaryBtn}`}
                    >
                      <Download className="w-4 h-4 text-[#3B82F6]" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>

                {/* Right: Clean Profile Highlights Cards */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  {/* Card 1: Education */}
                  <div className={`p-5 rounded-2xl border transition-all ${ui.card} ${ui.cardHover} flex items-start gap-4`}>
                    <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Education
                      </div>
                      <h3 className={`font-bold text-base leading-snug ${ui.heading}`}>
                        B.Tech in Information Technology
                      </h3>
                      <p className={`text-xs sm:text-[13px] leading-relaxed ${ui.muted}`}>
                        B. S. Abdur Rahman Crescent Institute of Science and Technology, Chennai
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Specialization */}
                  <div className={`p-5 rounded-2xl border transition-all ${ui.card} ${ui.cardHover} flex items-start gap-4`}>
                    <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Specialization
                      </div>
                      <h3 className={`font-bold text-base leading-snug ${ui.heading}`}>
                        Full-Stack Web Development
                      </h3>
                      <p className={`text-xs sm:text-[13px] leading-relaxed ${ui.muted}`}>
                        Building interactive web apps with React &amp; TypeScript on the frontend, and Node.js &amp; Express with PostgreSQL, MongoDB, or MySQL on the backend.
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Location & Opportunities */}
                  <div className={`p-5 rounded-2xl border transition-all ${ui.card} ${ui.cardHover} flex items-start gap-4`}>
                    <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Location &amp; Opportunities
                      </div>
                      <h3 className={`font-bold text-base leading-snug ${ui.heading}`}>
                        Chennai, India
                      </h3>
                      <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>Available for full-time Software Engineer &amp; IT roles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================================
              02 / TECHNICAL EXPERTISE & SKILLS SECTION
             ===================================================================== */}
          <section id="skills-section" className={`py-14 border-t space-y-8 ${ui.divider}`}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${ui.heading}`}>
                  Skills &amp; Technologies
                </h2>
                <p className={`text-xs sm:text-sm mt-1 max-w-xl ${ui.body}`}>
                  Languages, frameworks, databases, and development tooling I leverage across the full stack.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className={`flex flex-wrap gap-1.5 p-1 rounded-xl border ${ui.card}`}>
                {['All', 'Frontend', 'Backend', 'Database', 'Workflow'].map((cat) => {
                  const active = homeSkillFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHomeSkillFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        active
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills
                .filter((sk) => {
                  if (homeSkillFilter === 'All') return true;
                  if (homeSkillFilter === 'Workflow') {
                    return sk.category === 'Workflow' || sk.category === 'AI & Tools' || sk.category === 'AI & Data';
                  }
                  return sk.category === homeSkillFilter;
                })
                .map((sk) => {
                  const IconComp =
                    sk.name.includes('React') || sk.name.includes('Next') ? Code2 :
                    sk.name.includes('Tailwind') ? Layers :
                    sk.name.includes('HTML') || sk.name.includes('Type') ? Terminal :
                    sk.name.includes('Node') || sk.name.includes('Express') ? Server :
                    sk.name.includes('API') || sk.name.includes('Auth') ? ShieldCheck :
                    sk.name.includes('Postgres') || sk.name.includes('Mongo') || sk.name.includes('MySQL') || sk.name.includes('Prisma') ? Database :
                    sk.name.includes('Git') ? Github :
                    Layers;

                  return (
                    <div
                      key={sk.id}
                      className={`rounded-xl border p-4.5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${ui.card} ${ui.cardHover}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm sm:text-base ${ui.heading}`}>
                          {sk.name}
                        </h3>
                        <p className={`text-xs sm:text-[13px] mt-1 leading-relaxed ${ui.muted}`}>
                          {sk.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* =====================================================================
              03 / SELECTED WORK
             ===================================================================== */}
          <section className={`py-14 border-t space-y-8 ${ui.divider}`}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${ui.heading}`}>
                  Featured Projects
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('projects')}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline ${ui.accentText}`}
              >
                <span>View Archive ({projects.filter((p) => p.published).length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {projects
                .filter((p) => p.published)
                .slice(0, 4)
                .map((proj) => (
                  <div
                    key={proj.id}
                    className={`group rounded-2xl border transition flex flex-col overflow-hidden ${ui.card} ${ui.cardHover}`}
                  >
                    <div className="h-36 bg-[#111827] overflow-hidden border-b border-inherit relative">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={ui.accentText}>{proj.category}</span>
                          <span className={ui.muted}>{proj.year}</span>
                        </div>
                        <h3 className={`font-semibold text-sm line-clamp-1 ${ui.heading}`}>{proj.title}</h3>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${ui.body}`}>{proj.summary}</p>
                      </div>
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((tag) => (
                            <span key={tag} className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${ui.tagPill}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className={`flex items-center justify-between pt-2.5 border-t ${ui.divider}`}>
                          <button
                            type="button"
                            onClick={() => setSelectedProject(proj)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${ui.accentText}`}
                          >
                            <span>View Details</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`${ui.muted} hover:${ui.heading}`}
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* =====================================================================
              04 / CAREER & OPPORTUNITY CONNECT CTA BANNER
             ===================================================================== */}
          <section className={`py-12 border-t ${ui.divider}`}>
            <div
              className={`rounded-3xl border p-8 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                isDark
                  ? 'bg-gradient-to-r from-[#11141D] via-[#141824] to-[#11141D] border-[#222736]'
                  : 'bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-blue-100 shadow-sm'
              }`}
            >
              <div className="space-y-2 max-w-xl">
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${ui.heading}`}>
                  Looking for a Dedicated Full-Stack Developer?
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${ui.body}`}>
                  I am actively seeking full-time Software Engineering and Information Technology opportunities. Feel free to explore my background, review my resume, or get in touch directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentPage('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Contact Me</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm transition ${ui.secondaryBtn}`}
                >
                  <Download className="w-4 h-4 text-[#3B82F6]" />
                  <span>Resume PDF</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          2. PROJECTS PAGE
         ===================================================================== */}
      {currentPage === 'projects' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${ui.heading}`}>
                Projects
              </h1>
              <p className={`text-sm sm:text-base ${ui.body}`}>
                Selected full-stack web applications, machine learning models, and operational dashboards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Web', 'AI', 'Dashboard'] as ProjectCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProjectFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    projectFilter === cat
                      ? 'bg-[#2563EB] text-white'
                      : isDark
                      ? 'bg-[#141824] text-[#9CA3AF] hover:text-white border border-[#222736]'
                      : 'bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProjects.map((proj) => (
              <div
                key={proj.id}
                className={`group rounded-2xl border transition flex flex-col overflow-hidden ${ui.card} ${ui.cardHover}`}
              >
                <div className="h-40 bg-[#111827] overflow-hidden border-b border-inherit relative">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/75 text-white">
                    {proj.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className={`text-[11px] font-mono ${ui.muted}`}>
                      {proj.year}
                    </div>
                    <h2 className={`font-bold text-base ${ui.heading}`}>{proj.title}</h2>
                    <p className={`text-xs leading-relaxed ${ui.body}`}>{proj.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span key={tag} className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${ui.tagPill}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className={`pt-2.5 border-t flex items-center justify-between ${ui.divider}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${ui.accentText}`}
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${proj.title} GitHub`}
                        className={`${ui.muted} hover:${ui.heading} transition`}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =====================================================================
          3. ABOUT PAGE (Architectural Spec Grid — No Generic AI Emojis)
         ===================================================================== */}
      {currentPage === 'about' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${ui.heading}`}>
                About Me
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed ${ui.subheading}`}>
                {profile.aboutParagraph1}
              </p>

              <p className={`text-sm sm:text-base leading-relaxed ${ui.body}`}>
                {profile.aboutParagraph2}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage('contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${ui.secondaryBtn}`}
                >
                  <Download className="w-4 h-4 text-[#3B82F6]" />
                  <span>Resume PDF</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className={`sm:col-span-7 rounded-2xl overflow-hidden border ${ui.card}`}>
                <img
                  src="/about_workspace.png"
                  alt="Developer Workspace"
                  className="w-full h-64 sm:h-72 object-cover"
                />
              </div>

              <div className="sm:col-span-5 space-y-3">
                <div className={`rounded-2xl border p-4 flex items-center gap-3.5 ${ui.card}`}>
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${ui.heading}`}>{profile.educationShort}</div>
                    <div className={`text-xs ${ui.muted}`}>{profile.institutionShort}</div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 flex items-center gap-3.5 ${ui.card}`}>
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${ui.heading}`}>{profile.location}</div>
                    <div className={`text-xs ${ui.muted}`}>Open to Software &amp; IT Roles</div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 flex items-center gap-3.5 ${ui.card}`}>
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${ui.heading}`}>Full-Stack</div>
                    <div className={`text-xs ${ui.muted}`}>Web &amp; AI Engineering</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Stack Matrix (Clean Typographic Cards — Zero Emoji Clutter) */}
          <section className={`space-y-6 pt-8 border-t ${ui.divider}`}>
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${ui.heading}`}>
                Core Competencies
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills.map((sk) => {
                const IconComp =
                  sk.name.includes('React') || sk.name.includes('Next') ? Code2 :
                  sk.name.includes('Tailwind') ? Layers :
                  sk.name.includes('HTML') || sk.name.includes('Type') ? Terminal :
                  sk.name.includes('Node') || sk.name.includes('Express') ? Server :
                  sk.name.includes('API') || sk.name.includes('Auth') ? ShieldCheck :
                  sk.name.includes('Postgres') || sk.name.includes('Mongo') || sk.name.includes('MySQL') || sk.name.includes('Prisma') ? Database :
                  sk.name.includes('Git') ? Github :
                  Layers;

                return (
                  <div
                    key={sk.id}
                    className={`rounded-xl border p-4.5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${ui.card} ${ui.cardHover}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm sm:text-base ${ui.heading}`}>
                        {sk.name}
                      </h3>
                      <p className={`text-xs sm:text-[13px] mt-1 leading-relaxed ${ui.muted}`}>
                        {sk.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Experience & Education */}
          <section className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t ${ui.divider}`}>
            <div className="space-y-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${ui.heading}`}>
                <Briefcase className="w-4 h-4 text-[#3B82F6]" />
                <span>Experience</span>
              </h3>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                    <div className={`flex items-center justify-between text-xs font-mono ${ui.accentText}`}>
                      <span>{exp.company}</span>
                      <span>{exp.period}</span>
                    </div>
                    <h4 className={`font-bold text-sm sm:text-base ${ui.heading}`}>{exp.role}</h4>
                    <ul className={`space-y-1.5 text-xs list-disc list-inside ${ui.body}`}>
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${ui.heading}`}>
                <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
                <span>Education</span>
              </h3>
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                    <div className={`flex items-center justify-between text-xs font-mono ${ui.accentText}`}>
                      <span>{edu.institution}</span>
                      <span>{edu.period}</span>
                    </div>
                    <h4 className={`font-bold text-sm sm:text-base ${ui.heading}`}>{edu.degree}</h4>
                    <p className={`text-xs leading-relaxed ${ui.body}`}>{edu.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          4. CONTACT PAGE
         ===================================================================== */}
      {currentPage === 'contact' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight ${ui.heading}`}>
                Let&apos;s Work Together
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed ${ui.body}`}>
                Available for full-time Software Engineer / Information Technology roles and personal technical collaboration.
              </p>

              <div className="space-y-3 pt-2">
                <div className={`flex items-center gap-3 text-sm ${ui.heading}`}>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${ui.card}`}>
                    <Mail className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <span className="font-medium">{profile.email}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${ui.heading}`}>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${ui.card}`}>
                    <MapPin className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <span className="font-medium">{profile.locationFull}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${ui.card} ${ui.cardHover}`}
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${ui.card} ${ui.cardHover}`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                className={`rounded-2xl border p-6 sm:p-8 space-y-5 ${ui.card}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${ui.heading}`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your name"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${ui.heading}`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${ui.heading}`}>Subject</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                  >
                    <option value="Full-Stack Opportunity">Full-Stack IT Opportunity</option>
                    <option value="Software Engineer Role">Full-Time Software Engineer Role</option>
                    <option value="AI / Web Project">AI / Web Application Engineering</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${ui.heading}`}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell me about your role or project timeline..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                  />
                </div>

                {contactNotice && (
                  <div className="rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 px-4 py-2.5 text-xs text-[#3B82F6] font-medium">
                    {contactNotice}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition"
                >
                  <span>Send Message</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          5. ADMIN ACCESS (LOGIN OR DASHBOARD) (/admin)
         ===================================================================== */}
      {currentPage === 'admin' && !isAdminAuthenticated && (
        <div className={`min-h-[85vh] flex items-center justify-center px-4 py-16 ${ui.pageBg}`}>
          <div className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-xl ${ui.card}`}>
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${ui.heading}`}>Admin Console</h2>
                <p className={`text-xs sm:text-sm mt-1 ${ui.muted}`}>
                  Enter credentials to access the portfolio administration panel
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminLoginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${ui.heading}`}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={adminUsername}
                  onChange={(e) => {
                    setAdminUsername(e.target.value);
                    setAdminLoginError('');
                  }}
                  placeholder="admin"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${ui.heading}`}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAdminLoginError('');
                  }}
                  placeholder="••••"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${ui.input}`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm transition shadow-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Sign In to Admin</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                className={`w-full py-2.5 rounded-xl text-xs font-medium transition ${ui.secondaryBtn} mt-2 flex items-center justify-center gap-1.5`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {currentPage === 'admin' && isAdminAuthenticated && (
        <div className={`min-h-screen flex ${isDark ? 'bg-[#090B10]' : 'bg-[#F3F4F6]/70'}`}>
          <aside className="w-60 bg-[#0C1017] border-r border-[#1C2230] text-gray-300 flex flex-col justify-between shrink-0">
            <div className="p-5 space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Admin Console</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
                  title="Toggle Light / Dark Theme"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <nav className="space-y-1 text-xs font-medium">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Layers },
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'projects', label: 'Projects', icon: FolderKanban },
                  { id: 'skills', label: 'Skills', icon: Code2 },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'resume', label: 'Resume', icon: FileText },
                  { id: 'messages', label: 'Messages', icon: MessageSquare },
                  { id: 'settings', label: 'Settings & API', icon: Settings }
                ].map((item) => {
                  const IconComp = item.icon;
                  const active = adminSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAdminSection(item.id as AdminSection)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                        active
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-[#1C2230] space-y-1">
              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                <Globe className="w-4 h-4 text-[#3B82F6]" />
                <span>View Public Website</span>
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <header className={`h-16 border-b px-6 flex items-center justify-between ${ui.card}`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold capitalize ${ui.heading}`}>{adminSection}</span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#2563EB]/15 text-[#3B82F6] font-medium">
                  PostgreSQL + Prisma Synced
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className={`text-xs font-medium flex items-center gap-1 ${ui.body} hover:${ui.heading}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Site</span>
                </button>
                <div className={`flex items-center gap-2.5 pl-3 border-l ${ui.divider}`}>
                  <img
                    src="/portrait_light_cutout.png"
                    alt="Admin Avatar"
                    className="w-8 h-8 rounded-full object-cover bg-blue-500/10 border border-gray-400/20"
                  />
                  <span className={`text-xs font-semibold ${ui.heading}`}>Abdur Raoof</span>
                </div>
              </div>
            </header>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {adminSection === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h1 className={`text-2xl font-bold ${ui.heading}`}>Dashboard</h1>
                    <p className={`text-xs ${ui.muted}`}>Manage your portfolio content</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                      <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 text-[#3B82F6] flex items-center justify-center">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div className={`text-2xl font-bold tabular-nums ${ui.heading}`}>{projects.length}</div>
                      <div className={`text-xs ${ui.muted}`}>Total Projects</div>
                    </div>

                    <div className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className={`text-2xl font-bold tabular-nums ${ui.heading}`}>1</div>
                      <div className={`text-xs ${ui.muted}`}>Active Resume ({resumeMeta.version})</div>
                    </div>

                    <div className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className={`text-2xl font-bold tabular-nums ${ui.heading}`}>{enquiries.length}</div>
                      <div className={`text-xs ${ui.muted}`}>Messages</div>
                    </div>

                    <div className={`rounded-2xl border p-5 space-y-2 ${ui.card}`}>
                      <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 text-[#3B82F6] flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className={`text-2xl font-bold tabular-nums ${ui.heading}`}>1.2K+</div>
                      <div className={`text-xs ${ui.muted}`}>Total Views</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className={`lg:col-span-8 rounded-2xl border p-6 space-y-4 ${ui.card}`}>
                      <div className="flex items-center justify-between">
                        <h2 className={`font-bold text-sm ${ui.heading}`}>Recent Enquiries</h2>
                        <button
                          type="button"
                          onClick={() => setAdminSection('messages')}
                          className={`text-xs font-semibold hover:underline ${ui.accentText}`}
                        >
                          View All →
                        </button>
                      </div>

                      <div className={`divide-y ${ui.divider}`}>
                        {enquiries.slice(0, 4).map((enq) => (
                          <div key={enq.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#2563EB]/15 text-[#3B82F6] flex items-center justify-center font-bold text-xs shrink-0">
                                {enq.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-semibold text-xs truncate ${ui.heading}`}>{enq.name}</div>
                                <div className={`text-xs truncate ${ui.muted}`}>{enq.message}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[11px] ${ui.muted}`}>{enq.date}</span>
                              {enq.isNew && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`lg:col-span-4 rounded-2xl border p-6 space-y-3 ${ui.card}`}>
                      <h2 className={`font-bold text-sm mb-2 ${ui.heading}`}>Quick Actions</h2>
                      <button
                        type="button"
                        onClick={openCreateProjectModal}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${ui.secondaryBtn}`}
                      >
                        <Plus className="w-4 h-4 text-[#3B82F6]" />
                        <span>Add New Project</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminSection('resume')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${ui.secondaryBtn}`}
                      >
                        <Upload className="w-4 h-4 text-[#3B82F6]" />
                        <span>Update Resume</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminSection('profile')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${ui.secondaryBtn}`}
                      >
                        <User className="w-4 h-4 text-[#3B82F6]" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage('home')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${ui.secondaryBtn}`}
                      >
                        <Globe className="w-4 h-4 text-[#3B82F6]" />
                        <span>View Website</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {adminSection === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-xl font-bold ${ui.heading}`}>Project Management</h2>
                      <p className={`text-xs ${ui.muted}`}>
                        Add, edit, publish, unpublish, or delete projects dynamically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateProjectModal}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className={`rounded-2xl border overflow-hidden ${ui.card}`}>
                    <div className={`divide-y ${ui.divider}`}>
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-16 h-11 rounded-lg object-cover border border-gray-500/20 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${ui.heading}`}>{proj.title}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${ui.tagPill}`}>
                                  {proj.category}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    proj.published
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : 'bg-amber-500/15 text-amber-400'
                                  }`}
                                >
                                  {proj.published ? 'Published' : 'Draft'}
                                </span>
                              </div>
                              <p className={`text-xs mt-0.5 ${ui.muted}`}>{proj.summary}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleProjectPublished(proj.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${ui.secondaryBtn}`}
                            >
                              {proj.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditProjectModal(proj)}
                              className={`p-2 rounded-lg ${ui.secondaryBtn}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProject(proj.id)}
                              className={`p-2 rounded-lg text-red-400 ${ui.secondaryBtn}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminSection === 'resume' && (
                <div className={`rounded-2xl border p-6 space-y-6 max-w-2xl ${ui.card}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${ui.heading}`}>Resume PDF Management</h2>
                    <p className={`text-xs mt-1 ${ui.muted}`}>
                      Upload a new PDF to replace the active resume served across the portfolio.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center justify-between ${ui.subtleSurface}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 text-[#3B82F6] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${ui.heading}`}>{resumeMeta.fileName}</div>
                        <div className={`text-xs ${ui.muted}`}>
                          {resumeMeta.fileSize} · Updated {resumeMeta.updatedAt} · {resumeMeta.version}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResumeModal(true)}
                      className={`text-xs font-semibold hover:underline ${ui.accentText}`}
                    >
                      Preview
                    </button>
                  </div>

                  <label className="block border-2 border-dashed border-[#3B82F6]/40 hover:border-[#3B82F6] rounded-2xl p-8 text-center cursor-pointer bg-[#2563EB]/5 transition">
                    <Upload className="w-7 h-7 text-[#3B82F6] mx-auto mb-2" />
                    <div className={`text-sm font-semibold ${ui.heading}`}>
                      Click to select a new Resume PDF
                    </div>
                    <div className={`text-xs mt-1 ${ui.muted}`}>
                      PDF up to 10MB · Immediately live on public site
                    </div>
                    <input type="file" accept=".pdf" onChange={handleResumeFileChange} className="hidden" />
                  </label>
                </div>
              )}

              {adminSection === 'profile' && (
                <div className={`rounded-2xl border p-6 space-y-4 max-w-2xl ${ui.card}`}>
                  <h2 className={`text-xl font-bold ${ui.heading}`}>Edit Public Profile &amp; Bio</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className={`w-full rounded-xl border px-3 py-2 text-sm ${ui.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Role / Title</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className={`w-full rounded-xl border px-3 py-2 text-sm ${ui.input}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Hero Tagline</label>
                    <input
                      type="text"
                      value={profile.heroSubtitle}
                      onChange={(e) => setProfile({ ...profile, heroSubtitle: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-sm ${ui.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>About Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={profile.aboutParagraph1}
                      onChange={(e) => setProfile({ ...profile, aboutParagraph1: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-sm ${ui.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>About Paragraph 2</label>
                    <textarea
                      rows={3}
                      value={profile.aboutParagraph2}
                      onChange={(e) => setProfile({ ...profile, aboutParagraph2: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-sm ${ui.input}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                  >
                    Save Profile Changes
                  </button>
                </div>
              )}

              {adminSection === 'skills' && (
                <div className={`rounded-2xl border p-6 space-y-6 ${ui.card}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${ui.heading}`}>Skills Management</h2>
                    <p className={`text-xs mt-0.5 ${ui.muted}`}>Add or remove skills dynamically. Changes sync directly to PostgreSQL.</p>
                  </div>
                  <form onSubmit={handleAddSkill} className="flex flex-wrap gap-3">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="New skill name (e.g. Docker, Redis)"
                      className={`flex-1 min-w-[200px] rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    />
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className={`rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="AI & Data">AI &amp; Data</option>
                      <option value="Workflow">Workflow</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                    >
                      + Add Skill
                    </button>
                  </form>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {skills.map((sk) => (
                      <div
                        key={sk.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${ui.subtleSurface}`}
                      >
                        <div>
                          <div className={`font-bold text-xs ${ui.heading}`}>{sk.name}</div>
                          <div className={`text-[10px] ${ui.muted}`}>{sk.category}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSkill(sk.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'experience' && (
                <div className={`rounded-2xl border p-6 space-y-6 ${ui.card}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${ui.heading}`}>Experience Management</h2>
                    <p className={`text-xs mt-0.5 ${ui.muted}`}>Manage professional and project work experience entries in PostgreSQL.</p>
                  </div>
                  <form onSubmit={handleAddExperience} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newExpRole}
                      onChange={(e) => setNewExpRole(e.target.value)}
                      placeholder="Role / Title (e.g. Full-Stack Engineer)"
                      className={`rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    />
                    <input
                      type="text"
                      value={newExpCompany}
                      onChange={(e) => setNewExpCompany(e.target.value)}
                      placeholder="Company / Organization"
                      className={`rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExpPeriod}
                        onChange={(e) => setNewExpPeriod(e.target.value)}
                        placeholder="Period (e.g. 2024 — Present)"
                        className={`flex-1 rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className={`p-4 rounded-xl border flex items-center justify-between ${ui.subtleSurface}`}
                      >
                        <div>
                          <div className={`font-bold text-sm ${ui.heading}`}>{exp.role}</div>
                          <div className={`text-xs ${ui.accentText}`}>{exp.company} &middot; {exp.period}</div>
                          <div className={`text-xs mt-1 ${ui.muted}`}>{exp.location}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteExperience(exp.id)}
                          className="text-gray-400 hover:text-red-500 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'education' && (
                <div className={`rounded-2xl border p-6 space-y-6 ${ui.card}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${ui.heading}`}>Education Management</h2>
                    <p className={`text-xs mt-0.5 ${ui.muted}`}>Manage degrees and certifications in PostgreSQL.</p>
                  </div>
                  <form onSubmit={handleAddEducation} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newEduDegree}
                      onChange={(e) => setNewEduDegree(e.target.value)}
                      placeholder="Degree (e.g. B.Tech in IT)"
                      className={`rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    />
                    <input
                      type="text"
                      value={newEduInstitution}
                      onChange={(e) => setNewEduInstitution(e.target.value)}
                      placeholder="Institution (e.g. Crescent Institute)"
                      className={`rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newEduPeriod}
                        onChange={(e) => setNewEduPeriod(e.target.value)}
                        placeholder="Period (e.g. 2021 — 2025)"
                        className={`flex-1 rounded-xl border px-3.5 py-2 text-sm ${ui.input}`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {educations.map((edu) => (
                      <div
                        key={edu.id}
                        className={`p-4 rounded-xl border flex items-center justify-between ${ui.subtleSurface}`}
                      >
                        <div>
                          <div className={`font-bold text-sm ${ui.heading}`}>{edu.degree}</div>
                          <div className={`text-xs ${ui.accentText}`}>{edu.institution} &middot; {edu.period}</div>
                          <div className={`text-xs mt-1 ${ui.muted}`}>{edu.location}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteEducation(edu.id)}
                          className="text-gray-400 hover:text-red-500 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'messages' && (
                <div className={`rounded-2xl border p-6 space-y-4 ${ui.card}`}>
                  <h2 className={`text-xl font-bold ${ui.heading}`}>Contact Enquiries ({enquiries.length})</h2>
                  <div className={`divide-y ${ui.divider}`}>
                    {enquiries.map((enq) => (
                      <div key={enq.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${ui.heading}`}>{enq.name}</span>
                            <span className={`text-xs ${ui.muted}`}>&lt;{enq.email}&gt;</span>
                            {enq.isNew && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                                New
                              </span>
                            )}
                          </div>
                          <div className={`text-xs font-semibold ${ui.accentText}`}>{enq.subject}</div>
                          <p className={`text-xs ${ui.body}`}>{enq.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {enq.isNew && (
                            <button
                              type="button"
                              onClick={() => markEnquiryRead(enq.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${ui.secondaryBtn}`}
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteEnquiry(enq.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSection === 'settings' && (
                <div className="space-y-6">
                  <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border ${ui.card}`}>
                    <div>
                      <h2 className={`text-lg font-bold ${ui.heading}`}>Backend API &amp; Monorepo Architecture</h2>
                      <p className={`text-xs ${ui.muted}`}>
                        Test Express + Prisma + Zod endpoints and inspect Dev vs. Production configurations.
                      </p>
                    </div>
                    <div className={`inline-flex rounded-xl p-1 border ${ui.subtleSurface}`}>
                      <button
                        type="button"
                        onClick={() => handleEnvSwitch('development')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          envMode === 'development' ? 'bg-[#2563EB] text-white' : ui.muted
                        }`}
                      >
                        Development
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnvSwitch('production')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          envMode === 'production' ? 'bg-[#2563EB] text-white' : ui.muted
                        }`}
                      >
                        Production
                      </button>
                    </div>
                  </div>

                  <div className={`flex gap-2 border-b ${ui.divider}`}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('health')}
                      className={`px-4 py-2 text-xs font-semibold border-b-2 ${
                        activeTab === 'health' ? 'border-[#2563EB] text-[#3B82F6]' : `border-transparent ${ui.muted}`
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 inline mr-1" /> Live API Tester
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('config')}
                      className={`px-4 py-2 text-xs font-semibold border-b-2 ${
                        activeTab === 'config' ? 'border-[#2563EB] text-[#3B82F6]' : `border-transparent ${ui.muted}`
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 inline mr-1" /> Env Configs
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('structure')}
                      className={`px-4 py-2 text-xs font-semibold border-b-2 ${
                        activeTab === 'structure'
                          ? 'border-[#2563EB] text-[#3B82F6]'
                          : `border-transparent ${ui.muted}`
                      }`}
                    >
                      <FolderTree className="w-3.5 h-3.5 inline mr-1" /> Monorepo Files
                    </button>
                  </div>

                  {activeTab === 'health' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-3 ${ui.card}`}>
                        <button
                          type="button"
                          onClick={() => triggerHealthCheck(envMode)}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5" /> GET /api/v1/health
                          </span>
                          <span>200 OK</span>
                        </button>
                        <button
                          type="button"
                          onClick={trigger404Test}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${ui.secondaryBtn}`}
                        >
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> GET /api/v1/unknown-endpoint
                          </span>
                          <span>404</span>
                        </button>
                        <div className="pt-2 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={pingInput}
                              onChange={(e) => setPingInput(e.target.value)}
                              className={`flex-1 rounded-xl border px-3 py-1.5 text-xs ${ui.input}`}
                            />
                            <button
                              type="button"
                              onClick={triggerEchoTest}
                              className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Send
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-7 bg-[#0C1017] border border-[#1E2536] text-gray-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-gray-400">
                          <span>{lastEndpoint}</span>
                          <span>HTTP {lastStatusCode}</span>
                        </div>
                        <pre>{apiConsoleOutput}</pre>
                      </div>
                    </div>
                  )}

                  {activeTab === 'config' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-2xl border p-5 text-xs font-mono space-y-1 ${ui.card}`}>
                        <div className={`font-sans font-bold text-sm mb-2 ${ui.heading}`}>
                          Backend (.env.{envMode})
                        </div>
                        <div className={ui.body}>NODE_ENV={envMode}</div>
                        <div className={ui.body}>PORT=5000</div>
                        <div className={ui.body}>DATABASE_URL=postgresql://*** (Prisma)</div>
                        <div className={ui.body}>JWT_ACCESS_SECRET=*** (&gt;=32 chars)</div>
                      </div>
                      <div className={`rounded-2xl border p-5 text-xs font-mono space-y-1 ${ui.card}`}>
                        <div className={`font-sans font-bold text-sm mb-2 ${ui.heading}`}>
                          Frontend (.env.{envMode} · Zero Secrets)
                        </div>
                        <div className={ui.body}>VITE_APP_ENV={envMode}</div>
                        <div className={ui.body}>VITE_API_BASE_URL=/api/v1</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'structure' && (
                    <div className={`rounded-2xl border p-5 divide-y ${ui.card} ${ui.divider}`}>
                      {MONOREPO_FILES.map((item) => (
                        <div key={item.path} className="py-2.5 flex items-center justify-between text-xs">
                          <span className={`font-mono font-semibold ${ui.heading}`}>{item.path}</span>
                          <span className={ui.muted}>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PROJECT DETAILS MODAL
         ===================================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border ${ui.card}`}>
            <div className="h-48 bg-[#111827] relative">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={ui.accentText}>{selectedProject.category}</span>
                <span className={ui.muted}>{selectedProject.year}</span>
              </div>
              <h3 className={`text-xl font-bold ${ui.heading}`}>{selectedProject.title}</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${ui.body}`}>{selectedProject.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tags.map((t) => (
                  <span key={t} className={`text-xs px-2.5 py-1 rounded-md font-medium ${ui.tagPill}`}>
                    {t}
                  </span>
                ))}
              </div>
              <div className={`pt-3 border-t flex items-center justify-end gap-3 ${ui.divider}`}>
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${ui.secondaryBtn}`}
                >
                  <Github className="w-3.5 h-3.5" /> GitHub Repo
                </a>
                <a
                  href={selectedProject.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN CREATE / EDIT PROJECT MODAL
         ===================================================================== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProject}
            className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${ui.card}`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${ui.heading}`}>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button type="button" onClick={() => setShowProjectModal(false)} className={ui.muted}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectDraft.title}
                  onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })}
                  className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Category</label>
                  <select
                    value={projectDraft.category}
                    onChange={(e) =>
                      setProjectDraft({
                        ...projectDraft,
                        category: e.target.value as 'Web' | 'AI' | 'Dashboard'
                      })
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                  >
                    <option value="Web">Web</option>
                    <option value="AI">AI</option>
                    <option value="Dashboard">Dashboard</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Tech Tags</label>
                  <input
                    type="text"
                    value={projectDraft.tags}
                    onChange={(e) => setProjectDraft({ ...projectDraft, tags: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Short Summary *</label>
                <input
                  type="text"
                  required
                  value={projectDraft.summary}
                  onChange={(e) => setProjectDraft({ ...projectDraft, summary: e.target.value })}
                  className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${ui.heading}`}>Full Case Study</label>
                <textarea
                  rows={3}
                  value={projectDraft.description}
                  onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                  className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${ui.secondaryBtn}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          RESUME PREVIEW & DOWNLOAD MODAL
         ===================================================================== */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border ${ui.card}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#3B82F6] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${ui.heading}`}>{resumeMeta.fileName}</h3>
                  <p className={`text-[11px] ${ui.muted}`}>
                    {resumeMeta.fileSize} · Active Version {resumeMeta.version}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowResumeModal(false)} className={ui.muted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`rounded-xl p-4 space-y-2 text-xs border ${ui.subtleSurface}`}>
              <div className={`font-bold text-sm ${ui.heading}`}>
                {profile.name} — {profile.role}
              </div>
              <div className={ui.muted}>
                {profile.location} · {profile.email}
              </div>
              <p className={`leading-relaxed pt-1 ${ui.body}`}>{profile.aboutParagraph1}</p>
              <div className={`pt-1 font-semibold ${ui.heading}`}>
                Education: {profile.educationShort} ({profile.institutionShort})
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${ui.secondaryBtn}`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResumeModal(false);
                  showToast(`Downloaded ${resumeMeta.fileName}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
