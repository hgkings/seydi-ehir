# Seydişehir Sosyal Şehir – PRD

## Vision
Local "social city" app for Seydişehir, Turkey – a unified mobile platform that bundles a business directory, news, events, classifieds, pharmacy on duty, transport, and a full Instagram-style social feed. Designed to scale to Manavgat with the same codebase.

## Tech Stack
- **Frontend**: React Native + Expo Router (TypeScript)
- **Backend**: FastAPI + MongoDB (motor async)
- **Auth**: Mock SMS OTP (always `123456`). User ID is used as bearer token for MVP.
- **State**: AsyncStorage + React Context

## Implemented (MVP, all in Turkish UI)
### Auth
- Welcome screen (hero w/ background)
- Register (kayit), Login (giris), SMS verify (sms-dogrula)

### Tabs
- **Home (Ana Sayfa)**: weather hero card, quick action chips, featured news carousel, upcoming events list, 16-category grid
- **Discover (Keşfet)**: 2-column masonry grid of trending posts + classifieds with search
- **Feed (Akış)**: Instagram-style feed with stories row, posts, like/comment, create-post button
- **Profile (Profil)**: avatar, stats, posts grid, sign-out

### Content categories (16)
firmalar, haberler, etkinlikler, ilanlar, is-ilanlari, eczane (nöbetçi), indirimler, gezilecek, alo-paket, otobüs, yer-bildirim, itiraflar, alo-taksi, konaklama, resmi-kurumlar, anketler

### Detail screens
- Firma detail (call button)
- Haber detail (article view)
- Etkinlik detail (join button)
- İlan detail (contact button)
- Generic kategori list

### Social features
- Post creation (text + sample image picker)
- Like toggle (with haptics)
- Comments (backend ready)
- Stories carousel

## Mocked / Future Work
- SMS OTP is MOCKED (`123456`)
- Weather, Google Places, eczaneler.gen.tr APIs not yet integrated (returning mock data)
- No payments yet (firma subscription plans deferred)
- No admin panel (Next.js separate workstream)
- No push notifications (requires dev build)

## API
All routes prefixed `/api`. See `/app/backend/server.py` for full list.

## Seed Data
Backend auto-seeds Turkish mock data on first start: 8 firmalar, 5 haberler, 4 etkinlikler, 6 ilanlar, 4 iş ilanları, 2 nöbetçi eczane, 5 demo users with avatars, 5 stories, 6 feed posts.

## Test Credentials
See `/app/memory/test_credentials.md`. OTP for any phone: `123456`.
