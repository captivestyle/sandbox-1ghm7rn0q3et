---
name: skeletal-animations
description: How to implement skeletal animations with AnimationMixer. Covers discovering available animations, setting up the animation system, and creating state machines for gameplay. Essential for animated models from Sketchfab.
dependencies:
  - 3d-game-defaults
---

# Skeletal Animations with AnimationMixer

This skill covers implementing character animations using Three.js AnimationMixer when you have an animated GLB model.

## What are Skeletal Animations?

Skeletal animations use a bone structure to animate 3D characters. An animated GLB file contains:
- The 3D mesh (character model)
- A skeleton (bone hierarchy)
- Animation clips (Idle, Walk, Run, Jump, etc.)

AnimationMixer is the Three.js system that controls which animation plays and handles transitions between them.

## Discovering Available Animations

When you load an animated GLB, always log what animations it contains:

```typescript
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltf = useLoader(GLTFLoader, require('../assets/models/character.glb')) as any;

useEffect(() => {
  if (!gltf || !gltf.animations) return;

  console.log('Available animations:',
    gltf.animations.map((clip: THREE.AnimationClip) => ({
      name: clip.name,
      duration: clip.duration.toFixed(2) + 's'
    }))
  );
}, [gltf]);
```

Different models have different animation names. Common variations:
- `Idle` or `T-Pose` or `Standing`
- `Walk` or `Walking`
- `Run` or `Running`
- `Jump` or `JumpStart`

Check the console log to see what's actually available, then use those names in your state machine.

## AnimationMixer Setup

```typescript
import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function AnimatedCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const currentAnimationRef = useRef('Idle');

  const gltf = useLoader(GLTFLoader, require('../assets/models/character.glb')) as any;

  // Setup AnimationMixer
  useEffect(() => {
    if (!gltf || !gltf.scene || !gltf.animations) return;

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    // Store all animation actions
    gltf.animations.forEach((clip: THREE.AnimationClip) => {
      actionsRef.current[clip.name] = mixer.clipAction(clip);
    });

    console.log('Available animations:',
      gltf.animations.map((clip: THREE.AnimationClip) => clip.name)
    );

    // Play initial animation
    if (actionsRef.current['Idle']) {
      actionsRef.current['Idle'].play();
    }

    return () => mixer.stopAllAction();
  }, [gltf]);

  // Update mixer every frame
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}
```

**Critical:**
- Use `useRef` for mixer and actions, NOT `useState` (causes closure bugs)
- Use `useLoader` + `GLTFLoader`, NOT `useGLTF` from drei (import.meta issues)
- Update mixer every frame in `useFrame`

## Animation Switching with Crossfade

```typescript
const playAnimation = (name: string) => {
  if (!actionsRef.current[name]) {
    console.warn(`Animation "${name}" not found`);
    return;
  }
  if (currentAnimationRef.current === name) return; // Already playing

  const current = actionsRef.current[currentAnimationRef.current];
  const next = actionsRef.current[name];

  // Crossfade for smooth transitions
  if (current) current.fadeOut(0.2);
  if (next) next.reset().fadeIn(0.2).play();

  currentAnimationRef.current = name;
};
```

Call this function whenever you want to switch animations. It handles smooth crossfading automatically.

## Animation State Machines

### Basic Movement States

```typescript
useFrame((state, delta) => {
  if (!groupRef.current || !mixerRef.current) return;

  mixerRef.current.update(delta);

  // Check game state
  const isMoving = keys.w || keys.s || keys.a || keys.d;
  const isJumping = groupRef.current.position.y > groundY;

  // Switch animations based on state
  if (isJumping) {
    playAnimation('Jump');
  } else if (isMoving) {
    playAnimation('Running');
  } else {
    playAnimation('Idle');
  }
});
```

### Walk vs Run States

```typescript
// Determine speed
const isRunning = keys.shift && isMoving;
const isWalking = !keys.shift && isMoving;

if (isJumping) {
  playAnimation('Jump');
} else if (isRunning) {
  playAnimation('Run');
} else if (isWalking) {
  playAnimation('Walk');
} else {
  playAnimation('Idle');
}
```

### Combat States

```typescript
if (isDead) {
  playAnimation('Death');
} else if (isAttacking) {
  playAnimation('Attack');
} else if (isBlocking) {
  playAnimation('Block');
} else if (isMoving) {
  playAnimation('Run');
} else {
  playAnimation('Idle');
}
```

