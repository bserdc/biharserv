-- Phase 5B: Safe additive migration for the existing `notices` table.
-- Adds only the columns required by the notice management flow if they are
-- missing. Does NOT recreate the table, does NOT delete data, and does NOT
-- touch unrelated tables.

-- priority: notice importance level used by the admin UI
alter table public.notices add column if not exists priority text
  check (priority in ('normal', 'important', 'urgent'))
  default 'normal';

-- expires_at: optional automatic expiry timestamp for public visibility
alter table public.notices add column if not exists expires_at timestamptz;

-- external_link: optional valid HTTP/HTTPS URL for external references
alter table public.notices add column if not exists external_link text;

-- attachment_url: optional Supabase Storage public URL for notice PDFs
alter table public.notices add column if not exists attachment_url text;

-- is_published: publication flag used by public GET filtering
alter table public.notices add column if not exists is_published boolean
  not null default false;

-- published_at: timestamp set when a notice is published
alter table public.notices add column if not exists published_at timestamptz;

-- Index for the public query path: is_published = true AND not expired.
create index if not exists notices_published_expiry_idx
  on public.notices (is_published, expires_at)
  where is_published = true;