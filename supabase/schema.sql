-- =============================================================
-- Seydişehir Şehir Uygulaması – Supabase Schema
-- Run this in the Supabase SQL Editor (supabase.com → SQL Editor)
-- =============================================================

-- ── Eski tabloları temizle ───────────────────────────────────
drop table if exists comments      cascade;
drop table if exists post_likes    cascade;
drop table if exists posts         cascade;
drop table if exists stories       cascade;
drop table if exists indirimler    cascade;
drop table if exists is_ilanlari   cascade;
drop table if exists ilanlar       cascade;
drop table if exists etkinlikler   cascade;
drop table if exists haberler      cascade;
drop table if exists firmalar      cascade;
drop table if exists eczane        cascade;
drop table if exists categories    cascade;
drop table if exists otps          cascade;
drop table if exists profiles      cascade;
-- ─────────────────────────────────────────────────────────────

-- profiles (users)
create table if not exists profiles (
  id             uuid primary key default gen_random_uuid(),
  phone          text unique not null,
  full_name      text not null,
  username       text unique not null,
  avatar_url     text,
  bio            text,
  followers_count int not null default 0,
  following_count int not null default 0,
  posts_count    int not null default 0,
  created_at     timestamptz not null default now()
);

-- mock OTPs (always 123456 in demo)
create table if not exists otps (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null,
  code       text not null default '123456',
  created_at timestamptz not null default now()
);

-- haberler (news articles)
create table if not exists haberler (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text,
  content      text,
  image_url    text,
  category     text,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- etkinlikler (events)
create table if not exists etkinlikler (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  location    text,
  date        text,
  time        text,
  category    text,
  created_at  timestamptz not null default now()
);

-- firmalar (local businesses)
create table if not exists firmalar (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  kategori     text,
  subtitle     text,
  description  text,
  address      text,
  phone        text,
  image_url    text,
  rating       numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at   timestamptz not null default now()
);

-- ilanlar (classifieds)
create table if not exists ilanlar (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price       text,
  image_url   text,
  category    text,
  phone       text,
  user_id     uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- is_ilanlari (job listings)
create table if not exists is_ilanlari (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  company     text,
  description text,
  location    text,
  type        text,
  created_at  timestamptz not null default now()
);

-- indirimler (discounts / campaigns)
create table if not exists indirimler (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  firma_id    uuid references firmalar(id) on delete set null,
  firma_name  text,
  discount    text,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- eczane (pharmacies)
create table if not exists eczane (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  phone      text,
  nobetci    boolean not null default false,
  created_at timestamptz not null default now()
);

-- stories
create table if not exists stories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  username   text,
  avatar_url text,
  image_url  text not null,
  created_at timestamptz not null default now()
);

-- posts
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  text          text not null,
  image_url     text,
  like_count    int not null default 0,
  comment_count int not null default 0,
  created_at    timestamptz not null default now()
);

-- post_likes (many-to-many)
create table if not exists post_likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- comments
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  username   text,
  avatar_url text,
  text       text not null,
  created_at timestamptz not null default now()
);

-- categories (UI navigation tiles)
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  subtitle   text,
  icon       text,
  color      text,
  bg         text,
  "group"    text,
  sort_order int not null default 0
);

-- =============================================================
-- Grant anon access (RLS is disabled by default on new tables)
-- =============================================================
grant select, insert, update, delete on all tables in schema public to anon;
grant usage on schema public to anon;

-- =============================================================
-- Seed Data
-- =============================================================

insert into categories (slug, name, subtitle, icon, color, bg, "group", sort_order) values
  ('namaz',         'Namaz Vakitleri',   'Günlük namaz saatleri',         'time-outline',        '#16A34A', '#DCFCE7', 'Günlük ihtiyaçlar',            1),
  ('hava',          'Hava Durumu',       'Güncel hava tahmini',           'partly-sunny-outline', '#2563EB', '#DBEAFE', 'Günlük ihtiyaçlar',            2),
  ('nobetci-eczane','Nöbetçi Eczane',   'Açık eczaneler',                'medical-outline',     '#DC2626', '#FEE2E2', 'Günlük ihtiyaçlar',            3),
  ('haberler',      'Haberler',          'Şehir haberleri',               'newspaper-outline',   '#7C3AED', '#EDE9FE', 'Şehir gündemi',               10),
  ('etkinlikler',   'Etkinlikler',       'Yaklaşan etkinlikler',          'calendar-outline',    '#D97706', '#FEF3C7', 'Şehir gündemi',               11),
  ('ilanlar',       'İlanlar',           'Alım-satım ilanları',           'pricetag-outline',    '#0891B2', '#CFFAFE', 'İlan, alışveriş ve fırsatlar', 20),
  ('is-ilanlari',   'İş İlanları',       'İş fırsatları',                'briefcase-outline',   '#065F46', '#D1FAE5', 'İlan, alışveriş ve fırsatlar', 21),
  ('indirimler',    'İndirimler',        'Kampanyalar ve fırsatlar',      'gift-outline',        '#BE185D', '#FCE7F3', 'İlan, alışveriş ve fırsatlar', 22),
  ('firmalar',      'İşletmeler',        'Yerel işletmeler',              'storefront-outline',  '#1D4ED8', '#DBEAFE', 'Şehir & yaşam',               30),
  ('sosyal-akis',   'Sosyal Akış',       'Şehirden paylaşımlar',          'people-outline',      '#7C3AED', '#EDE9FE', 'Sosyal',                      40),
  ('buradayim',     'Buradayım',         'Anlık konum paylaşımı',         'location-outline',    '#DC2626', '#FEE2E2', 'Sosyal',                      41)
