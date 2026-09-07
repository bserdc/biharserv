# BSEDRC Student Lifecycle Backend — PHASE 2 Setup Guide

## PHASE 2: Node.js + Express → Supabase PostgreSQL Integration

This document outlines the migration from in-memory mock data to Supabase PostgreSQL.

### Prerequisites

- Node.js v18+
- npm v9+
- Supabase account with existing PostgreSQL instance
- Supabase project created with the following tables already present:
  - `forms`
  - `grievances`
  - `job_applications`
  - `merit_results`
  - `notices`
  - `schools`
  - `students`
  - `verification_records`

### Setup Steps

#### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key-here

# Other configuration
NODE_ENV=development
PORT=3000
```

**CRITICAL SECURITY NOTES:**
- ⚠️ `SUPABASE_SECRET_KEY` is server-only. Never expose it to the frontend.
- ⚠️ Never commit `.env` to Git (already ignored in .gitignore).
- ⚠️ Use environment variables only on the server (Node.js/Express).
- ⚠️ Do NOT use `VITE_SUPABASE_SECRET_KEY` or similar in frontend code.

#### 2. Install Dependencies

```bash
cd student-zone
npm install
```

Verify @supabase/supabase-js is installed:

```bash
npm list @supabase/supabase-js
```

#### 3. Database Verification

Ensure Row-Level Security (RLS) is enabled on all tables:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, 
  (SELECT enabled FROM pg_policies WHERE tablename = 'schools' LIMIT 1) as rls_enabled
FROM pg_tables 
WHERE schemaname='public';
```

#### 4. Development Server

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

To test the Supabase connection:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": {
    "supabase": "CONNECTED",
    "fallback_inmemory": "AVAILABLE"
  },
  "counts": {
    "schools": 50,
    "forms": 3,
    "students": 200
  }
}
```

### Architecture

```
React + TypeScript + Vite (Frontend)
            ↓
Node.js + Express (API Server)
            ↓
Repository Layer (Data Access Abstraction)
            ├── StudentRepository
            ├── SchoolRepository
            ├── FormRepository
            ├── NoticeRepository
            ├── GrievanceRepository
            ├── MeritRepository
            ├── VerificationRepository
            └── JobApplicationRepository
            ↓
Supabase JavaScript Client
            ↓
PostgreSQL Database (Supabase)
```

### Repository Layer

Repositories provide a clean abstraction between Express routes and Supabase:

**Location:** `server/repositories/`

**Key Methods:**

```typescript
// Schools
SchoolRepository.findAll()
SchoolRepository.findByUdiseCode(udise_code)
SchoolRepository.getDistinctDistricts()
SchoolRepository.getBlocksByDistrict(district)
SchoolRepository.findByDistrictAndBlock(district, block)
SchoolRepository.search(query)
SchoolRepository.create(school)
SchoolRepository.update(udise_code, updates)

// Forms
FormRepository.findAll()
FormRepository.findByFormId(form_id)
FormRepository.findByAcademicYear(academic_year)
FormRepository.create(form)
FormRepository.update(form_id, updates)
FormRepository.activate(form_id)
FormRepository.deactivate(form_id)
FormRepository.releaseAdmitCard(form_id)
FormRepository.declareResults(form_id)

// Notices
NoticeRepository.findPublished()
NoticeRepository.findAll()
NoticeRepository.search(query)
NoticeRepository.create(notice)
NoticeRepository.update(notice_id, updates)
NoticeRepository.publish(notice_id)
NoticeRepository.unpublish(notice_id)
NoticeRepository.delete(notice_id)

// Grievances
GrievanceRepository.findAll()
GrievanceRepository.findByTicketId(ticket_id)
GrievanceRepository.findByStudentId(registration_id)
GrievanceRepository.search(query)
GrievanceRepository.create(grievance)
GrievanceRepository.updateStatus(ticket_id, status, response)
GrievanceRepository.getStats()

// Merit
MeritRepository.findPublished(form_id)
MeritRepository.findAll(form_id)
MeritRepository.findTop(form_id, limit)
MeritRepository.create(merit)
MeritRepository.createBulk(merits)
MeritRepository.update(merit_id, updates)
MeritRepository.publishForForm(form_id)
MeritRepository.unpublishForForm(form_id)

// Verification
VerificationRepository.findByRegistrationId(registration_id)
VerificationRepository.findAll()
VerificationRepository.create(verification)
VerificationRepository.update(registration_id, updates)
VerificationRepository.updateStatus(registration_id, status, notes)
VerificationRepository.getStats()

