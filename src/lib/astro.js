// Where the sun and the moon are, for a place and a moment.
//
// Low-precision published formulas, chosen because a sky needs a fraction of a
// degree and these give that with a few dozen lines and no tables:
//
//   SUN   The Astronomical Almanac's low-precision solar coordinates
//         (Section C, "Low precision formulas for the Sun"): mean longitude,
//         mean anomaly, two-term equation of centre, linear obliquity. Stated
//         accuracy 0.01 deg in position between 1950 and 2050. This is the same
//         solution src/lib/weather.js solarPosition() has used since the home sky
//         went real, so the window and the home band agree on the sun.
//   MOON  The Astronomical Almanac's low-precision lunar coordinates
//         (Section D, "Low precision formulas for the Moon"): six periodic terms
//         in ecliptic longitude, four in latitude, four in horizontal parallax.
//         Stated accuracy about 0.3 deg in longitude and 0.2 deg in latitude
//         between 1900 and 2100. Topocentric correction by the Almanac's own
//         vector method (the moon's parallax is about a degree, so it matters).
//   PHASE Jean Meeus, "Astronomical Algorithms" (2nd ed., 1998), chapter 48:
//         elongation (48.2), phase angle (48.3), illuminated fraction (48.1) and
//         the position angle of the bright limb (48.5).
//   TILT  Meeus chapter 14, the parallactic angle (14.1), which turns the bright
//         limb's position angle (measured from celestial north) into the angle
//         an observer actually sees (measured from straight up).
//   SIDEREAL TIME  Meeus 12.4, truncated after the linear term.
//
// Precision note: the phase here is the TRUE one (the moon's ecliptic longitude
// run ahead of the sun's). weather.js moonPhase() counts MEAN lunations from a
// known new moon and can differ from it by about 0.02 of a cycle; both are fine
// for a picture, and the window uses this one because it agrees with the limb.
//
// CHECKED against JPL Horizons (ssd.jpl.nasa.gov/api/horizons.api, observer
// table, airless, site 77.59 E 12.97 N 0.914 km) on 2026-09-26, seven moments
// between June and December 2026. Worst errors over all seven: sun altitude and
// azimuth 0.005 deg; moon altitude 0.13 deg, azimuth 0.45 deg (at -70 deg
// altitude, where azimuth is touchy), illuminated fraction 0.005, bright-limb
// position angle 1.3 deg (non-full phases; at a full moon the limb has no
// direction to speak of). Three of them, to re-check by hand:
//
//   UTC 2026-09-26 12:11 (17:41 IST, the reference photo's hour)
//     sun   Horizons alt 6.986 az 266.971   here 6.985 / 266.975
//   UTC 2026-12-21 06:30 (winter solstice, solar noon-ish)
//     sun   Horizons alt 53.339 az 173.232  here 53.343 / 173.233
//   UTC 2026-10-13 13:30 (evening crescent in the west)
//     moon  Horizons alt 9.929 az 242.329 illum 0.0838 sub-sun PA 293.54
//           here     alt 9.96  az 242.33  illum 0.0872 bright limb PA 292.2
//           limbAngle -138.7 (down and to the right, toward the set sun); the
//           great-circle bearing from Horizons' moon to Horizons' sun gives
//           -137.3, which is the independent check on the sign convention
//
// Conventions used everywhere in this file:
//   angles are DEGREES in and out (radians only inside),
//   azimuth is a compass bearing: 0 north, 90 east, 180 south, 270 west,
//   altitude is geometric (no refraction), topocentric for the moon,
//   phase is 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter, 1 new,
//   limbAngle is where the lit edge of the moon points as seen by someone
//   facing it: 0 straight up, 90 to their LEFT, 180 straight down, -90 to their
//   right (counterclockwise on the sky, the same sense as a position angle).

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const AU_KM = 149597870.7;
const EARTH_RADIUS_KM = 6378.14;

const norm360 = (d) => ((d % 360) + 360) % 360;
const norm180 = (d) => {
  const x = norm360(d);
  return x > 180 ? x - 360 : x;
};
const sind = (d) => Math.sin(d * RAD);
const cosd = (d) => Math.cos(d * RAD);

