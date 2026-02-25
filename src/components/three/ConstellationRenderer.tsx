import * as THREE from 'three';
import { constellations, polaris, celestialToCartesian } from '@/data/constellations';

/**
 * Render real constellations on the celestial sphere with star points and connecting lines.
 * Includes Polaris with a distinctive marker.
 */
export const createConstellations = (scene: THREE.Scene): THREE.Group => {
  const group = new THREE.Group();
  group.name = 'constellations';
  const SPHERE_RADIUS = 800;

  constellations.forEach((constellation) => {
    // Star points
    const starPositions: THREE.Vector3[] = [];
    const starVertices: number[] = [];
    const starSizes: number[] = [];

    constellation.stars.forEach((star) => {
      const [x, y, z] = celestialToCartesian(star.ra, star.dec, SPHERE_RADIUS);
      starPositions.push(new THREE.Vector3(x, y, z));
      starVertices.push(x, y, z);
      // Brighter stars → larger size (magnitude is inverted)
      starSizes.push(Math.max(1.5, 4.5 - star.magnitude));
    });

    // Stars as points
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      color: 0xeeeeff,
      size: 3,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const starPoints = new THREE.Points(starGeo, starMat);
    group.add(starPoints);

    // Constellation lines
    const lineVertices: number[] = [];
    constellation.lines.forEach((line) => {
      const from = starPositions[line.from];
      const to = starPositions[line.to];
      if (from && to) {
        lineVertices.push(from.x, from.y, from.z);
        lineVertices.push(to.x, to.y, to.z);
      }
    });

    if (lineVertices.length > 0) {
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x4488cc,
        transparent: true,
        opacity: 0.25,
        linewidth: 1,
      });

      const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
      group.add(lineSegments);
    }

    // Constellation label (using sprite)
    if (constellation.stars.length > 0) {
      const center = new THREE.Vector3();
      starPositions.forEach(p => center.add(p));
      center.divideScalar(starPositions.length);
      // Push label slightly outward
      center.normalize().multiplyScalar(SPHERE_RADIUS + 15);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
      ctx.font = '20px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(constellation.name, 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.6 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(center);
      sprite.scale.set(40, 10, 1);
      group.add(sprite);
    }
  });

  // Polaris — bright distinct star with glow
  const [px, py, pz] = celestialToCartesian(polaris.ra, polaris.dec, SPHERE_RADIUS);

  const polarisGeo = new THREE.SphereGeometry(2.5, 16, 16);
  const polarisMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const polarisMesh = new THREE.Mesh(polarisGeo, polarisMat);
  polarisMesh.position.set(px, py, pz);
  group.add(polarisMesh);

  // Polaris glow
  const glowGeo = new THREE.SphereGeometry(5, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.15, side: THREE.BackSide });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(px, py, pz);
  group.add(glow);

  // Polaris label
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 256;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d')!;
  pCtx.fillStyle = 'rgba(255, 220, 150, 0.8)';
  pCtx.font = 'bold 22px "Orbitron", monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('★ POLARIS', 128, 40);
  const pTex = new THREE.CanvasTexture(pCanvas);
  const pSpriteMat = new THREE.SpriteMaterial({ map: pTex, transparent: true });
  const pSprite = new THREE.Sprite(pSpriteMat);
  pSprite.position.set(px, py + 15, pz);
  pSprite.scale.set(50, 12, 1);
  group.add(pSprite);

  scene.add(group);
  return group;
};
