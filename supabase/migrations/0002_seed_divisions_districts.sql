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
