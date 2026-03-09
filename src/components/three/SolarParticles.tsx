import * as THREE from 'three';

/**
 * Creates solar particle effects on the Sun:
 * - Coronal mass ejection bursts (radial particle streams)
 * - Solar flare glow pulses
 * - Ambient solar wind particles
 */
export const createSolarParticles = (scene: THREE.Scene): THREE.Group => {
  const group = new THREE.Group();
  group.name = 'solarParticles';

  // Solar wind — ambient particles streaming outward
  const windCount = 2000;
  const windGeo = new THREE.BufferGeometry();
  const windPositions = new Float32Array(windCount * 3);
  const windVelocities = new Float32Array(windCount * 3);
  const windColors = new Float32Array(windCount * 3);
  const windSizes = new Float32Array(windCount);

  for (let i = 0; i < windCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 26 + Math.random() * 120;

    windPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    windPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    windPositions[i * 3 + 2] = r * Math.cos(phi);

    // Velocity direction: outward from center
    const norm = Math.sqrt(windPositions[i*3]**2 + windPositions[i*3+1]**2 + windPositions[i*3+2]**2);
    windVelocities[i * 3] = (windPositions[i * 3] / norm) * 0.15;
    windVelocities[i * 3 + 1] = (windPositions[i * 3 + 1] / norm) * 0.15;
    windVelocities[i * 3 + 2] = (windPositions[i * 3 + 2] / norm) * 0.15;

    // Orange-yellow gradient
    const t = Math.random();
    windColors[i * 3] = 1.0;
    windColors[i * 3 + 1] = 0.5 + t * 0.4;
    windColors[i * 3 + 2] = t * 0.2;

    windSizes[i] = 0.3 + Math.random() * 0.5;
  }

  windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));
  windGeo.setAttribute('color', new THREE.BufferAttribute(windColors, 3));
  windGeo.setAttribute('size', new THREE.BufferAttribute(windSizes, 1));

  const windMat = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const windPoints = new THREE.Points(windGeo, windMat);
  windPoints.name = 'solarWind';
  windPoints.userData.velocities = windVelocities;
  group.add(windPoints);

  // CME burst streams (3 directional streams)
  for (let burst = 0; burst < 3; burst++) {
    const burstCount = 300;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocities = new Float32Array(burstCount * 3);

    // Random burst direction
    const burstDir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    ).normalize();

    for (let i = 0; i < burstCount; i++) {
      const spread = 0.3;
      const dir = burstDir.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
        )
      ).normalize();

      const r = 26 + Math.random() * 80;
      burstPositions[i * 3] = dir.x * r;
      burstPositions[i * 3 + 1] = dir.y * r;
      burstPositions[i * 3 + 2] = dir.z * r;

      burstVelocities[i * 3] = dir.x * (0.2 + Math.random() * 0.3);
      burstVelocities[i * 3 + 1] = dir.y * (0.2 + Math.random() * 0.3);
      burstVelocities[i * 3 + 2] = dir.z * (0.2 + Math.random() * 0.3);
    }

    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));

    const burstMat = new THREE.PointsMaterial({
      size: 0.6,
      color: burst === 0 ? 0xff6600 : burst === 1 ? 0xffaa00 : 0xff3300,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const burstPoints = new THREE.Points(burstGeo, burstMat);
    burstPoints.name = `cmeBurst-${burst}`;
    burstPoints.userData.velocities = burstVelocities;
    burstPoints.userData.burstDir = burstDir;
    group.add(burstPoints);
  }

  scene.add(group);
  return group;
};

/**
 * Animate solar particles each frame.
 * Call this in the main animation loop.
 */
export const animateSolarParticles = (scene: THREE.Scene, simTime: number) => {
  const group = scene.getObjectByName('solarParticles');
  if (!group) return;

  group.children.forEach(child => {
    if (!(child instanceof THREE.Points)) return;
    const positions = child.geometry.attributes.position;
    const velocities = child.userData.velocities as Float32Array;
    if (!velocities) return;

    const posArr = positions.array as Float32Array;
    const count = positions.count;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];
      posArr[i * 3 + 2] += velocities[i * 3 + 2];

      // Reset particles that go too far
      const dist = Math.sqrt(posArr[i*3]**2 + posArr[i*3+1]**2 + posArr[i*3+2]**2);
      if (dist > 160) {
        // Respawn near the sun surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 26 + Math.random() * 5;
        posArr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        posArr[i * 3 + 2] = r * Math.cos(phi);

        if (child.name === 'solarWind') {
          // Reset velocity outward
          const norm = r;
          velocities[i * 3] = (posArr[i * 3] / norm) * 0.15;
          velocities[i * 3 + 1] = (posArr[i * 3 + 1] / norm) * 0.15;
          velocities[i * 3 + 2] = (posArr[i * 3 + 2] / norm) * 0.15;
        } else if (child.userData.burstDir) {
          const dir = (child.userData.burstDir as THREE.Vector3).clone().add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
            )
          ).normalize();
          velocities[i * 3] = dir.x * (0.2 + Math.random() * 0.3);
          velocities[i * 3 + 1] = dir.y * (0.2 + Math.random() * 0.3);
          velocities[i * 3 + 2] = dir.z * (0.2 + Math.random() * 0.3);
        }
      }
    }

    positions.needsUpdate = true;
  });

  // Pulse the solar wind opacity
  const wind = group.getObjectByName('solarWind') as THREE.Points | undefined;
  if (wind) {
    (wind.material as THREE.PointsMaterial).opacity = 0.25 + Math.sin(simTime * 3) * 0.1;
  }
};
