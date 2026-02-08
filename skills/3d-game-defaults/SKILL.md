---
name: 3d-game-defaults
description: Standard default values for 3D game parameters (physics, sizes, speeds) and auto-normalization of 3D models. Use these defaults to avoid guessing and adjusting. Based on Unity/Three.js conventions where 1 unit ≈ 1 meter.
---

# 3D Game Defaults and Conventions

This skill provides sensible default values for 3D game development to avoid trial-and-error with sizes, speeds, and physics parameters.

## When to Use This Skill

Use this skill when:
- Starting a new 3D game project
- Setting up player movement
- Configuring physics (gravity, jump height)
- Loading 3D models that might be different scales
- Positioning cameras

## Core Convention: 1 Unit = 1 Meter

In Three.js and most game engines, **1 unit = 1 meter** (approximately human scale).

This means:
- A player character should be ~1.8 units tall
- A car should be ~2 units wide, ~4 units long
- A room should be ~3 units tall
- Camera distance: 5-15 units from subject

## Default Parameter Values

### Player Character

```typescript
const PLAYER_DEFAULTS = {
  // Size (assuming sphere or capsule)
  radius: 0.5,              // 0.5 units = 50cm radius
  height: 1.8,              // 1.8 units = ~6 feet tall

  // Movement (units per second)
  walkSpeed: 5,             // 5 m/s walking
  runSpeed: 8,              // 8 m/s running
  jumpVelocity: 10,         // 10 m/s upward

  // Physics
  gravity: 20,              // 20 m/s² (2x Earth gravity for snappy feel)
  airControl: 0.5,          // 50% control while in air
  groundFriction: 0.8,      // 80% friction when grounded
  airResistance: 0.98,      // 2% air resistance

  // Camera (third-person)
  cameraDistance: 10,       // 10 units behind player
  cameraHeight: 3,          // 3 units above player
  cameraFOV: 50,           // 50° field of view
};
```

### Platform/Environment

```typescript
const ENVIRONMENT_DEFAULTS = {
  // Platform sizes
  platformHeight: 0.5,      // 0.5 units thick
  platformWidth: 3,         // 3 units wide (comfortable for player)
  platformGap: 2,           // 2 units between platforms

  // Room/level bounds
  roomHeight: 10,           // 10 units tall
  worldSize: 100,           // 100x100 unit play area

  // Collectibles
  coinSize: 0.3,            // 0.3 units (small pickup)
  powerupSize: 0.5,         // 0.5 units (medium pickup)
};
```

### Camera Settings

```typescript
const CAMERA_DEFAULTS = {
  // Perspective camera
  fov: 50,                  // 50° field of view (cinematic)
  near: 0.1,                // 0.1 units near plane
  far: 1000,                // 1000 units far plane

  // Positioning (for different game types)
  firstPerson: {
    height: 1.6,            // Eye level
    fov: 60,                // Wider FOV for FPS
  },

  thirdPerson: {
    distance: 10,           // Behind player
    height: 3,              // Above player
    fov: 50,                // Narrower, more cinematic
  },

  topDown: {
    distance: 20,           // High above
    angle: Math.PI / 3,     // 60° angle
    fov: 45,                // Narrow for less distortion
  },
};
```

### Lighting

```typescript
const LIGHTING_DEFAULTS = {
  ambientIntensity: 0.5,    // 50% ambient light
  directionalIntensity: 1,  // 100% directional light
  shadowBias: -0.0001,      // Shadow map bias

  // Standard three-point lighting positions
  keyLight: [5, 5, 5],      // Main light
  fillLight: [-3, 2, 2],    // Fill shadows
  backLight: [0, 5, -5],    // Rim light
};
```

## Auto-Normalizing 3D Models

**Problem:** Downloaded models have arbitrary scales (beaver was 40x too big, needs manual adjustment).

**Solution:** Auto-normalize models to a target size on load.

### Pattern: useNormalizedModel Hook

```typescript
import { useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

/**
 * Load and auto-normalize a 3D model to target size
 * @param url - Path to GLB/GLTF file
 * @param targetSize - Target height in units (default: 1 unit)
 * @returns Normalized GLTF with correct scale applied
 */
function useNormalizedModel(url: string, targetSize: number = 1) {
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

// Usage
function Player() {
  const gltf = useNormalizedModel(
    require('../assets/models/character.glb'),
    1.8  // Normalize to 1.8 units tall (human height)
  );

  return <primitive object={gltf.scene} />;
}

function Collectible() {
  const gltf = useNormalizedModel(
    require('../assets/models/coin.glb'),
    0.3  // Normalize to 0.3 units (small pickup)
  );

  return <primitive object={gltf.scene} />;
}
```

