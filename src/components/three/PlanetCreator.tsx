
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { createOrbitPath } from './Animator';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moons?: THREE.Mesh[];
  moonOrbitMeshes?: THREE.Line[];
  ringsMesh?: THREE.Mesh;
}

export interface SolarSystemObjects {
  planetObjects: Map<string, PlanetObject>;
  asteroidBelt?: THREE.Group;
  kuiperBelt?: THREE.Group;
  oortCloud?: THREE.Mesh;
  comets?: THREE.Group;
}

// Moon data for each planet with updated counts
const moonData: { [key: string]: { count: number; distance: number; size: number } } = {
  earth: { count: 1, distance: 3.0, size: 0.20 },
  mars: { count: 2, distance: 2.5, size: 0.10 },
  jupiter: { count: 12, distance: 8.0, size: 0.15 },
  saturn: { count: 10, distance: 10.0, size: 0.12 },
  uranus: { count: 8, distance: 6.0, size: 0.11 },
  neptune: { count: 6, distance: 5.0, size: 0.13 }
};

export const createSolarSystem = (
  scene: THREE.Scene, 
  planets: PlanetData[],
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSceneReady?: () => void
): SolarSystemObjects => {
  const textureLoader = new THREE.TextureLoader();
  const planetObjects = new Map<string, PlanetObject>();
  let loadedCount = 0;
  const totalToLoad = planets.length;
  
  // Much larger orbit radii with exponential scaling for better separation
  const orbitRadii: { [key: string]: number } = {
    mercury: 60,   // Closest to sun
    venus: 85,     // 
    earth: 115,    // Reference point
    mars: 155,     // 
    jupiter: 280,  // Much further out - gas giant
    saturn: 380,   // Very far - gas giant with rings
    uranus: 480,   // Ice giant
    neptune: 580   // Outermost planet
  };
  
  planets.forEach(planet => {
    // Create orbit path
    const orbitRadius = orbitRadii[planet.id] || (115 + planetObjects.size * 50);
    const orbitPath = createOrbitPath(orbitRadius);
    scene.add(orbitPath);
    
    // Realistic planet scaling - much more proportional
    let planetScale;
    
    if (planet.id === 'jupiter') {
      planetScale = 8.0; // Large but not overwhelming
    } else if (planet.id === 'saturn') {
      planetScale = 7.0; // Slightly smaller than Jupiter
    } else if (planet.id === 'earth') {
      planetScale = 2.5; // Reference size
    } else if (planet.id === 'venus') {
      planetScale = 2.3; // Similar to Earth
    } else if (planet.id === 'mars') {
      planetScale = 1.8; // Smaller than Earth
    } else if (planet.id === 'mercury') {
      planetScale = 1.2; // Smallest
    } else if (planet.id === 'uranus') {
      planetScale = 4.5; // Ice giant
    } else if (planet.id === 'neptune') {
      planetScale = 4.3; // Ice giant, slightly smaller
    } else {
      planetScale = planet.scale * 2.0;
    }
    
    const geometry = new THREE.SphereGeometry(planetScale, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.1,
    });
    
    const planetMesh = new THREE.Mesh(geometry, material);
    
    // Random starting position on orbit
    const startAngle = Math.random() * Math.PI * 2;
    planetMesh.position.x = Math.cos(startAngle) * orbitRadius;
    planetMesh.position.z = Math.sin(startAngle) * orbitRadius;
    
    scene.add(planetMesh);
    
    // Initialize planet object
    const planetObj: PlanetObject = {
      mesh: planetMesh,
      orbitMesh: orbitPath,
      moons: [],
      moonOrbitMeshes: []
    };
    
    planetObjects.set(planet.id, planetObj);
    
    // Use a fallback color initially
    material.color.set(planet.color);
    
    // Add moons for planets that have them
    if (moonData[planet.id]) {
      const moonInfo = moonData[planet.id];
      
      for (let i = 0; i < moonInfo.count; i++) {
        const moonGeometry = new THREE.SphereGeometry(moonInfo.size, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xdddddd,
          roughness: 0.8,
        });
        
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        
        // Position moon at different orbital distances
        const moonAngle = (i / moonInfo.count) * Math.PI * 2;
        const moonDistance = moonInfo.distance + (i * 0.5);
        moonMesh.position.x = planetMesh.position.x + Math.cos(moonAngle) * moonDistance;
        moonMesh.position.y = planetMesh.position.y;
        moonMesh.position.z = planetMesh.position.z + Math.sin(moonAngle) * moonDistance;
        
        scene.add(moonMesh);
        planetObj.moons!.push(moonMesh);
        
        // Create moon orbit path
        const moonOrbitGeometry = new THREE.BufferGeometry();
        const moonOrbitVertices = [];
        
        for (let j = 0; j <= 64; j++) {
          const theta = (j / 64) * Math.PI * 2;
          moonOrbitVertices.push(
            Math.cos(theta) * moonDistance,
            0,
            Math.sin(theta) * moonDistance
          );
        }
        
        moonOrbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(moonOrbitVertices, 3));
        
        const moonOrbitMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.2
        });
        
        const moonOrbitMesh = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
        moonOrbitMesh.position.copy(planetMesh.position);
        
        scene.add(moonOrbitMesh);
        planetObj.moonOrbitMeshes!.push(moonOrbitMesh);
      }
    }
    
    // Load texture maps
    if (planet.texture) {
      textureLoader.load(
        planet.texture,
        (texture) => {
          if (material && planetMesh) {
            material.map = texture;
            material.needsUpdate = true;
            
            // If Saturn, add prominent rings
            if (planet.id === 'saturn') {
              const ringsMesh = createSaturnRings(planetScale, planetMesh);
              planetObj.ringsMesh = ringsMesh;
              scene.add(ringsMesh);
            }
            
            loadedCount++;
            if (loadedCount === totalToLoad) {
              setIsLoading(false);
              if (onSceneReady) onSceneReady();
            }
          }
        },
        undefined,
        (error) => {
          console.error('Error loading texture for ' + planet.id + ':', error);
          loadedCount++;
          if (loadedCount === totalToLoad) {
            setIsLoading(false);
            if (onSceneReady) onSceneReady();
          }
        }
      );
    } else {
      // No texture needed, proceed
      if (planet.id === 'saturn') {
        const ringsMesh = createSaturnRings(planetScale, planetMesh);
        planetObj.ringsMesh = ringsMesh;
        scene.add(ringsMesh);
      }
      loadedCount++;
      if (loadedCount === totalToLoad) {
        setIsLoading(false);
        if (onSceneReady) onSceneReady();
      }
    }
    
    // Add normal map if available
    if (planet.normalMap) {
      textureLoader.load(
        planet.normalMap,
        (texture) => {
          if (material) {
            material.normalMap = texture;
            material.normalScale.set(0.8, 0.8);
            material.needsUpdate = true;
          }
        }
      );
    }
  });
  
  // Create Asteroid Belt between Mars and Jupiter - adjusted for new distances
  const asteroidBelt = createAsteroidBelt();
  scene.add(asteroidBelt);
  
  // Create Kuiper Belt beyond Neptune - adjusted for new distances
  const kuiperBelt = createKuiperBelt();
  scene.add(kuiperBelt);
  
  // Create Oort Cloud
  const oortCloud = createOortCloud();
  scene.add(oortCloud);
  
  // Create Comets
  const comets = createComets();
  scene.add(comets);
  
  return { 
    planetObjects,
    asteroidBelt,
    kuiperBelt,
    oortCloud,
    comets
  };
};

