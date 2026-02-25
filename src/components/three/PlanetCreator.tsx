import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { orbitalElements } from '@/data/keplerOrbits';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moons?: THREE.Mesh[];
  moonOrbitMeshes?: THREE.Line[];
  ringsMesh?: THREE.Mesh;
  // Kepler orbital parameters for animation
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  startAngle: number;
}

export interface SolarSystemObjects {
  planetObjects: Map<string, PlanetObject>;
  asteroidBelt?: THREE.Group;
  kuiperBelt?: THREE.Group;
  oortCloud?: THREE.Mesh;
  comets?: THREE.Group;
}

// Moon data for each planet
const moonData: { [key: string]: { count: number; distance: number; size: number } } = {
  earth: { count: 1, distance: 3.0, size: 0.20 },
  mars: { count: 2, distance: 2.5, size: 0.10 },
  jupiter: { count: 12, distance: 8.0, size: 0.15 },
  saturn: { count: 10, distance: 10.0, size: 0.12 },
  uranus: { count: 8, distance: 6.0, size: 0.11 },
  neptune: { count: 6, distance: 5.0, size: 0.13 }
};

// Real NASA texture URLs from Solar System Scope (public, high-res)
const nasaTextureUrls: { [key: string]: string } = {
  mercury: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
  venus:   'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  earth:   'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  mars:    'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
  jupiter: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  saturn:  'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
  uranus:  'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
  neptune: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
};

// NASA CDN fallback textures
const nasaFallbackUrls: { [key: string]: string } = {
  mercury: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/800px-Mercury_in_true_color.jpg',
  venus:   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/800px-Venus-real_color.jpg',
  earth:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/800px-The_Blue_Marble_%28remastered%29.jpg',
  mars:    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/800px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
  saturn:  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/800px-Saturn_during_Equinox.jpg',
  uranus:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/800px-Uranus2.jpg',
  neptune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/800px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
};

// Planet color maps for procedural texture fallback
const planetColorSchemes: { [key: string]: { base: string; accent: string; detail: string } } = {
  mercury: { base: '#8C7E6F', accent: '#A59585', detail: '#6B5E50' },
  venus:   { base: '#D4A860', accent: '#E8C87A', detail: '#B89040' },
  earth:   { base: '#4A7AB5', accent: '#3D9540', detail: '#E8DCC0' },
  mars:    { base: '#C1582A', accent: '#A04020', detail: '#D4783E' },
  jupiter: { base: '#C4A56A', accent: '#D4B880', detail: '#A08050' },
  saturn:  { base: '#D4C8A0', accent: '#E0D4B0', detail: '#B8AC80' },
  uranus:  { base: '#88C8D8', accent: '#A0D8E8', detail: '#70B0C0' },
  neptune: { base: '#3050B0', accent: '#4060C0', detail: '#2040A0' },
};

const generateFallbackTexture = (planetId: string, size: number = 512): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  const colors = planetColorSchemes[planetId] || { base: '#888888', accent: '#AAAAAA', detail: '#666666' };
  ctx.fillStyle = colors.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (planetId === 'earth') {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvas.width, canvas.height * 0.2 + Math.random() * canvas.height * 0.6, 30 + Math.random() * 60, 20 + Math.random() * 40, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#E8E8F0';
    ctx.fillRect(0, 0, canvas.width, 15);
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
  } else if (planetId === 'jupiter' || planetId === 'saturn') {
    const bandCount = planetId === 'jupiter' ? 12 : 8;
    for (let i = 0; i < bandCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? colors.accent : colors.detail;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(0, (i / bandCount) * canvas.height, canvas.width, canvas.height / bandCount);
    }
    ctx.globalAlpha = 1;
    if (planetId === 'jupiter') {
      ctx.fillStyle = '#C06040';
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.6, canvas.height * 0.55, 30, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'mars') {
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = colors.detail;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 5 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#E0D8D0';
    ctx.fillRect(0, 0, canvas.width, 12);
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

/**
 * Load a NASA texture with fallback chain:
 * 1. Solar System Scope 2K texture
 * 2. Wikipedia high-res image
 * 3. Procedural canvas texture
 */
const loadPlanetTexture = (
  planetId: string,
  loader: THREE.TextureLoader,
  onLoad: (tex: THREE.Texture) => void
) => {
  const primaryUrl = nasaTextureUrls[planetId];
  const fallbackUrl = nasaFallbackUrls[planetId];

  loader.load(
    primaryUrl,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      onLoad(tex);
    },
    undefined,
    () => {
      // Primary failed — try Wikipedia fallback
      loader.load(
        fallbackUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          onLoad(tex);
        },
        undefined,
        () => {
          // Both failed — use procedural canvas texture
          onLoad(generateFallbackTexture(planetId));
        }
      );
    }
  );
};