on conflict (slug) do nothing;

insert into eczane (name, address, phone, nobetci) values
  ('Eczane Merkez',   'Cumhuriyet Mah. Atatürk Cad. No:12', '0332 582 20 10', true),
  ('Güven Eczanesi',  'Bahçelievler Mah. Karapınar Cad. No:5', '0332 582 31 45', false),
  ('Sağlık Eczanesi', 'Camii Mah. İnönü Cad. No:8', '0332 582 41 55', false),
  ('Nur Eczanesi',    'Yeni Mah. Hastane Cad. No:3', '0332 582 55 67', false);

insert into firmalar (name, kategori, subtitle, description, address, phone, rating, review_count) values
  ('Seydişehir Belediyesi', 'Hizmetler',  'Belediye hizmetleri',      'Seydişehir Belediyesi resmi hizmetleri', 'Cumhuriyet Meydanı', '0332 582 20 00', 4.2, 128),
  ('ETİ Alüminyum',         'Sanayi',     'Alüminyum fabrikası',       'Türkiye''nin önde gelen alüminyum üreticisi', 'OSB', '0332 582 10 00', 4.5, 89),
  ('Toros Restaurant',      'Yemek',      'Yöresel lezzetler',         'Geleneksel Konya mutfağı', 'İstasyon Cad. No:15', '0332 582 33 22', 4.7, 234),
  ('Seydişehir Çarşısı',   'Alışveriş',  'Kapalı çarşı',              'Geleneksel kapalı çarşı', 'Çarşı Mah.', '0332 582 20 50', 4.0, 56),
  ('Göl Cafe',              'Kafe',       'Göl manzaralı kafe',        'Beyşehir Gölü manzaralı kafe', 'Göl Yolu No:7', '0332 582 44 11', 4.8, 312);

insert into haberler (title, summary, content, category, published_at) values
  ('Seydişehir''de Yeni Park Açıldı',
   'Merkez mahallede yeni bir park ve dinlenme alanı hizmete girdi.',
   'Seydişehir Belediyesi, merkez mahallede tamamlanan yeni park ve dinlenme alanını vatandaşların hizmetine sundu. 5.000 metrekare alana sahip parkta çocuk oyun alanı, yürüyüş pisti ve sosyal alanlar yer alıyor.',
   'Şehir', now() - interval '1 day'),
  ('ETİ Alüminyum''dan 100 Yeni İstihdam',
   'ETİ Alüminyum yeni üretim hattıyla 100 kişilik istihdam sağlayacak.',
   'ETİ Alüminyum A.Ş., yeni üretim hattı yatırımıyla Seydişehir ekonomisine önemli bir katkı sağlayacak. Yeni hat için işe alımlar başladı.',
   'Ekonomi', now() - interval '2 days'),
  ('Beyşehir Gölü Su Seviyesi Normale Döndü',
   'Son yağışların ardından Beyşehir Gölü su seviyesi yükseldi.',
   'Geçen ay yaşanan yağışların etkisiyle Beyşehir Gölü su seviyesi önemli ölçüde yükseldi. DSİ yetkilileri su seviyesinin normale döndüğünü açıkladı.',
   'Çevre', now() - interval '3 days');

insert into etkinlikler (title, description, location, date, time, category) values
  ('Seydişehir Kültür Festivali', 'Geleneksel yöresel ürünler, el sanatları ve müzik etkinlikleri', 'Cumhuriyet Meydanı', '2026-07-15', '10:00', 'Kültür'),
  ('Göl Koşusu',                  'Beyşehir Gölü çevresinde doğa koşusu etkinliği',                 'Göl Yolu Başlangıcı', '2026-07-20', '08:00', 'Spor'),
  ('Ramazan Konseri',              'Geleneksel Türk müziği konseri',                                 'Atatürk Kültür Merkezi', '2026-07-25', '21:00', 'Sanat');

insert into is_ilanlari (title, company, description, location, type) values
  ('Satış Danışmanı',  'Seydişehir Çarşısı', 'Deneyimli satış danışmanı aranmaktadır.', 'Seydişehir', 'Tam Zamanlı'),
  ('Muhasebe Uzmanı',  'ETİ Alüminyum',      'Üniversite mezunu muhasebe uzmanı aranmaktadır.', 'Seydişehir', 'Tam Zamanlı'),
  ('Garson',           'Toros Restaurant',   'Hafta sonları çalışabilecek garson aranmaktadır.', 'Seydişehir', 'Yarı Zamanlı');

insert into indirimler (title, description, firma_name, discount, expires_at) values
  ('Toros Restaurant Yaz İndirimi', 'Tüm yemeklerde %20 indirim', 'Toros Restaurant', '%20', now() + interval '30 days'),
  ('Göl Cafe Kahve Kampanyası',     'İki kahve al, birini bedava al', 'Göl Cafe', '2 Al 1 Öde', now() + interval '14 days');
