-- ============================================================================
-- PRIMA RIB CONTENT PLAN v1.0
-- FILE 2: ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- ============================================================================

-- Helper function to check if current user has a specific role
create or replace function public.has_role(target_role text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = target_role
  );
$$;

-- Helper function to check if current user is Admin or Content Planner
create or replace function public.is_admin_or_planner()
returns boolean
language sql
security definer
stable
as $$
  select public.has_role('Admin') or public.has_role('Content Planner');
$$;

-- Helper function to check if user is assigned to a specific content
create or replace function public.is_assigned_to_content(target_content_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.content_assignments ca
    where ca.content_id = target_content_id
      and ca.user_id = auth.uid()
  );
$$;

-- Enable RLS on all 16 public tables
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.programs enable row level security;
alter table public.content_pillars enable row level security;
alter table public.content_formats enable row level security;
alter table public.platforms enable row level security;
alter table public.campaigns enable row level security;
alter table public.ideas enable row level security;
alter table public.contents enable row level security;
alter table public.content_platforms enable row level security;
alter table public.content_assignments enable row level security;
alter table public.content_assets enable row level security;
alter table public.content_reviews enable row level security;
alter table public.content_analytics enable row level security;
alter table public.content_activity enable row level security;

-- ----------------------------------------------------------------------------
-- READ POLICIES: All authenticated team members can read master data & content
-- ----------------------------------------------------------------------------
create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Authenticated users can read roles"
  on public.roles for select to authenticated using (true);

create policy "Authenticated users can read user_roles"
  on public.user_roles for select to authenticated using (true);

create policy "Authenticated users can read programs"
  on public.programs for select to authenticated using (true);

create policy "Authenticated users can read content_pillars"
  on public.content_pillars for select to authenticated using (true);

create policy "Authenticated users can read content_formats"
  on public.content_formats for select to authenticated using (true);

create policy "Authenticated users can read platforms"
  on public.platforms for select to authenticated using (true);

create policy "Authenticated users can read campaigns"
  on public.campaigns for select to authenticated using (true);

create policy "Authenticated users can read ideas"
  on public.ideas for select to authenticated using (true);

create policy "Authenticated users can read contents"
  on public.contents for select to authenticated using (true);

create policy "Authenticated users can read content_platforms"
  on public.content_platforms for select to authenticated using (true);

create policy "Authenticated users can read content_assignments"
  on public.content_assignments for select to authenticated using (true);

create policy "Authenticated users can read content_assets"
  on public.content_assets for select to authenticated using (true);

create policy "Authenticated users can read content_reviews"
  on public.content_reviews for select to authenticated using (true);

create policy "Authenticated users can read content_analytics"
  on public.content_analytics for select to authenticated using (true);

create policy "Authenticated users can read content_activity"
  on public.content_activity for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- WRITE POLICIES: Role-Based Access Control (RBAC)
-- ----------------------------------------------------------------------------

-- 1. PROFILES & USER_ROLES (Admin manages users; users can update own profile)
create policy "Users can update own profile or Admin can update any"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role('Admin'));

create policy "Admin can manage user_roles"
  on public.user_roles for all to authenticated
  using (public.has_role('Admin'))
  with check (public.has_role('Admin'));

-- 2. MASTER DATA (Admin & Content Planner can manage)
create policy "Admin and Planner can manage programs"
  on public.programs for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Admin and Planner can manage content_pillars"
  on public.content_pillars for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Admin and Planner can manage content_formats"
  on public.content_formats for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Admin and Planner can manage platforms"
  on public.platforms for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Admin and Planner can manage campaigns"
  on public.campaigns for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

-- 3. IDEAS (Any authenticated user can propose ideas; Admin/Planner/Creator can update)
create policy "Authenticated users can insert ideas"
  on public.ideas for insert to authenticated
  with check (auth.uid() is not null);

create policy "Admin, Planner, or Creator can update ideas"
  on public.ideas for update to authenticated
  using (public.is_admin_or_planner() or created_by = auth.uid());

create policy "Only Admin can delete ideas"
  on public.ideas for delete to authenticated
  using (public.has_role('Admin'));

-- 4. CONTENTS (Admin/Planner can create; Admin/Planner/Assigned PIC/Reviewer can update)
create policy "Admin and Planner can insert contents"
  on public.contents for insert to authenticated
  with check (public.is_admin_or_planner());

create policy "Authorized team can update contents"
  on public.contents for update to authenticated
  using (
    public.is_admin_or_planner()
    or public.has_role('Reviewer')
    or public.is_assigned_to_content(id)
    or created_by = auth.uid()
  );

create policy "Only Admin can permanently delete contents"
  on public.contents for delete to authenticated
  using (public.has_role('Admin'));

-- 5. CONTENT_PLATFORMS, ASSIGNMENTS, ASSETS, REVIEWS, ANALYTICS, ACTIVITY
create policy "Admin and Planner can manage content_platforms"
  on public.content_platforms for all to authenticated
  using (public.is_admin_or_planner() or public.is_assigned_to_content(content_id))
  with check (public.is_admin_or_planner() or public.is_assigned_to_content(content_id));

create policy "Admin and Planner can manage content_assignments"
  on public.content_assignments for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Assigned PIC, Planner, or Admin can upload assets"
  on public.content_assets for insert to authenticated
  with check (
    public.is_admin_or_planner()
    or public.is_assigned_to_content(content_id)
  );

create policy "Uploader or Admin can delete assets"
  on public.content_assets for delete to authenticated
  using (uploaded_by = auth.uid() or public.is_admin_or_planner());

create policy "Reviewer, Planner, or Admin can insert reviews"
  on public.content_reviews for insert to authenticated
  with check (
    public.has_role('Reviewer')
    or public.is_admin_or_planner()
    or public.is_assigned_to_content(content_id)
  );

create policy "Admin and Planner can manage content_analytics"
  on public.content_analytics for all to authenticated
  using (public.is_admin_or_planner())
  with check (public.is_admin_or_planner());

create policy "Authenticated users can insert activity log"
  on public.content_activity for insert to authenticated
  with check (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- SUPABASE STORAGE BUCKETS (content-assets & avatars)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('content-assets', 'content-assets', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;
