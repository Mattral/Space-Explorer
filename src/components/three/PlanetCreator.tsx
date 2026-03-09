import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { orbitalElements } from '@/data/keplerOrbits';

// Local high-quality planet textures (bundled via Vite)
import mercuryTex from '@/assets/textures/mercury.jpg';
import venusTex from '@/assets/textures/venus.jpg';
import earthTex from '@/assets/textures/earth.jpg';
import marsTex from '@/assets/textures/mars.jpg';
import jupiterTex from '@/assets/textures/jupiter.jpg';
import saturnTex from '@/assets/textures/saturn.jpg';
import uranusTex from '@/assets/textures/uranus.jpg';
import neptuneTex from '@/assets/textures/neptune.jpg';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moons?: THREE.Mesh[];
  moonOrbitMeshes?: THREE.Line[];
  ringsMesh?: THREE.Mesh;
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

const moonData: { [key: string]: { count: number; distance: number; size: number } } = {
  earth: { count: 1, distance: 3.0, size: 0.20 },
  mars: { count: 2, distance: 2.5, size: 0.10 },
  jupiter: { count: 12, distance: 8.0, size: 0.15 },
  saturn: { count: 10, distance: 10.0, size: 0.12 },
  uranus: { count: 8, distance: 6.0, size: 0.11 },
  neptune: { count: 6, distance: 5.0, size: 0.13 }
};

// Local texture map — guaranteed to load, no CORS issues
const localTextures: Record<string, string> = {
  mercury: mercuryTex,
  venus: venusTex,
  earth: earthTex,
  mars: marsTex,
  jupiter: jupiterTex,
  saturn: saturnTex,
  uranus: uranusTex,
  neptune: neptuneTex,
};

/**
 * Load planet texture from local bundled assets.
 */
const loadPlanetTexture = (
  planetId: string,
  loader: THREE.TextureLoader,
  onLoad: (tex: THREE.Texture) => void
) => {
  const url = localTextures[planetId];
  if (!url) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, 256, 128);
    onLoad(new THREE.CanvasTexture(canvas));
    return;
  }

  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16;
      onLoad(tex);
    },
    undefined,
    () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#888';
      ctx.fillRect(0, 0, 256, 128);
      onLoad(new THREE.CanvasTexture(canvas));
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
    color: 0x4488aa,
    transparent: true,
    opacity: 0.18,
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

    // Placeholder material while texture loads — bright enough to see
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(planet.color),
      roughness: 0.55,
      metalness: 0.0,
      emissive: new THREE.Color(planet.color),
      emissiveIntensity: 0.08,
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

      mat.map = tex;
      mat.roughness = planet.id === 'earth' ? 0.45 : planet.id === 'venus' ? 0.4 : 0.55;
      mat.metalness = 0.0;

      // All planets get a subtle self-illumination so they're never pitch black
      const emissiveColors: Record<string, number> = {
        mercury: 0x1a1510, venus: 0x1a1508, earth: 0x081018,
        mars: 0x180a04, jupiter: 0x141008, saturn: 0x141208,
        uranus: 0x081418, neptune: 0x060818,
      };
      mat.emissive = new THREE.Color(emissiveColors[planet.id] || 0x101010);
      mat.emissiveIntensity = 0.35;

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
