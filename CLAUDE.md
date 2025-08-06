# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (Next.js on port 3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (extends next/core-web-vitals)
- `npm run type-check` - Run TypeScript type checking with `tsc --noEmit`

**Testing:** No test framework is currently configured in this project.

## Architecture & Structure

DocVault is a Next.js 14 application using the App Router pattern with TypeScript, Tailwind CSS, and Supabase as the backend.

### Core Technology Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, API)
- **UI Components:** shadcn/ui components
- **Form Handling:** React Hook Form with Zod validation
- **Authentication:** Supabase Auth with custom middleware

### Application Structure
- **Route Organization:** Uses Next.js App Router with route groups
  - `(auth)/` - Authentication pages (signin, signup, reset-password, update-password)
  - `dashboard/` - Main application interface (protected route)
- **Component Organization:**
  - `components/ui/` - Base UI components from shadcn/ui
  - `components/forms/` - Form components with validation
  - `components/document/` - Document-specific components
  - `components/layout/` - Layout and navigation components

### Key Architecture Patterns

**Supabase Integration:**
- Client-side: `src/lib/supabase/client.ts` using `createBrowserClient`
- Server-side: `src/lib/supabase/server.ts` using `createServerClient` 
- Database types: `src/types/database.ts` contains generated TypeScript types for tables

**Authentication Flow:**
- Middleware (`middleware.ts`) protects routes and handles redirects
- Protected routes: `/dashboard`, `/documents`, `/settings`
- Auth routes: `/auth/signin`, `/auth/signup`, `/auth/reset-password`
- Special handling for `/auth/update-password` (requires auth for password reset flow)

**Database Schema:**
- `profiles` table: User profiles with subscription tiers (freemium model)
- `documents` table: Document metadata with encryption, categories, tags, and expiry dates
- Row Level Security (RLS) enabled for both tables

**Validation & Types:**
- Zod schemas in `src/lib/validations/` for form and data validation
- TypeScript types in `src/types/` for application-wide type safety

### Environment Configuration
Required environment variables (see `env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `ENCRYPTION_KEY` - Document encryption key

### Development Notes
- ESLint configuration extends `next/core-web-vitals` with additional rules
- Images configured for Supabase storage domain patterns
- Uses French language for UI text and documentation
- Implements freemium model (5 free documents, then subscription required)