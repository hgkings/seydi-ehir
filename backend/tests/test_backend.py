"""Seydişehir Sosyal Şehir Uygulaması - Backend API tests.
Covers: health, auth (mock OTP), content endpoints, social flow.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth(client):
    """Register a unique test user and verify OTP, returning token + user."""
    import time
    phone = f"+9055599{int(time.time()) % 100000:05d}"
    r = client.post(f"{API}/auth/register", json={
        "phone": phone, "full_name": "TEST User", "username": f"test_{int(time.time())}"
    })
    assert r.status_code == 200, r.text
    assert r.json().get("otp_debug") == "123456"
    r2 = client.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    assert r2.status_code == 200, r2.text
    data = r2.json()
    return {"token": data["token"], "user": data["user"], "phone": phone}


# ============================ HEALTH ============================
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "Seydişehir" in r.json()["message"]


# ============================ AUTH ============================
class TestAuth:
    def test_register_new_and_verify(self, client):
        import time
        phone = f"+9055580{int(time.time()) % 100000:05d}"
        r = client.post(f"{API}/auth/register", json={
            "phone": phone, "full_name": "Reg User", "username": f"reg_{int(time.time())}"
        })
        assert r.status_code == 200
        j = r.json()
        assert j["otp_debug"] == "123456"
        assert j["existing"] is False

        r2 = client.post(f"{API}/auth/verify-otp", json={"phone": phone, "otp": "123456"})
        assert r2.status_code == 200
        d = r2.json()
        assert "token" in d and "user" in d
        assert d["user"]["phone"] == phone
        assert d["user"]["full_name"] == "Reg User"

    def test_verify_wrong_otp(self, client, auth):
        r = client.post(f"{API}/auth/verify-otp", json={"phone": auth["phone"], "otp": "000000"})
        assert r.status_code == 400

    def test_me_with_token(self, client, auth):
        r = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {auth['token']}"})
        assert r.status_code == 200
        assert r.json()["id"] == auth["user"]["id"]

    def test_me_unauthorized(self, client):
        r = client.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_login_existing(self, client, auth):
        r = client.post(f"{API}/auth/login", json={"phone": auth["phone"]})
        assert r.status_code == 200
        assert r.json()["otp_debug"] == "123456"

    def test_login_not_registered(self, client):
        r = client.post(f"{API}/auth/login", json={"phone": "+905550000000"})
        assert r.status_code == 404


# ============================ CONTENT ============================
class TestContent:
    def test_weather(self, client):
        r = client.get(f"{API}/weather")
        assert r.status_code == 200
        j = r.json()
        assert j["city"] == "Seydişehir"
        assert isinstance(j["temp"], int)

    def test_categories_16(self, client):
        r = client.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 16
        assert {"slug", "name", "icon", "color"}.issubset(cats[0].keys())

    def test_firmalar_list_and_filter_and_detail(self, client):
        r = client.get(f"{API}/firmalar")
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        fid = items[0]["id"]
        kat = items[0]["kategori"]

        r2 = client.get(f"{API}/firmalar", params={"kategori": kat})
        assert r2.status_code == 200
        assert all(x["kategori"] == kat for x in r2.json())

        r3 = client.get(f"{API}/firmalar/{fid}")
        assert r3.status_code == 200
        assert r3.json()["id"] == fid

        r4 = client.get(f"{API}/firmalar/nonexistent-id")
        assert r4.status_code == 404

    def test_haberler(self, client):
        r = client.get(f"{API}/haberler")
        assert r.status_code == 200 and len(r.json()) > 0
        hid = r.json()[0]["id"]
        r2 = client.get(f"{API}/haberler/{hid}")
        assert r2.status_code == 200 and r2.json()["id"] == hid

    def test_etkinlikler(self, client):
        r = client.get(f"{API}/etkinlikler")
        assert r.status_code == 200 and len(r.json()) > 0
        eid = r.json()[0]["id"]
        r2 = client.get(f"{API}/etkinlikler/{eid}")
        assert r2.status_code == 200 and r2.json()["id"] == eid

    def test_ilanlar(self, client):
        r = client.get(f"{API}/ilanlar")
        assert r.status_code == 200 and len(r.json()) > 0
        iid = r.json()[0]["id"]
        r2 = client.get(f"{API}/ilanlar/{iid}")
        assert r2.status_code == 200 and r2.json()["id"] == iid

    def test_is_ilanlari(self, client):
        r = client.get(f"{API}/is-ilanlari")
        assert r.status_code == 200 and len(r.json()) > 0

    def test_eczane(self, client):
        r = client.get(f"{API}/eczane")
        assert r.status_code == 200 and len(r.json()) > 0

    def test_stories(self, client):
        r = client.get(f"{API}/stories")
        assert r.status_code == 200 and len(r.json()) > 0

    def test_posts_list(self, client):
        r = client.get(f"{API}/posts")
        assert r.status_code == 200 and len(r.json()) > 0
        assert "liked_by_me" in r.json()[0]

    def test_discover(self, client):
        r = client.get(f"{API}/discover")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0


# ============================ SOCIAL FLOW ============================
class TestSocial:
    def test_create_like_comment(self, client, auth):
        h = {"Authorization": f"Bearer {auth['token']}"}
        # Create post
        r = client.post(f"{API}/posts", json={"text": "TEST_post merhaba"}, headers=h)
        assert r.status_code == 200, r.text
        post = r.json()
        pid = post["id"]
        assert post["user_id"] == auth["user"]["id"]

        # Like
        r2 = client.post(f"{API}/posts/{pid}/like", headers=h)
        assert r2.status_code == 200 and r2.json()["liked"] is True
        # Unlike
        r3 = client.post(f"{API}/posts/{pid}/like", headers=h)
        assert r3.status_code == 200 and r3.json()["liked"] is False

        # Comment
        r4 = client.post(f"{API}/posts/{pid}/comments", json={"text": "TEST_yorum"}, headers=h)
        assert r4.status_code == 200
        r5 = client.get(f"{API}/posts/{pid}/comments")
        assert r5.status_code == 200 and any(c["text"] == "TEST_yorum" for c in r5.json())

    def test_create_post_unauthorized(self, client):
        r = client.post(f"{API}/posts", json={"text": "x"})
        assert r.status_code == 401
