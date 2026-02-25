import * as THREE from 'three';

/**
 * Create atmospheric glow shell around a planet for close-up view.
 * Uses a BackSide shader with Fresnel-based opacity.
 */
export const createAtmosphereGlow = (
  planetRadius: number,
  color: THREE.Color,
  intensity: number = 1.0
): THREE.Mesh => {
  const geo = new THREE.SphereGeometry(planetRadius * 1.15, 64, 64);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: color },
      viewVector: { value: new THREE.Vector3(0, 0, 1) },
      intensity: { value: intensity },
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float vIntensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        vIntensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      varying float vIntensity;
      void main() {
        vec3 glow = glowColor * vIntensity * intensity;
        gl_FragColor = vec4(glow, vIntensity * 0.8);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
};

/**
 * Create Earth cloud layer — semi-transparent rotating sphere
 */
export const createCloudLayer = (planetRadius: number): THREE.Mesh => {
  const geo = new THREE.SphereGeometry(planetRadius * 1.02, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    roughness: 1.0,
    metalness: 0.0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'cloudLayer';
  return mesh;
};

/**
 * Create Earth city lights on the night side.
 * Uses an emissive unlit sphere slightly above the surface that
 * is only visible when facing away from the sun direction.
 */
export const createCityLights = (planetRadius: number): THREE.Mesh => {
  const geo = new THREE.SphereGeometry(planetRadius * 1.005, 64, 64);
  const canvas = generateCityLightsTexture(1024);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTex: { value: tex },
      sunDir: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D cityTex;
      uniform vec3 sunDir;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        float sunFacing = dot(vNormal, sunDir);
        float nightMask = smoothstep(-0.1, -0.35, sunFacing);
        vec4 city = texture2D(cityTex, vUv);
        gl_FragColor = vec4(city.rgb * 2.5, city.a * nightMask * 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'cityLights';
  return mesh;
};

/** Generate a procedural city lights texture */
function generateCityLightsTexture(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Major population centers (approximate lon/lat mapped to UV)
  const cities = [
    // Europe
    { u: 0.51, v: 0.30, r: 18 }, { u: 0.50, v: 0.28, r: 14 }, { u: 0.53, v: 0.32, r: 12 },
    // East Asia
    { u: 0.82, v: 0.34, r: 20 }, { u: 0.80, v: 0.30, r: 16 }, { u: 0.85, v: 0.32, r: 14 },
    { u: 0.87, v: 0.28, r: 12 },
    // India
    { u: 0.70, v: 0.38, r: 18 }, { u: 0.72, v: 0.40, r: 14 },
    // North America East
    { u: 0.25, v: 0.30, r: 20 }, { u: 0.27, v: 0.32, r: 16 },
    // North America West
    { u: 0.17, v: 0.32, r: 14 }, { u: 0.18, v: 0.34, r: 12 },
    // South America
    { u: 0.32, v: 0.55, r: 14 }, { u: 0.34, v: 0.58, r: 12 },
    // Middle East
    { u: 0.60, v: 0.36, r: 10 },
    // Southeast Asia
    { u: 0.78, v: 0.42, r: 12 },
    // Australia
    { u: 0.88, v: 0.60, r: 10 },
    // Africa
    { u: 0.52, v: 0.45, r: 8 }, { u: 0.55, v: 0.50, r: 8 },
  ];

  cities.forEach(city => {
    const x = city.u * canvas.width;
    const y = city.v * canvas.height;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, city.r);
    grad.addColorStop(0, 'rgba(255, 220, 120, 0.9)');
    grad.addColorStop(0.4, 'rgba(255, 190, 80, 0.5)');
    grad.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - city.r, y - city.r, city.r * 2, city.r * 2);

    // Scatter individual light dots
    for (let i = 0; i < city.r * 3; i++) {
      const dx = (Math.random() - 0.5) * city.r * 2.5;
      const dy = (Math.random() - 0.5) * city.r * 2;
      ctx.fillStyle = `rgba(255, 230, 150, ${Math.random() * 0.7 + 0.3})`;
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  });

  return canvas;
}

// Atmosphere color lookup per planet
const atmosphereColors: Record<string, THREE.Color> = {
  mercury: new THREE.Color(0.5, 0.5, 0.5),
  venus: new THREE.Color(0.9, 0.7, 0.3),
  earth: new THREE.Color(0.3, 0.6, 1.0),
  mars: new THREE.Color(0.9, 0.4, 0.2),
  jupiter: new THREE.Color(0.8, 0.7, 0.5),
  saturn: new THREE.Color(0.9, 0.85, 0.6),
  uranus: new THREE.Color(0.5, 0.8, 0.9),
  neptune: new THREE.Color(0.2, 0.3, 0.9),
};

export const getAtmosphereColor = (planetId: string): THREE.Color => {
  return atmosphereColors[planetId] || new THREE.Color(0.5, 0.5, 0.8);
};