// Create Saturn's rings with MUCH more prominent and visible appearance
export const createSaturnRings = (planetScale: number, planetMesh: THREE.Mesh): THREE.Mesh => {
  // Much larger and more visible ring geometry
  const ringGeometry = new THREE.RingGeometry(
    planetScale * 2.2, // inner radius - closer to planet
    planetScale * 4.5, // outer radius - much larger and more visible
    256, // many more segments for smooth appearance
    16   // more radial segments
  );
  
  // Create a much more visible and realistic ring material
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4e4bc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95, // Almost opaque for maximum visibility
    roughness: 0.8,
    metalness: 0.0,
    emissive: 0x332211, // More glow
    emissiveIntensity: 0.2
  });
  
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  
  // Tilt the rings significantly for Saturn's characteristic look
  rings.rotation.x = Math.PI / 2; // Rotate to horizontal plane
  rings.rotation.z = 26.7 * (Math.PI / 180); // Saturn's actual axial tilt
  
  // Add rings directly to the scene at planet position for better visibility
  rings.position.copy(planetMesh.position);
  
  return rings;
};

// Create Asteroid Belt - adjusted for new orbital distances
const createAsteroidBelt = (): THREE.Group => {
  const asteroidGroup = new THREE.Group();
  const asteroidCount = 150;
  const innerRadius = 195; // Between Mars (155) and Jupiter (280)
  const outerRadius = 240;
  
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(
      Math.random() * 0.3 + 0.1, // Random size
      8, 8 // Low detail for performance
    );
    
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2),
      roughness: 0.9,
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    // Random position in belt
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const height = (Math.random() - 0.5) * 8; // Some vertical spread
    
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.y = height;
    asteroid.position.z = Math.sin(angle) * radius;
    
    asteroidGroup.add(asteroid);
  }
  
  return asteroidGroup;
};

