/**
 * Real constellation data — star positions mapped to celestial coordinates
 * Converted to 3D positions on a celestial sphere (radius ~800)
 * RA (Right Ascension) → longitude, Dec (Declination) → latitude
 */

interface Star {
  name?: string;
  ra: number; // hours
  dec: number; // degrees
  magnitude: number; // brightness (lower = brighter)
}

interface ConstellationLine {
  from: number; // index into stars array
  to: number;
}

export interface Constellation {
  name: string;
  abbreviation: string;
  stars: Star[];
  lines: ConstellationLine[];
}

// Convert RA/Dec to 3D position on a sphere
export const celestialToCartesian = (ra: number, dec: number, radius: number = 800): [number, number, number] => {
  const raRad = (ra / 24) * Math.PI * 2;
  const decRad = (dec / 180) * Math.PI;
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);
  return [x, y, z];
};

export const constellations: Constellation[] = [
  {
    name: "Ursa Major",
    abbreviation: "UMa",
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
    name: "Orion",
    abbreviation: "Ori",
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
    name: "Scorpius",
    abbreviation: "Sco",
    stars: [
      { name: "Antares", ra: 16.49, dec: -26.43, magnitude: 0.96 },
      { ra: 16.00, dec: -22.62, magnitude: 2.63 },
      { ra: 16.09, dec: -19.81, magnitude: 2.56 },
      { ra: 16.35, dec: -25.59, magnitude: 2.29 },
      { ra: 17.20, dec: -43.24, magnitude: 1.87 },
      { ra: 17.56, dec: -37.10, magnitude: 1.63 },
    ],
    lines: [
      { from: 2, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 0 },
      { from: 0, to: 4 }, { from: 4, to: 5 },
    ],
  },
  {
    name: "Leo",
    abbreviation: "Leo",
    stars: [
      { name: "Regulus", ra: 10.14, dec: 11.97, magnitude: 1.35 },
      { name: "Denebola", ra: 11.82, dec: 14.57, magnitude: 2.14 },
      { ra: 10.33, dec: 19.84, magnitude: 2.56 },
      { ra: 11.24, dec: 20.52, magnitude: 2.98 },
      { ra: 10.28, dec: 23.42, magnitude: 3.44 },
    ],
    lines: [
      { from: 0, to: 2 }, { from: 2, to: 4 }, { from: 4, to: 3 },
      { from: 3, to: 1 }, { from: 2, to: 3 },
    ],
  },
  {
    name: "Cassiopeia",
    abbreviation: "Cas",
    stars: [
      { name: "Schedar", ra: 0.68, dec: 56.54, magnitude: 2.23 },
      { name: "Caph", ra: 0.15, dec: 59.15, magnitude: 2.27 },
      { ra: 0.95, dec: 60.72, magnitude: 2.47 },
      { ra: 1.43, dec: 60.24, magnitude: 2.68 },
      { ra: 1.91, dec: 63.67, magnitude: 3.37 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4 },
    ],
  },
  {
    name: "Gemini",
    abbreviation: "Gem",
    stars: [
      { name: "Castor", ra: 7.58, dec: 31.89, magnitude: 1.58 },
      { name: "Pollux", ra: 7.76, dec: 28.03, magnitude: 1.14 },
      { ra: 6.63, dec: 16.40, magnitude: 3.06 },
      { ra: 6.38, dec: 22.51, magnitude: 3.36 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 2 },
    ],
  },
  {
    name: "Taurus",
    abbreviation: "Tau",
    stars: [
      { name: "Aldebaran", ra: 4.60, dec: 16.51, magnitude: 0.85 },
      { ra: 4.48, dec: 15.96, magnitude: 3.53 },
      { ra: 4.33, dec: 17.54, magnitude: 3.41 },
      { ra: 5.63, dec: 21.14, magnitude: 1.65 },
      { ra: 5.44, dec: 28.61, magnitude: 2.87 },
    ],
    lines: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 3 },
      { from: 3, to: 4 },
    ],
  },
  {
    name: "Crux",
    abbreviation: "Cru",
    stars: [
      { name: "Acrux", ra: 12.44, dec: -63.10, magnitude: 0.76 },
      { name: "Mimosa", ra: 12.80, dec: -59.69, magnitude: 1.25 },
      { ra: 12.52, dec: -57.11, magnitude: 1.63 },
      { ra: 12.25, dec: -58.75, magnitude: 2.80 },
    ],
    lines: [
      { from: 0, to: 2 }, { from: 1, to: 3 },
    ],
  },
];

// Polaris — the North Star
export const polaris = {
  name: "Polaris",
  ra: 2.53,
  dec: 89.26,
  magnitude: 1.98,
};
