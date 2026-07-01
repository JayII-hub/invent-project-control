# Invent Project Control App

Next.js + Supabase + Vercel project management app.

## Setup
1. Copy `.env.example` to `.env.local`.
2. Fill Supabase URL and anon key from Supabase > Project Settings > API.
3. Run `npm install`.
4. Run `npm run dev`.
5. Deploy to Vercel and add same environment variables.

## Supabase prerequisites
Tables required: clients, resources, projects, activities, daily_updates, reviews, change_requests, attachments.
Bucket required: project-attachments.
