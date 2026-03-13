# Syed Jahangir Alam MP Web Application

A bilingual (Bangla + English) full web application for **Syed Jahangir Alam MP, Dinajpur-3**, inspired by the reference structure but with a different UI direction.

## What Is Included

- Public website pages
  - Home
  - Candidate Profile
  - Commitments + commitment detail pages
  - Previous Work History
  - Gallery
  - News + news detail pages
  - Contact
  - Manifesto (embedded PDF + download)
  - Write-to-MP form
- Bilingual routing (`/bn`, `/en`)
- Admin system
  - Login/logout with session cookies
  - Role-based users (`admin`, `editor`)
  - Content management (non-technical form editor)
  - Submission inbox
  - User management (admin only)
  - Media upload support (image, video, PDF) with optional direct links
- Email delivery support for Write-to-MP via SMTP

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Local JSON persistence (`data/*.json`) for easy local hosting
- Nodemailer for email

## Local Run (On Your PC)

1. Install Node.js LTS (v20 or later recommended):
   - https://nodejs.org/
2. Open terminal in project folder:
   - `f:\AZM Labs\MP Website\syeed-jahangir-mp-web`
3. Install dependencies:
   - `npm install`
4. Create environment file:
   - Copy `.env.example` to `.env.local`
   - Fill SMTP values if you want email notifications
5. Start development server:
   - `npm run dev`
6. Open:
   - `http://localhost:3000/bn`

## Default Admin Login

- URL: `http://localhost:3000/bn/admin/login`
- Username: `admin`
- Password: `ChangeMe123!`

Change this password immediately by creating a new admin user, then removing the default one from `data/users.json`.

## Data Storage

At first run, the app auto-creates:

- `data/site-content.json`
- `data/users.json`
- `data/submissions.json`
- `data/sessions.json`

## Notes

- Current media and copy are starter content and placeholders to keep the system functional until official assets are provided.
- You can fully replace text/images/video links from the admin panel JSON editor.

## Production Suggestion

For internet deployment later, move to:

- PostgreSQL + Prisma
- Cloud object storage for uploads
- Hardened auth (NextAuth/Keycloak)
- Managed deployment (Vercel + Supabase)

