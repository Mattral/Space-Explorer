
import * as THREE from 'three';

export const createLighting = (scene: THREE.Scene) => {
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  // Point light at the center (Sun)
  const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  
  // Create the Sun as a glowing sphere - MUCH LARGER
  const sunGeometry = new THREE.SphereGeometry(25, 64, 64); // Much larger sun
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.8,
  });
  
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
  
  // Add a subtle glow effect around the sun
  const glowGeometry = new THREE.SphereGeometry(30, 32, 32); // Slightly larger for glow
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });
  
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(sunGlow);
  
  // Additional directional light for better planet illumination
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);
};
