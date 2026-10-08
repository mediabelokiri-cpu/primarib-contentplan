-- ============================================================================
-- PRIMA RIB CONTENT PLAN v1.0
-- FILE 1: DATABASE SCHEMA, INDEXES & TRIGGERS (16 PUBLIC TABLES)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. ROLES
-- ----------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. USER_ROLES (N:M Multi-Role Support)
-- ----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ----------------------------------------------------------------------------
-- 4. PROGRAMS (CPNS, SEKDIN, POLRI, GENERAL)
-- ----------------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. CONTENT_PILLARS
-- ----------------------------------------------------------------------------
create table if not exists public.content_pillars (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. CONTENT_FORMATS
-- ----------------------------------------------------------------------------
create table if not exists public.content_formats (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. PLATFORMS
-- ----------------------------------------------------------------------------
create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. CAMPAIGNS
-- ----------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. IDEAS (Idea Bank)
-- ----------------------------------------------------------------------------
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  program_id uuid references public.programs(id) on delete set null,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  source text,
  priority text not null default 'MEDIUM'
    check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  status text not null default 'NEW'
    check (status in ('NEW', 'SELECTED', 'PLANNED', 'ARCHIVED')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. CONTENTS (Central Content Database)
-- ----------------------------------------------------------------------------
create sequence if not exists public.content_code_seq start 1;

create or replace function public.generate_content_code()
returns text
language plpgsql
as $$
declare
  current_year text;
  seq_num bigint;
begin
  current_year := to_char(now(), 'YYYY');
  seq_num := nextval('public.content_code_seq');
  return 'PR-' || current_year || '-' || lpad(seq_num::text, 4, '0');
end;
$$;

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  content_code text not null unique default public.generate_content_code(),
  title text not null,
  short_title text,
  program_id uuid references public.programs(id) on delete set null,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  format_id uuid references public.content_formats(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  objective text,
  target_audience text,
  angle text,
  priority text not null default 'MEDIUM'
    check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  status text not null default 'PLANNED'
    check (
      status in (
        'PLANNED',
        'BRIEF',
        'PRODUCTION',
        'REVIEW',
        'REVISION',
        'APPROVED',
        'SCHEDULED',
        'PUBLISHED',
        'ARCHIVED'
      )
    ),
  hook text,
  main_content text,
  cta text,
  caption text,
  hashtags text,
  script text,
  creative_brief text,
  scheduled_at timestamptz,
  source_idea_id uuid references public.ideas(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 11. CONTENT_PLATFORMS (Multi-Platform & Specific Schedule/Post URL)
-- ----------------------------------------------------------------------------
create table if not exists public.content_platforms (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete cascade,
  scheduled_at timestamptz,
  published_at timestamptz,
  post_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, platform_id)
);

-- ----------------------------------------------------------------------------
-- 12. CONTENT_ASSIGNMENTS (PIC per Role Type)
-- ----------------------------------------------------------------------------
create table if not exists public.content_assignments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assignment_type text not null
    check (
      assignment_type in (
        'PLANNER',
        'COPYWRITER',
        'DESIGNER',
        'VIDEO_EDITOR',
        'REVIEWER'
      )
    ),
  task_notes text,
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, assignment_type)
);

-- ----------------------------------------------------------------------------
-- 13. CONTENT_ASSETS (Supabase Storage References)
-- ----------------------------------------------------------------------------
create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  asset_type text not null
    check (
      asset_type in (
        'DESIGN',
        'VIDEO',
        'THUMBNAIL',
        'DOCUMENT',
        'OTHER'
      )
    ),
  file_name text not null,
  file_path text not null,
  file_url text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 14. CONTENT_REVIEWS (Review & Revision History)
-- ----------------------------------------------------------------------------
create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision text not null
    check (decision in ('APPROVED', 'REVISION')),
  comment text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 15. CONTENT_ANALYTICS (Per-Platform Performance Metrics)
-- ----------------------------------------------------------------------------
create table if not exists public.content_analytics (
  id uuid primary key default gen_random_uuid(),
  content_platform_id uuid not null references public.content_platforms(id) on delete cascade,
  views bigint not null default 0,
  reach bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  saves bigint not null default 0,
  followers bigint not null default 0,
  engagement_rate numeric(8,2),
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 16. CONTENT_ACTIVITY (Audit Trail / Timeline)
-- ----------------------------------------------------------------------------
create table if not exists public.content_activity (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES (Section 35 of Database Spec)
-- ----------------------------------------------------------------------------
create index if not exists idx_contents_status on public.contents(status);
create index if not exists idx_contents_program on public.contents(program_id);
create index if not exists idx_contents_pillar on public.contents(pillar_id);
create index if not exists idx_contents_scheduled_at on public.contents(scheduled_at);
create index if not exists idx_contents_created_by on public.contents(created_by);
create index if not exists idx_content_platforms_platform on public.content_platforms(platform_id);
create index if not exists idx_content_assignments_user on public.content_assignments(user_id);
create index if not exists idx_content_activity_content on public.content_activity(content_id);
create index if not exists idx_ideas_status on public.ideas(status);
create index if not exists idx_ideas_program on public.ideas(program_id);

-- ----------------------------------------------------------------------------
-- TRIGGERS FOR updated_at & AUTO-CREATE PROFILE
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists trg_programs_updated_at on public.programs;
create trigger trg_programs_updated_at before update on public.programs
for each row execute function public.handle_updated_at();

drop trigger if exists trg_pillars_updated_at on public.content_pillars;
create trigger trg_pillars_updated_at before update on public.content_pillars
for each row execute function public.handle_updated_at();

drop trigger if exists trg_formats_updated_at on public.content_formats;
create trigger trg_formats_updated_at before update on public.content_formats
for each row execute function public.handle_updated_at();

drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at before update on public.campaigns
for each row execute function public.handle_updated_at();

drop trigger if exists trg_ideas_updated_at on public.ideas;
create trigger trg_ideas_updated_at before update on public.ideas
for each row execute function public.handle_updated_at();

drop trigger if exists trg_contents_updated_at on public.contents;
create trigger trg_contents_updated_at before update on public.contents
for each row execute function public.handle_updated_at();

drop trigger if exists trg_content_platforms_updated_at on public.content_platforms;
create trigger trg_content_platforms_updated_at before update on public.content_platforms
for each row execute function public.handle_updated_at();

drop trigger if exists trg_content_assignments_updated_at on public.content_assignments;
create trigger trg_content_assignments_updated_at before update on public.content_assignments
for each row execute function public.handle_updated_at();

drop trigger if exists trg_content_analytics_updated_at on public.content_analytics;
create trigger trg_content_analytics_updated_at before update on public.content_analytics
for each row execute function public.handle_updated_at();

-- Auto-create profile when a new Supabase Auth user signs up / is created
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
