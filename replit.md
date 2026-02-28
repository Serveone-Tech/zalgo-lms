# EduLearn - Learning Management System

## Overview
A professional, full-featured Learning Management System (LMS) built with React + Vite (frontend) and Express (backend).

## Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui, TanStack Query, Wouter
- **Backend**: Express.js, TypeScript, in-memory storage with seed data
- **Auth**: Session-based authentication (express-session)

## Features
### Student Features
- Sign in / Sign up with session auth
- Dashboard with enrolled courses, progress tracking, and active coupons
- Course player with module/lecture navigation and video playback
- Progress tracking (mark lectures complete)
- Course enrollment with payment simulation
- Coupon code support with discount application
- Profile management

### Admin Features
- Admin dashboard with stats (revenue, courses, users)
- Course management (create, edit, publish/unpublish, delete)
- Lecture management (modules + lectures with video URLs)
- User management with search and stats
- Coupon management (CRUD, toggle active status)

## Demo Credentials
- **Admin**: admin@lms.com / admin123
- **Student**: rahul@example.com / password123

## Demo Coupon Codes
- **WELCOME20** — 20% off (active)
- **SUMMER30** — 30% off (active)
- **LEARN50** — 50% off (expired/inactive)

## Project Structure
```
client/src/
  pages/           # All page components
    admin/         # Admin pages (courses, lectures, users, coupons)
    sign-in.tsx    # Auth pages
    sign-up.tsx
    dashboard.tsx  # Student dashboard
    course-player.tsx
    payment.tsx
    profile.tsx
  components/
    layouts/       # App layout with sidebar
    app-sidebar.tsx
    theme-provider.tsx
  lib/
    auth.tsx       # Auth context and provider
    queryClient.ts # TanStack Query setup
server/
  routes.ts        # All API endpoints
  storage.ts       # In-memory storage with seed data
shared/
  schema.ts        # TypeScript types and schemas
```

## API Routes
- `POST /api/auth/signin|signup|signout` - Authentication
- `GET /api/auth/me` - Current user
- `GET/POST/PATCH/DELETE /api/courses` - Course CRUD
- `GET /api/courses/enrolled` - Enrolled courses
- `GET/POST /api/courses/:id/modules` - Module management
- `GET/POST/PATCH/DELETE /api/modules/:id/lectures` - Lecture management
- `POST /api/enroll` - Course enrollment
- `POST /api/courses/:id/lectures/:id/complete` - Mark complete
- `GET/POST/PATCH/DELETE /api/coupons` - Coupon management
- `POST /api/coupons/apply` - Apply coupon code
- `GET /api/admin/users` - Admin user list
- `GET /api/admin/stats` - Admin statistics
