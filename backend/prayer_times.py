"""
Seydişehir namaz vakitleri hesaplayıcı.

Kaynak formüller: https://www.islamicfinder.org/prayer-times/calculation-methods/
Kullanılan yöntem: Diyanet İşleri Başkanlığı (Fajr 18°, Isha 17°, Asr Standard)
"""
import math
import datetime


LAT = 37.4167
LON = 31.8500
TZ_OFFSET = 3  # UTC+3 (Türkiye)

# Diyanet açıları
FAJR_ANGLE = 18.0
ISHA_ANGLE = 17.0


def _deg(x: float) -> float:
    return math.degrees(x)


def _rad(x: float) -> float:
    return math.radians(x)


def _fix_angle(a: float) -> float:
    a = a - 360.0 * math.floor(a / 360.0)
    return a if a >= 0 else a + 360.0


def _sun_position(jd: float) -> tuple[float, float]:
    """Julian day → (declination_deg, equation_of_time_hours)"""
    d = jd - 2451545.0
    g = _fix_angle(357.529 + 0.98560028 * d)
    q = _fix_angle(280.459 + 0.98564736 * d)
    L = _fix_angle(q + 1.9148 * math.sin(_rad(g)) + 0.0200 * math.sin(_rad(2 * g)))
    e = 23.439 - 0.0000004 * d
    RA = _deg(math.atan2(math.cos(_rad(e)) * math.sin(_rad(L)), math.cos(_rad(L)))) / 15.0
    dec = _deg(math.asin(math.sin(_rad(e)) * math.sin(_rad(L))))
    Etime = q / 15.0 - _fix_angle(RA)
    if Etime > 12:
        Etime -= 24
    elif Etime < -12:
        Etime += 24
    return dec, Etime


def _julian_day(year: int, month: int, day: int) -> float:
    if month <= 2:
        year -= 1
        month += 12
    A = math.floor(year / 100.0)
    B = 2 - A + math.floor(A / 4.0)
    return math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + B - 1524.5


def _hour_angle(lat: float, dec: float, angle: float) -> float:
    """Returns hour angle in degrees for a given solar angle."""
    cos_ha = (math.sin(_rad(angle)) - math.sin(_rad(lat)) * math.sin(_rad(dec))) / (
        math.cos(_rad(lat)) * math.cos(_rad(dec))
    )
    if cos_ha < -1:
        return 180.0
    if cos_ha > 1:
        return 0.0
    return _deg(math.acos(cos_ha))


def _asr_hour_angle(lat: float, dec: float, shadow_factor: int = 1) -> float:
    """Standard Asr (shadow_factor=1)."""
    target = _deg(math.atan(1.0 / (shadow_factor + math.tan(_rad(abs(lat - dec))))))
    return _hour_angle(lat, dec, target)


def _hours_to_hhmm(h: float) -> str:
    h = h % 24
    total_min = round(h * 60)
    hh = total_min // 60 % 24
    mm = total_min % 60
    return f"{hh:02d}:{mm:02d}"


def compute(date: datetime.date, lat: float = LAT, lon: float = LON, tz: int = TZ_OFFSET) -> dict:
    jd = _julian_day(date.year, date.month, date.day)
    dec, etime = _sun_position(jd)

    # Dhuhr (öğle): solar noon
    dhuhr = 12 + tz - lon / 15.0 - etime

    ha_sunrise = _hour_angle(lat, dec, -0.8333)  # sunrise/sunset
    ha_fajr    = _hour_angle(lat, dec, -FAJR_ANGLE)
    ha_isha    = _hour_angle(lat, dec, -ISHA_ANGLE)
    ha_asr     = _asr_hour_angle(lat, dec, 1)

    fajr    = dhuhr - ha_fajr / 15.0
    sunrise = dhuhr - ha_sunrise / 15.0
    asr     = dhuhr + ha_asr / 15.0
    maghrib = dhuhr + ha_sunrise / 15.0
    isha    = dhuhr + ha_isha / 15.0
    # İmsak: Diyanet'te İmsak = Fajr (aynı açı), bazı kaynaklarda Fajr-10dk
    imsak   = fajr

    return {
        "İmsak":  _hours_to_hhmm(imsak),
        "Güneş":  _hours_to_hhmm(sunrise),
        "Öğle":   _hours_to_hhmm(dhuhr),
        "İkindi": _hours_to_hhmm(asr),
        "Akşam":  _hours_to_hhmm(maghrib),
        "Yatsı":  _hours_to_hhmm(isha),
    }


def as_list(date: datetime.date) -> list[dict]:
    r = compute(date)
    return [{"name": k, "time": v} for k, v in r.items()]
