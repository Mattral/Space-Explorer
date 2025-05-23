
import * as THREE from 'three';

export const createLighting = (scene: THREE.Scene): void => {
  // Ambient light for base illumination - slightly brighter
  const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
  scene.add(ambientLight);
  
  // Create the sun as a light source
  const sunLight = new THREE.PointLight(0xffffcc, 2);
  sunLight.position.set(0, 0, 0); // Sun at center of system
  sunLight.castShadow = true;
  scene.add(sunLight);
  
  // Create a visual sun object - Significantly increased sun size from 5.0 to 8.0
  const sunGeometry = new THREE.SphereGeometry(8.0, 64, 64);
  
  // Use MeshStandardMaterial for emissive properties
  const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1,
    metalness: 0.1,
    roughness: 0.7
  });
  
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);
  
  // Add a subtle hemispheric light for better overall illumination
  const hemisphereLight = new THREE.HemisphereLight(0xffffcc, 0x080820, 0.8);
  scene.add(hemisphereLight);
};