### Pattern: Inline Normalization

For one-off models without creating a hook:

```typescript
function Beaver() {
  const gltf = useLoader(GLTFLoader, require('../public/models/beaver.glb'));
  const meshRef = useRef<THREE.Group>(null);

  // Auto-calculate scale on mount
  useEffect(() => {
    if (!meshRef.current) return;

    const box = new THREE.Box3().setFromObject(meshRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const targetSize = 2; // Want beaver to be 2 units tall
    const scale = targetSize / maxDim;

    meshRef.current.scale.setScalar(scale);

    console.log(`Beaver auto-scaled: ${scale.toFixed(3)}x`);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      position={[0, -1, 0]}
    />
  );
}
```

## Quick Reference Table

| Element | Default Size | Default Speed | Notes |
|---------|-------------|---------------|-------|
| Player (human) | 1.8 units tall | 5 u/s walk, 8 u/s run | Standard humanoid |
| Player (sphere) | 0.5 radius | 5 u/s | Simple physics |
| Platform | 0.5 thick, 3 wide | N/A | Comfortable landing |
| Jump velocity | N/A | 10 u/s upward | ~2.5 unit jump height |
| Gravity | N/A | 20 u/s² | 2x Earth for game feel |
| Camera (3rd person) | 10 units away, 3 up | N/A | Good visibility |
| Collectible | 0.3 units | N/A | Small pickup |
| Vehicle | 2 wide, 4 long | 15-30 u/s | Depends on type |

## Velocity Calculations

### Jump Height Formula
```
jumpHeight = (jumpVelocity²) / (2 × gravity)
```

With defaults (10 u/s velocity, 20 u/s² gravity):
```
jumpHeight = (10²) / (2 × 20) = 100 / 40 = 2.5 units
```

### Time in Air
```
airTime = (2 × jumpVelocity) / gravity
```

With defaults:
```
airTime = (2 × 10) / 20 = 1 second
```

## Best Practices

### 1. Start with Defaults, Then Tune
```typescript
// ✅ Start with proven defaults
const playerSpeed = 5; // Standard walk speed
const gravity = 20;    // Standard game gravity

// After testing, adjust if needed
const playerSpeed = 7; // Felt too slow, increased
```

### 2. Always Normalize Models on Load
```typescript
// ❌ Don't use arbitrary scale values
<primitive object={model.scene} scale={2} />

// ✅ Use auto-normalization
const normalized = useNormalizedModel(url, targetSize);
<primitive object={normalized.scene} />
```

### 3. Keep Ratios Consistent
```typescript
// If player is 1.8 units tall:
const platformWidth = 3;      // 1.67x player height
const jumpHeight = 2.5;       // 1.39x player height
const cameraDistance = 10;    // 5.56x player height
```

### 4. Log Calculated Values
```typescript
console.log(`Model size: ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`);
console.log(`Auto-scale applied: ${scale.toFixed(3)}x`);
console.log(`Jump height: ${jumpHeight.toFixed(2)} units`);
```

## Common Pitfalls

### Pitfall 1: Inconsistent Units
```typescript
// ❌ Mixing units
const playerSpeed = 5;        // m/s
const jumpVelocity = 300;     // cm/s (wrong!)

// ✅ Consistent units (meters)
const playerSpeed = 5;        // m/s
const jumpVelocity = 10;      // m/s
```

### Pitfall 2: Forgetting to Normalize
```typescript
// ❌ Model loaded at arbitrary size
const gltf = useLoader(GLTFLoader, url);
<primitive object={gltf.scene} />  // Could be huge or tiny!

// ✅ Always normalize
const gltf = useNormalizedModel(url, 1.8);
<primitive object={gltf.scene} />
```

### Pitfall 3: Camera Too Close/Far
```typescript
// ❌ Camera too close (claustrophobic)
<Canvas camera={{ position: [0, 0, 2] }}>

// ❌ Camera too far (player looks tiny)
<Canvas camera={{ position: [0, 0, 50] }}>

// ✅ Standard third-person distance
<Canvas camera={{ position: [0, 3, 10] }}>
```

### Pitfall 4: Model Clipping Through Ground (No Y-Offset)

**Problem:** Collision uses sphere/capsule at position [0, 0, 0], but visual model's bottom is also at Y=0, causing clipping.

**Why it happens:** Collision shape (sphere with radius 0.5) sits ON the ground at Y=0.5, but the model's visual geometry extends below its origin point, so it clips through the ground.

