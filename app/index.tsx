import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import type { GLTF } from 'three-stdlib';

// Better hills - more terrain-like
function Hills() {
  const hillsRef = useRef<THREE.Group>(null);
  const hillsData = useRef<Array<{ x: number; z: number; height: number; width: number }>>([]);

  // Initialize hills
  useEffect(() => {
    const hills = [];
    for (let i = 0; i < 30; i++) {
      hills.push({
        x: i * 6 - 60,
        z: Math.random() * 8 - 4,
        height: Math.random() * 2 + 1.5,
        width: Math.random() * 4 + 6,
      });
    }
    hillsData.current = hills;
  }, []);

  useFrame((state, delta) => {
    // Move hills backwards to create scrolling effect
    if (hillsRef.current) {
      hillsRef.current.position.x -= delta * 3;
      
      // Reset position when hills move too far
      if (hillsRef.current.position.x < -60) {
        hillsRef.current.position.x = 0;
      }
    }
  });

  return (
    <group ref={hillsRef}>
      {hillsData.current.map((hill, index) => (
        <mesh key={index} position={[hill.x, -2, hill.z]} castShadow receiveShadow>
          <sphereGeometry args={[hill.width, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#5fb55f" 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[200, 50]} />
      <meshStandardMaterial 
        color="#4a8a4a" 
        roughness={0.9}
      />
    </mesh>
  );
}

// Kangaroo component with jumping mechanics
function Kangaroo() {
  const kangarooRef = useRef<THREE.Group>(null);
  const [isJumping, setIsJumping] = useState(false);
  const velocityY = useRef(0);
  const positionY = useRef(0);
  const gravity = -20;
  const jumpForce = 9;
  const groundLevel = 0;

  // Load kangaroo model
  const gltf = useLoader(GLTFLoader, require('../assets/models/kangaroo.glb')) as GLTF;

  // Auto jump every 1.8 seconds
  useEffect(() => {
    const jumpInterval = setInterval(() => {
      if (!isJumping) {
        setIsJumping(true);
        velocityY.current = jumpForce;
      }
    }, 1800);

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

      // Subtle bob animation when on ground
      if (!isJumping) {
        kangarooRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      }
    }
  });

  return (
    <group ref={kangarooRef} position={[-1, 0, 0]}>
      <primitive 
        object={gltf.scene.clone()} 
        scale={2.5} 
        rotation={[0, Math.PI / 2, 0]} 
      />
    </group>
  );
}

// Sky background with gradient effect
function Sky() {
  return (
    <>
      <mesh position={[0, 10, -20]}>
        <planeGeometry args={[200, 40]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0, -5, -20]}>
        <planeGeometry args={[200, 20]} />
        <meshBasicMaterial color="#a8d8ea" />
      </mesh>
    </>
  );
}

// Clouds
function Clouds() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x -= delta * 1.5;
      
      if (cloudsRef.current.position.x < -60) {
        cloudsRef.current.position.x = 0;
      }
    }
  });

  return (
    <group ref={cloudsRef}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i} position={[i * 15 - 30, 6 + Math.sin(i) * 1.5, -12]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
          <mesh position={[1.2, 0.2, 0]}>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
          <mesh position={[-1, 0.1, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
          <mesh position={[0.5, -0.3, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Sun
function Sun() {
  return (
    <mesh position={[15, 10, -15]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FFD700" />
    </mesh>
  );
}

// Main game scene
function GameScene() {
  return (
    <>
      <Sky />
      <Sun />
      <Clouds />
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 8, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Ground />
      <Hills />
      <Kangaroo />
      <fog attach="fog" args={['#87CEEB', 20, 50]} />
    </>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦘 Jumping Kangaroo</Text>
      <View style={styles.canvasContainer}>
        <Canvas 
          camera={{ position: [0, 3, 15], fov: 50 }}
          shadows
        >
          <GameScene />
        </Canvas>
      </View>
      <Text style={styles.instructions}>
        Watch the kangaroo jump across the Australian outback!
      </Text>
      <Text style={styles.subtitle}>
        The kangaroo jumps automatically while the hills roll by 🌄
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3d0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: '100%',
    height: 500,
    maxWidth: 800,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#5fb55f',
    backgroundColor: '#87CEEB',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5fb55f',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  instructions: {
    fontSize: 18,
    color: '#a8d8a8',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#7fb57f',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
