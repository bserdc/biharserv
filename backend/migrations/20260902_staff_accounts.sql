-- Phase 5B: trusted Examiner/Principal account mapping.
-- REVIEW ONLY: do not apply until UDISE data has been populated and revalidated.
create table if not exists public.staff_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('examiner', 'principal')),
  principal_name text not null check (btrim(principal_name) <> ''),
  email text not null check (btrim(email) <> ''),
  mobile text,
  school_name text,
  udise_code text,
  approved boolean not null default false,
  active boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_accounts_role_fields check (
    (role = 'examiner' and udise_code is null and school_name is null)
    or
    (role = 'principal'
      and nullif(btrim(mobile), '') is not null
      and nullif(btrim(school_name), '') is not null
      and nullif(btrim(udise_code), '') is not null)
  )
);

-- auth_user_id's UNIQUE constraint provides the authentication lookup index.
create index if not exists staff_accounts_role_active_approved_idx
  on public.staff_accounts (role, active, approved);
create index if not exists staff_accounts_udise_code_idx
  on public.staff_accounts (udise_code)
  where udise_code is not null;

-- One active Principal may be assigned to a school. This does not assume that
-- public.schools.udise_code is unique; application must validate it first.
create unique index if not exists staff_accounts_one_active_principal_udise
  on public.staff_accounts (udise_code)
  where role = 'principal' and active = true;

-- RLS is intentionally enabled with no client policies. Server routes use the
-- service-role client, while browser clients cannot read or write staff data.
alter table public.staff_accounts enable row level security;