/**
 * Create an elliptical orbit path from Kepler elements.
 * a = scene-space semi-major axis, e = eccentricity, inclinationDeg = orbital inclination
 */
export const createKeplerOrbitPath = (
  a: number, e: number, inclinationDeg: number,
  segments: number = 256
): THREE.Line => {
  const incRad = inclinationDeg * (Math.PI / 180);
  const b = a * Math.sqrt(1 - e * e); // semi-minor axis
  const c = a * e;                    // focus offset

  const vertices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    // Parametric ellipse, shifted so Sun is at focus
    const xEllipse = a * Math.cos(theta) - c;
    const yEllipse = b * Math.sin(theta);
    // Apply inclination rotation around x-axis
    vertices.push(xEllipse, yEllipse * Math.sin(incRad), yEllipse * Math.cos(incRad));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x336688,
    transparent: true,
    opacity: 0.25,
  });
  return new THREE.Line(geometry, material);
};

// Visual scale for the scene (AU → scene units)
const AU_SCALE = 60; // 1 AU = 60 scene units

export const createSolarSystem = (
  scene: THREE.Scene,
  planets: PlanetData[],
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSceneReady?: () => void
): SolarSystemObjects => {
  const planetObjects = new Map<string, PlanetObject>();
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';

  // Visual size scaling (not astronomically accurate — for visibility)
  const planetScales: { [key: string]: number } = {
    mercury: 1.2, venus: 2.3, earth: 2.5, mars: 1.8,
    jupiter: 8.0, saturn: 7.0, uranus: 4.5, neptune: 4.3,
  };

  let loadedCount = 0;
  const totalPlanets = planets.length;

  planets.forEach(planet => {
    const elems = orbitalElements[planet.id];
    const a = elems ? elems.a * AU_SCALE : 115;
    const e = elems ? elems.e : 0;
    const inc = elems ? elems.i : 0;

    // Elliptical orbit path
    const orbitPath = createKeplerOrbitPath(a, e, inc);
    scene.add(orbitPath);

    const planetScale = planetScales[planet.id] || planet.scale * 2.0;
    const geometry = new THREE.SphereGeometry(planetScale, 64, 64);

    // Placeholder material while texture loads
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(planet.color),
      roughness: 0.7,
      metalness: 0.05,
    });

    const planetMesh = new THREE.Mesh(geometry, material);

    // Start at a random eccentric anomaly
    const startAngle = Math.random() * Math.PI * 2;
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;
    const incRad = inc * (Math.PI / 180);
    planetMesh.position.x = a * Math.cos(startAngle) - c;
    const yEllipse = b * Math.sin(startAngle);
    planetMesh.position.y = yEllipse * Math.sin(incRad);
    planetMesh.position.z = yEllipse * Math.cos(incRad);

    scene.add(planetMesh);

    const planetObj: PlanetObject = {
      mesh: planetMesh,
      orbitMesh: orbitPath,
      moons: [],
      moonOrbitMeshes: [],
      semiMajorAxis: a,
      eccentricity: e,
      inclination: inc,
      startAngle,
    };

    planetObjects.set(planet.id, planetObj);

    // Load NASA texture
    loadPlanetTexture(planet.id, loader, (tex) => {
      const mat = planetMesh.material as THREE.MeshStandardMaterial;

      // Enhance material with the loaded texture
      mat.map = tex;
      mat.roughness = planet.id === 'earth' ? 0.6 : planet.id === 'venus' ? 0.5 : 0.75;
      mat.metalness = 0.0;

      // Emissive self-glow for gas giants
      if (planet.id === 'jupiter' || planet.id === 'saturn') {
        mat.emissive = new THREE.Color(0x110800);
        mat.emissiveIntensity = 0.15;
      }

      mat.needsUpdate = true;

      loadedCount++;
      if (loadedCount >= totalPlanets) {
        setIsLoading(false);
        if (onSceneReady) onSceneReady();
      }
    });

    // Saturn rings
    if (planet.id === 'saturn') {
      const ringsMesh = createSaturnRings(planetScale, planetMesh);
      planetObj.ringsMesh = ringsMesh;
      scene.add(ringsMesh);
    }

    // Moons
    if (moonData[planet.id]) {
      const moonInfo = moonData[planet.id];
      for (let i = 0; i < moonInfo.count; i++) {
        const moonGeometry = new THREE.SphereGeometry(moonInfo.size, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

        const moonAngle = (i / moonInfo.count) * Math.PI * 2;
        const moonDistance = moonInfo.distance + (i * 0.5);
        moonMesh.position.x = planetMesh.position.x + Math.cos(moonAngle) * moonDistance;
        moonMesh.position.y = planetMesh.position.y;
        moonMesh.position.z = planetMesh.position.z + Math.sin(moonAngle) * moonDistance;
        scene.add(moonMesh);
        planetObj.moons!.push(moonMesh);

        // Moon orbit path (circular, relative to planet)
        const moonOrbitGeometry = new THREE.BufferGeometry();
        const moonOrbitVertices: number[] = [];
        for (let j = 0; j <= 64; j++) {
          const theta = (j / 64) * Math.PI * 2;
          moonOrbitVertices.push(Math.cos(theta) * moonDistance, 0, Math.sin(theta) * moonDistance);
        }
        moonOrbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(moonOrbitVertices, 3));
        const moonOrbitMesh = new THREE.Line(
          moonOrbitGeometry,
          new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.15 })
        );
        moonOrbitMesh.position.copy(planetMesh.position);
        scene.add(moonOrbitMesh);
        planetObj.moonOrbitMeshes!.push(moonOrbitMesh);
      }
    }
  });

  // Fallback: if textures never call back (e.g. offline), unblock after 8s
  setTimeout(() => {
    if (loadedCount < totalPlanets) {
      setIsLoading(false);
      if (onSceneReady) onSceneReady();
    }
  }, 8000);

  // Belts & comets
  const asteroidBelt = createAsteroidBelt();
  scene.add(asteroidBelt);
  const kuiperBelt = createKuiperBelt();
  scene.add(kuiperBelt);
  const oortCloud = createOortCloud();
  scene.add(oortCloud);
  const comets = createComets();
  scene.add(comets);

  return { planetObjects, asteroidBelt, kuiperBelt, oortCloud, comets };
};

