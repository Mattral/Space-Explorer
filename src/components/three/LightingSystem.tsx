import * as THREE from 'three';

export const createLighting = (scene: THREE.Scene) => {
  // ── Generous ambient fill — no planet should ever feel "dark" ──
  const ambientLight = new THREE.AmbientLight(0x8899bb, 1.2);
  scene.add(ambientLight);

  // ── Sun point light — warm, powerful, long-range ──
  const sunLight = new THREE.PointLight(0xfff8ee, 4.0, 3000, 0.8);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // ── Secondary fill light from above-right (simulates reflected light) ──
  const fillLight = new THREE.DirectionalLight(0x6688cc, 0.6);
  fillLight.position.set(200, 150, 100);
  scene.add(fillLight);

  // ── Rim light from behind-below (edge definition) ──
  const rimLight = new THREE.DirectionalLight(0x4466aa, 0.35);
  rimLight.position.set(-100, -80, -200);
  scene.add(rimLight);

  // ── The Sun mesh — brilliant, luminous ──
  const sunGeometry = new THREE.SphereGeometry(25, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffee66 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = 'sun';
  scene.add(sun);

  // Inner glow
  const glowGeometry = new THREE.SphereGeometry(30, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc33,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(glowGeometry, glowMaterial));

  // Mid corona
  const coronaGeo = new THREE.SphereGeometry(38, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(coronaGeo, coronaMat));

  // Outer halo
  const haloGeo = new THREE.SphereGeometry(50, 32, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(haloGeo, haloMat));

  // Hemisphere light for gentle sky/ground color differentiation
  const hemiLight = new THREE.HemisphereLight(0x6688cc, 0x222244, 0.5);
  scene.add(hemiLight);
};
