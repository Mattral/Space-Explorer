
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { createSkybox, createStars } from './three/SkyboxCreator';
import { createLighting } from './three/LightingSystem';
import { createSolarSystem, SolarSystemObjects } from './three/PlanetCreator';
import { cleanupResources } from './three/ResourceDisposer';
import { setupAnimation, setupResizeHandler } from './three/Animator';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PlanetSceneProps {
  planet: PlanetData;
  planets: PlanetData[];
  onSceneReady?: () => void;
  isSpaceView?: boolean;
}

const PlanetScene = ({ planet, planets, onSceneReady, isSpaceView = false }: PlanetSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetObjectsRef = useRef<Map<string, any> | null>(null);
  const frameIdRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set up the scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Dimensions for renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Clean up function to be called when component unmounts
    const cleanup = () => {
      cleanupResources({
        planetMesh: null,
        ringsMesh: null,
        renderer: rendererRef.current,
        scene: sceneRef.current,
        mountRef,
        frameId: frameIdRef.current
      });
      
      // Reset refs
      planetObjectsRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
    
    // Clean up any existing scene
    cleanup();
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Fix for TypeScript error - using type assertion to access colorSpace property
    (renderer as any).colorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    
    // Add renderer to DOM safely
    mountRef.current.appendChild(renderer.domElement);
    
    // Initialize scene elements
    createSkybox(scene);
    createStars(scene);
    createLighting(scene);
    
    // Create all planets, the sun, and their orbits
    const solarSystem = createSolarSystem(scene, planets, setIsLoading, onSceneReady);
    planetObjectsRef.current = solarSystem.planetObjects;
    
    // Set up animation loop with the selected planet
    const { frameId, controls } = setupAnimation({
      renderer,
      scene,
      camera,
      planetObjects: solarSystem.planetObjects,
      selectedPlanetId: planet.id,
      isSpaceView
    });
    
    frameIdRef.current = frameId;
    controlsRef.current = controls;
    
    // Handle window resize
    const removeResizeListener = setupResizeHandler(camera, renderer, mountRef);
    
    // Clean up when component unmounts
    return () => {
      removeResizeListener();
      cleanup();
    };
  }, [planet.id, planets, onSceneReady, isSpaceView]);
  
  return (
    <div className="w-full h-screen bg-space-dark" ref={mountRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-xl">Loading solar system...</div>
        </div>
      )}
    </div>
  );
};

export default PlanetScene;
