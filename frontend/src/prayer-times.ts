// Astronomical prayer time calculation – Diyanet method
// Seydişehir, Turkey: 37.4167°N, 31.85°E, UTC+3
const LAT = 37.4167;
const LON = 31.85;
const TZ = 3;
const FAJR_ANGLE = 18.0;
const ISHA_ANGLE = 17.0;

function rad(d: number) { return (d * Math.PI) / 180; }
function deg(r: number) { return (r * 180) / Math.PI; }
function fixH(h: number) { return h - 24 * Math.floor(h / 24); }

function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunPos(jd: number) {
  const D = jd - 2451545.0;
  const g = rad(357.529 + 0.98560028 * D);
  const q = 280.459 + 0.98564736 * D;
  const L = rad(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const e = rad(23.439 - 3.6e-7 * D);
  const RA = deg(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15;
  const eqt = q / 15 - fixH(RA);
  const decl = Math.asin(Math.sin(e) * Math.sin(L));
  return { decl, eqt };
}

function hourAngle(angle: number, decl: number): number {
  const cosH =
    (Math.sin(rad(angle)) - Math.sin(rad(LAT)) * Math.sin(decl)) /
    (Math.cos(rad(LAT)) * Math.cos(decl));
  if (cosH < -1 || cosH > 1) return 0;
  return deg(Math.acos(cosH)) / 15;
}

function fmt(h: number): string {
  h = fixH(h);
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  if (mm === 60) return `${String(hh + 1).padStart(2, '0')}:00`;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function computePrayerTimes(date: Date): Record<string, string> {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { decl, eqt } = sunPos(jd);
  const noon = 12 - LON / 15 - eqt + TZ;
  const srHA = hourAngle(-0.833, decl);
  const sunrise = noon - srHA;
  const sunset = noon + srHA;
  const asrAngle = -deg(Math.atan(1 + Math.tan(Math.abs(rad(LAT) - decl))));
  const asr = noon + hourAngle(asrAngle, decl);
  const fajr = noon - hourAngle(-FAJR_ANGLE, decl);
  const isha = noon + hourAngle(-ISHA_ANGLE, decl);
  return {
    'İmsak': fmt(fajr),
    'Güneş': fmt(sunrise),
    'Öğle': fmt(noon),
    'İkindi': fmt(asr),
    'Akşam': fmt(sunset),
    'Yatsı': fmt(isha),
  };
}

export function getPrayerTimesList(date: Date) {
  const times = computePrayerTimes(date);
  return Object.entries(times).map(([name, time]) => ({ name, time }));
}
