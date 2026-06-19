"""Seydişehir Sosyal Şehir Uygulaması - Backend API
FastAPI + MongoDB. Mock OTP auth, mock data for categories.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Seydişehir Sosyal API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============================ MODELS ============================

class RegisterRequest(BaseModel):
    phone: str
    full_name: str
    username: str

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

class LoginRequest(BaseModel):
    phone: str


class User(BaseModel):
    id: str
    phone: str
    full_name: str
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str = "user"  # user | firma | editor | admin
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: str


class PostCreate(BaseModel):
    text: str
    image_url: Optional[str] = None


class CommentCreate(BaseModel):
    text: str


# ============================ AUTH HELPERS ============================

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Token is just the user_id for the MVP mock auth."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token gerekli")
    token = authorization.replace("Bearer ", "").strip()
    user = await db.users.find_one({"id": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    return user


# ============================ AUTH ENDPOINTS ============================

@api_router.post("/auth/register")
async def register(body: RegisterRequest):
    existing = await db.users.find_one({"phone": body.phone}, {"_id": 0})
    if existing:
        # Resend OTP for existing
        await db.otps.update_one(
            {"phone": body.phone},
            {"$set": {"otp": "123456", "created_at": now_iso()}},
            upsert=True,
        )
        return {"message": "OTP gönderildi", "otp_debug": "123456", "existing": True}
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "phone": body.phone,
        "full_name": body.full_name,
        "username": body.username,
        "avatar_url": None,
        "bio": "Seydişehirli 🌿",
        "role": "user",
        "followers_count": 0,
        "following_count": 0,
        "posts_count": 0,
        "verified": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    await db.otps.update_one(
        {"phone": body.phone},
        {"$set": {"otp": "123456", "created_at": now_iso()}},
        upsert=True,
    )
    return {"message": "OTP gönderildi", "otp_debug": "123456", "existing": False}


@api_router.post("/auth/login")
async def login(body: LoginRequest):
    user = await db.users.find_one({"phone": body.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Bu numara kayıtlı değil")
    await db.otps.update_one(
        {"phone": body.phone},
        {"$set": {"otp": "123456", "created_at": now_iso()}},
        upsert=True,
    )
    return {"message": "OTP gönderildi", "otp_debug": "123456"}


@api_router.post("/auth/verify-otp")
async def verify_otp(body: VerifyOtpRequest):
    record = await db.otps.find_one({"phone": body.phone}, {"_id": 0})
    if not record or record.get("otp") != body.otp:
        raise HTTPException(status_code=400, detail="OTP yanlış")
    user = await db.users.find_one({"phone": body.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    await db.users.update_one({"id": user["id"]}, {"$set": {"verified": True}})
    user["verified"] = True
    return {"token": user["id"], "user": user}


@api_router.get("/auth/me")
async def me(authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    return user


# ============================ WEATHER ============================

@api_router.get("/weather")
async def weather():
    # Mock current weather (Seydişehir)
    return {
        "city": "Seydişehir",
        "temp": 22,
        "condition": "Açık",
        "icon": "sun",
        "humidity": 45,
        "wind": 8,
        "high": 26,
        "low": 14,
    }


# ============================ CATEGORIES ============================

CATEGORIES = [
    {"slug": "firmalar", "name": "Firmalar", "icon": "storefront-outline", "color": "#C35235"},
    {"slug": "haberler", "name": "Haberler", "icon": "newspaper-outline", "color": "#DF7A61"},
    {"slug": "etkinlikler", "name": "Etkinlikler", "icon": "calendar-outline", "color": "#3E7D59"},
    {"slug": "ilanlar", "name": "İlanlar", "icon": "pricetags-outline", "color": "#D98C2C"},
    {"slug": "eczane", "name": "Nöbetçi Eczane", "icon": "medkit-outline", "color": "#B83A3A"},
    {"slug": "is-ilanlari", "name": "İş İlanları", "icon": "briefcase-outline", "color": "#4A6C7A"},
    {"slug": "indirimler", "name": "İndirimler", "icon": "ticket-outline", "color": "#C35235"},
    {"slug": "gezilecek", "name": "Gezilecek Yerler", "icon": "map-outline", "color": "#3E7D59"},
    {"slug": "alo-paket", "name": "Alo Paket", "icon": "bicycle-outline", "color": "#DF7A61"},
    {"slug": "otobus", "name": "Otobüs Hatları", "icon": "bus-outline", "color": "#4A6C7A"},
    {"slug": "yer-bildirim", "name": "Yer Bildirimi", "icon": "location-outline", "color": "#D98C2C"},
    {"slug": "itiraflar", "name": "İtiraflar", "icon": "chatbox-outline", "color": "#B83A3A"},
    {"slug": "alo-taksi", "name": "Alo Taksi", "icon": "car-outline", "color": "#1A1A1A"},
    {"slug": "konaklama", "name": "Konaklama", "icon": "bed-outline", "color": "#3E7D59"},
    {"slug": "resmi-kurumlar", "name": "Resmi Kurumlar", "icon": "business-outline", "color": "#4A6C7A"},
    {"slug": "anketler", "name": "Anketler", "icon": "stats-chart-outline", "color": "#C35235"},
]

@api_router.get("/categories")
async def get_categories():
    return CATEGORIES


# ============================ FIRMALAR ============================

@api_router.get("/firmalar")
async def list_firmalar(kategori: Optional[str] = None):
    q = {}
    if kategori:
        q["kategori"] = kategori
    items = await db.firmalar.find(q, {"_id": 0}).to_list(500)
    return items


@api_router.get("/firmalar/{firma_id}")
async def get_firma(firma_id: str):
    item = await db.firmalar.find_one({"id": firma_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    return item


# ============================ HABERLER ============================

@api_router.get("/haberler")
async def list_haberler():
    items = await db.haberler.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/haberler/{haber_id}")
async def get_haber(haber_id: str):
    item = await db.haberler.find_one({"id": haber_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Haber bulunamadı")
    return item


# ============================ ETKİNLİKLER ============================

@api_router.get("/etkinlikler")
async def list_etkinlikler():
    items = await db.etkinlikler.find({}, {"_id": 0}).sort("event_date", 1).to_list(200)
    return items


@api_router.get("/etkinlikler/{etkinlik_id}")
async def get_etkinlik(etkinlik_id: str):
    item = await db.etkinlikler.find_one({"id": etkinlik_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return item


# ============================ İLANLAR ============================

@api_router.get("/ilanlar")
async def list_ilanlar():
    items = await db.ilanlar.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/ilanlar/{ilan_id}")
async def get_ilan(ilan_id: str):
    item = await db.ilanlar.find_one({"id": ilan_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    return item


# ============================ İŞ İLANLARI ============================

@api_router.get("/is-ilanlari")
async def list_is_ilanlari():
    items = await db.is_ilanlari.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


# ============================ NÖBETÇİ ECZANE ============================

@api_router.get("/eczane")
async def list_eczane():
    items = await db.eczane.find({}, {"_id": 0}).to_list(50)
    return items


# ============================ STORIES ============================

@api_router.get("/stories")
async def list_stories():
    items = await db.stories.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items


# ============================ POSTS / FEED ============================

@api_router.get("/posts")
async def list_posts(authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization:
        try:
            u = await get_current_user(authorization)
            user_id = u["id"]
        except HTTPException:
            pass
    items = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if user_id:
        for p in items:
            p["liked_by_me"] = user_id in p.get("liked_by", [])
    else:
        for p in items:
            p["liked_by_me"] = False
    return items


@api_router.post("/posts")
async def create_post(body: PostCreate, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    post = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "avatar_url": user.get("avatar_url"),
        "text": body.text,
        "image_url": body.image_url,
        "like_count": 0,
        "comment_count": 0,
        "liked_by": [],
        "created_at": now_iso(),
    }
    await db.posts.insert_one(post)
    await db.users.update_one({"id": user["id"]}, {"$inc": {"posts_count": 1}})
    post.pop("_id", None)
    return post


@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Gönderi bulunamadı")
    liked_by = post.get("liked_by", [])
    if user["id"] in liked_by:
        await db.posts.update_one(
            {"id": post_id},
            {"$pull": {"liked_by": user["id"]}, "$inc": {"like_count": -1}},
        )
        return {"liked": False, "like_count": max(0, post.get("like_count", 0) - 1)}
    else:
        await db.posts.update_one(
            {"id": post_id},
            {"$addToSet": {"liked_by": user["id"]}, "$inc": {"like_count": 1}},
        )
        return {"liked": True, "like_count": post.get("like_count", 0) + 1}


@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str):
    items = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return items


@api_router.post("/posts/{post_id}/comments")
async def add_comment(post_id: str, body: CommentCreate, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    comment = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "user_id": user["id"],
        "username": user["username"],
        "avatar_url": user.get("avatar_url"),
        "text": body.text,
        "created_at": now_iso(),
    }
    await db.comments.insert_one(comment)
    await db.posts.update_one({"id": post_id}, {"$inc": {"comment_count": 1}})
    comment.pop("_id", None)
    return comment


# ============================ DISCOVER ============================

@api_router.get("/discover")
async def discover():
    """Mixed list of posts + classifieds for masonry grid."""
    posts = await db.posts.find({}, {"_id": 0}).sort("like_count", -1).limit(20).to_list(20)
    ilanlar = await db.ilanlar.find({}, {"_id": 0}).limit(20).to_list(20)
    mixed = []
    for p in posts:
        mixed.append({
            "id": p["id"],
            "type": "post",
            "image_url": p.get("image_url"),
            "title": p.get("text", "")[:60],
            "subtitle": "@" + p.get("username", ""),
        })
    for i in ilanlar:
        mixed.append({
            "id": i["id"],
            "type": "ilan",
            "image_url": i.get("image_url"),
            "title": i.get("title", ""),
            "subtitle": f"{i.get('price', 0):,} ₺",
        })
    # Interleave
    import random
    random.shuffle(mixed)
    return mixed


# ============================ USER PROFILE ============================

@api_router.get("/users/{user_id}/posts")
async def user_posts(user_id: str):
    items = await db.posts.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user


# ============================ SEED DATA ============================

async def seed_data():
    """Seed mock data only if database is empty."""
    if await db.firmalar.count_documents({}) > 0:
        return

    logger.info("Seeding mock data...")

    # Seed users
    avatars = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400",
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    ]
    demo_users = [
        ("Ayşe Yılmaz", "ayse_y", "+905551110001"),
        ("Mehmet Demir", "mehmet.dmr", "+905551110002"),
        ("Elif Kaya", "elifk", "+905551110003"),
        ("Burak Çelik", "burakc", "+905551110004"),
        ("Zeynep Arslan", "zeynep.a", "+905551110005"),
    ]
    user_ids = []
    for i, (name, uname, phone) in enumerate(demo_users):
        uid = str(uuid.uuid4())
        user_ids.append((uid, name, uname, avatars[i]))
        await db.users.insert_one({
            "id": uid,
            "phone": phone,
            "full_name": name,
            "username": uname,
            "avatar_url": avatars[i],
            "bio": "Seydişehirli 🌿",
            "role": "user",
            "followers_count": 100 + i * 50,
            "following_count": 80 + i * 20,
            "posts_count": 3,
            "verified": True,
            "created_at": now_iso(),
        })

    # Firmalar
    firmalar = [
        ("Karadeniz Pastanesi", "Tatlıcılar", "Antika Cad. No:12", "+90 332 582 1010",
         "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=800",
         "Seydişehir'in en eski pastanesi. 1985'ten beri taze ekmek ve şekerleme."),
        ("Mavi Köşe Cafe", "Kafeler", "Cumhuriyet Meydanı", "+90 332 582 2020",
         "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
         "Şehrin kalbinde özel kahve ve ev yapımı pastalar."),
        ("Anadolu Lokantası", "Restoranlar", "Belediye Cd. No:5", "+90 332 582 3030",
         "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
         "Yöresel etli ekmek ve fırın kebabı."),
        ("Star Kuaför", "Kuaförler", "Yeni Mah. Atatürk Bulvarı", "+90 332 582 4040",
         "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
         "Modern kesim ve bakım hizmetleri."),
        ("Demir Oto Servis", "Otomotiv", "Sanayi Sitesi B Blok", "+90 332 582 5050",
         "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
         "Tüm marka araç bakım ve onarım."),
        ("Yeşil Market", "Marketler", "Bahçelievler Mah. 23. Sk", "+90 332 582 6060",
         "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800",
         "Taze meyve sebze ve yöresel ürünler."),
        ("Berra Butik", "Giyim", "Çarşı içi No:18", "+90 332 582 7070",
         "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
         "Kadın giyim ve aksesuar."),
        ("Doğa Eczanesi", "Sağlık", "Hastane Cd. No:3", "+90 332 582 8080",
         "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
         "24 saat hizmet. Reçeteli ve reçetesiz ilaçlar."),
    ]
    for name, kat, adres, tel, img, desc in firmalar:
        await db.firmalar.insert_one({
            "id": str(uuid.uuid4()),
            "name": name,
            "kategori": kat,
            "adres": adres,
            "telefon": tel,
            "image_url": img,
            "description": desc,
            "rating": round(4.0 + (hash(name) % 10) / 10, 1),
            "reviews_count": 10 + (hash(name) % 200),
            "verified": True,
            "created_at": now_iso(),
        })

    # Haberler
    haberler = [
        ("Seydişehir'de Geleneksel Festival Başladı",
         "Belediyenin düzenlediği geleneksel kültür festivali bu hafta sonu başladı. Beş gün sürecek etkinlikte yöresel lezzetler ve halk oyunları sergilenecek.",
         "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", "Kültür"),
        ("Yeni Park Açıldı: Atatürk Yeşil Alanı",
         "Atatürk Mahallesi'ndeki yeni park bugün vatandaşların hizmetine açıldı. Çocuk oyun alanları, yürüyüş parkurları ve kafeteryası bulunuyor.",
         "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", "Şehir"),
        ("İlçemize 2 Yeni Hastane Müjdesi",
         "Sağlık Bakanlığı'nın açıklamasına göre Seydişehir'e iki yeni hastane yapılacak. Yapımına 2026'da başlanacak.",
         "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800", "Sağlık"),
        ("Esnaf Odası'ndan 'Dijital Seydişehir' Projesi",
         "Esnaf ve Sanatkarlar Odası, üyelerini dijital platformda buluşturan yeni bir proje başlattı.",
         "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800", "Ekonomi"),
        ("Yaz Spor Okulları Kayıtları Başladı",
         "Belediyenin ücretsiz yaz spor okulları için kayıtlar başladı. Yüzme, basketbol, futbol ve tenis branşları mevcut.",
         "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800", "Spor"),
    ]
    for title, content, img, kat in haberler:
        await db.haberler.insert_one({
            "id": str(uuid.uuid4()),
            "title": title,
            "content": content,
            "image_url": img,
            "kategori": kat,
            "author": "Seydişehir Haber",
            "created_at": now_iso(),
            "views": 100 + (hash(title) % 500),
        })

    # Etkinlikler
    etkinlikler = [
        ("Ramazan Konseri", "Belediye Meydanı", "2026-06-15", "20:00",
         "Yöresel sanatçılar sahne alacak.",
         "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"),
        ("Bal Festivali 2026", "Kültür Merkezi", "2026-07-10", "10:00",
         "Yöresel bal üreticileri buluşması.",
         "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800"),
        ("Çocuk Tiyatro Günleri", "Halk Eğitim Salonu", "2026-06-20", "14:00",
         "Çocuklar için ücretsiz tiyatro.",
         "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800"),
        ("Seydişehir Maratonu", "Cumhuriyet Meydanı Start", "2026-09-01", "08:00",
         "5K ve 10K kategorilerinde halk koşusu.",
         "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800"),
    ]
    for title, loc, date, time, desc, img in etkinlikler:
        await db.etkinlikler.insert_one({
            "id": str(uuid.uuid4()),
            "title": title,
            "location": loc,
            "event_date": date,
            "event_time": time,
            "description": desc,
            "image_url": img,
            "attendees_count": 50 + (hash(title) % 300),
            "created_at": now_iso(),
        })

    # İlanlar
    ilanlar = [
        ("Sıfır Buzdolabı", 8500, "Beyaz Eşya", "Kullanılmamış, garantili.",
         "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600"),
        ("3+1 Daire Sahibinden Satılık", 1850000, "Emlak", "Yeni Mahalle, 2. kat.",
         "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"),
        ("Honda Civic 2019", 685000, "Vasıta", "85.000 km, hasar kayıtsız.",
         "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600"),
        ("Yavru Kedi Sahiplendirme", 0, "Evcil Hayvan", "Ücretsiz, 2 aylık.",
         "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600"),
        ("iPhone 14 Pro 256GB", 42000, "Elektronik", "Az kullanılmış, kutusunda.",
         "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600"),
        ("Antika Halı", 12500, "Ev & Yaşam", "El dokuma, 150x200 cm.",
         "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600"),
    ]
    for title, price, kat, desc, img in ilanlar:
        await db.ilanlar.insert_one({
            "id": str(uuid.uuid4()),
            "title": title,
            "price": price,
            "kategori": kat,
            "description": desc,
            "image_url": img,
            "seller": "Seydişehirli",
            "phone": "+90 5XX XXX XXXX",
            "location": "Seydişehir",
            "created_at": now_iso(),
        })

    # İş İlanları
    is_ilanlari = [
        ("Garson Aranıyor", "Anadolu Lokantası", "Tam Zamanlı", "20.000 - 25.000 ₺",
         "Deneyimli, güler yüzlü garson aranıyor."),
        ("Kasiyer", "Yeşil Market", "Tam Zamanlı", "18.500 ₺",
         "Marketimizde çalışacak kasiyer aranıyor."),
        ("Web Geliştirici (Junior)", "Dijital Çözüm A.Ş.", "Hibrit", "30.000 - 45.000 ₺",
         "React Native bilen geliştirici aranıyor."),
        ("Berber Çırağı", "Star Kuaför", "Tam Zamanlı", "15.000 ₺",
         "16 yaş üstü, hevesli, çalışkan çırak."),
    ]
    for title, sirket, tip, maas, desc in is_ilanlari:
        await db.is_ilanlari.insert_one({
            "id": str(uuid.uuid4()),
            "title": title,
            "company": sirket,
            "type": tip,
            "salary": maas,
            "description": desc,
            "location": "Seydişehir",
            "created_at": now_iso(),
        })

    # Nöbetçi Eczane
    eczane = [
        ("Yıldız Eczanesi", "Antika Cd. No:24", "+90 332 582 1122", "08:30 - 08:30 (24 saat)"),
        ("Şifa Eczanesi", "Hastane Cd. No:8", "+90 332 582 3344", "08:30 - 08:30 (24 saat)"),
    ]
    for name, adres, tel, saat in eczane:
        await db.eczane.insert_one({
            "id": str(uuid.uuid4()),
            "name": name,
            "adres": adres,
            "telefon": tel,
            "saat": saat,
            "tarih": datetime.now(timezone.utc).date().isoformat(),
        })

    # Stories
    story_images = [
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
        "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=600",
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600",
    ]
    for i, (uid, name, uname, avatar) in enumerate(user_ids):
        await db.stories.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "username": uname,
            "full_name": name,
            "avatar_url": avatar,
            "image_url": story_images[i % len(story_images)],
            "created_at": now_iso(),
        })

    # Posts
    post_data = [
        ("Bugün şehirde harika bir gün ☀️", "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900"),
        ("Yeni açılan parkta yürüyüş 🌿", "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900"),
        ("Seydişehir manzarası eşsiz 🏔️", "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900"),
        ("Pastanenin yeni tatlısı ❤️", "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=900"),
        ("Akşam çayı keyfi ☕", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900"),
        ("Festival hazırlıkları başladı 🎉", "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900"),
    ]
    for i, (text, img) in enumerate(post_data):
        uid, name, uname, avatar = user_ids[i % len(user_ids)]
        await db.posts.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "username": uname,
            "full_name": name,
            "avatar_url": avatar,
            "text": text,
            "image_url": img,
            "like_count": 10 + i * 7,
            "comment_count": 2 + i,
            "liked_by": [],
            "created_at": now_iso(),
        })

    logger.info("Mock data seed complete.")


@app.on_event("startup")
async def startup_event():
    await seed_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@api_router.get("/")
async def root():
    return {"message": "Seydişehir Sosyal API çalışıyor"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
