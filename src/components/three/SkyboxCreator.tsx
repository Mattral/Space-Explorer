import * as THREE from 'three';
import { constellations, celestialToCartesian } from '@/data/constellations';

export const createSkybox = (scene: THREE.Scene): void => {
  const skyboxGeometry = new THREE.SphereGeometry(900, 60, 40);
  skyboxGeometry.scale(-1, 1, 1);

  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Ultra-deep space gradient
  const gradient = ctx.createRadialGradient(2048, 1024, 50, 2048, 1024, 2048);
  gradient.addColorStop(0, '#0c1020');
  gradient.addColorStop(0.3, '#060a16');
  gradient.addColorStop(0.6, '#040812');
  gradient.addColorStop(1, '#01030a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4096, 2048);

  // ── Milky Way band ──
  // Draw a luminous band across the galactic plane (~62° tilt to celestial equator)
  ctx.save();
  ctx.translate(2048, 1024);
  ctx.rotate(-62 * Math.PI / 180);

  // Main galactic band — wide soft glow
  const mwGrad = ctx.createLinearGradient(0, -180, 0, 180);
  mwGrad.addColorStop(0, 'transparent');
  mwGrad.addColorStop(0.2, 'rgba(180, 180, 220, 0.015)');
  mwGrad.addColorStop(0.35, 'rgba(200, 190, 230, 0.04)');
  mwGrad.addColorStop(0.5, 'rgba(220, 210, 240, 0.07)');
  mwGrad.addColorStop(0.65, 'rgba(200, 190, 230, 0.04)');
  mwGrad.addColorStop(0.8, 'rgba(180, 180, 220, 0.015)');
  mwGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = mwGrad;
  ctx.fillRect(-3000, -180, 6000, 360);

  // Dense core near galactic center (Sagittarius direction)
  const coreGrad = ctx.createRadialGradient(400, 0, 10, 400, 0, 300);
  coreGrad.addColorStop(0, 'rgba(255, 240, 200, 0.08)');
  coreGrad.addColorStop(0.3, 'rgba(240, 220, 200, 0.05)');
  coreGrad.addColorStop(0.7, 'rgba(200, 190, 230, 0.02)');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(100, -300, 600, 600);

  // Milky Way star dust — thousands of tiny points along the band
  ctx.globalAlpha = 1;
  for (let i = 0; i < 8000; i++) {
    const x = (Math.random() - 0.5) * 5500;
    const y = (Math.random() - 0.5) * 200 * (1 + Math.random());
    // Density falloff from center
    const density = Math.exp(-(y * y) / (120 * 120));
    if (Math.random() > density) continue;
    const brightness = Math.random() * 0.5 + 0.3;
    const size = Math.random() * 0.8 + 0.2;
    ctx.globalAlpha = brightness * density;
    ctx.fillStyle = `rgba(${200 + Math.random() * 55}, ${190 + Math.random() * 55}, ${220 + Math.random() * 35}, 1)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Nebulae — richer, more varied ──
  const addNebula = (x: number, y: number, r: number, color: string, alpha: number) => {
    const nebGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    nebGrad.addColorStop(0, color);
    nebGrad.addColorStop(0.3, color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
    nebGrad.addColorStop(0.6, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
    nebGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = nebGrad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // Orion Nebula region (near RA ~5.5h, Dec ~-5°)
  addNebula(940, 1070, 120, 'rgb(200, 80, 120)', 0.12);
  addNebula(960, 1050, 60, 'rgb(255, 140, 180)', 0.08);

  // Carina Nebula region (RA ~10.7h, Dec ~-60°)
  addNebula(1830, 1700, 150, 'rgb(255, 120, 80)', 0.10);

  // Eagle / Serpens nebulosity
  addNebula(2700, 900, 100, 'rgb(80, 160, 200)', 0.09);

  // Large generic nebula patches
  addNebula(600, 400, 350, 'rgb(40, 15, 80)', 0.20);
  addNebula(3200, 800, 500, 'rgb(15, 30, 70)', 0.15);
  addNebula(1600, 1600, 250, 'rgb(60, 15, 25)', 0.12);
  addNebula(800, 1200, 200, 'rgb(10, 50, 60)', 0.10);
  addNebula(2800, 400, 300, 'rgb(20, 10, 50)', 0.14);
  addNebula(3600, 1500, 200, 'rgb(70, 20, 60)', 0.08);
  addNebula(200, 1700, 180, 'rgb(30, 60, 80)', 0.07);

  ctx.globalAlpha = 1;

  // ── Stars with color variation ──
  const starColors = [
    [255, 255, 255], [200, 220, 255], [255, 240, 220],
    [255, 200, 150], [180, 200, 255], [255, 180, 180],
  ];

  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 4096;
    const y = Math.random() * 2048;
    const brightness = Math.random();
    const size = Math.random() < 0.02 ? Math.random() * 2.5 + 1.5 : Math.random() * 1.2 + 0.3;
    const color = starColors[Math.floor(Math.random() * starColors.length)];

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${brightness * 0.7 + 0.3})`;
    ctx.fill();

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

  // Constellation lines on skybox texture
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#6699cc';
  ctx.lineWidth = 0.8;
  constellations.forEach(c => {
    c.lines.forEach(line => {
      const from = c.stars[line.from];
      const to = c.stars[line.to];
      if (from && to) {
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
  const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
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
