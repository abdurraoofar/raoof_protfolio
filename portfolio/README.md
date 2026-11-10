# Dynamic Personal Portfolio & Admin Dashboard — Monorepo Foundation

Full-stack TypeScript monorepo containing the public portfolio SPA, secure `/admin` dashboard foundation, Express + Prisma + Zod REST API backend, and system architecture specifications.

## Directory Structure

```
portfolio/
├── backend/       # Node.js + Express.js + TypeScript + Prisma + PostgreSQL + Zod
├── frontend/      # React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide React
├── docs/          # System Architecture, Database Schema, API Docs, Development Plan
└── scripts/       # Monorepo build, dev orchestration, and automated health verification
```

## Security & Environment Configuration

- **Backend**: Loads `.env.development` or `.env.production` based on `NODE_ENV` and validates every variable at startup using **Zod** (`backend/src/config/env.ts`). Database credentials, JWT secrets, and Cloudinary API keys live strictly on the backend.
- **Frontend**: Contains **zero secrets**. Only public `VITE_*` variables (`VITE_API_BASE_URL`, `VITE_APP_ENV`, `VITE_APP_TITLE`, `VITE_ENABLE_DEBUG`) are exposed to the client bundle, with runtime guards (`frontend/src/config/env.ts`) verifying that no private keys are accidentally injected.

## Quick Commands

- `npm run dev` — Starts both backend (port `5000`) and frontend (port `5173`) in development mode
- `npm run build` — Runs production builds for both `backend` (`dist/`) and `frontend` (`dist/`)
- `npm run start` — Runs compiled production builds for both applications
- `npm run lint` — Runs ESLint verification across backend and frontend
- `npm run test:health` — Automated integration test verifying `/api/v1/health`, Zod validation errors, 404 handler, and production mode
