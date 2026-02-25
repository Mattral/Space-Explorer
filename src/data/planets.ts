
export interface PlanetData {
  id: string;
  name: string;
  diameter: number; // km
  distanceFromSun: number; // million km
  dayLength: number; // Earth days
  yearLength: number; // Earth days
  moons: number;
  temperature: string;
  color: string;
  description: string;
  texture: string;
  normalMap?: string; // Normal map for 3D texture details
  specularMap?: string; // Specular map for reflective properties
  scale: number; // For 3D model scaling
}

export const planets: PlanetData[] = [
  {
    id: "mercury",
    name: "Mercury",
    diameter: 4879,
    distanceFromSun: 57.9,
    dayLength: 59,
    yearLength: 88,
    moons: 0,
    temperature: "-173°C to 427°C",
    color: "#A5A5A5",
    description: "Mercury is the smallest and innermost planet in the Solar System. It has no atmosphere to retain heat, causing extreme temperature variations.",
    texture: "/textures/mercury.jpg",
    normalMap: "/textures/mercury_normal.jpg",
    scale: 0.38
  },
  {
    id: "venus",
    name: "Venus",
    diameter: 12104,
    distanceFromSun: 108.2,
    dayLength: 243,
    yearLength: 225,
    moons: 0,
    temperature: "462°C",
    color: "#E7CDBA",
    description: "Venus is the second planet from the Sun. It has a thick atmosphere that traps heat, making it the hottest planet in our solar system.",
    texture: "/textures/venus.jpg",
    normalMap: "/textures/venus_normal.jpg",
    scale: 0.95
  },
  {
    id: "earth",
    name: "Earth",
    diameter: 12742,
    distanceFromSun: 149.6,
    dayLength: 1,
    yearLength: 365.25,
    moons: 1,
    temperature: "-88°C to 58°C",
    color: "#6B93D6",
    description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. It has one natural satellite, the Moon.",
    texture: "/textures/earth.jpg",
    normalMap: "/textures/earth_normal.jpg",
    scale: 1.0
  },
  {
    id: "mars",
    name: "Mars",
    diameter: 6779,
    distanceFromSun: 227.9,
    dayLength: 1.03,
    yearLength: 687,
    moons: 2,
    temperature: "-153°C to 20°C",
    color: "#E27B58",
    description: "Mars is the fourth planet from the Sun. Known as the Red Planet due to its reddish appearance, it has a thin atmosphere and polar ice caps.",
    texture: "/textures/mars.jpg",
    normalMap: "/textures/mars_normal.jpg",
    scale: 0.53
  },
  {
    id: "jupiter",
    name: "Jupiter",
    diameter: 139820,
    distanceFromSun: 778.5,
    dayLength: 0.41,
    yearLength: 4333,
    moons: 79,
    temperature: "-145°C",
    color: "#C9A97A",
    description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined.",
    texture: "/textures/jupiter.jpg",
    normalMap: "/textures/jupiter_normal.jpg",
    scale: 11.2
  },
  {
    id: "saturn",
    name: "Saturn",
    diameter: 116460,
    distanceFromSun: 1434,
    dayLength: 0.44,
    yearLength: 10759,
    moons: 82,
    temperature: "-178°C",
    color: "#E9E2D1",
    description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is known for its prominent ring system, which consists of ice particles, rocky debris, and dust.",
    texture: "/textures/saturn.jpg",
    normalMap: "/textures/saturn_normal.jpg",
    scale: 9.45
  },
  {
    id: "uranus",
    name: "Uranus",
    diameter: 50724,
    distanceFromSun: 2871,
    dayLength: 0.72,
    yearLength: 30687,
    moons: 27,
    temperature: "-224°C",
    color: "#C8E7FC",
    description: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. It is similar in composition to Neptune, and both are classified as ice giants.",
    texture: "/textures/uranus.jpg",
    normalMap: "/textures/uranus_normal.jpg",
    scale: 4.0
  },
  {
    id: "neptune",
    name: "Neptune",
    diameter: 49244,
    distanceFromSun: 4495,
    dayLength: 0.67,
    yearLength: 60190,
    moons: 14,
    temperature: "-214°C",
    color: "#5B76E5",
    description: "Neptune is the eighth and farthest-known planet from the Sun. It is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet in the Solar System.",
    texture: "/textures/neptune.jpg",
    normalMap: "/textures/neptune_normal.jpg",
    scale: 3.88
  }
];
