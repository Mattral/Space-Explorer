
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { createOrbitPath } from './Animator';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moonMesh?: THREE.Mesh;
  moonOrbitMesh?: THREE.Line;
  ringsMesh?: THREE.Mesh;
}

export interface SolarSystemObjects {
  planetObjects: Map<string, PlanetObject>;
}

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
  
  // Define orbit radii (increased to prevent overlapping)
  const orbitRadii: { [key: string]: number } = {
    mercury: 12,
    venus: 20,
    earth: 30,
    mars: 40,
    jupiter: 55,
    saturn: 75,
    uranus: 90, 
    neptune: 105
  };
  
  planets.forEach(planet => {
    // Create orbit path
    const orbitRadius = orbitRadii[planet.id] || (30 + planetObjects.size * 10);
    const orbitPath = createOrbitPath(orbitRadius);
    scene.add(orbitPath);
    
    // Create planet
    const normalScale = planet.scale * 0.5;
    const geometry = new THREE.SphereGeometry(normalScale, 64, 64);
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
      orbitMesh: orbitPath
    };
    
    planetObjects.set(planet.id, planetObj);
    
    // Use a fallback color initially
    material.color.set(planet.color);
    
    // Add Earth's moon
    if (planet.id === 'earth') {
      const moonGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.8,
      });
      
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      
      // Position moon at a random initial point in its orbit
      const moonAngle = Math.random() * Math.PI * 2;
      const moonDistance = 1.5;
      moonMesh.position.x = planetMesh.position.x + Math.cos(moonAngle) * moonDistance;
      moonMesh.position.y = planetMesh.position.y;
      moonMesh.position.z = planetMesh.position.z + Math.sin(moonAngle) * moonDistance;
      
      scene.add(moonMesh);
      
      // Create moon orbit path
      const moonOrbitGeometry = new THREE.BufferGeometry();
      const moonOrbitVertices = [];
      
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
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
        opacity: 0.3
      });
      
      const moonOrbitMesh = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
      moonOrbitMesh.position.copy(planetMesh.position);
      
      scene.add(moonOrbitMesh);
      
      planetObj.moonMesh = moonMesh;
      planetObj.moonOrbitMesh = moonOrbitMesh;
    }
    
    // Load texture maps
    if (planet.texture) {
      textureLoader.load(
        planet.texture,
        (texture) => {
          if (material && planetMesh) {
            material.map = texture;
            material.needsUpdate = true;
            
            // If Saturn, add rings
            if (planet.id === 'saturn') {
              const ringsMesh = createSaturnRings(normalScale, planetMesh);
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
          // Fallback already set above
        }
      );
    } else {
      // No texture needed, proceed
      if (planet.id === 'saturn') {
        const ringsMesh = createSaturnRings(normalScale, planetMesh);
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
  
  return { planetObjects };
};

// Create Saturn's rings - improved version with more detailed textures
export const createSaturnRings = (planetScale: number, planetMesh: THREE.Mesh): THREE.Mesh => {
  // Ring geometry with significantly more detail
  const ringGeometry = new THREE.RingGeometry(
    planetScale * 1.4, // inner radius
    planetScale * 2.8, // outer radius (increased for more prominent rings)
    128, // theta segments - higher for more detail
    8  // phi segments - more segments for better detail
  );
  
  // Modify UVs for better texture mapping
  const pos = ringGeometry.attributes.position;
  const v3 = new THREE.Vector3();
  const uv = ringGeometry.attributes.uv;
  
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const normalizedRadius = (v3.length() - planetScale * 1.4) / (planetScale * 1.4);
    uv.setXY(i, normalizedRadius, 0);
  }
  
  // Rotate rings to correct orientation
  const positionAttribute = ringGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    const y = 0;
    vertex.z = y;
    ringGeometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  // Rotate the rings to match Saturn's axial tilt
  ringGeometry.rotateX(-Math.PI / 7);
  
  // Create a more realistic ring material with a texture
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8e8c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    roughness: 0.6,
    metalness: 0.3
  });
  
  // Try to load a ring texture
  const textureLoader = new THREE.TextureLoader();
  try {
    textureLoader.load(
      '/textures/saturn_rings.jpg',
      (texture) => {
        ringMaterial.map = texture;
        ringMaterial.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.log('Using fallback for Saturn rings');
      }
    );
  } catch (e) {
    console.log('Using fallback for Saturn rings');
  }
  
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  planetMesh.add(rings);
  
  return rings;
};
