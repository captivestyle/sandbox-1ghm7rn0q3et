import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

/**
 * Load and auto-normalize a 3D model to target size
 * @param url - Path to GLB/GLTF file
 * @param targetSize - Target height in units (default: 1 unit)
 * @returns Normalized GLTF with correct scale applied
 */
export function useNormalizedModel(url: string, targetSize: number = 1) {
  const gltf = useLoader(GLTFLoader, url);

  const normalizedScene = useMemo(() => {
    // Clone the scene to avoid modifying cached version
    const scene = gltf.scene.clone();

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());

    // Find largest dimension
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Calculate scale to fit target size
    const scale = targetSize / maxDimension;

    // Apply scale
    scene.scale.setScalar(scale);

    // Center the model (optional)
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center.multiplyScalar(scale));

    console.log(`Model normalized: ${maxDimension.toFixed(2)} → ${targetSize} (scale: ${scale.toFixed(3)})`);

    return scene;
  }, [gltf, targetSize]);

  return { ...gltf, scene: normalizedScene };
}
