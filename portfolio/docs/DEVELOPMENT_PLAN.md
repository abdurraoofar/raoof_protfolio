# Dynamic Portfolio & Admin Dashboard — Master Development Plan

## 1. Executive Summary & Architectural Scope

This document defines the comprehensive engineering and execution plan for a production-grade personal portfolio website paired with a decoupled, highly secure administrative dashboard (`/admin`). 

The system enables the developer to showcase skills, projects, experience, and contact forms to public recruiters and clients, while providing real-time, dynamic content management without redeploying frontend assets.

### Core Stack Alignment
* **Frontend**: React 18+ with TypeScript, Vite (build tool), Tailwind CSS, Framer Motion (fluid micro-interactions and transitions), Lucide React (iconography), React Router v6 (client routing).
* **Backend**: Node.js with Express.js, TypeScript, RESTful API architecture.
* **Database & ORM**: PostgreSQL with Prisma ORM.
* **Authentication**: Zero-trust administrator authentication with JWT (short-lived access tokens, encrypted HTTP-only refresh tokens), bcrypt password hashing, and rate limiting.
* **Validation**: End-to-end type safety via Zod schemas shared between frontend and backend.
* **Asset Storage**: Cloudinary or Supabase Storage for project screenshots, avatars, and resume PDFs with automatic replacement and versioning.
* **Form & Communication**: React Hook Form with Zod resolver on client; server-side email dispatch (Nodemailer / Resend) with fallback to EmailJS.
* **Hosting Targets**: Vercel (Frontend SPA), Render/Railway/VPS (Express Backend), Supabase/Neon (Managed PostgreSQL).

---

## 2. Monorepo Project Structure & Topology

A clean, decoupled monorepo topology ensures strict separation of concerns, reusability of Zod validation contracts, and independent deployment cycles.

```
portfolio-monorepo/
├── package.json                 # Root workspace orchestration
├── tsconfig.base.json           # Shared base TypeScript config
├── .gitignore
├── .env.example
├── shared/                      # Shared contracts between Client & Server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── types/               # TypeScript interfaces & DTOs
│       └── schemas/             # Zod validation schemas (forms & API payloads)
│           ├── auth.schema.ts
│           ├── profile.schema.ts
│           ├── project.schema.ts
│           ├── skill.schema.ts
│           ├── contact.schema.ts
│           └── index.ts
├── server/                      # Express.js REST API Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions
│   │   ├── migrations/          # Managed SQL migrations
│   │   └── seed.ts              # Idempotent database seed script
│   └── src/
│       ├── config/              # Environment & service clients (Prisma, Cloudinary)
│       ├── constants/           # HTTP status codes, error messages, roles
│       ├── controllers/         # HTTP request/response handlers
│       │   ├── auth.controller.ts
│       │   ├── public.controller.ts
│       │   ├── admin.controller.ts
│       │   └── upload.controller.ts
│       ├── middlewares/         # Auth, validation, rate-limiting, error handlers
│       │   ├── authenticate.ts
│       │   ├── validate.ts
│       │   ├── rateLimiter.ts
│       │   └── errorHandler.ts
│       ├── routes/              # Express route definitions
│       │   ├── index.ts
│       │   ├── auth.routes.ts
│       │   ├── public.routes.ts
│       │   └── admin.routes.ts
│       ├── services/            # Core business logic & database interactions
│       │   ├── auth.service.ts
│       │   ├── profile.service.ts
│       │   ├── project.service.ts
│       │   ├── upload.service.ts
│       │   └── email.service.ts
│       ├── utils/               # JWT helpers, crypto hashing, logger
│       └── app.ts               # Express application entrypoint
└── client/                      # React + TypeScript + Vite SPA
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── assets/              # Static branding, user headshot, icons
        ├── components/          # Reusable UI primitives (Buttons, Modals, Cards)
        │   ├── ui/
        │   └── shared/
        ├── context/             # AuthContext, ToastContext, ThemeContext
        ├── hooks/               # Custom hooks (useAuth, useDebounce, useMediaQuery)
        ├── layouts/             # PublicLayout (Navbar/Footer) & AdminLayout (Sidebar)
        ├── pages/
        │   ├── public/          # Landing, ProjectDetail, NotFound
        │   └── admin/           # Dashboard, Projects, Profile, Skills, Enquiries
        ├── services/            # Axios/Fetch API client with auto-refresh interceptors
        ├── styles/              # Global CSS & Tailwind layers
        ├── types/               # Frontend-specific UI state types
        └── App.tsx              # Router root & providers
```

