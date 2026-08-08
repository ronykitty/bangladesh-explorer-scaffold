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
-- ============================================================
-- Seed: 8 Divisions + 64 Districts (accurate as of 2026)
-- ============================================================

insert into public.divisions (name_bn, name_en, slug, sort_order) values
  ('ঢাকা', 'Dhaka', 'dhaka', 1),
  ('চট্টগ্রাম', 'Chattogram', 'chattogram', 2),
  ('রাজশাহী', 'Rajshahi', 'rajshahi', 3),
  ('খুলনা', 'Khulna', 'khulna', 4),
  ('বরিশাল', 'Barishal', 'barishal', 5),
  ('সিলেট', 'Sylhet', 'sylhet', 6),
  ('রংপুর', 'Rangpur', 'rangpur', 7),
  ('ময়মনসিংহ', 'Mymensingh', 'mymensingh', 8);

-- Dhaka division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('ঢাকা','Dhaka','dhaka'),
    ('গাজীপুর','Gazipur','gazipur'),
    ('নারায়ণগঞ্জ','Narayanganj','narayanganj'),
    ('নরসিংদী','Narsingdi','narsingdi'),
    ('মানিকগঞ্জ','Manikganj','manikganj'),
    ('মুন্সিগঞ্জ','Munshiganj','munshiganj'),
    ('টাঙ্গাইল','Tangail','tangail'),
    ('কিশোরগঞ্জ','Kishoreganj','kishoreganj'),
    ('ফরিদপুর','Faridpur','faridpur'),
    ('গোপালগঞ্জ','Gopalganj','gopalganj'),
    ('মাদারীপুর','Madaripur','madaripur'),
    ('রাজবাড়ী','Rajbari','rajbari'),
    ('শরীয়তপুর','Shariatpur','shariatpur')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'dhaka';

-- Chattogram division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('চট্টগ্রাম','Chattogram','chattogram-district'),
    ('কক্সবাজার',E'Cox''s Bazar','coxs-bazar'),
    ('রাঙ্গামাটি','Rangamati','rangamati'),
    ('বান্দরবান','Bandarban','bandarban'),
    ('খাগড়াছড়ি','Khagrachari','khagrachari'),
    ('ফেনী','Feni','feni'),
    ('নোয়াখালী','Noakhali','noakhali'),
    ('লক্ষ্মীপুর','Lakshmipur','lakshmipur'),
    ('চাঁদপুর','Chandpur','chandpur'),
    ('কুমিল্লা','Cumilla','cumilla'),
    ('ব্রাহ্মণবাড়িয়া','Brahmanbaria','brahmanbaria')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'chattogram';

-- Rajshahi division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('রাজশাহী','Rajshahi','rajshahi-district'),
    ('চাঁপাইনবাবগঞ্জ','Chapainawabganj','chapainawabganj'),
    ('নাটোর','Natore','natore'),
    ('নওগাঁ','Naogaon','naogaon'),
    ('পাবনা','Pabna','pabna'),
    ('সিরাজগঞ্জ','Sirajganj','sirajganj'),
    ('বগুড়া','Bogura','bogura'),
    ('জয়পুরহাট','Joypurhat','joypurhat')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'rajshahi';

-- Khulna division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('খুলনা','Khulna','khulna-district'),
    ('বাগেরহাট','Bagerhat','bagerhat'),
    ('সাতক্ষীরা','Satkhira','satkhira'),
    ('যশোর','Jashore','jashore'),
    ('ঝিনাইদহ','Jhenaidah','jhenaidah'),
    ('মাগুরা','Magura','magura'),
    ('নড়াইল','Narail','narail'),
    ('কুষ্টিয়া','Kushtia','kushtia'),
    ('চুয়াডাঙ্গা','Chuadanga','chuadanga'),
    ('মেহেরপুর','Meherpur','meherpur')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'khulna';

-- Barishal division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('বরিশাল','Barishal','barishal-district'),
    ('ভোলা','Bhola','bhola'),
    ('পটুয়াখালী','Patuakhali','patuakhali'),
    ('পিরোজপুর','Pirojpur','pirojpur'),
    ('বরগুনা','Barguna','barguna'),
    ('ঝালকাঠি','Jhalokati','jhalokati')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'barishal';

-- Sylhet division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('সিলেট','Sylhet','sylhet-district'),
    ('মৌলভীবাজার','Moulvibazar','moulvibazar'),
    ('হবিগঞ্জ','Habiganj','habiganj'),
    ('সুনামগঞ্জ','Sunamganj','sunamganj')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'sylhet';

-- Rangpur division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('রংপুর','Rangpur','rangpur-district'),
    ('দিনাজপুর','Dinajpur','dinajpur'),
    ('ঠাকুরগাঁও','Thakurgaon','thakurgaon'),
    ('পঞ্চগড়','Panchagarh','panchagarh'),
    ('নীলফামারী','Nilphamari','nilphamari'),
    ('লালমনিরহাট','Lalmonirhat','lalmonirhat'),
    ('কুড়িগ্রাম','Kurigram','kurigram'),
    ('গাইবান্ধা','Gaibandha','gaibandha')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'rangpur';

-- Mymensingh division districts
insert into public.districts (division_id, name_bn, name_en, slug)
select id, d.name_bn, d.name_en, d.slug from public.divisions,
  (values
    ('ময়মনসিংহ','Mymensingh','mymensingh-district'),
    ('জামালপুর','Jamalpur','jamalpur'),
    ('শেরপুর','Sherpur','sherpur'),
    ('নেত্রকোণা','Netrokona','netrokona')
  ) as d(name_bn, name_en, slug)
where public.divisions.slug = 'mymensingh';
-- ============================================================
-- Seed: Categories
-- ============================================================

insert into public.categories (name_bn, slug, icon, sort_order) values
  ('নদী ও ঘাট', 'rivers-ghats', '🌊', 1),
  ('ফেরিঘাট', 'ferry-ghats', '⛴', 2),
  ('নৌ ভ্রমণ ও লঞ্চ', 'boat-launch', '🛶', 3),
  ('হেরিটেজ ও স্থাপনা', 'heritage', '🏛', 4),
  ('রেলওয়ে স্টেশন', 'railway', '🚂', 5),
  ('স্ক্যানিক রোড', 'scenic-roads', '🛣', 6),
  ('খাবার হোটেল', 'food-hotels', '🍛', 7),
  ('থাকার হোটেল / রিসোর্ট', 'lodging', '🏨', 8),
  ('মিষ্টির দোকান', 'sweet-shops', '🍬', 9),
  ('চা বাগান', 'tea-gardens', '🍃', 10),
  ('ঝর্ণা', 'waterfalls', '💦', 11),
  ('হাওর ও বিল', 'haor-beel', '🌾', 12),
  ('সমুদ্র সৈকত', 'beaches', '🏖', 13),
  ('দ্বীপ', 'islands', '🏝', 14),
  ('পাহাড় ও বন', 'hills-forests', '⛰', 15),
  ('মন্দির ও মসজিদ', 'temples-mosques', '🕌', 16),
  ('বাজার', 'markets', '🛍', 17),
  ('জাদুঘর ও পার্ক', 'museums-parks', '🏛', 18),
  ('সূর্যাস্ত/সূর্যোদয় স্পট', 'sunset-sunrise', '🌅', 19),
  ('অন্যান্য', 'other', '📍', 20);