export function julianDay(date = new Date()) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Greenwich mean sidereal time in degrees (Meeus 12.4, linear term only; the
// dropped T^2 term is under 0.4 arcseconds this century)
function gmstDeg(jd) {
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0));
}

function obliquityDeg(jd) {
  return 23.439 - 0.0000004 * (jd - 2451545.0);
}

// ecliptic (lon, lat) -> equatorial (ra, dec), all degrees
function eclToEq(lonDeg, latDeg, epsDeg) {
  const l = lonDeg * RAD, b = latDeg * RAD, e = epsDeg * RAD;
  const ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  return { ra: norm360(ra * DEG), dec: dec * DEG };
}

// equatorial + place + sidereal time -> horizontal. Azimuth from north through
// east. Returns the hour angle too, which the parallactic angle needs.
function eqToHorizontal(raDeg, decDeg, latDeg, lonDeg, jd) {
  const H = norm180(gmstDeg(jd) + lonDeg - raDeg);
  const h = H * RAD, d = decDeg * RAD, p = latDeg * RAD;
  const sinAlt = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h);
  const az = Math.atan2(-Math.cos(d) * Math.sin(h), Math.cos(p) * Math.sin(d) - Math.sin(p) * Math.cos(d) * Math.cos(h));
  return { alt: Math.asin(Math.max(-1, Math.min(1, sinAlt))) * DEG, az: norm360(az * DEG), hourAngle: H, sinAlt };
}

// --- the sun -------------------------------------------------------------------
// Geocentric apparent-enough coordinates of the sun (Almanac low precision).
function sunCoords(jd) {
  const n = jd - 2451545.0;
  const L = norm360(280.46 + 0.9856474 * n);
  const g = norm360(357.528 + 0.9856003 * n);
  const lon = norm360(L + 1.915 * sind(g) + 0.020 * sind(2 * g));
  const distAU = 1.00014 - 0.01671 * cosd(g) - 0.00014 * cosd(2 * g);
  const eps = obliquityDeg(jd);
  const { ra, dec } = eclToEq(lon, 0, eps);
  return { lon, ra, dec, distAU };
}

// { alt, az, sinAlt, hourAngle, ra, dec, distAU } for a place (degrees) and a Date
export function sunPosition(date, lat, lon) {
  const jd = julianDay(date);
  const s = sunCoords(jd);
  const h = eqToHorizontal(s.ra, s.dec, lat, lon, jd);
  return { alt: h.alt, az: h.az, sinAlt: h.sinAlt, hourAngle: h.hourAngle, ra: s.ra, dec: s.dec, distAU: s.distAU };
}

// --- the moon ------------------------------------------------------------------
// Geocentric ecliptic coordinates and parallax (Almanac low precision).
function moonCoords(jd) {
  const T = (jd - 2451545.0) / 36525;
  const lon = norm360(
    218.32 + 481267.881 * T
      + 6.29 * sind(135.0 + 477198.87 * T)
      - 1.27 * sind(259.3 - 413335.36 * T)
      + 0.66 * sind(235.7 + 890534.22 * T)
      + 0.21 * sind(269.9 + 954397.74 * T)
      - 0.19 * sind(357.5 + 35999.05 * T)
      - 0.11 * sind(186.5 + 966404.03 * T)
  );
  const lat =
    5.13 * sind(93.3 + 483202.02 * T)
    + 0.28 * sind(228.2 + 960400.89 * T)
    - 0.28 * sind(318.3 + 6003.15 * T)
    - 0.17 * sind(217.6 - 407332.21 * T);
  const par =
    0.9508
    + 0.0518 * cosd(135.0 + 477198.87 * T)
    + 0.0095 * cosd(259.3 - 413335.36 * T)
    + 0.0078 * cosd(235.7 + 890534.22 * T)
    + 0.0028 * cosd(269.9 + 954397.74 * T);
  const eps = obliquityDeg(jd);
  const { ra, dec } = eclToEq(lon, lat, eps);
  const distER = 1 / sind(par); // in Earth radii
  return { lon, lat, ra, dec, parallax: par, distER, distKm: distER * EARTH_RADIUS_KM };
}

