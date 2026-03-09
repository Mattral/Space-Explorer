/**
 * Real constellation data — IAU 88 subset with accurate star positions
 * RA (Right Ascension) in hours, Dec (Declination) in degrees
 */

interface Star {
  name?: string;
  ra: number;
  dec: number;
  magnitude: number;
}

interface ConstellationLine {
  from: number;
  to: number;
}

export interface Constellation {
  name: string;
  abbreviation: string;
  stars: Star[];
  lines: ConstellationLine[];
}

export const celestialToCartesian = (ra: number, dec: number, radius: number = 800): [number, number, number] => {
  const raRad = (ra / 24) * Math.PI * 2;
  const decRad = (dec / 180) * Math.PI;
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);
  return [x, y, z];
};

export const constellations: Constellation[] = [
  // ── Northern Sky ──
  {
    name: "Ursa Major", abbreviation: "UMa",
    stars: [
      { name: "Dubhe", ra: 11.06, dec: 61.75, magnitude: 1.79 },
      { name: "Merak", ra: 11.03, dec: 56.38, magnitude: 2.37 },
      { name: "Phecda", ra: 11.90, dec: 53.69, magnitude: 2.44 },
      { name: "Megrez", ra: 12.26, dec: 57.03, magnitude: 3.31 },
      { name: "Alioth", ra: 12.90, dec: 55.96, magnitude: 1.77 },
      { name: "Mizar", ra: 13.40, dec: 54.93, magnitude: 2.27 },
      { name: "Alkaid", ra: 13.79, dec: 49.31, magnitude: 1.86 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
      { from: 3, to: 0 },
    ],
  },
  {
    name: "Ursa Minor", abbreviation: "UMi",
    stars: [
      { name: "Polaris", ra: 2.53, dec: 89.26, magnitude: 1.98 },
      { name: "Kochab", ra: 14.85, dec: 74.16, magnitude: 2.08 },
      { name: "Pherkad", ra: 15.35, dec: 71.83, magnitude: 3.00 },
      { ra: 15.73, dec: 77.79, magnitude: 4.36 },
      { ra: 16.29, dec: 75.76, magnitude: 4.23 },
      { ra: 17.54, dec: 86.59, magnitude: 4.35 },
      { ra: 16.77, dec: 82.04, magnitude: 4.95 },
    ],
    lines: [
      { from: 0, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 1 },
      { from: 1, to: 2 }, { from: 2, to: 4 }, { from: 4, to: 3 },
    ],
  },
  {
    name: "Cassiopeia", abbreviation: "Cas",
    stars: [
      { name: "Schedar", ra: 0.68, dec: 56.54, magnitude: 2.23 },
      { name: "Caph", ra: 0.15, dec: 59.15, magnitude: 2.27 },
      { ra: 0.95, dec: 60.72, magnitude: 2.47 },
      { ra: 1.43, dec: 60.24, magnitude: 2.68 },
      { ra: 1.91, dec: 63.67, magnitude: 3.37 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    ],
  },
  {
    name: "Cepheus", abbreviation: "Cep",
    stars: [
      { name: "Alderamin", ra: 21.31, dec: 62.59, magnitude: 2.51 },
      { ra: 21.48, dec: 70.56, magnitude: 3.23 },
      { ra: 23.66, dec: 77.63, magnitude: 3.35 },
      { ra: 22.83, dec: 66.20, magnitude: 3.43 },
      { ra: 22.49, dec: 58.20, magnitude: 3.52 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 0 },
    ],
  },
  {
    name: "Draco", abbreviation: "Dra",
    stars: [
      { name: "Eltanin", ra: 17.94, dec: 51.49, magnitude: 2.23 },
      { name: "Rastaban", ra: 17.51, dec: 52.30, magnitude: 2.79 },
      { ra: 17.15, dec: 65.71, magnitude: 3.17 },
      { ra: 16.40, dec: 61.51, magnitude: 2.74 },
      { ra: 15.42, dec: 58.97, magnitude: 3.29 },
      { ra: 12.56, dec: 69.79, magnitude: 3.83 },
      { ra: 11.52, dec: 69.33, magnitude: 3.07 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5 }, { from: 5, to: 6 },
    ],
  },
  // ── Zodiac ──
  {
    name: "Orion", abbreviation: "Ori",
    stars: [
      { name: "Betelgeuse", ra: 5.92, dec: 7.41, magnitude: 0.42 },
      { name: "Rigel", ra: 5.24, dec: -8.20, magnitude: 0.13 },
      { name: "Bellatrix", ra: 5.42, dec: 6.35, magnitude: 1.64 },
      { name: "Mintaka", ra: 5.53, dec: -0.30, magnitude: 2.23 },
      { name: "Alnilam", ra: 5.60, dec: -1.20, magnitude: 1.69 },
      { name: "Alnitak", ra: 5.68, dec: -1.94, magnitude: 1.77 },
      { name: "Saiph", ra: 5.80, dec: -9.67, magnitude: 2.09 },
    ],
    lines: [
      { from: 0, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 1 },
      { from: 1, to: 3 }, { from: 0, to: 5 },
    ],
  },
  {
    name: "Scorpius", abbreviation: "Sco",
    stars: [
      { name: "Antares", ra: 16.49, dec: -26.43, magnitude: 0.96 },
      { ra: 16.00, dec: -22.62, magnitude: 2.63 },
      { ra: 16.09, dec: -19.81, magnitude: 2.56 },
      { ra: 16.35, dec: -25.59, magnitude: 2.29 },
      { name: "Shaula", ra: 17.56, dec: -37.10, magnitude: 1.63 },
      { ra: 17.20, dec: -43.24, magnitude: 1.87 },
      { ra: 17.71, dec: -39.03, magnitude: 2.69 },
    ],
    lines: [
      { from: 2, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
      { from: 0, to: 5 }, { from: 5, to: 4 }, { from: 4, to: 6 },
    ],
  },
  {
    name: "Leo", abbreviation: "Leo",
    stars: [
      { name: "Regulus", ra: 10.14, dec: 11.97, magnitude: 1.35 },
      { name: "Denebola", ra: 11.82, dec: 14.57, magnitude: 2.14 },
      { name: "Algieba", ra: 10.33, dec: 19.84, magnitude: 2.56 },
      { name: "Zosma", ra: 11.24, dec: 20.52, magnitude: 2.98 },
      { ra: 10.28, dec: 23.42, magnitude: 3.44 },
    ],
    lines: [
      { from: 0, to: 2 }, { from: 2, to: 4 }, { from: 4, to: 3 },
      { from: 3, to: 1 }, { from: 2, to: 3 },
    ],
  },
  {
    name: "Gemini", abbreviation: "Gem",
    stars: [
      { name: "Castor", ra: 7.58, dec: 31.89, magnitude: 1.58 },
      { name: "Pollux", ra: 7.76, dec: 28.03, magnitude: 1.14 },
      { ra: 6.63, dec: 16.40, magnitude: 3.06 },
      { ra: 6.38, dec: 22.51, magnitude: 3.36 },
      { ra: 6.73, dec: 25.13, magnitude: 3.06 },
      { ra: 7.07, dec: 20.57, magnitude: 2.88 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 0, to: 4 }, { from: 4, to: 3 },
      { from: 1, to: 5 }, { from: 5, to: 2 },
    ],
  },
  {
    name: "Taurus", abbreviation: "Tau",
    stars: [
      { name: "Aldebaran", ra: 4.60, dec: 16.51, magnitude: 0.85 },
      { ra: 4.48, dec: 15.96, magnitude: 3.53 },
      { ra: 4.33, dec: 17.54, magnitude: 3.41 },
      { name: "El Nath", ra: 5.44, dec: 28.61, magnitude: 1.65 },
      { ra: 5.63, dec: 21.14, magnitude: 2.87 },
      { ra: 4.01, dec: 12.49, magnitude: 3.74 },
    ],
    lines: [
      { from: 5, to: 0 }, { from: 0, to: 1 }, { from: 1, to: 2 },
      { from: 0, to: 4 }, { from: 4, to: 3 },
    ],
  },
  {
    name: "Virgo", abbreviation: "Vir",
    stars: [
      { name: "Spica", ra: 13.42, dec: -11.16, magnitude: 0.97 },
      { name: "Porrima", ra: 12.69, dec: -1.45, magnitude: 2.74 },
      { ra: 13.04, dec: 10.96, magnitude: 2.83 },
      { ra: 12.33, dec: -0.67, magnitude: 3.37 },
      { ra: 11.84, dec: 1.76, magnitude: 3.61 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 3, to: 4 },
    ],
  },
  {
    name: "Sagittarius", abbreviation: "Sgr",
    stars: [
      { name: "Kaus Australis", ra: 18.40, dec: -34.38, magnitude: 1.85 },
      { ra: 18.35, dec: -29.83, magnitude: 2.81 },
      { ra: 18.10, dec: -30.42, magnitude: 2.60 },
      { name: "Nunki", ra: 18.92, dec: -26.30, magnitude: 2.02 },
      { ra: 19.04, dec: -29.88, magnitude: 2.89 },
      { ra: 18.76, dec: -26.99, magnitude: 2.99 },
      { ra: 18.47, dec: -25.42, magnitude: 3.11 },
    ],
    lines: [
      { from: 2, to: 0 }, { from: 0, to: 4 }, { from: 4, to: 3 },
      { from: 3, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 1 },
      { from: 1, to: 2 },
    ],
  },
  {
    name: "Aquarius", abbreviation: "Aqr",
    stars: [
      { name: "Sadalsuud", ra: 21.53, dec: -5.57, magnitude: 2.91 },
      { name: "Sadalmelik", ra: 22.10, dec: -0.32, magnitude: 2.96 },
      { ra: 22.48, dec: -0.02, magnitude: 3.77 },
      { ra: 22.36, dec: -1.39, magnitude: 3.84 },
      { ra: 22.88, dec: -7.58, magnitude: 3.73 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 3, to: 4 },
    ],
  },
  {
    name: "Pisces", abbreviation: "Psc",
    stars: [
      { ra: 1.52, dec: 15.35, magnitude: 3.62 },
      { ra: 23.99, dec: 6.86, magnitude: 3.82 },
      { ra: 23.67, dec: 5.63, magnitude: 4.13 },
      { ra: 1.05, dec: 7.89, magnitude: 4.48 },
      { ra: 2.03, dec: 2.76, magnitude: 4.27 },
    ],
    lines: [
      { from: 0, to: 3 }, { from: 3, to: 4 }, { from: 1, to: 2 },
    ],
  },
  {
    name: "Aries", abbreviation: "Ari",
    stars: [
      { name: "Hamal", ra: 2.12, dec: 23.46, magnitude: 2.00 },
      { name: "Sheratan", ra: 1.91, dec: 20.81, magnitude: 2.64 },
      { ra: 1.89, dec: 19.29, magnitude: 3.63 },
    ],
    lines: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    name: "Cancer", abbreviation: "Cnc",
    stars: [
      { ra: 8.78, dec: 28.76, magnitude: 3.52 },
      { ra: 8.74, dec: 21.47, magnitude: 3.94 },
      { ra: 8.72, dec: 18.15, magnitude: 4.02 },
      { ra: 8.27, dec: 9.19, magnitude: 3.53 },
    ],
    lines: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }],
  },
  {
    name: "Capricornus", abbreviation: "Cap",
    stars: [
      { name: "Deneb Algedi", ra: 21.78, dec: -16.13, magnitude: 2.87 },
      { ra: 20.29, dec: -12.51, magnitude: 3.57 },
      { ra: 20.35, dec: -14.78, magnitude: 3.68 },
      { ra: 21.44, dec: -22.41, magnitude: 3.74 },
    ],
    lines: [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 }, { from: 0, to: 1 }],
  },
  {
    name: "Libra", abbreviation: "Lib",
    stars: [
      { name: "Zubeneschamali", ra: 15.28, dec: -9.38, magnitude: 2.61 },
      { name: "Zubenelgenubi", ra: 14.85, dec: -16.04, magnitude: 2.75 },
      { ra: 15.07, dec: -25.28, magnitude: 3.29 },
    ],
    lines: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 2 }],
  },
  // ── Southern Sky ──
  {
    name: "Crux", abbreviation: "Cru",
    stars: [
      { name: "Acrux", ra: 12.44, dec: -63.10, magnitude: 0.76 },
      { name: "Mimosa", ra: 12.80, dec: -59.69, magnitude: 1.25 },
      { ra: 12.52, dec: -57.11, magnitude: 1.63 },
      { ra: 12.25, dec: -58.75, magnitude: 2.80 },
    ],
    lines: [{ from: 0, to: 2 }, { from: 1, to: 3 }],
  },
  {
    name: "Centaurus", abbreviation: "Cen",
    stars: [
      { name: "Alpha Centauri", ra: 14.66, dec: -60.83, magnitude: -0.27 },
      { name: "Hadar", ra: 14.06, dec: -60.37, magnitude: 0.61 },
      { ra: 13.93, dec: -47.29, magnitude: 2.06 },
      { ra: 14.11, dec: -36.37, magnitude: 2.55 },
      { ra: 12.69, dec: -48.96, magnitude: 2.20 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 4 }, { from: 2, to: 3 },
    ],
  },
  {
    name: "Canis Major", abbreviation: "CMa",
    stars: [
      { name: "Sirius", ra: 6.75, dec: -16.72, magnitude: -1.46 },
      { name: "Adhara", ra: 6.98, dec: -28.97, magnitude: 1.50 },
      { name: "Wezen", ra: 7.14, dec: -26.39, magnitude: 1.84 },
      { ra: 6.61, dec: -19.26, magnitude: 2.45 },
      { ra: 7.06, dec: -23.83, magnitude: 3.02 },
    ],
    lines: [
      { from: 0, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 2 }, { from: 2, to: 1 },
    ],
  },
  {
    name: "Canis Minor", abbreviation: "CMi",
    stars: [
      { name: "Procyon", ra: 7.66, dec: 5.22, magnitude: 0.34 },
      { ra: 7.45, dec: 8.29, magnitude: 2.90 },
    ],
    lines: [{ from: 0, to: 1 }],
  },
  // ── Notable ──
  {
    name: "Lyra", abbreviation: "Lyr",
    stars: [
      { name: "Vega", ra: 18.62, dec: 38.78, magnitude: 0.03 },
      { ra: 18.98, dec: 32.69, magnitude: 3.24 },
      { ra: 18.75, dec: 37.60, magnitude: 3.26 },
      { ra: 18.83, dec: 36.90, magnitude: 3.52 },
    ],
    lines: [{ from: 0, to: 2 }, { from: 0, to: 3 }, { from: 2, to: 1 }, { from: 3, to: 1 }],
  },
  {
    name: "Cygnus", abbreviation: "Cyg",
    stars: [
      { name: "Deneb", ra: 20.69, dec: 45.28, magnitude: 1.25 },
      { name: "Sadr", ra: 20.37, dec: 40.26, magnitude: 2.20 },
      { name: "Albireo", ra: 19.51, dec: 27.96, magnitude: 3.08 },
      { ra: 20.77, dec: 33.97, magnitude: 2.48 },
      { ra: 19.75, dec: 45.13, magnitude: 2.46 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 },
    ],
  },
  {
    name: "Aquila", abbreviation: "Aql",
    stars: [
      { name: "Altair", ra: 19.85, dec: 8.87, magnitude: 0.77 },
      { ra: 19.77, dec: 10.61, magnitude: 2.72 },
      { ra: 19.92, dec: 6.41, magnitude: 3.23 },
      { ra: 19.10, dec: 13.86, magnitude: 3.36 },
    ],
    lines: [{ from: 1, to: 0 }, { from: 0, to: 2 }, { from: 3, to: 1 }],
  },
  {
    name: "Perseus", abbreviation: "Per",
    stars: [
      { name: "Mirfak", ra: 3.41, dec: 49.86, magnitude: 1.79 },
      { name: "Algol", ra: 3.14, dec: 40.96, magnitude: 2.12 },
      { ra: 3.08, dec: 53.51, magnitude: 2.85 },
      { ra: 3.96, dec: 40.01, magnitude: 2.93 },
    ],
    lines: [{ from: 2, to: 0 }, { from: 0, to: 1 }, { from: 0, to: 3 }],
  },
  {
    name: "Andromeda", abbreviation: "And",
    stars: [
      { name: "Alpheratz", ra: 0.14, dec: 29.09, magnitude: 2.06 },
      { name: "Mirach", ra: 1.16, dec: 35.62, magnitude: 2.06 },
      { name: "Almach", ra: 2.07, dec: 42.33, magnitude: 2.17 },
    ],
    lines: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    name: "Pegasus", abbreviation: "Peg",
    stars: [
      { name: "Markab", ra: 23.08, dec: 15.21, magnitude: 2.49 },
      { name: "Scheat", ra: 23.06, dec: 28.08, magnitude: 2.42 },
      { name: "Algenib", ra: 0.22, dec: 15.18, magnitude: 2.83 },
      // Alpheratz shared with Andromeda
    ],
    lines: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
  },
  {
    name: "Boötes", abbreviation: "Boo",
    stars: [
      { name: "Arcturus", ra: 14.26, dec: 19.18, magnitude: -0.05 },
      { ra: 14.53, dec: 30.37, magnitude: 3.03 },
      { ra: 15.03, dec: 40.39, magnitude: 2.68 },
      { ra: 14.75, dec: 27.07, magnitude: 2.68 },
    ],
    lines: [{ from: 0, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 }],
  },
  {
    name: "Corona Borealis", abbreviation: "CrB",
    stars: [
      { name: "Alphecca", ra: 15.58, dec: 26.71, magnitude: 2.23 },
      { ra: 15.46, dec: 29.11, magnitude: 3.68 },
      { ra: 15.71, dec: 26.30, magnitude: 3.84 },
      { ra: 15.83, dec: 26.88, magnitude: 4.15 },
    ],
    lines: [{ from: 1, to: 0 }, { from: 0, to: 2 }, { from: 2, to: 3 }],
  },
  {
    name: "Eridanus", abbreviation: "Eri",
    stars: [
      { name: "Achernar", ra: 1.63, dec: -57.24, magnitude: 0.46 },
      { ra: 3.55, dec: -9.46, magnitude: 2.79 },
      { ra: 2.97, dec: -40.30, magnitude: 2.84 },
      { ra: 3.04, dec: -23.62, magnitude: 3.54 },
    ],
    lines: [{ from: 1, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 0 }],
  },
  {
    name: "Carina", abbreviation: "Car",
    stars: [
      { name: "Canopus", ra: 6.40, dec: -52.70, magnitude: -0.74 },
      { ra: 8.38, dec: -59.51, magnitude: 1.86 },
      { ra: 9.22, dec: -59.28, magnitude: 1.68 },
      { ra: 9.28, dec: -69.72, magnitude: 2.25 },
    ],
    lines: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }],
  },
];

export const polaris = {
  name: "Polaris",
  ra: 2.53,
  dec: 89.26,
  magnitude: 1.98,
};