---

## 3. Phased Implementation Roadmap

### Phase 0: Workspace Setup & Foundational Tooling
* **Milestone 0.1**: Initialize monorepo root with `npm workspaces` (or `pnpm`).
* **Milestone 0.2**: Configure strict TypeScript compiler options (`noImplicitAny`, `strictNullChecks`, `isolatedModules`).
* **Milestone 0.3**: Set up Tailwind CSS with the custom design system:
  * Primary background: `#0A0D0B` (rich deep dark)
  * Elevated surfaces/cards: `#121614`
  * Card borders: `#222924`
  * Vibrant emerald green accent: `#00E599` / `#10B981`
  * Muted text: `#929D96`
  * Typography: Inter / Geist fonts.
* **Milestone 0.4**: Configure ESLint, Prettier, and environment variable schema validation via Zod.

### Phase 1: Database Architecture & Prisma ORM Layer
* **Milestone 1.1**: Model relational schema in `server/prisma/schema.prisma` covering Admin, Profile, Projects, Skills, Experience, Education, Social Links, Contact Enquiries, and Audit Logs.
* **Milestone 1.2**: Generate and execute initial database migration via `prisma migrate dev`.
* **Milestone 1.3**: Build idempotent seed script (`prisma/seed.ts`) populating:
  * Initial superadmin credentials (argon2/bcrypt hashed).
  * Profile defaults (Chennai, India; IT Graduate bio; open to work status badge).
  * Foundational skill categories (Frontend, Full-Stack, Database, AI-assisted development).
  * Initial demo projects and social media links.

### Phase 2: Backend REST API & Authentication Engine
* **Milestone 2.1**: Establish layered Express architecture (Controllers, Services, Repositories).
* **Milestone 2.2**: Implement JWT-based authentication system:
  * Short-lived Access Token (15 minutes) sent in Authorization header or memory.
  * Long-lived Refresh Token (7 days) stored in secure, `httpOnly`, `SameSite=Strict` cookie.
  * Silent token refresh rotation mechanism.
* **Milestone 2.3**: Implement security middleware:
  * `helmet` for HTTP security headers.
  * `cors` with strict origin whitelisting.
  * `express-rate-limit` with aggressive limits on `/api/v1/auth/login` (5 attempts per 15 min) and `/api/v1/public/contact` (3 submissions per hour per IP).
* **Milestone 2.4**: Build generic validation middleware parsing incoming requests against shared Zod schemas (`validateBody`, `validateQuery`, `validateParams`).

### Phase 3: Cloud Storage & Media Management Subsystem
* **Milestone 3.1**: Integrate Cloudinary or Supabase Storage SDK in `upload.service.ts`.
* **Milestone 3.2**: Configure `multer` memory storage with strict file filters:
  * PDFs: `application/pdf`, max size 10MB.
  * Images: `image/jpeg`, `image/png`, `image/webp`, max size 5MB.
* **Milestone 3.3**: Implement atomic resume replacement workflow:
  * Accepts new PDF upload.
  * Uploads to cloud storage bucket under folder `portfolio/resumes/`.
  * Deletes previous resume asset ID from cloud storage.
  * Updates `Profile.resumeUrl` and `Profile.resumeUpdatedAt` inside a database transaction.
* **Milestone 3.4**: Implement project image uploads with automatic WebP conversion and responsive thumbnail generation.

### Phase 4: Secure Admin Portal (`/admin`)
* **Milestone 4.1**: Build dedicated `AdminLayout` with responsive collapsible sidebar, breadcrumbs, session status, and quick logout.
* **Milestone 4.2**: Implement route protection (`ProtectedRoute.tsx`) redirecting unauthorized visitors to `/admin/login`.
* **Milestone 4.3**: Build administrative modules:
  * **Profile & Resume Manager**: Update headline, bio, contact email, location pill, and one-click drag-and-drop resume PDF replacement with live preview.
  * **Project Management CRUD**: Create, edit, preview, reorder (drag-and-drop), toggle publication status, and delete projects. Rich markdown editor for technical case studies.
  * **Skills, Experience & Education**: Interactive tabular cards with category filtering, proficiency level sliders, and display order adjustments.
  * **Social Links & Presence**: Manage active URLs, platforms, and visibility toggles.
  * **Contact Enquiries Inbox**: View customer submissions, mark as read/replied, view client IP/timestamp, add internal notes.