// Topocentric right ascension and declination: the Almanac's vector method,
// subtracting the observer's position (on a spherical Earth, which is well inside
// the formula's own error) from the moon's.
function topocentric(m, latDeg, lonDeg, jd) {
  const lst = (gmstDeg(jd) + lonDeg) * RAD;
  const r = m.distER;
  const x = r * cosd(m.dec) * cosd(m.ra) - cosd(latDeg) * Math.cos(lst);
  const y = r * cosd(m.dec) * sind(m.ra) - cosd(latDeg) * Math.sin(lst);
  const z = r * sind(m.dec) - sind(latDeg);
  const rr = Math.hypot(x, y, z);
  return { ra: norm360(Math.atan2(y, x) * DEG), dec: Math.asin(z / rr) * DEG, distER: rr };
}

// Phase, illuminated fraction and the bright limb's position angle, geocentric
// (Meeus ch. 48). Works from the SAME sun and moon coordinates as the positions,
// so the lit side can never disagree with where the sun actually is.
export function moonIllumination(date = new Date()) {
  const jd = julianDay(date);
  const s = sunCoords(jd);
  const m = moonCoords(jd);
  // elongation (48.2)
  const cosPsi = sind(s.dec) * sind(m.dec) + cosd(s.dec) * cosd(m.dec) * cosd(s.ra - m.ra);
  const psi = Math.acos(Math.max(-1, Math.min(1, cosPsi)));
  // phase angle (48.3), with both distances in km
  const R = s.distAU * AU_KM;
  const i = Math.atan2(R * Math.sin(psi), m.distKm - R * Math.cos(psi));
  const illum = (1 + Math.cos(i)) / 2; // (48.1)
  // position angle of the bright limb (48.5), from celestial north toward east
  const chi = norm360(
    Math.atan2(cosd(s.dec) * sind(s.ra - m.ra), sind(s.dec) * cosd(m.dec) - cosd(s.dec) * sind(m.dec) * cosd(s.ra - m.ra)) * DEG
  );
  // phase as the fraction of the synodic cycle: how far the moon has run ahead of
  // the sun in ecliptic longitude. 0 new, 0.5 full, rising through 1.
  const phase = norm360(m.lon - s.lon) / 360;
  return { phase, illum, brightLimbPA: chi, elongation: psi * DEG, phaseAngle: i * DEG };
}

// Everything the window needs about the moon, for a place and a moment.
// { alt, az, phase, illum, limbAngle, brightLimbPA, parallacticAngle, distKm }
export function moonPosition(date, lat, lon) {
  const jd = julianDay(date);
  const m = moonCoords(jd);
  const t = topocentric(m, lat, lon, jd);
  const h = eqToHorizontal(t.ra, t.dec, lat, lon, jd);
  const ill = moonIllumination(date);
  // parallactic angle (Meeus 14.1): the tilt between celestial north and the
  // observer's up, at the moon. Positive west of the meridian.
  const q = Math.atan2(sind(h.hourAngle), Math.tan(lat * RAD) * cosd(t.dec) - sind(t.dec) * cosd(h.hourAngle)) * DEG;
  return {
    alt: h.alt,
    az: h.az,
    sinAlt: h.sinAlt,
    phase: ill.phase,
    illum: ill.illum,
    // Meeus: chi - q is the bright limb measured from the vertical, which is the
    // tilt of the crescent a person actually sees
    limbAngle: norm180(ill.brightLimbPA - q),
    brightLimbPA: ill.brightLimbPA,
    parallacticAngle: q,
    distKm: t.distER * EARTH_RADIUS_KM,
  };
}

// A compass direction as a unit vector in the window scene's world frame:
// x to the right, y up, +z from the window into the room. The window faces
// `bearing` (0 = north), so looking out of it is looking along -z.
export function worldDir(azDeg, altDeg, bearing = 0) {
  const a = (azDeg - bearing) * RAD, e = altDeg * RAD;
  return [Math.cos(e) * Math.sin(a), Math.sin(e), -Math.cos(e) * Math.cos(a)];
}

export { norm180, norm360 };