// Create Kuiper Belt with dwarf planets - adjusted for new distances
const createKuiperBelt = (): THREE.Group => {
  const kuiperGroup = new THREE.Group();
  const objectCount = 80;
  const innerRadius = 640; // Beyond Neptune (580)
  const outerRadius = 780;
  
  // Create regular Kuiper Belt objects
  for (let i = 0; i < objectCount; i++) {
    const objectGeometry = new THREE.SphereGeometry(
      Math.random() * 0.4 + 0.2, // Larger than asteroids
      12, 12
    );
    
    const objectMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.4, Math.random() * 0.4 + 0.3),
      roughness: 0.8,
    });
    
    const kuiperObject = new THREE.Mesh(objectGeometry, objectMaterial);
    
    // Random position in belt
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const height = (Math.random() - 0.5) * 15; // More vertical spread than asteroid belt
    
    kuiperObject.position.x = Math.cos(angle) * radius;
    kuiperObject.position.y = height;
    kuiperObject.position.z = Math.sin(angle) * radius;
    
    kuiperGroup.add(kuiperObject);
  }
  
  // Add major dwarf planets - adjusted distances
  const dwarfPlanets = [
    { name: 'Pluto', color: 0xc49c7c, size: 1.2, distance: 680 },
    { name: 'Eris', color: 0xd4d4d4, size: 1.1, distance: 720 },
    { name: 'Haumea', color: 0xf0e8d0, size: 0.8, distance: 700 },
    { name: 'Makemake', color: 0xcd5c5c, size: 0.7, distance: 740 }
  ];
  
  dwarfPlanets.forEach((dwarf, index) => {
    const dwarfGeometry = new THREE.SphereGeometry(dwarf.size, 24, 24);
    const dwarfMaterial = new THREE.MeshStandardMaterial({
      color: dwarf.color,
      roughness: 0.7,
    });
    
    const dwarfPlanet = new THREE.Mesh(dwarfGeometry, dwarfMaterial);
    
    const angle = (index / dwarfPlanets.length) * Math.PI * 2;
    dwarfPlanet.position.x = Math.cos(angle) * dwarf.distance;
    dwarfPlanet.position.y = (Math.random() - 0.5) * 10;
    dwarfPlanet.position.z = Math.sin(angle) * dwarf.distance;
    
    kuiperGroup.add(dwarfPlanet);
  });
  
  return kuiperGroup;
};

// Create Oort Cloud
const createOortCloud = (): THREE.Mesh => {
  const cloudGeometry = new THREE.SphereGeometry(1200, 32, 16); // Larger for new scale
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0x404080,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
    wireframe: true
  });
  
  return new THREE.Mesh(cloudGeometry, cloudMaterial);
};

const createComets = (): THREE.Group => {
  const cometGroup = new THREE.Group();
  const cometCount = 8;
  
  for (let i = 0; i < cometCount; i++) {
    // Comet nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9,
    });
    
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    
    // Comet tail (simplified as a cone)
    const tailGeometry = new THREE.ConeGeometry(2, 20, 8);
    const tailMaterial = new THREE.MeshBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.3,
    });
    
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -10; // Behind the nucleus
    tail.rotation.x = Math.PI / 2;
    
    // Create comet group
    const comet = new THREE.Group();
    comet.add(nucleus);
    comet.add(tail);
    
    // Position on elliptical orbit - adjusted for new scale
    const angle = (i / cometCount) * Math.PI * 2;
    const distance = 400 + Math.random() * 400; // Further out
    comet.position.x = Math.cos(angle) * distance;
    comet.position.y = (Math.random() - 0.5) * 50;
    comet.position.z = Math.sin(angle) * distance;
    
    // Point tail away from center (sun)
    comet.lookAt(0, 0, 0);
    comet.rotateY(Math.PI);
    
    cometGroup.add(comet);
  }
  
  return cometGroup;
};
