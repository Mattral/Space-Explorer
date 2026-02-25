import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { createSkybox, createStars } from './three/SkyboxCreator';
import { createLighting } from './three/LightingSystem';
import { createSolarSystem, SolarSystemObjects } from './three/PlanetCreator';
import { createConstellations } from './three/ConstellationRenderer';
import { createMissionPaths, animateMissions } from './three/MissionRenderer';
import { createHYGStarfield } from './three/HYGStarfield';
import { createSolarParticles } from './three/SolarParticles';
import { cleanupResources } from './three/ResourceDisposer';
import { setupAnimation, setupResizeHandler } from './three/Animator';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PlanetSceneProps {
  planet: PlanetData;
  planets: PlanetData[];
  onSceneReady?: () => void;
  isSpaceView?: boolean;
  highlightPlanetId?: string | null;
  timeScale?: number;
  closeUpPlanetId?: string | null;
  onCloseUpExit?: () => void;
}

const PlanetScene = ({ planet, planets, onSceneReady, isSpaceView = false, highlightPlanetId, timeScale = 1, closeUpPlanetId, onCloseUpExit }: PlanetSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetObjectsRef = useRef<Map<string, any> | null>(null);
  const reticleRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  const timeScaleRef = useRef<number>(timeScale);
  const closeUpPlanetIdRef = useRef<string | null>(closeUpPlanetId || null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep timeScale ref in sync so the animation loop always reads the latest value
  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    closeUpPlanetIdRef.current = closeUpPlanetId || null;
  }, [closeUpPlanetId]);

  // Targeting reticle for search highlight
  useEffect(() => {
    if (!sceneRef.current || !planetObjectsRef.current) return;

    if (reticleRef.current) {
      sceneRef.current.remove(reticleRef.current);
      reticleRef.current = null;
    }

    if (highlightPlanetId) {
      const target = planetObjectsRef.current.get(highlightPlanetId);
      if (target?.mesh) {
        const reticle = createTargetingReticle();
        reticle.position.copy(target.mesh.position);
        sceneRef.current.add(reticle);
        reticleRef.current = reticle;
      }
    }
  }, [highlightPlanetId]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const cleanup = () => {
      cleanupResources({
        planetMesh: null,
        ringsMesh: null,
        renderer: rendererRef.current,
        scene: sceneRef.current,
        mountRef,
        frameId: frameIdRef.current,
      });
      planetObjectsRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };

    cleanup();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 20;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    (renderer as any).colorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    createSkybox(scene);
    createStars(scene);
    createHYGStarfield(scene);
    createLighting(scene);
    createConstellations(scene);
    createMissionPaths(scene);
    createSolarParticles(scene);

    const solarSystem = createSolarSystem(scene, planets, setIsLoading, onSceneReady);
    planetObjectsRef.current = solarSystem.planetObjects;

    if (solarSystem.asteroidBelt) solarSystem.asteroidBelt.name = 'asteroidBelt';
    if (solarSystem.kuiperBelt) solarSystem.kuiperBelt.name = 'kuiperBelt';
    if (solarSystem.comets) solarSystem.comets.name = 'comets';

    const { frameId, controls } = setupAnimation({
      renderer, scene, camera,
      planetObjects: solarSystem.planetObjects,
      selectedPlanetId: planet.id,
      isSpaceView,
      reticleRef,
      getTimeScale: () => timeScaleRef.current,
      getCloseUpPlanetId: () => closeUpPlanetIdRef.current,
    });

    frameIdRef.current = frameId;
    controlsRef.current = controls;

    const removeResizeListener = setupResizeHandler(camera, renderer, mountRef);

    return () => {
      removeResizeListener();
      cleanup();
    };
  }, [planet.id, planets, onSceneReady, isSpaceView]);

  return (
    <div className="w-full h-screen bg-background" ref={mountRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-display text-lg text-foreground tracking-widest animate-pulse">Loading solar system...</div>
        </div>
      )}
    </div>
  );
};

/** Creates a targeting reticle group for highlighting a searched planet */
function createTargetingReticle(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'targetingReticle';

  const ringGeo = new THREE.RingGeometry(6, 6.3, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const innerRingGeo = new THREE.RingGeometry(4, 4.15, 64);
  const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.rotation.x = Math.PI / 2;
  group.add(innerRing);

  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.5 });
  const directions = [
    [[-8, 0, 0], [-4, 0, 0]],
    [[4, 0, 0], [8, 0, 0]],
    [[0, 0, -8], [0, 0, -4]],
    [[0, 0, 4], [0, 0, 8]],
  ];

  directions.forEach(([from, to]) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([...from, ...to], 3));
    group.add(new THREE.Line(geo, lineMat));
  });

  return group;
}

export default PlanetScene;
