
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface UseThreeSceneProps {
  width: number;
  height: number;
  onSceneReady?: () => void;
}

interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  mount: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useThreeScene = ({ width, height, onSceneReady }: UseThreeSceneProps): ThreeScene => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create scene
  const scene = new THREE.Scene();
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  
  // Create renderer with antialiasing for better quality
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
  
  return {
    scene,
    camera,
    renderer,
    mount: mountRef,
    isLoading,
    setIsLoading
  };
};
