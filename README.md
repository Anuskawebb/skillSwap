# SkillSwap

A minimal skill-sharing platform built with Next.js 15, Clerk authentication, and Supabase.

## Current Features

- ✅ **Authentication**: Clerk sign-in/sign-up with automatic redirects
- ✅ **Landing Page**: Simple homepage with navbar  
- ✅ **Onboarding**: Basic form to collect user profile data
- ✅ **Dashboard**: View user profile and basic stats
- ✅ **API Routes**: `/api/user`, `/api/onboard`, `/api/dashboard`

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma

## Getting Started

1. Environment variables are already configured
2. Database schema is set up with Prisma
3. Run `npm run dev` to start development server

## Pages

- `/` - Landing page
- `/onboard` - User onboarding form  
- `/dashboard` - User dashboard

## API Routes

- `GET /api/user` - Get current user data
- `POST /api/onboard` - Complete user onboarding
- `GET /api/dashboard` - Get dashboard data

## Database Schema

- **User**: Core user profile with skills, goals, and preferences
- **Session**: Skill-sharing sessions between users

Ready for further development and feature additions.
