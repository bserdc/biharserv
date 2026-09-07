# BSEDRC backend

Node/Express API with Supabase PostgreSQL, Supabase Auth, and the provider-based Supabase Storage implementation. Copy `.env.example` to `.env` for a standalone backend process. The backend reads only its own `.env` or deployment-provided process environment variables.

```text
npm run dev
npm run lint
npm run build
npm run start
```

## Offline local server

For a local server without an internet connection, create `backend/.env` with:

```text
OFFLINE_MODE=true
PORT=3000
```

Then run `npm.cmd run dev`. The server is available at
`http://localhost:3000`, and `GET /api/health` reports `mode: "offline"`.
Database-backed API operations require Supabase and are intentionally not
served from stale or fabricated local data.

## Supabase setup requirements

The backend requires a Supabase project with service-role server access. The
following database tables are referenced by the current repositories or API
routes and must already exist:

- `schools`
- `forms`
- `students`
- `notices`
- `merit_results`
- `verification_records`
- `grievances`
- `job_applications`
- `staff_accounts`

The migration in `migrations/20260902_staff_accounts.sql` represents only the
`staff_accounts` table, its indexes, its foreign-key references to
`auth.users`, and its RLS enablement. It does not bootstrap the other tables,
the Supabase Auth users, or storage resources. Do not apply duplicate table
migrations blindly; provide or verify the existing schema separately before
running the backend.

Supabase Storage must provide these buckets, configured through the matching
environment variables:

- Private bucket: `SUPABASE_STORAGE_BUCKET` (default `student-documents`)
- Public bucket: `SUPABASE_STORAGE_PUBLIC_BUCKET` (default
	`student-documents-public`)

The private bucket must allow service-role server uploads, downloads, deletes,
listing, and signed URLs. The public bucket must allow the public URLs used for
notice and gallery objects. Storage policies and bucket creation are external
Supabase setup requirements and are not represented by the current migration.

RLS is enabled on `staff_accounts` with no browser/client policies. Server
routes use the service-role client, so route authentication and authorization
must remain enabled. The other table RLS policies are external to this
directory and must permit the intended server-side service-role operations.

## Payment status

The current payment UI supplies simulated payment fields and the backend does
not implement Razorpay signature verification or server-side order/payment
lookup. Therefore `/api/payment/create-order` and
`/api/payment/verify-and-register` are available only when `OFFLINE_MODE=true`
for local simulation. They reject requests in normal environments rather than
marking a student as paid from client-supplied fields.

## Environment status endpoint

`GET /api/system/env-status` is an admin-protected diagnostic endpoint. It is
not required by the frontend and must not be exposed publicly.