```typescript
// ❌ Model clips through ground
function Player() {
  const gltf = useNormalizedModel(url, 1.8);

  // Collision sphere at Y=0.5 (radius 0.5)
  // But model visual extends from Y=0 to Y=1.8
  // Bottom of model clips through ground!

  return <primitive object={gltf.scene} position={[0, 0, 0]} />;
}
```

**Solution:** Add Y-offset to visual model to lift it above the collision sphere:

```typescript
// ✅ Y-offset prevents clipping
function Player() {
  const gltf = useNormalizedModel(url, 1.8);
  const meshRef = useRef<THREE.Group>(null);

  // Collision sphere at Y=0.5 (centered at player's feet)
  const collisionRadius = 0.5;
  const yOffset = collisionRadius; // Lift model up by collision radius

  return (
    <group ref={meshRef} position={[0, collisionRadius, 0]}>
      {/* Visual model offset upward */}
      <primitive
        object={gltf.scene}
        position={[0, yOffset, 0]}  // Lift model so bottom aligns with collision
      />
    </group>
  );
}
```

**Common Y-offset values:**
- **Player (sphere collision):** `yOffset = radius` (typically 0.5)
- **Player (capsule collision):** `yOffset = radius + (height/2)` (typically 0.5 + 0.9 = 1.4)
- **Objects resting on ground:** `yOffset = 0` (no offset needed if model origin is at bottom)

**Rule of thumb:** If your collision shape's center is at Y=radius (sitting on ground), add `yOffset = radius` to the visual model.

```typescript
// Complete example with Y-offset
function Player() {
  const gltf = useNormalizedModel(require('./player.glb'), 1.8);
  const meshRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState([0, 0.5, 0]); // Collision position

  const COLLISION_RADIUS = 0.5;
  const Y_OFFSET = COLLISION_RADIUS; // Visual offset

  return (
    <group position={position}>
      {/* Collision sphere (invisible) centered at feet */}
      <mesh>
        <sphereGeometry args={[COLLISION_RADIUS]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visual model offset upward */}
      <primitive
        ref={meshRef}
        object={gltf.scene}
        position={[0, Y_OFFSET, 0]}
      />
    </group>
  );
}
```

**Debug tip:** Temporarily make collision sphere visible to verify alignment:
```typescript
<meshBasicMaterial color="red" transparent opacity={0.3} />
```

## Integration with getPolyPizzaAsset

When using the asset tool, always normalize after downloading:

```typescript
// 1. Agent calls getPolyPizzaAsset
getPolyPizzaAsset({
  query: "character",
  filename: "player",
  mcpUrl: devServerUrl
});
// Returns: { filePath: "assets/models/player.glb" }

// 2. Agent creates normalized loader
const gltf = useNormalizedModel(
  require('../assets/models/player.glb'),
  1.8  // Human height
);
```

## Example: Complete Game with Defaults

```typescript
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Using all standard defaults
const DEFAULTS = {
  player: {
    radius: 0.5,
    walkSpeed: 5,
    jumpVelocity: 10,
    gravity: 20,
  },
  camera: {
    position: [0, 3, 10],
    fov: 50,
  },
  lighting: {
    ambient: 0.5,
    directional: 1,
  },
};

function useNormalizedModel(url: string, targetSize: number = 1) {
  const gltf = useLoader(GLTFLoader, url);

  const normalizedScene = useMemo(() => {
    const scene = gltf.scene.clone();
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = targetSize / maxDim;
    scene.scale.setScalar(scale);
    return scene;
  }, [gltf, targetSize]);

  return { ...gltf, scene: normalizedScene };
}

function Player() {
  const gltf = useNormalizedModel(
    require('../assets/models/player.glb'),
    1.8
  );
  const meshRef = useRef<THREE.Group>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Apply standard gravity
    let newVel = { ...velocity };
    newVel.y -= DEFAULTS.player.gravity * delta;

    meshRef.current.position.y += newVel.y * delta;

    if (meshRef.current.position.y <= DEFAULTS.player.radius) {
      meshRef.current.position.y = DEFAULTS.player.radius;
      newVel.y = 0;
    }

    setVelocity(newVel);
  });

  return <primitive ref={meshRef} object={gltf.scene} />;
}

export default function Game() {
  return (
    <Canvas camera={{ position: DEFAULTS.camera.position, fov: DEFAULTS.camera.fov }}>
      <ambientLight intensity={DEFAULTS.lighting.ambient} />
      <directionalLight position={[5, 5, 5]} intensity={DEFAULTS.lighting.directional} />
      <Player />
    </Canvas>
  );
}
```

## Key Takeaway

> **Start with proven defaults. Don't guess sizes and speeds - use the standard values, then tune only if needed after testing.**

This eliminates the trial-and-error phase of "too big", "too slow", "can't jump high enough", etc.
