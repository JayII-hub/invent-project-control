# Invent Project Control App

This is a Next.js + Supabase starter app for Invent India style stage-gate and sprint project control.

## What it includes
- Project Master: Project ID, Project Name, Client, PM
- Activity Planner
- Resource assignment
- Daily updates and actual hours
- Live Kanban by status
- 40-hour resource allocation dashboard
- Simple Gantt style timeline
- Gate Reviews
- Change Requests

## Setup
1. Create Supabase project and tables.
2. Copy `.env.local.example` to `.env.local`.
3. Add Supabase URL and anon key.
4. Run `npm install`.
5. Run `npm run dev`.
6. Deploy to Vercel and add same environment variables.

## Supabase keys location
Supabase Dashboard → Project Settings → API:
- Project URL
- anon public key
