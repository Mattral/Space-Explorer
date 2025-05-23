
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
  planetObjects: Map<string, PlanetObject>;
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
}: AnimationProps): { frameId: number; controls: OrbitControls } => {
  let frameId = 0;
  
  // Create orbit controls for interactive camera movement
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  
  // Set initial camera position based on selected planet
  const selectedPlanet = planetObjects.get(selectedPlanetId);
  if (selectedPlanet) {
    camera.position.x = selectedPlanet.mesh.position.x;
    camera.position.z = selectedPlanet.mesh.position.z + 8;
    controls.target.copy(selectedPlanet.mesh.position);
  } else {
    // Default position focusing on the sun
    camera.position.set(0, 20, 50);
    controls.target.set(0, 0, 0);
  }
  
  // If in space view mode, position camera farther away for a better overview
  if (isSpaceView) {
    camera.position.set(0, 50, 120);
    controls.target.set(0, 0, 0);
  }
  
  controls.update();
  
  // Different rotation speeds for each planet
  const rotationSpeeds = new Map([
    ['mercury', 0.004],
    ['venus', 0.002],
    ['earth', 0.001],
    ['mars', 0.0008],
    ['jupiter', 0.0004],
    ['saturn', 0.0003],
    ['uranus', 0.0002],
    ['neptune', 0.0001]
  ]);
  
  // Different orbit speeds for each planet
  const orbitSpeeds = new Map([
    ['mercury', 0.008],
    ['venus', 0.005],
    ['earth', 0.003],
    ['mars', 0.002],
    ['jupiter', 0.001],
    ['saturn', 0.0008],
    ['uranus', 0.0005],
    ['neptune', 0.0003]
  ]);
  
  // Animation angles for orbits
  const orbitAngles = new Map<string, number>();
  planetObjects.forEach((_, id) => {
    orbitAngles.set(id, Math.random() * Math.PI * 2); // Random starting position
  });
  
  // Moon orbit angles
  const moonOrbitAngles = new Map<string, number>();
  planetObjects.forEach((_, id) => {
    moonOrbitAngles.set(id, Math.random() * Math.PI * 2);
  });
  
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    
    planetObjects.forEach((planetObj, id) => {
      const rotationSpeed = rotationSpeeds.get(id) || 0.001;
      const orbitSpeed = orbitSpeeds.get(id) || 0.001;
      
      // Update planet rotation (around its axis)
      if (planetObj.mesh) {
        planetObj.mesh.rotation.y += rotationSpeed;
      }
      
      // Update planet position (orbit around sun)
      if (orbitAngles.has(id)) {
        let angle = orbitAngles.get(id)! + orbitSpeed;
        if (angle > Math.PI * 2) angle -= Math.PI * 2;
        orbitAngles.set(id, angle);
        
        // Calculate the distance from the data or the orbit mesh
        const distance = planetObj.orbitMesh ? 
          ((planetObj.orbitMesh.geometry as any).parameters?.radius || 
          (id === 'mercury' ? 12 : 
           id === 'venus' ? 20 : 
           id === 'earth' ? 30 : 
           id === 'mars' ? 40 : 
           id === 'jupiter' ? 55 : 
           id === 'saturn' ? 75 : 
           id === 'uranus' ? 90 : 
           id === 'neptune' ? 105 : 30)) : 30;
        
        planetObj.mesh.position.x = Math.cos(angle) * distance;
        planetObj.mesh.position.z = Math.sin(angle) * distance;
        
        // Update Saturn's rings position if they exist
        if (planetObj.ringsMesh && id === 'saturn') {
          // The rings are already attached to the planet mesh, so they will follow
        }
      }
      
      // Update moon if it exists (only for Earth for now)
      if (planetObj.moonMesh && id === 'earth') {
        let moonAngle = moonOrbitAngles.get(id)! + 0.01; // Moon moves faster
        if (moonAngle > Math.PI * 2) moonAngle -= Math.PI * 2;
        moonOrbitAngles.set(id, moonAngle);
        
        const moonDistance = 1.5;
        planetObj.moonMesh.position.x = planetObj.mesh.position.x + Math.cos(moonAngle) * moonDistance;
        planetObj.moonMesh.position.y = planetObj.mesh.position.y;
        planetObj.moonMesh.position.z = planetObj.mesh.position.z + Math.sin(moonAngle) * moonDistance;
        
        // Update moon orbit position
        if (planetObj.moonOrbitMesh) {
          planetObj.moonOrbitMesh.position.copy(planetObj.mesh.position);
        }
      }
    });
    
    // Make camera follow selected planet only if not in space view mode
    if (!isSpaceView) {
      const selectedPlanet = planetObjects.get(selectedPlanetId);
      if (selectedPlanet) {
        // Smoothly update the orbit controls target to follow the planet
        const smoothness = 0.1; // Lower values make the camera movement smoother
        controls.target.lerp(selectedPlanet.mesh.position, smoothness);
        
        // Also update camera position to follow at a fixed distance
        const cameraOffset = new THREE.Vector3(0, 4, 8); // Offset from planet
        const idealPosition = selectedPlanet.mesh.position.clone().add(cameraOffset);
        camera.position.lerp(idealPosition, smoothness);
      }
    }
    
    // Update orbit controls
    controls.update();
    
    // Render the scene
    renderer.render(scene, camera);
  };
  
  animate();
  return { frameId, controls };
};

export const setupResizeHandler = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  mountRef: React.RefObject<HTMLDivElement>
): (() => void) => {
  const handleResize = () => {
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

// Create orbit path lines
export const createOrbitPath = (radius: number): THREE.Line => {
  const segments = 128;
  const orbitGeometry = new THREE.BufferGeometry();
  const vertices = [];
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    vertices.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  }
  
  orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  const orbitMaterial = new THREE.LineBasicMaterial({ 
    color: 0x444444,
    transparent: true,
    opacity: 0.3
  });
  
  return new THREE.Line(orbitGeometry, orbitMaterial);
};
