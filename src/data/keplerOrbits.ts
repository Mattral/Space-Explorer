/**
 * Kepler Orbital Mechanics — Real orbital elements for solar system planets
 * Uses J2000.0 epoch elements with secular rates
 * Reference: NASA JPL Solar System Dynamics
 */

export interface OrbitalElements {
  a: number;       // Semi-major axis (AU)
  e: number;       // Eccentricity
  i: number;       // Inclination (degrees)
  L: number;       // Mean longitude (degrees)
  longPeri: number; // Longitude of perihelion (degrees)
  longNode: number; // Longitude of ascending node (degrees)
  // Rates per century
  aRate: number;
  eRate: number;
  iRate: number;
  LRate: number;
  longPeriRate: number;
  longNodeRate: number;
}

// J2000.0 orbital elements + century rates (NASA JPL)
export const orbitalElements: Record<string, OrbitalElements> = {
  mercury: {
    a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.25032350,
    longPeri: 77.45779628, longNode: 48.33076593,
    aRate: 0.00000037, eRate: 0.00001906, iRate: -0.00594749, LRate: 149472.67411175,
    longPeriRate: 0.16047689, longNodeRate: -0.12534081,
  },
  venus: {
    a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.97909950,
    longPeri: 131.60246718, longNode: 76.67984255,
    aRate: 0.00000390, eRate: -0.00004107, iRate: -0.00078890, LRate: 58517.81538729,
    longPeriRate: 0.00268329, longNodeRate: -0.27769418,
  },
  earth: {
    a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166,
    longPeri: 102.93768193, longNode: 0.0,
    aRate: 0.00000562, eRate: -0.00004392, iRate: -0.01294668, LRate: 35999.37244981,
    longPeriRate: 0.32327364, longNodeRate: 0.0,
  },
  mars: {
    a: 1.52371034, e: 0.09339410, i: 1.84969142, L: -4.55343205,
    longPeri: -23.94362959, longNode: 49.55953891,
    aRate: 0.00001847, eRate: 0.00007882, iRate: -0.00813131, LRate: 19140.30268499,
    longPeriRate: 0.44441088, longNodeRate: -0.29257343,
  },
  jupiter: {
    a: 5.20288700, e: 0.04838624, i: 1.30439695, L: 34.39644051,
    longPeri: 14.72847983, longNode: 100.47390909,
    aRate: -0.00011607, eRate: -0.00013253, iRate: -0.00183714, LRate: 3034.74612775,
    longPeriRate: 0.21252668, longNodeRate: 0.20469106,
  },
  saturn: {
    a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423,
    longPeri: 92.59887831, longNode: 113.66242448,
    aRate: -0.00125060, eRate: -0.00050991, iRate: 0.00193609, LRate: 1222.49362201,
    longPeriRate: -0.41897216, longNodeRate: -0.28867794,
  },
  uranus: {
    a: 19.18916464, e: 0.04725744, i: 0.77263783, L: 313.23810451,
    longPeri: 170.95427630, longNode: 74.01692503,
    aRate: -0.00196176, eRate: -0.00004397, iRate: -0.00242939, LRate: 428.48202785,
    longPeriRate: 0.40805281, longNodeRate: 0.04240589,
  },
  neptune: {
    a: 30.06992276, e: 0.00859048, i: 1.77004347, L: -55.12002969,
    longPeri: 44.96476227, longNode: 131.78422574,
    aRate: 0.00026291, eRate: 0.00005105, iRate: 0.00035372, LRate: 218.45945325,
    longPeriRate: -0.32241464, longNodeRate: -0.00508664,
  },
};

/**
 * Solve Kepler's equation M = E - e*sin(E) iteratively
 */
const solveKepler = (M: number, e: number, tolerance: number = 1e-8): number => {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
};

const deg2rad = (d: number) => d * Math.PI / 180;

/**
 * Calculate the heliocentric position of a planet at a given Julian date
 * Returns [x, y, z] in AU
 */
export const calculatePosition = (planetId: string, jd: number): [number, number, number] => {
  const elem = orbitalElements[planetId];
  if (!elem) return [0, 0, 0];

  // Centuries since J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // Current elements
  const a = elem.a + elem.aRate * T;
  const e = elem.e + elem.eRate * T;
  const I = deg2rad(elem.i + elem.iRate * T);
  const L = elem.L + elem.LRate * T;
  const wBar = elem.longPeri + elem.longPeriRate * T;
  const Omega = deg2rad(elem.longNode + elem.longNodeRate * T);

  // Argument of perihelion
  const w = deg2rad(wBar - (elem.longNode + elem.longNodeRate * T));

  // Mean anomaly
  let M = deg2rad(L - wBar);
  // Normalize to [-π, π]
  M = M % (2 * Math.PI);
  if (M > Math.PI) M -= 2 * Math.PI;
  if (M < -Math.PI) M += 2 * Math.PI;

  // Solve Kepler's equation
  const E = solveKepler(M, e);

  // True anomaly
  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Heliocentric ecliptic coordinates
  const cosW = Math.cos(w), sinW = Math.sin(w);
  const cosO = Math.cos(Omega), sinO = Math.sin(Omega);
  const cosI = Math.cos(I), sinI = Math.sin(I);

  const x = (cosW * cosO - sinW * sinO * cosI) * xPrime + (-sinW * cosO - cosW * sinO * cosI) * yPrime;
  const y = (cosW * sinO + sinW * cosO * cosI) * xPrime + (-sinW * sinO + cosW * cosO * cosI) * yPrime;
  const z = (sinW * sinI) * xPrime + (cosW * sinI) * yPrime;

  return [x, y, z];
};

/**
 * Get current Julian Date from a JS Date
 */
export const dateToJD = (date: Date): number => {
  return date.getTime() / 86400000 + 2440587.5;
};

/**
 * Get all planet positions for a given date, scaled for the 3D scene
 */
export const getAllPositions = (date: Date, sceneScale: number = 50): Record<string, [number, number, number]> => {
  const jd = dateToJD(date);
  const positions: Record<string, [number, number, number]> = {};

  for (const planetId of Object.keys(orbitalElements)) {
    const [x, y, z] = calculatePosition(planetId, jd);
    positions[planetId] = [x * sceneScale, z * sceneScale * 0.3, y * sceneScale]; // remap for Three.js coords
  }

  return positions;
};
