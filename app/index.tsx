import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useNormalizedModel } from '@/hooks/useNormalizedModel';

function SwappingModels() {
  const groupRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<THREE.Group>(null);
  const bloomRef = useRef<THREE.Group>(null);

  const controller = useNormalizedModel(require('../public/models/controller.glb'), 4.5);
  const bloom = useNormalizedModel(require('../public/models/bloom-logo-3d-model.glb'), 4.5);

  const [showController, setShowController] = useState(true);
  const lastSwapRef = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Variable speed with smooth ease-in-out: slow when facing us, fast when rotated away
      const phaseShift = - Math.PI / 3;
      const normalizedCos = (1 - Math.cos(groupRef.current.rotation.y + phaseShift)) / 2;
      const eased = normalizedCos * normalizedCos * (3 - 2 * normalizedCos);
      const speed = .5 + eased * 10;
      groupRef.current.rotation.y += delta * speed;

      // Calculate scale based on speed (smaller when moving fast)
      const normalizedSpeed = (speed - 0.3) / (10.3 - 0.3);
      const scale = 1 - (normalizedSpeed * 0.98);

      // Track rotation for swap detection
      const currentRotation = groupRef.current.rotation.y;
      const rotationsSinceLastSwap = Math.floor(currentRotation / (Math.PI * 2)) - lastSwapRef.current;

      // Swap when scale is very small AND we've completed a rotation
      if (scale < 0.05 && rotationsSinceLastSwap >= 1) {
        setShowController(prev => !prev);
        lastSwapRef.current = Math.floor(currentRotation / (Math.PI * 2));
      }

      // Apply scale to both models
      if (controllerRef.current) {
        controllerRef.current.scale.setScalar(scale);
      }
      if (bloomRef.current) {
        bloomRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {showController && (
        <group ref={controllerRef}>
          <primitive
            object={controller.scene}
            rotation={[Math.PI / 6, 0, Math.PI / 4]}
          />
        </group>
      )}
      {!showController && (
        <group ref={bloomRef}>
          <primitive object={bloom.scene} />
        </group>
      )}
    </group>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <SwappingModels />
        </Canvas>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Bloom 3D</Text>
        <Text style={styles.subtitle}>
          Build 3D games with AI. Describe your game and watch it come to life.
        </Text>
        <Text style={styles.instructions}>
          Tell Bloom 3D what you want to create. No coding required.
        </Text>
        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Try saying:</Text>
          <Text style={styles.example}>• "Create a platformer where I collect 10 rotating gems before time runs out"</Text>
          <Text style={styles.example}>• "Make a racing game where I pass through checkpoints to reach the finish line"</Text>
          <Text style={styles.example}>• "Build a maze where I collect all the golden coins to unlock the exit"</Text>
          <Text style={styles.example}>• "Add floating crystals that give me powerups when I touch them"</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: 300,
    height: 300,
    marginBottom: 32,
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 26,
  },
  instructions: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  examples: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  examplesTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
    lineHeight: 20,
  },
});