export const createSaturnRings = (planetScale: number, planetMesh: THREE.Mesh): THREE.Mesh => {
  const ringGeometry = new THREE.RingGeometry(planetScale * 2.2, planetScale * 4.5, 256, 16);

  // UV remap for ring gradient
  const pos = ringGeometry.attributes.position;
  const uv = ringGeometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.sqrt(pos.getX(i) ** 2 + pos.getY(i) ** 2);
    const norm = (r - planetScale * 2.2) / (planetScale * 4.5 - planetScale * 2.2);
    uv.setXY(i, norm, 0.5);
  }

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4e4bc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    roughness: 0.9,
    metalness: 0.0,
  });

  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.rotation.x = Math.PI / 2;
  rings.rotation.z = 26.7 * (Math.PI / 180);
  rings.position.copy(planetMesh.position);
  return rings;
};

const createAsteroidBelt = (): THREE.Group => {
  const group = new THREE.Group();
  for (let i = 0; i < 150; i++) {
    const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2),
      roughness: 0.9,
    });
    const asteroid = new THREE.Mesh(geo, mat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 195 + Math.random() * 45;
    asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 8, Math.sin(angle) * radius);
    group.add(asteroid);
  }
  return group;
};

const createKuiperBelt = (): THREE.Group => {
  const group = new THREE.Group();
  for (let i = 0; i < 80; i++) {
    const geo = new THREE.SphereGeometry(Math.random() * 0.4 + 0.2, 12, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.4, Math.random() * 0.4 + 0.3),
      roughness: 0.8,
    });
    const obj = new THREE.Mesh(geo, mat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 640 + Math.random() * 140;
    obj.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 15, Math.sin(angle) * radius);
    group.add(obj);
  }
  const dwarfPlanets = [
    { color: 0xc49c7c, size: 1.2, distance: 680 },
    { color: 0xd4d4d4, size: 1.1, distance: 720 },
    { color: 0xf0e8d0, size: 0.8, distance: 700 },
    { color: 0xcd5c5c, size: 0.7, distance: 740 },
  ];
  dwarfPlanets.forEach((d, idx) => {
    const geo = new THREE.SphereGeometry(d.size, 24, 24);
    const mat = new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (idx / dwarfPlanets.length) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * d.distance, (Math.random() - 0.5) * 10, Math.sin(angle) * d.distance);
    group.add(mesh);
  });
  return group;
};

const createOortCloud = (): THREE.Mesh => {
  const geo = new THREE.SphereGeometry(1200, 32, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0x404080, transparent: true, opacity: 0.04, side: THREE.BackSide, wireframe: true });
  return new THREE.Mesh(geo, mat);
};

const createComets = (): THREE.Group => {
  const group = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }));
    const tail = new THREE.Mesh(new THREE.ConeGeometry(2, 20, 8), new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.3 }));
    tail.position.z = -10;
    tail.rotation.x = Math.PI / 2;
    const comet = new THREE.Group();
    comet.add(nucleus);
    comet.add(tail);
    const angle = (i / 8) * Math.PI * 2;
    const distance = 400 + Math.random() * 400;
    comet.position.set(Math.cos(angle) * distance, (Math.random() - 0.5) * 50, Math.sin(angle) * distance);
    comet.lookAt(0, 0, 0);
    comet.rotateY(Math.PI);
    group.add(comet);
  }
  return group;
};