## Size Normalization

Animated characters need normalization like static models:

```typescript
const normalizedScale = useRef(1);

useEffect(() => {
  if (!gltf || !gltf.scene) return;

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetSize = 1.8; // Standard humanoid height
  normalizedScale.current = targetSize / maxDim;
}, [gltf]);

return (
  <group
    ref={groupRef}
    position={[0, 0.9, 0]} // Lift by collision radius
    scale={normalizedScale.current}
  >
    <primitive object={gltf.scene} />
  </group>
);
```

## Complete Working Example

```typescript
import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const keys = { w: false, a: false, s: false, d: false, space: false };

function AnimatedCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const currentAnimationRef = useRef('Idle');
  const velocityRef = useRef(new THREE.Vector3());
  const isJumpingRef = useRef(false);

  const gltf = useLoader(GLTFLoader, require('../assets/models/character.glb')) as any;
  const normalizedScale = useRef(1);

  // Size normalization
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    normalizedScale.current = 1.8 / maxDim;
  }, [gltf]);

  // Setup AnimationMixer
  useEffect(() => {
    if (!gltf || !gltf.animations) return;

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    gltf.animations.forEach((clip: THREE.AnimationClip) => {
      actionsRef.current[clip.name] = mixer.clipAction(clip);
    });

    console.log('Available animations:',
      gltf.animations.map((clip: THREE.AnimationClip) => clip.name)
    );

    if (actionsRef.current['Idle']) {
      actionsRef.current['Idle'].play();
    }

    return () => mixer.stopAllAction();
  }, [gltf]);

  const playAnimation = (name: string) => {
    if (!actionsRef.current[name] || currentAnimationRef.current === name) return;

    const current = actionsRef.current[currentAnimationRef.current];
    const next = actionsRef.current[name];

    if (current) current.fadeOut(0.2);
    if (next) next.reset().fadeIn(0.2).play();

    currentAnimationRef.current = name;
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !mixerRef.current) return;

    mixerRef.current.update(delta);

    // Movement
    const speed = 5;
    const movement = new THREE.Vector3();
    if (keys.w) movement.z -= 1;
    if (keys.s) movement.z += 1;
    if (keys.a) movement.x -= 1;
    if (keys.d) movement.x += 1;

    const isMoving = movement.length() > 0;
    if (isMoving) {
      movement.normalize().multiplyScalar(speed * delta);
      groupRef.current.position.add(movement);
      groupRef.current.rotation.y = Math.atan2(movement.x, movement.z);
    }

    // Jumping physics
    const groundY = 0.9;
    const isOnGround = groupRef.current.position.y <= groundY;

    if (keys.space && isOnGround && !isJumpingRef.current) {
      velocityRef.current.y = 6;
      isJumpingRef.current = true;
    }

    velocityRef.current.y += -20 * delta;
    groupRef.current.position.y += velocityRef.current.y * delta;

    if (groupRef.current.position.y <= groundY) {
      groupRef.current.position.y = groundY;
      velocityRef.current.y = 0;
      isJumpingRef.current = false;
    }

    // Animation state machine
    if (isJumpingRef.current) {
      playAnimation('Jump');
    } else if (isMoving) {
      playAnimation('Running');
    } else {
      playAnimation('Idle');
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.9, 0]} scale={normalizedScale.current}>
      <primitive object={gltf.scene} />
    </group>
  );
}
```

## Critical Pitfalls

### 1. Using useState causes closure bugs
```typescript
// ❌ Wrong - animation gets stuck
const [currentAnimation, setCurrentAnimation] = useState('Idle');

// ✅ Correct
const currentAnimationRef = useRef('Idle');
```

### 2. @react-three/drei has import.meta issues
```typescript
// ❌ Wrong
import { useGLTF } from '@react-three/drei';

// ✅ Correct
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
```

### 3. Forgetting to update mixer
```typescript
// ❌ Wrong - animation won't play
const mixer = new THREE.AnimationMixer(gltf.scene);

// ✅ Correct - update every frame
useFrame((state, delta) => {
  if (mixerRef.current) {
    mixerRef.current.update(delta);
  }
});
```

## Related Skills

- **3d-game-defaults** - Standard character sizes (1.8 units for humanoids)
- **player-movement** - Character controller with WASD movement
- **generating-3d-assets** - Tools for getting animated character models
