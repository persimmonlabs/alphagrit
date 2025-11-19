# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Alpha Grit is a production-ready Next.js 14 e-commerce platform for selling e-books.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Payments**: Stripe.
- **Emails**: Resend + React Email.

## Common Commands
- **Development**: `npm run dev` - Starts the local development server at http://localhost:3000.
- **Build**: `npm run build` - Builds the application for production.
- **Lint**: `npm run lint` - Runs ESLint.
- **Type Check**: `npm run type-check` - Runs TypeScript compiler check.
- **Testing**: No test framework is currently configured.

## Architecture & Structure

### Key Directories
- **/app**: Next.js App Router pages and layouts.
  - `/(store)`: Public store routes.
  - `/account`: Protected user account routes.
  - `/auth`: Authentication routes (signin, signup, callback).
  - `/api`: API routes (webhooks, etc.).
- **/components**: React components.
  - `/ui`: Reusable UI components (shadcn/ui).
  - `/store`: Store-specific components.
  - `/providers`: React Context providers.
- **/lib**: Core logic and utilities.
  - `/actions`: Server Actions for mutations.
  - `/supabase`: Supabase client initialization.
  - `/utils.ts`: General utilities.
- **/emails**: React Email templates.
- **/supabase/migrations**: SQL migrations for the database.
- **/types**: TypeScript type definitions (including generated Supabase types).

### Data Flow & Patterns
- **Data Fetching**: Uses Server Components for fetching data where possible.
- **Mutations**: Uses Server Actions (`/lib/actions`) for form submissions and data updates.
- **Authentication**: Managed via Supabase Auth; Middleware (`middleware.ts`) protects routes.
- **Database**: All tables are protected by Row Level Security (RLS) policies.

### Design System
- **Colors**: Primary Orange (#f97316), Accent Red (#ef4444).
- **Theme**: Supports Light/Dark mode via `next-themes`.
