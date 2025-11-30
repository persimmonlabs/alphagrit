# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Alpha Grit is a production-ready Next.js 14 e-commerce platform for selling e-books.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI (Python, Clean Architecture/DDD).
- **Database**: Railway PostgreSQL.
- **Payments**: Stripe.
- **Emails**: Resend + React Email.

## Common Commands
- **Frontend Dev**: `npm run dev` - Starts the local development server at http://localhost:3000.
- **Backend Dev**: `cd backend && uvicorn src.main:app --reload --port 8000` - Starts FastAPI at http://localhost:8000.
- **Build**: `npm run build` - Builds the application for production.
- **Lint**: `npm run lint` - Runs ESLint.
- **Type Check**: `npm run type-check` - Runs TypeScript compiler check.
- **Backend Tests**: `cd backend && pytest` - Run all Python tests.

## Architecture & Structure

### Key Directories
- **/app**: Next.js App Router pages and layouts.
  - `/[lang]`: Localized public routes (en, pt).
  - `/admin`: Admin panel routes.
  - `/api`: API routes (webhooks, etc.).
- **/backend**: FastAPI backend (Clean Architecture).
  - `/src/domain`: Entities, abstract repositories.
  - `/src/application`: Use case services.
  - `/src/infrastructure`: SQLAlchemy repos, payment gateways.
  - `/src/api`: FastAPI endpoints.
- **/components**: React components.
  - `/ui`: Reusable UI components (shadcn/ui).
  - `/organisms`: Complex components.
  - `/templates`: Page templates.
- **/lib**: Core logic and utilities.
  - `/api-client.ts`: API client for FastAPI backend.
  - `/utils.ts`: General utilities.
- **/database**: PostgreSQL schema and documentation.

### Data Flow & Patterns
- **Frontend Data Fetching**: Uses Server Components where possible.
- **API Communication**: Frontend calls FastAPI backend via `lib/api-client.ts`.
- **Authentication**: JWT-based, handled by FastAPI backend.
- **Database**: Railway PostgreSQL with Row Level Security policies.

### Design System
- **Colors**: Primary Orange (#f97316), Accent Red (#ef4444).
- **Theme**: Supports Light/Dark mode via `next-themes`.
