# EventSphere — Campus Event Management System

> A full-stack, real-time campus event management platform built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Authentication](#authentication)
8. [API Reference](#api-reference)
9. [Pages & Routes](#pages--routes)
10. [Key Components](#key-components)
11. [Deployment](#deployment)

---

## Overview

**EventSphere** is a centralized college event management system that allows:

- **Students** to browse, search, and register for campus events (technical, cultural, sports).
- **Admins** to create, manage, and track events and registrations through a dashboard.

### Key Features

| Feature                     | Description                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| Role-based Authentication   | Separate student and admin login flows via Supabase Auth           |
| Admin Dashboard             | Overview stats, registration trends chart, recent registrations    |
| Event Management            | Create, edit, mark complete, and delete events                     |
| Student Registration        | One-click event registration with duplicate prevention             |
| Image Uploads               | Event poster uploads via AWS S3 pre-signed URLs                    |
| Protected Routes            | Middleware-based auth guard; unauthenticated users redirect to `/login` |
| Dynamic Sidebar             | Collapsible sidebar with real-time user info and logout            |
| 3D Landing Page             | Interactive Three.js particle background and lanyard animation     |
| Responsive Design           | Dark-themed, glassmorphism UI with Tailwind CSS v4                 |

---

## Tech Stack

| Layer          | Technology                                                         |
| -------------- | ------------------------------------------------------------------ |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack) |
| Language       | TypeScript 5.9                                                     |
| Database       | PostgreSQL via [Supabase](https://supabase.com/)                   |
| Authentication | Supabase Auth + `@supabase/ssr` (cookie-based SSR sessions)        |
| Styling        | Tailwind CSS v4, `tw-animate-css`, `class-variance-authority`      |
| UI Components  | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)         |
| Animations     | Framer Motion / Motion, React Three Fiber, Drei                    |
| File Storage   | AWS S3 (pre-signed upload URLs)                                    |
| Containerization | Docker (multi-stage build) + Nginx reverse proxy                 |

---

## Project Structure

```
eventsph/
├── public/                         # Static assets (SVGs, images)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (AuthProvider, fonts, metadata)
│   │   ├── page.tsx                # Landing page (hero, CTA, features)
│   │   ├── globals.css             # Global styles & Tailwind directives
│   │   ├── login/
│   │   │   ├── page.tsx            # Login/Signup UI (client component)
│   │   │   └── actions.ts          # Server Actions for login & signup
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Admin dashboard (stats, chart, table)
│   │   ├── admin/
│   │   │   ├── events/
│   │   │   │   └── page.tsx        # Manage events (CRUD table)
│   │   │   └── registrations/
│   │   │       └── page.tsx        # View all registrations
│   │   ├── student/
│   │   │   └── dashboard/
│   │   │       └── page.tsx        # Student dashboard
│   │   ├── explore/                # Public event browsing
│   │   ├── bookings/               # Student bookings
│   │   ├── auth/
│   │   │   └── signout/            # Sign-out route
│   │   └── api/                    # REST API routes
│   │       ├── events/             # GET /api/events, GET /api/events/:id
│   │       ├── register/           # POST /api/register, DELETE /api/register/:id
│   │       ├── admin/
│   │       │   ├── events/         # POST, PUT, DELETE admin event endpoints
│   │       │   └── registrations/  # GET all registrations (admin)
│   │       ├── auth/               # login, signup, logout, me, callback
│   │       ├── upload/             # S3 pre-signed URL generation
│   │       ├── seed/               # Database seeding endpoint
│   │       └── user/
│   │           └── profile/        # GET & PUT user profile
│   ├── components/
│   │   ├── admin-sidebar.tsx       # Dynamic admin sidebar (client component)
│   │   ├── auth-provider.tsx       # React context for auth state
│   │   ├── CreateEventModal.tsx    # Modal for creating events
│   │   ├── BookEventModal.tsx      # Modal for booking events
│   │   ├── ActionButtons.tsx       # Mark complete / delete event buttons
│   │   ├── ProfileEditModal.tsx    # Edit user profile modal
│   │   ├── hero-section.tsx        # Landing page hero
│   │   ├── call-to-action.tsx      # Landing page CTA section
│   │   ├── gl/                     # Three.js particle system
│   │   ├── ui/                     # shadcn/ui primitives (Button, Card, etc.)
│   │   └── motion-primitives/      # Animation utilities
│   └── lib/
│       ├── supabase.ts             # Supabase clients (public + admin)
│       ├── supabase/
│       │   ├── server.ts           # Server-side Supabase client (cookie-based)
│       │   ├── client.ts           # Browser-side Supabase client
│       │   └── middleware.ts       # Session refresh & route protection logic
│       ├── s3.ts                   # AWS S3 client singleton
│       └── utils.ts                # Utility functions (cn, etc.)
├── middleware.ts                    # Next.js middleware entry point
├── init.sql                         # Database schema (Event, Registration, Admin)
├── Dockerfile                       # Multi-stage Docker build
├── nginx.conf                       # Nginx reverse proxy config
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- A [Supabase](https://supabase.com/) project (free tier works)
- *(Optional)* AWS account for S3 image uploads
- *(Optional)* Docker for containerized deployment

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd eventsph

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase & AWS credentials (see below)

# 4. Set up the database
# Run init.sql in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

# 5. Start the development server
npm run dev
```

The app runs at **http://localhost:3000**.

### Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start dev server (Turbopack)         |
| `npm run build` | Production build                     |
| `npm run start` | Start production server              |
| `npm run lint`  | Run ESLint                           |

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase — Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key

# Supabase Service Role Key — Optional (enables admin client that bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS S3 — Optional (for event image uploads)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

| Variable | Required | Where to Find |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ✅ | Supabase → Project Settings → API → `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase → Project Settings → API → `service_role` key |
| `AWS_*` variables | Optional | AWS IAM Console |

---

## Database Schema

Run `init.sql` in your Supabase SQL Editor to create the tables.

### Event

| Column       | Type           | Description                           |
| ------------ | -------------- | ------------------------------------- |
| `id`         | UUID (PK)      | Auto-generated                        |
| `title`      | TEXT           | Event name                            |
| `description`| TEXT           | Event description                     |
| `date`       | TIMESTAMP      | Event date & time                     |
| `location`   | TEXT           | Venue                                 |
| `capacity`   | INTEGER        | Maximum registrations                 |
| `imageUrl`   | TEXT (nullable)| S3 poster image URL                   |
| `category`   | TEXT (nullable)| `Technical`, `Cultural`, `Sports`     |
| `organizer`  | TEXT           | Organizing department                 |
| `status`     | TEXT           | `UPCOMING`, `COMPLETED`, `CANCELLED`  |
| `createdAt`  | TIMESTAMP      | Auto-set                              |
| `updatedAt`  | TIMESTAMP      | Auto-set                              |

### Registration

| Column         | Type      | Description                         |
| -------------- | --------- | ----------------------------------- |
| `id`           | UUID (PK) | Auto-generated                      |
| `eventId`      | UUID (FK) | References `Event.id` (CASCADE)     |
| `studentName`  | TEXT      | Registered student's name           |
| `studentEmail` | TEXT      | Registered student's email          |
| `studentId`    | TEXT      | Student ID / roll number            |
| `status`       | TEXT      | `REGISTERED` or `ATTENDED`          |
| `createdAt`    | TIMESTAMP | Auto-set                            |
| `updatedAt`    | TIMESTAMP | Auto-set                            |

### Admin

| Column     | Type           | Description               |
| ---------- | -------------- | ------------------------- |
| `id`       | UUID (PK)      | Auto-generated            |
| `email`    | TEXT (UNIQUE)  | Admin email               |
| `name`     | TEXT (nullable)| Admin display name        |
| `createdAt`| TIMESTAMP      | Auto-set                  |

---

## Authentication

Authentication is handled by **Supabase Auth** with cookie-based SSR sessions via `@supabase/ssr`.

### Flow

```
┌─────────┐     Server Action      ┌──────────────────┐
│  Login   │ ──────────────────────▶│ supabase.auth     │
│  Page    │     (actions.ts)       │ .signInWithPassword│
└─────────┘                         └────────┬─────────┘
                                             │ Sets auth cookies
                                             ▼
                                    ┌──────────────────┐
                                    │   Middleware      │
                                    │ (session refresh) │
                                    │ + route protection│
                                    └──────────────────┘
```

### Key Files

| File | Purpose |
| --- | --- |
| `src/app/login/actions.ts` | Server Actions: `login()` and `signup()` |
| `src/middleware.ts` | Entry point for session refresh & protected routes |
| `src/lib/supabase/middleware.ts` | Session refresh logic, redirects unauthenticated users |
| `src/lib/supabase/server.ts` | Cookie-based Supabase client for Server Components & Actions |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/components/auth-provider.tsx` | React context providing `user`, `loading`, `signOut` |

### Protected Routes

The middleware redirects unauthenticated users to `/login` for all routes **except**:
- `/` (landing page)
- `/login`
- `/auth/*`
- `/api/*`

### Roles

- **Student**: Signs up/in → redirected to `/student/dashboard`
- **Admin**: Signs up/in → if email exists in `Admin` table → redirected to `/dashboard`

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/events` | List all events (sorted by date ascending) |
| `GET` | `/api/events/:id` | Get a single event by ID |

### Student Endpoints (Authenticated)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/register` | Register for an event |
| `DELETE` | `/api/register/:id` | Cancel a registration |
| `GET` | `/api/user/profile` | Get current user's profile |
| `PUT` | `/api/user/profile` | Update current user's profile |

### Admin Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/admin/events` | Create a new event |
| `PUT` | `/api/admin/events/:id` | Update an event |
| `DELETE` | `/api/admin/events/:id` | Delete an event |
| `GET` | `/api/admin/registrations` | List all registrations (with event details) |

### Auth Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sign in with email/password |
| `POST` | `/api/auth/signup` | Create a new account |
| `POST` | `/api/auth/logout` | Sign out (clears server cookies) |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/auth/callback` | OAuth callback handler |

### Utility Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/upload` | Generate S3 pre-signed upload URL |
| `POST` | `/api/seed` | Seed the database with sample data |

---

## Pages & Routes

| Route | Type | Auth | Description |
| --- | --- | --- | --- |
| `/` | Static | Public | Landing page with hero, features, CTA |
| `/login` | Static | Public | Login / Signup form with role toggle |
| `/dashboard` | Dynamic | Admin | Admin dashboard (stats, chart, registrations) |
| `/admin/events` | Dynamic | Admin | Event management table (CRUD) |
| `/admin/registrations` | Dynamic | Admin | All registrations table |
| `/student/dashboard` | Dynamic | Student | Student dashboard |
| `/explore` | Dynamic | Student | Browse and search events |
| `/bookings` | Dynamic | Student | View personal bookings |

---

## Key Components

### `AdminSidebar`
**File:** `src/components/admin-sidebar.tsx`
Client component used across all admin pages. Features:
- Collapsible sidebar (72px → 280px on hover)
- Active route highlighting
- Dynamic user info (name, email, initials) from `useAuth()`
- Logout button that clears both client and server sessions

### `AuthProvider`
**File:** `src/components/auth-provider.tsx`
React context wrapping the entire app (in `layout.tsx`). Provides:
- `user` — current Supabase user object (or `null`)
- `loading` — auth state loading flag
- `signOut()` — signs out from browser + calls `/api/auth/logout` to clear server cookies

### `CreateEventModal`
**File:** `src/components/CreateEventModal.tsx`
Modal form for admins to create new events with fields for title, description, date, location, capacity, category, organizer, and optional image upload.

### `BookEventModal`
**File:** `src/components/BookEventModal.tsx`
Modal for students to register for an event.

### UI Primitives
**Directory:** `src/components/ui/`
All shadcn/ui components (Button, Card, Table, Badge, Avatar, Input, Dialog, etc.) built on Radix UI.

---

## Deployment

### Docker

```bash
# Build the Docker image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key \
  -t eventsphere .

# Run the container
docker run -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  -e AWS_REGION=ap-south-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  -e AWS_S3_BUCKET_NAME=your-bucket \
  eventsphere
```

### Nginx (Production)

An `nginx.conf` is provided for reverse-proxying to the Next.js container:

```bash
# Assumes a Docker network with the Next.js container named "nextjs-app"
# Nginx listens on port 80 and proxies to nextjs-app:3000
```

### Supabase Setup Checklist

1. Create a new Supabase project
2. Run `init.sql` in the SQL Editor to create tables
3. Copy the Project URL and `anon` key to `.env.local`
4. *(Optional)* Disable email confirmation: **Auth → Providers → Email → Disable "Confirm email"**
5. *(Optional)* Insert an admin row: `INSERT INTO "Admin" (email, name) VALUES ('you@email.com', 'Your Name');`

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| `fetch failed` on login/signup | Your Supabase project is likely **paused**. Go to [app.supabase.com](https://app.supabase.com) and restore it. |
| `Module not found` build errors | Run `npm install` — `node_modules` may be missing or incomplete. |
| Middleware deprecation warning | Next.js 16 shows a warning about `middleware` → `proxy`. This is cosmetic and does not affect functionality. |
| Static user info in sidebar | Ensure all admin pages use the `<AdminSidebar />` component instead of hardcoded HTML. |
| Redirect loop on login | Check that middleware excludes `/login`, `/auth/*`, and `/api/*` paths. |

---

## License

ISC
