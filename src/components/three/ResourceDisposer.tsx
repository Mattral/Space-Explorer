
import * as THREE from 'three';

interface DisposableResources {
  planetMesh: THREE.Mesh | null;
  ringsMesh: THREE.Mesh | null;
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  mountRef: React.RefObject<HTMLDivElement>;
  frameId: number;
}

export const cleanupResources = (resources: DisposableResources): void => {
  cancelAnimationFrame(resources.frameId);
  
  // Clean up planet mesh
  if (resources.planetMesh) {
    if (resources.planetMesh.geometry) resources.planetMesh.geometry.dispose();
    if (resources.planetMesh.material) {
      const material = resources.planetMesh.material as THREE.MeshStandardMaterial;
      if (material.map) material.map.dispose();
      material.dispose();
    }
  }
  
  // Clean up rings mesh
  if (resources.ringsMesh) {
    if (resources.ringsMesh.geometry) resources.ringsMesh.geometry.dispose();
    if (resources.ringsMesh.material) {
      const material = resources.ringsMesh.material as THREE.MeshStandardMaterial;
      material.dispose();
    }
  }
  
  // Clean up renderer
  if (resources.renderer) {
    if (resources.mountRef.current) {
      try {
        const canvas = resources.renderer.domElement;
        if (canvas && canvas.parentNode === resources.mountRef.current) {
          resources.mountRef.current.removeChild(canvas);
        }
      } catch (e) {
        console.error('Error removing canvas:', e);
      }
    }
    
    resources.renderer.dispose();
  }
};
