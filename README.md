# Invent Project Control Pro

A Next.js + Supabase + Vercel project control application for stage-gate product development.

## Setup

1. Upload this folder contents to GitHub main branch.
2. In Vercel, import the repository.
3. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL = Supabase Project URL from Integrations > Data API
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = Supabase Publishable Key from Settings > API Keys
4. Redeploy without cache.

## Current modules

- Dashboard
- Project Master
- Auto-linked Project -> Client -> PM
- Auto-create roadmap activities based on stage-gate image
- Activity Planner
- Live drag/drop Kanban
- 40-hour resource allocation
- Gantt view based on planned dates
- Reviews
- Change Requests

## Supabase tables required

Use the tables already created in your Supabase project:
clients, resources, projects, activities, reviews, change_requests, daily_updates, attachments.
