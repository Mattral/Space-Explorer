import * as THREE from 'three';

export const createLighting = (scene: THREE.Scene) => {
  // Ambient light for general illumination - slightly brighter for better visibility
  const ambientLight = new THREE.AmbientLight(0x303050, 0.5);
  scene.add(ambientLight);
  
  // Point light at the center (Sun) - high intensity, long range
  const sunLight = new THREE.PointLight(0xfff5e0, 2.5, 2500);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = false;
  scene.add(sunLight);
  
  // Create the Sun as a glowing sphere
  const sunGeometry = new THREE.SphereGeometry(25, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
  });
  
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
  
  // Inner glow layer
  const glowGeometry = new THREE.SphereGeometry(28, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide,
  });
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(sunGlow);

  // Outer corona
  const coronaGeometry = new THREE.SphereGeometry(35, 32, 32);
  const coronaMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
  scene.add(corona);
  
  // Hemisphere light for subtle ambient color variation
  const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x111122, 0.3);
  scene.add(hemiLight);
};