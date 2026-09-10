# LASTRO MVP — Setup and Development Guide

## Overview

LASTRO is a land analysis and acquisition viability tool built with:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod (shared schemas across frontend and backend)

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (local or remote)

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd LASTRO
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your database URL:
   ```bash
   cp .env.example .env
   ```
   
   For Replit:
   - Activate the PostgreSQL addon in the Replit panel
   - The `DATABASE_URL` will be auto-injected into `.env`
   
   For local development:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/lastro_dev"
   ```

4. Generate JWT secrets (run once):
   ```bash
   openssl rand -base64 32  # for JWT_SECRET
   openssl rand -base64 32  # for JWT_REFRESH_SECRET
   ```
   
   Add both to your `.env` file.

5. Setup the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

### Development

Start the dev server (Vite frontend + Express backend with hot reload):

```bash
npm run dev
```

- Frontend runs on: http://localhost:5173
- Backend API runs on: http://localhost:3000
- API Proxy: `/api` on frontend routes to `http://localhost:3000`
- Health check: http://localhost:3000/api/v1/health

### Production Build

```bash
npm run build
npm start
```

Builds the React app to `dist/public/` and starts Express server on port 3000, serving both API and static files from the same port.

## Architecture

### Single-Port Monolith (Production)
- One Express process serves both `/api/v1/*` REST endpoints and static frontend files
- Eliminates CORS complexity and simplifies deployment on Replit
- Dev uses Vite proxy (`/api` → `localhost:3000`); production uses same-origin

### Shared Validation
- Zod schemas in `/shared/schemas/` used by both frontend and backend
- Eliminates duplication of validation rules
- Single source of truth for data contracts

### Adapter Pattern (External Data)
- `MarketDataAdapter` and `CubDataAdapter` interfaces with pluggable implementations:
  - `StaticAdapter`: JSON-based (default, no external dependencies)
  - `HttpAdapter`: For real APIs (only after confirmation they exist)
- Toggled via `.env` variables: `FIPEZAP_ADAPTER`, `CUB_ADAPTER`

## Project Structure

```
LASTRO/
├── src/                      # React frontend
│   ├── components/           # React components (will be organized per phase)
│   ├── pages/               # Page components
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles and Tailwind config
│   ├── utils/               # Utility functions
│   └── main.tsx             # Entry point
├── server/                  # Node.js/Express backend
│   ├── routes/              # API route handlers
│   ├── controllers/         # Business logic
│   ├── middleware/          # Express middleware (auth, logging, etc)
│   ├── models/              # Data models
│   ├── services/            # Service layer (adapters, calculations)
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   └── index.ts             # Express setup
├── shared/                  # Code shared by frontend and backend
│   └── schemas/             # Zod validation schemas
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Auto-generated migrations
│   └── seed.ts              # Database seed
├── e2e/                     # Playwright E2E tests
├── __tests__/               # Unit and integration tests
├── index.html               # Vite entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── package.json             # Project dependencies
└── README.md                # This file
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run dev:server` | Start only Express backend |
| `npm run dev:client` | Start only Vite frontend |
| `npm run build` | Build frontend and prepare for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

## Environment Variables

See `.env.example` for required variables:

```
DATABASE_URL         # PostgreSQL connection string (auto-injected on Replit)
JWT_SECRET          # 32-char random string for access tokens
JWT_REFRESH_SECRET  # 32-char random string for refresh tokens
NODE_ENV            # development or production
PORT                # Server port (default 3000)
FIPEZAP_ADAPTER     # static (default) or http
CUB_ADAPTER         # static (default) or http
```

## Deployment on Replit

1. Create a new Replit project with Node.js runtime
2. Add PostgreSQL addon (auto-injects `DATABASE_URL`)
3. Generate secrets and add to Secrets panel (`.env`)
4. Deploy with native Replit Deployments (no Docker needed)

## API Documentation

### Authentication (Phase 1)
- `POST /api/v1/auth/signup` — Register new user
- `POST /api/v1/auth/login` — Login with email/password
- `POST /api/v1/auth/refresh` — Get new access token
- `GET /api/v1/auth/me` — Get current user info

### Parameters (Phase 2)
- `GET /api/v1/parameters/tipologies` — List all tipologies
- `GET /api/v1/parameters/cub-adjustments` — Get CUB adjustments
- `GET /api/v1/data/market-prices` — Get market pricing data

### Analyses (Phase 4)
- `POST /api/v1/analyses` — Create new analysis
- `GET /api/v1/analyses` — List user's analyses
- `GET /api/v1/analyses/:id` — Get analysis details
- `DELETE /api/v1/analyses/:id` — Delete analysis

### Export (Phase 8)
- `POST /api/v1/export/pdf` — Generate PDF export
- `GET /api/v1/export/html/:id` — Get public HTML result

## Development Workflow

### Adding a new feature:
1. Create feature branch from `main`
2. Implement changes following the phase structure
3. Test locally (`npm run dev`, `npm test`)
4. Commit with clear message (see commit guidelines below)
5. Push and open pull request

### Commit Message Format:
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Troubleshooting

### Database migration fails
- Check that `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running
- Try `npm run db:migrate -- --skip-generate`

### Port 3000 already in use
- Use `PORT=3001 npm run dev` to use a different port
- Or kill the process using the port: `lsof -i :3000 | kill -9`

### Vite proxy not working
- Ensure Express is running on port 3000
- Check firewall settings
- Restart both dev servers

## Phase-Based Development

This project is built in 12 phases. Each phase:
- Delivers testable features
- Updates relevant documentation
- Includes automated tests
- Follows architectural decisions from plan.md

See `plan.md` for complete phase details and dependencies.

## References

- **CLAUDE.md** — Project vision and technical decisions
- **PRD.md** — Product requirements and specifications
- **plan.md** — 12-phase implementation roadmap with detailed requirements
- **phaseTable.md** — Quick reference table of all phases

---

**Status:** Phase 0 Complete ✓  
**Last Updated:** September 2026
