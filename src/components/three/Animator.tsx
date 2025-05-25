import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moonMesh?: THREE.Mesh;
  moonOrbitMesh?: THREE.Line;
  ringsMesh?: THREE.Mesh;
}

interface AnimationProps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  planetObjects: Map<string, any>;
  selectedPlanetId: string;
  isSpaceView?: boolean;
}

export const setupAnimation = ({
  renderer,
  scene,
  camera,
  planetObjects,
  selectedPlanetId,
  isSpaceView = false
}: AnimationProps) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  let time = 0;
  const targetPosition = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();

  const animate = () => {
    time += 0.005;
    
    // Animate planets in their orbits
    planetObjects.forEach((planetObj, planetId) => {
      if (planetObj.mesh && planetObj.orbitMesh) {
        // Get orbit radius from the orbit mesh
        const positions = planetObj.orbitMesh.geometry.attributes.position.array;
        const orbitRadius = Math.sqrt(positions[0] * positions[0] + positions[2] * positions[2]);
        
        // Different orbital speeds for different planets
        const speedMultiplier = getOrbitalSpeed(planetId);
        const angle = time * speedMultiplier;
        
        planetObj.mesh.position.x = Math.cos(angle) * orbitRadius;
        planetObj.mesh.position.z = Math.sin(angle) * orbitRadius;
        
        // Rotate the planet on its axis
        planetObj.mesh.rotation.y += 0.01;
        
        // Update Saturn's rings position to follow the planet
        if (planetId === 'saturn' && planetObj.ringsMesh) {
          planetObj.ringsMesh.position.copy(planetObj.mesh.position);
          planetObj.ringsMesh.rotation.y += 0.003; // Slight ring rotation
        }
        
        // Animate moons if they exist
        if (planetObj.moons && planetObj.moonOrbitMeshes) {
          planetObj.moons.forEach((moon: THREE.Mesh, index: number) => {
            const moonOrbit = planetObj.moonOrbitMeshes[index];
            if (moonOrbit) {
              const moonPositions = moonOrbit.geometry.attributes.position.array;
              const moonRadius = Math.sqrt(moonPositions[0] * moonPositions[0] + moonPositions[2] * moonPositions[2]);
              
              // Faster moon orbital speed
              const moonAngle = time * (speedMultiplier * 5 + index);
              
              moon.position.x = planetObj.mesh.position.x + Math.cos(moonAngle) * moonRadius;
              moon.position.y = planetObj.mesh.position.y;
              moon.position.z = planetObj.mesh.position.z + Math.sin(moonAngle) * moonRadius;
              
              // Update moon orbit position
              moonOrbit.position.copy(planetObj.mesh.position);
            }
          });
        }
      }
    });

    // Animate asteroid belt rotation
    const asteroidBelt = scene.getObjectByName('asteroidBelt');
    if (asteroidBelt) {
      asteroidBelt.rotation.y += 0.0005;
    }

    // Animate Kuiper belt rotation (slower)
    const kuiperBelt = scene.getObjectByName('kuiperBelt');
    if (kuiperBelt) {
      kuiperBelt.rotation.y += 0.0002;
    }

    // Animate comets along their orbits
    const comets = scene.getObjectByName('comets');
    if (comets) {
      comets.children.forEach((comet, index) => {
        const cometAngle = time * 0.1 + (index * Math.PI * 2 / comets.children.length);
        const distance = 200 + Math.sin(time * 0.2 + index) * 100;
        
        comet.position.x = Math.cos(cometAngle) * distance;
        comet.position.z = Math.sin(cometAngle) * distance;
        
        // Update tail direction to point away from sun
        comet.lookAt(0, 0, 0);
        comet.rotateY(Math.PI);
      });
    }

    // Handle camera movement based on space view mode
    if (!isSpaceView) {
      const selectedPlanet = planetObjects.get(selectedPlanetId);
      if (selectedPlanet?.mesh) {
        // Smoothly follow the selected planet
        targetPosition.copy(selectedPlanet.mesh.position);
        targetPosition.y += 25; // Higher up for better view
        targetPosition.z += 40; // Further back for wider view
        
        targetLookAt.copy(selectedPlanet.mesh.position);
        
        // Use lerp for smooth camera movement
        camera.position.lerp(targetPosition, 0.02);
        
        const currentTarget = controls.target.clone();
        currentTarget.lerp(targetLookAt, 0.02);
        controls.target.copy(currentTarget);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    
    return requestAnimationFrame(animate);
  };

  const frameId = animate();
  
  return { frameId, controls };
};

// Helper function to get orbital speeds for different planets
const getOrbitalSpeed = (planetId: string): number => {
  const speeds: { [key: string]: number } = {
    mercury: 2.0,
    venus: 1.6,
    earth: 1.0,
    mars: 0.8,
    jupiter: 0.4,
    saturn: 0.3,
    uranus: 0.2,
    neptune: 0.15
  };
  
  return speeds[planetId] || 1.0;
};

export const setupResizeHandler = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  mountRef: React.RefObject<HTMLDivElement>
) => {
  const handleResize = () => {
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

// Create orbit path lines
export const createOrbitPath = (radius: number): THREE.Line => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    vertices.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x555555,
    transparent: true,
    opacity: 0.3
  });

  return new THREE.Line(geometry, material);
};