// Job Applications
JobApplicationRepository.findActivePostings()
JobApplicationRepository.findAll()
JobApplicationRepository.findById(job_id)
JobApplicationRepository.create(jobPosting)
JobApplicationRepository.update(job_id, updates)
JobApplicationRepository.close(job_id)
JobApplicationRepository.delete(job_id)
```

### API Endpoints Status

#### Migrated to Supabase (with fallback)
- ✅ `GET /api/health` — Supabase connection test
- ✅ `GET /api/schools` — Query schools
- ✅ `GET /api/schools/districts` — List districts
- ✅ `GET /api/schools/blocks` — List blocks by district
- ✅ `GET /api/schools/by-block` — Schools in a block
- ✅ `GET /api/forms` — List forms
- ✅ `GET /api/forms/:id` — Get specific form
- ✅ `POST /api/forms` — Create form
- ✅ `PUT /api/forms/:id` — Update form
- ✅ `GET /api/notices` — List published notices
- ✅ `POST /api/notices` — Create notice
- ✅ `DELETE /api/notices/:id` — Delete notice
- ✅ `GET /api/grievances` — List grievances
- ✅ `POST /api/grievances` — Submit grievance
- ✅ `PUT /api/grievances/:id` — Update grievance
- ✅ `GET /api/merit-gazette` — Get merit toppers (with Supabase fallback)

#### In-Memory (No Supabase yet - PHASE 3)
- ⏳ `POST /api/student/login` — Student authentication
- ⏳ `POST /api/student/verify` — Verify session
- ⏳ `POST /api/payment/create-order` — Payment order
- ⏳ `POST /api/payment/verify-and-register` — Register student with payment
- ⏳ `GET /api/student/status` — Student status
- ⏳ `GET /api/students` — Admin student list
- ⏳ `PUT /api/students/:id` — Update student
- ⏳ `POST /api/students/bulk-admit-cards` — Generate admit cards
- ⏳ `POST /api/students/bulk-results` — Import results
- ⏳ `GET /api/verify/lookup` — Verify records
- ⏳ `GET /api/exam-center/attendance-sheet` — Attendance sheet

### Testing

#### Test Health Check with Supabase

```bash
curl http://localhost:3000/api/health
```

#### Test Schools Endpoint

```bash
# Get all districts
curl http://localhost:3000/api/schools/districts

# Get blocks for a district
curl "http://localhost:3000/api/schools/blocks?district=Madhepura"

# Search schools
curl "http://localhost:3000/api/schools?q=government"
```

#### Test Forms Endpoint

```bash
# Get all forms
curl http://localhost:3000/api/schools

# Create a test form (requires admin auth)
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Form","fee_amount":50}'
```

#### Test Notices

```bash
# Get published notices
curl http://localhost:3000/api/notices

# Search notices
curl "http://localhost:3000/api/notices?q=examination"
```

### Build for Production

```bash
npm run build
```

This creates:
- `dist/` — Vite-built frontend
- `dist/server.cjs` — Bundled Node server

Start production server:

```bash
npm run start
```

### TypeScript & Linting

```bash
# Check for TypeScript errors
npm run lint

# Full build with esbuild
npm run build
```

### Fallback Strategy

All Supabase-integrated endpoints include fallback logic:

1. **Attempt Supabase query** — Query the database
2. **On success** — Return Supabase data
3. **On error** — Fall back to in-memory store
4. **Log errors** — Console logs help debug issues

Example:

```typescript
try {
  const schools = await SchoolRepository.findAll();
  if (schools.length > 0) {
    return res.json({ success: true, schools });
  }
} catch (err) {
  console.error('❌ Supabase error:', err);
}

// Fallback to in-memory
const fallback = schoolsStore;
res.json({ success: true, schools: fallback });
```

### Troubleshooting

#### "SUPABASE_URL environment variable is not set"

**Solution:** Add `SUPABASE_URL` to `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
```

#### "SUPABASE_SECRET_KEY environment variable is not set"

**Solution:** Add `SUPABASE_SECRET_KEY` to `.env`:

```env
SUPABASE_SECRET_KEY=your-secret-key
```

**Get from:** Supabase Dashboard → Settings → API → Service Role Secret

#### Connection refused errors

**Possible causes:**
- Supabase URL is incorrect
- Network connectivity issue
- Supabase project is paused
- Row-Level Security blocking access

**Debug:**
```bash
curl https://your-project.supabase.co/rest/v1/schools?limit=1 \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

#### CORS errors in frontend

**Note:** CORS is handled server-side (Node.js). The frontend calls `/api/*` endpoints, not Supabase directly.

### Security Checklist

- ✅ `SUPABASE_SECRET_KEY` is server-only (not in frontend)
- ✅ `.env` is in `.gitignore` (never committed)
- ✅ `.env.example` has placeholder values only
- ✅ Row-Level Security is enabled on all tables
- ✅ Admin authentication is required for sensitive operations
- ✅ Student personal data is not exposed in public endpoints
- ✅ Grievances and verification records are private
- ✅ Notice publication status is respected

### Next Steps (PHASE 3)

1. Migrate Student repository to Supabase
2. Migrate Payment/Registration flow
3. Implement Supabase Auth (optional)
4. Migrate Storage for documents/photos
5. Full test suite with real Supabase data

### File Structure

```
student-zone/
├── server/
│   ├── lib/
│   │   └── supabase.ts           # Supabase client initialization
│   └── repositories/
│       ├── index.ts              # Export all repositories
│       ├── StudentRepository.ts
│       ├── SchoolRepository.ts
│       ├── FormRepository.ts
│       ├── NoticeRepository.ts
│       ├── GrievanceRepository.ts
│       ├── MeritRepository.ts
│       ├── VerificationRepository.ts
│       └── JobApplicationRepository.ts
├── src/
│   ├── components/
│   ├── services/
│   ├── types.ts
│   └── App.tsx
├── server.ts                      # Express server (updated with repositories)
├── vite.config.ts
├── tsconfig.json
├── .env.example                   # Template (includes Supabase vars)
├── .env                           # Local (gitignored)
└── package.json
```

### Support

For issues, check:
1. `.env` variables are set correctly
2. Supabase project exists and is running
3. Database tables are created with RLS enabled
4. TypeScript compilation passes (`npm run lint`)
5. Server starts without errors (`npm run dev`)

---

**Last Updated:** 2026-09-01  
**Status:** PHASE 2 COMPLETE - Supabase Integration Ready  
**Next:** PHASE 3 - Student Migration & Payment Integration
