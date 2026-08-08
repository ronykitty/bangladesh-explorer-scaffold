-- ============================================================
-- Bangladesh Explorer — Core Schema
-- Divisions, Districts, Categories, Places, Visits
-- ============================================================

create extension if not exists "pgcrypto";

-- ============ DIVISIONS ============
create table public.divisions (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null unique,
  name_en text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);

-- ============ DISTRICTS ============
create table public.districts (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id) on delete cascade,
  name_bn text not null,
  name_en text not null,
  slug text not null unique
);
create index idx_districts_division on public.districts(division_id);

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null unique,
  slug text not null unique,
  icon text not null default '📍',
  sort_order int not null default 0
);

-- ============ PLACES ============
create type public.place_status as enum ('wishlist', 'planned', 'visited', 'revisited');

create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  district_id uuid not null references public.districts(id) on delete restrict,
  upazila_name text,
  union_village text,
  name text not null,
  description text,
  status public.place_status not null default 'wishlist',
  photo_url text,
  google_maps_url text,
  personal_rating numeric(2,1) check (personal_rating is null or (personal_rating between 0 and 5)),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_places_user on public.places(user_id);
create index idx_places_district on public.places(district_id);
create index idx_places_category on public.places(category_id);
create index idx_places_status on public.places(status);

-- ============ VISITS ============
-- A place can have multiple visits, each with its own date + note
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  visit_date date not null,
  note text,
  created_at timestamptz not null default now()
);
create index idx_visits_place on public.visits(place_id);
create index idx_visits_date on public.visits(visit_date);

-- ============ updated_at trigger ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_places_updated_at
before update on public.places
for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.divisions enable row level security;
alter table public.districts enable row level security;
alter table public.categories enable row level security;
alter table public.places enable row level security;
alter table public.visits enable row level security;

-- Reference tables: readable by anyone (including logged-out visitors), no client writes
create policy "divisions_read_all" on public.divisions
  for select using (true);

create policy "districts_read_all" on public.districts
  for select using (true);

create policy "categories_read_all" on public.categories
  for select using (true);

-- Places: strictly owner-only
create policy "places_select_own" on public.places
  for select using (auth.uid() = user_id);

create policy "places_insert_own" on public.places
  for insert with check (auth.uid() = user_id);

create policy "places_update_own" on public.places
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "places_delete_own" on public.places
  for delete using (auth.uid() = user_id);

-- Visits: owner via parent place
create policy "visits_select_own" on public.visits
  for select using (
    exists (select 1 from public.places p where p.id = visits.place_id and p.user_id = auth.uid())
  );

create policy "visits_insert_own" on public.visits
  for insert with check (
    exists (select 1 from public.places p where p.id = visits.place_id and p.user_id = auth.uid())
  );

create policy "visits_update_own" on public.visits
  for update using (
    exists (select 1 from public.places p where p.id = visits.place_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.places p where p.id = visits.place_id and p.user_id = auth.uid())
  );

create policy "visits_delete_own" on public.visits
  for delete using (
    exists (select 1 from public.places p where p.id = visits.place_id and p.user_id = auth.uid())
  );
