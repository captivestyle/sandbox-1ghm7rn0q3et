import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import type { GLTF } from 'three-stdlib';

// Hills component - creates a rolling terrain
function Hills() {
  const hillsRef = useRef<THREE.Group>(null);
  const hillsData = useRef<Array<{ x: number; z: number; height: number; width: number }>>([]);

  // Initialize hills
  useEffect(() => {
    const hills = [];
    for (let i = 0; i < 20; i++) {
      hills.push({
        x: i * 8 - 40,
        z: Math.random() * 10 - 5,
        height: Math.random() * 3 + 2,
        width: Math.random() * 5 + 4,
      });
    }
    hillsData.current = hills;
  }, []);

  useFrame((state, delta) => {
    // Move hills backwards to create scrolling effect
    if (hillsRef.current) {
      hillsRef.current.position.x -= delta * 5;
      
      // Reset position when hills move too far
      if (hillsRef.current.position.x < -40) {
        hillsRef.current.position.x = 0;
      }
    }
  });

  return (
    <group ref={hillsRef}>
      {hillsData.current.map((hill, index) => (
        <mesh key={index} position={[hill.x, -hill.height / 2, hill.z]} castShadow receiveShadow>
          <sphereGeometry args={[hill.width, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a9b5c" />
        </mesh>
      ))}
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
      <planeGeometry args={[100, 30]} />
      <meshStandardMaterial color="#3d7a4a" />
    </mesh>
  );
}

// Kangaroo component with jumping mechanics
function Kangaroo() {
  const kangarooRef = useRef<THREE.Group>(null);
  const [isJumping, setIsJumping] = useState(false);
  const velocityY = useRef(0);
  const positionY = useRef(0);
  const gravity = -15;
  const jumpForce = 8;
  const groundLevel = 0;

  // Load kangaroo model
  const gltf = useLoader(GLTFLoader, require('../assets/models/kangaroo.glb')) as GLTF;

  // Auto jump every 2 seconds
  useEffect(() => {
    const jumpInterval = setInterval(() => {
      if (!isJumping) {
        setIsJumping(true);
        velocityY.current = jumpForce;
      }
    }, 2000);

    return () => clearInterval(jumpInterval);
  }, [isJumping]);

  useFrame((state, delta) => {
    if (kangarooRef.current) {
      // Apply gravity
      if (isJumping) {
        velocityY.current += gravity * delta;
        positionY.current += velocityY.current * delta;

        // Land on ground
        if (positionY.current <= groundLevel) {
          positionY.current = groundLevel;
          velocityY.current = 0;
          setIsJumping(false);
        }

        kangarooRef.current.position.y = positionY.current;
      }

      // Add slight rotation animation
      kangarooRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={kangarooRef} position={[0, 0, 0]}>
      <primitive object={gltf.scene.clone()} scale={1.5} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

// Sky background
function Sky() {
  return (
    <mesh position={[0, 0, -15]}>
      <planeGeometry args={[100, 50]} />
      <meshBasicMaterial color="#87CEEB" />
    </mesh>
  );
}

// Clouds
function Clouds() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x -= delta * 2;
      
      if (cloudsRef.current.position.x < -50) {
        cloudsRef.current.position.x = 0;
      }
    }
  });

  return (
    <group ref={cloudsRef}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[i * 20 - 20, 8 + Math.sin(i) * 2, -10]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
          </mesh>
          <mesh position={[1.5, 0, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
          </mesh>
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Main game scene
function GameScene() {
  return (
    <>
      <Sky />
      <Clouds />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Ground />
      <Hills />
      <Kangaroo />
    </>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jumping Kangaroo</Text>
      <View style={styles.canvasContainer}>
        <Canvas 
          camera={{ position: [0, 2, 12], fov: 60 }}
          shadows
        >
          <GameScene />
        </Canvas>
      </View>
      <Text style={styles.instructions}>
        Watch the kangaroo jump over the rolling hills!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: '100%',
    height: 500,
    maxWidth: 800,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4a9b5c',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a9b5c',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 20,
    textAlign: 'center',
  },
});