### Phase 5: Public Portfolio Website (High-End UX)
* **Milestone 5.1**: Build Hero Section mirroring the reference aesthetic:
  * Deep dark background `#0A0D0B` with subtle radial emerald glow aura.
  * Bold typography assertion ("Building Scalable Digital Products & Intelligent Systems").
  * Status badge: "Chennai, India · Open to IT opportunities & freelance projects".
  * Primary neon pill button ("View Projects" / "Get In Touch") and secondary outline button ("Download Resume").
  * Dynamic metric counters (projects delivered, experience, technologies mastered).
  * Rounded portrait frame integrating the developer's professional photo with emerald backdrop glow.
* **Milestone 5.2**: About Section integrating the specified copy with highlighted tech pills and interactive resume preview modal.
* **Milestone 5.3**: Projects Showcase:
  * Category tabs (All, Full-Stack, Frontend, AI-Assisted).
  * Project cards with hover zoom, technology chips, GitHub source link, and live demo link.
  * Detailed project drawer/modal rendering full case studies.
* **Milestone 5.4**: Experience & Education Timeline:
  * Clean vertical timeline with glowing active nodes, role summaries, and verified skill badges.
* **Milestone 5.5**: Skills Matrix:
  * Categorized groups (Frontend, Backend, Databases, AI Tools, DevOps).
* **Milestone 5.6**: Interactive Contact Section:
  * React Hook Form with Zod validation.
  * Instant feedback with toast notifications.
  * Anti-spam honeypot input and client rate limit check.
* **Milestone 5.7**: Micro-interactions & animations via Framer Motion:
  * Page reveal transitions, staggered card reveals, floating glow effects, scroll-linked progress indicator.

### Phase 6: Hardening, Performance Optimization & Deployment
* **Milestone 6.1**: End-to-end integration tests (Vitest + Supertest) covering auth flows, public data caching, and admin mutations.
* **Milestone 6.2**: Performance audit: Lighthouse score targets (>95 Performance, 100 Accessibility, 100 Best Practices, 100 SEO).
* **Milestone 6.3**: Production deployment:
  * Frontend: Vercel with automatic edge preview deployments.
  * Backend: Render / Railway with health check monitoring.
  * Database: Managed PostgreSQL (Supabase / Neon) with automated daily backups.
  * Cloud Storage: Production Cloudinary / Supabase bucket with CDN caching.

---

## 4. Verification & Acceptance Criteria Matrix

| Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- |
| **Public Portfolio** | Browser testing across desktop, tablet, and mobile viewports. | Responsive layout, dark emerald aesthetic, sub-1.5s First Contentful Paint. |
| **Secure /admin** | Security penetration check on unauthorized `/admin/*` routes. | Unauthenticated requests redirect to `/admin/login`; API returns 401/403. |
| **Resume PDF Upload** | Upload new PDF in dashboard; verify public download button. | Old file pruned from storage; public site serves updated PDF immediately. |
| **Project Management** | Add new project, toggle `isPublished=false`, verify public API. | Unpublished project hidden from public site; visible only in admin table. |
| **Dynamic Changes** | Edit bio or skill; observe public landing page. | Public UI reflects database updates without rebuilding frontend code. |
| **Contact Enquiry** | Submit valid and invalid inputs to `/api/v1/public/contact`. | Zod errors surfaced on client; valid message stored in DB & visible in admin inbox. |
| **Admin Auth Security** | Test brute force password attempts (6 rapid wrong passwords). | IP locked out for 15 minutes; credentials encrypted with bcrypt (rounds=12). |

---

## 5. Local Development Environment Checklist

```bash
# 1. Clone repository and install dependencies
git clone <repo-url>
cd portfolio-monorepo
npm install

# 2. Configure Environment Variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Initialize Database & Run Migrations
cd server
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start Full-Stack Dev Servers Concurrently
cd ..
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# Admin:    http://localhost:5173/admin
```