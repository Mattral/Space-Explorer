import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { animateSolarParticles } from './SolarParticles';
import { createAtmosphereGlow, createCloudLayer, createCityLights, getAtmosphereColor } from './PlanetCloseUp';

interface AnimationProps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  planetObjects: Map<string, any>;
  selectedPlanetId: string;
  isSpaceView?: boolean;
  reticleRef?: React.MutableRefObject<THREE.Group | null>;
  getTimeScale: () => number;
  getCloseUpPlanetId: () => string | null;
}

export const setupAnimation = ({
  renderer, scene, camera, planetObjects, selectedPlanetId, isSpaceView = false, reticleRef, getTimeScale, getCloseUpPlanetId,
}: AnimationProps) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  let simTime = 0;
  const targetPosition = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();
  let closeUpGroup: THREE.Group | null = null;
  let currentCloseUpId: string | null = null;

  const animate = () => {
    const scale = getTimeScale();
    simTime += 0.005 * scale; // base tick × user speed

    planetObjects.forEach((planetObj, planetId) => {
      if (planetObj.mesh) {
        // Kepler elliptical motion
        const a: number = planetObj.semiMajorAxis ?? 115;
        const e: number = planetObj.eccentricity ?? 0;
        const inc: number = (planetObj.inclination ?? 0) * (Math.PI / 180);
        const b = a * Math.sqrt(1 - e * e);
        const c = a * e;

        const speedMultiplier = getOrbitalSpeed(planetId);
        const angle = (planetObj.startAngle ?? 0) + simTime * speedMultiplier;

        // Parametric ellipse position
        const xEllipse = a * Math.cos(angle) - c;
        const yEllipse = b * Math.sin(angle);

        planetObj.mesh.position.x = xEllipse;
        planetObj.mesh.position.y = yEllipse * Math.sin(inc);
        planetObj.mesh.position.z = yEllipse * Math.cos(inc);

        // Axial rotation — sidereal day approximation
        const rotSpeeds: Record<string, number> = {
          mercury: 0.003, venus: -0.001, earth: 0.02, mars: 0.019,
          jupiter: 0.045, saturn: 0.038, uranus: -0.022, neptune: 0.021,
        };
        planetObj.mesh.rotation.y += (rotSpeeds[planetId] || 0.01) * Math.abs(scale);

        // Saturn rings follow planet
        if (planetId === 'saturn' && planetObj.ringsMesh) {
          planetObj.ringsMesh.position.copy(planetObj.mesh.position);
        }

        // Moons orbit their planet
        if (planetObj.moons && planetObj.moonOrbitMeshes) {
          planetObj.moons.forEach((moon: THREE.Mesh, index: number) => {
            const moonOrbit = planetObj.moonOrbitMeshes[index];
            if (moonOrbit) {
              const moonPositions = moonOrbit.geometry.attributes.position.array;
              const moonRadius = Math.sqrt(moonPositions[0] ** 2 + moonPositions[2] ** 2);
              const moonAngle = simTime * (speedMultiplier * 5 + index);
              moon.position.x = planetObj.mesh.position.x + Math.cos(moonAngle) * moonRadius;
              moon.position.y = planetObj.mesh.position.y;
              moon.position.z = planetObj.mesh.position.z + Math.sin(moonAngle) * moonRadius;
              moonOrbit.position.copy(planetObj.mesh.position);
            }
          });
        }
      }
    });

    // Belts & comets
    const asteroidBelt = scene.getObjectByName('asteroidBelt');
    if (asteroidBelt) asteroidBelt.rotation.y += 0.0005 * Math.sign(scale || 1);
    const kuiperBelt = scene.getObjectByName('kuiperBelt');
    if (kuiperBelt) kuiperBelt.rotation.y += 0.0002 * Math.sign(scale || 1);
    const comets = scene.getObjectByName('comets');
    if (comets) {
      comets.children.forEach((comet, index) => {
        const cometAngle = simTime * 0.1 + (index * Math.PI * 2 / comets.children.length);
        const distance = 200 + Math.sin(simTime * 0.2 + index) * 100;
        comet.position.x = Math.cos(cometAngle) * distance;
        comet.position.z = Math.sin(cometAngle) * distance;
        comet.lookAt(0, 0, 0);
        comet.rotateY(Math.PI);
      });
    }

    // Targeting reticle
    if (reticleRef?.current) {
      reticleRef.current.rotation.y = simTime * 2;
    }

    // Mission probes pulse
    const missionGroup = scene.getObjectByName('missionPaths');
    if (missionGroup) {
      missionGroup.children.forEach((child) => {
        if (child.name.startsWith('mission-probe-')) {
          child.rotation.y = simTime * 2;
          child.rotation.x = Math.sin(simTime) * 0.3;
        }
      });
    }

    // Constellation drift
    const constGroup = scene.getObjectByName('constellations');
    if (constGroup) constGroup.rotation.y += 0.00005;

    // Solar particles
    animateSolarParticles(scene, simTime);

    // Close-up mode
    const closeUpId = getCloseUpPlanetId();
    if (closeUpId && closeUpId !== currentCloseUpId) {
      // Enter close-up: add atmosphere, clouds, city lights
      if (closeUpGroup) { scene.remove(closeUpGroup); closeUpGroup = null; }
      const target = planetObjects.get(closeUpId);
      if (target?.mesh) {
        currentCloseUpId = closeUpId;
        const radius = (target.mesh.geometry as THREE.SphereGeometry).parameters.radius;
        closeUpGroup = new THREE.Group();
        closeUpGroup.name = 'closeUpEffects';

        const atmo = createAtmosphereGlow(radius, getAtmosphereColor(closeUpId), 1.2);
        closeUpGroup.add(atmo);

        if (closeUpId === 'earth') {
          closeUpGroup.add(createCloudLayer(radius));
          closeUpGroup.add(createCityLights(radius));
        }

        closeUpGroup.position.copy(target.mesh.position);
        scene.add(closeUpGroup);
      }
    } else if (!closeUpId && currentCloseUpId) {
      // Exit close-up
      if (closeUpGroup) { scene.remove(closeUpGroup); closeUpGroup = null; }
      currentCloseUpId = null;
    }

    // Update close-up group position & cloud rotation
    if (closeUpGroup && currentCloseUpId) {
      const target = planetObjects.get(currentCloseUpId);
      if (target?.mesh) {
        closeUpGroup.position.copy(target.mesh.position);
        const cloud = closeUpGroup.getObjectByName('cloudLayer');
        if (cloud) cloud.rotation.y += 0.001 * Math.abs(scale);
        // Update city lights sun direction
        const cityLights = closeUpGroup.getObjectByName('cityLights');
        if (cityLights && (cityLights as THREE.Mesh).material) {
          const mat = (cityLights as THREE.Mesh).material as THREE.ShaderMaterial;
          if (mat.uniforms?.sunDir) {
            const sunDir = target.mesh.position.clone().negate().normalize();
            mat.uniforms.sunDir.value.copy(sunDir);
          }
        }
      }
    }

    // Camera follow
    if (closeUpId) {
      const target = planetObjects.get(closeUpId);
      if (target?.mesh) {
        const radius = (target.mesh.geometry as THREE.SphereGeometry).parameters.radius;
        targetPosition.copy(target.mesh.position);
        targetPosition.y += radius * 0.5;
        targetPosition.z += radius * 3.5;
        targetLookAt.copy(target.mesh.position);
        camera.position.lerp(targetPosition, 0.03);
        const currentTarget = controls.target.clone();
        currentTarget.lerp(targetLookAt, 0.03);
        controls.target.copy(currentTarget);
      }
    } else if (!isSpaceView) {
      const selectedPlanet = planetObjects.get(selectedPlanetId);
      if (selectedPlanet?.mesh) {
        targetPosition.copy(selectedPlanet.mesh.position);
        targetPosition.y += 25;
        targetPosition.z += 40;
        targetLookAt.copy(selectedPlanet.mesh.position);
        camera.position.lerp(targetPosition, 0.02);
        const currentTarget = controls.target.clone();
        currentTarget.lerp(targetLookAt, 0.02);
        controls.target.copy(currentTarget);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    return requestAnimationFrame(animate);
  };

  const frameId = animate();
  return { frameId, controls };
};

const getOrbitalSpeed = (planetId: string): number => {
  // Relative orbital speeds (Earth = 1.0), based on Kepler's 3rd law
  const speeds: Record<string, number> = {
    mercury: 4.15, venus: 1.62, earth: 1.0, mars: 0.531,
    jupiter: 0.084, saturn: 0.034, uranus: 0.012, neptune: 0.006,
  };
  return speeds[planetId] || 1.0;
};

export const setupResizeHandler = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  mountRef: React.RefObject<HTMLDivElement>
) => {
  const handleResize = () => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};

export const createOrbitPath = (radius: number): THREE.Line => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i <= 128; i++) {
    const theta = (i / 128) * Math.PI * 2;
    vertices.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.2 });
  return new THREE.Line(geometry, material);
};
