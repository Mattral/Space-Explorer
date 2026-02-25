import * as THREE from 'three';
import { constellations, polaris, celestialToCartesian } from '@/data/constellations';

export const createSkybox = (scene: THREE.Scene): void => {
  const skyboxGeometry = new THREE.SphereGeometry(900, 60, 40);
  skyboxGeometry.scale(-1, 1, 1);

  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Ultra-deep space gradient with subtle color regions
  const gradient = ctx.createRadialGradient(2048, 1024, 50, 2048, 1024, 2048);
  gradient.addColorStop(0, '#0c1020');
  gradient.addColorStop(0.3, '#060a16');
  gradient.addColorStop(0.6, '#040812');
  gradient.addColorStop(1, '#01030a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4096, 2048);

  // Rich nebula patches
  const addNebula = (x: number, y: number, r: number, color: string, alpha: number) => {
    const nebGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    nebGrad.addColorStop(0, color);
    nebGrad.addColorStop(0.5, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
    nebGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = nebGrad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  addNebula(600, 400, 350, 'rgb(40, 15, 80)', 0.25);
  addNebula(3200, 800, 500, 'rgb(15, 30, 70)', 0.2);
  addNebula(1600, 1600, 250, 'rgb(60, 15, 25)', 0.15);
  addNebula(800, 1200, 200, 'rgb(10, 50, 60)', 0.12);
  addNebula(2800, 400, 300, 'rgb(20, 10, 50)', 0.18);

  ctx.globalAlpha = 1;

  // Multi-layer stars with color variation for realism
  const starColors = [
    [255, 255, 255],   // white
    [200, 220, 255],   // blue-white
    [255, 240, 220],   // warm white
    [255, 200, 150],   // orange
    [180, 200, 255],   // blue
  ];

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 4096;
    const y = Math.random() * 2048;
    const brightness = Math.random();
    const size = Math.random() < 0.02 ? Math.random() * 2.5 + 1.5 : Math.random() * 1.2 + 0.3;
    const color = starColors[Math.floor(Math.random() * starColors.length)];

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${brightness * 0.7 + 0.3})`;
    ctx.fill();

    // Add diffraction spikes to brightest stars
    if (size > 2) {
      ctx.globalAlpha = brightness * 0.3;
      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4)`;
      ctx.lineWidth = 0.5;
      const spikeLen = size * 3;
      ctx.beginPath();
      ctx.moveTo(x - spikeLen, y); ctx.lineTo(x + spikeLen, y);
      ctx.moveTo(x, y - spikeLen); ctx.lineTo(x, y + spikeLen);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Draw constellation lines on the skybox texture itself for extra visual depth
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#6699cc';
  ctx.lineWidth = 0.8;
  constellations.forEach(c => {
    c.lines.forEach(line => {
      const from = c.stars[line.from];
      const to = c.stars[line.to];
      if (from && to) {
        // Map RA/Dec to canvas coordinates
        const x1 = (from.ra / 24) * 4096;
        const y1 = (0.5 - from.dec / 180) * 2048;
        const x2 = (to.ra / 24) * 4096;
        const y2 = (0.5 - to.dec / 180) * 2048;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });
  });
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
};

export const createStars = (scene: THREE.Scene): void => {
  const layers = [
    { count: 5000, size: 0.35, opacity: 0.5, spread: 1500 },
    { count: 2500, size: 0.7, opacity: 0.75, spread: 1800 },
    { count: 800, size: 1.4, opacity: 0.95, spread: 2000 },
    { count: 150, size: 2.5, opacity: 1.0, spread: 2200 },
  ];

  layers.forEach(layer => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: layer.size,
      transparent: true,
      opacity: layer.opacity,
      sizeAttenuation: true,
    });

    const vertices: number[] = [];
    for (let i = 0; i < layer.count; i++) {
      const x = (Math.random() - 0.5) * layer.spread;
      const y = (Math.random() - 0.5) * layer.spread;
      const z = (Math.random() - 0.5) * layer.spread;
      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  });
};
