
import * as THREE from 'three';

export const createSkybox = (scene: THREE.Scene): void => {
  const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);
  // Invert the geometry so that the texture is displayed on the inside
  skyboxGeometry.scale(-1, 1, 1);
  
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('/textures/milky_way.jpg', 
      undefined, 
      undefined, 
      (error) => {
        console.error('Error loading skybox texture:', error);
      }
    ),
    side: THREE.BackSide
  });
  
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
};

export const createStars = (scene: THREE.Scene): void => {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  
  const starsVertices = [];
  for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
};
