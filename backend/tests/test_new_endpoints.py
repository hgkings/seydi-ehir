"""Tests for BiKonya-style additions: /namaz, /indirimler, categories shape, posts sort."""
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


class TestNamaz:
    def test_namaz_shape(self, client):
        r = client.get(f"{API}/namaz")
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["city"] == "Seydişehir"
        assert "date" in j and "times" in j
        assert isinstance(j["times"], list) and len(j["times"]) == 6
        names = [t["name"] for t in j["times"]]
        assert names == ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"]
        assert "next_index" in j and isinstance(j["next_index"], int)
        assert 0 <= j["next_index"] < 6
        assert j["next_name"] == j["times"][j["next_index"]]["name"]
        assert isinstance(j["next_in"], str) and len(j["next_in"]) > 0


class TestIndirimler:
    def test_indirimler_six_items(self, client):
        r = client.get(f"{API}/indirimler")
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list) and len(items) >= 6
        item = items[0]
        for field in ["id", "firma_name", "title", "discount_pct", "valid_until", "image_url"]:
            assert field in item, f"Missing field {field}"
        assert isinstance(item["discount_pct"], int)


class TestCategoriesEnriched:
    def test_categories_have_new_fields_and_slugs(self, client):
        r = client.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        slugs = {c["slug"] for c in cats}
        # New slugs added in BiKonya redesign
        for s in ["yeme-icme", "ikinci-el", "piknik", "noter", "kayip-buluntu", "namaz"]:
            assert s in slugs, f"Missing new slug: {s}"
        # Each cat should have group/subtitle/icon/bg/color/count/image_url
        for c in cats:
            for field in ["group", "subtitle", "icon", "bg", "color", "count", "image_url"]:
                assert field in c, f"Cat {c.get('slug')} missing {field}"

    def test_categories_groups(self, client):
        r = client.get(f"{API}/categories")
        cats = r.json()
        groups = {c["group"] for c in cats}
        # Expected group buckets
        expected = {"Günlük ihtiyaçlar", "Şehir gündemi", "İlan, alışveriş ve fırsatlar",
                    "Şehir & yaşam", "Hizmetler", "Sosyal"}
        assert expected.issubset(groups), f"Missing groups, got {groups}"


class TestPostsSort:
    def test_posts_sort_trend(self, client):
        r = client.get(f"{API}/posts", params={"sort": "trend"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        likes = [p.get("like_count", 0) for p in items]
        assert likes == sorted(likes, reverse=True), "Trend should be desc by like_count"

    def test_posts_sort_latest(self, client):
        r = client.get(f"{API}/posts", params={"sort": "latest"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        dates = [p.get("created_at", "") for p in items]
        assert dates == sorted(dates, reverse=True), "Latest should be desc by created_at"
