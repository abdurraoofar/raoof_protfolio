# Abdur Raoof A R &mdash; Full-Stack Portfolio & Admin Monorepo

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)

Full-stack TypeScript monorepo containing a modern personal portfolio SPA, protected `/admin` dashboard, and Express + Prisma + Zod REST API backend connected to PostgreSQL.

---

## 🌟 Key Features

- **Public Portfolio SPA**: Modern, high-contrast light/dark mode UI with zero invisible text, category filters (`All`, `Web`, `AI`, `Dashboard`), resume PDF preview modal, and dynamic contact inquiries.
- **Secure `/admin` Management Dashboard**: JWT token authentication, real-time live data persistence in PostgreSQL for projects, skills, experience, education, profile metadata, and contact message management.
- **Robust REST API Backend**: Type-safe REST endpoints built with Express, Prisma ORM, and Zod runtime schema validation, protected by Helmet and security rate limiting.
- **100% Free Cloud Deployment Ready**: Pre-configured for deployment with **Neon** (PostgreSQL), **Render** (Node.js API), and **Vercel** (Vite React frontend).

---

## 📁 Monorepo Structure

```text
portfolio/
├── backend/       # Express + TypeScript + Prisma ORM + PostgreSQL + Zod API
├── frontend/      # React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
├── docs/          # Architecture, Database Schema, and API specifications
└── scripts/       # Monorepo build, dev orchestration, and E2E verification
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js &ge; 18
- Local PostgreSQL instance running on port `5432` with a database named `portfolio_db`

### 1. Clone & Install
```powershell
git clone https://github.com/abdurraoofar/raoof_protfolio.git
cd raoof_protfolio/portfolio
npm install
```

### 2. Configure Environment
Copy `.env.example` in both `backend` and `frontend`:
```powershell
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your PostgreSQL database credentials:
```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/portfolio_db?schema=public"
ADMIN_EMAIL="admin@portfolio.local"
ADMIN_INITIAL_PASSWORD="your_secure_password"
JWT_ACCESS_SECRET="your_long_32_character_jwt_access_secret"
```

### 3. Run Database Migrations & Seed
```powershell
cd backend
npx prisma migrate deploy
npx prisma db seed
cd ..
```

### 4. Start Development Servers
```powershell
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/v1`
- Admin Portal: `http://localhost:5173/admin`

---

## 🌐 1-Click Free Cloud Deployment

This repository is pre-configured for deployment across free tiers:
1. **Database**: [Neon.tech](https://neon.tech) (Free PostgreSQL &mdash; no credit card required)
2. **Backend**: [Render.com](https://render.com) (Free Web Service utilizing root `render.yaml`)
3. **Frontend**: [Vercel.com](https://vercel.com) (Free Vite React hosting using `portfolio/frontend/vercel.json`)
