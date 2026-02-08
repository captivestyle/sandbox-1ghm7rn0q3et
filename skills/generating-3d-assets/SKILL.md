---
name: generating-3d-assets
description: Guide for downloading and generating 3D assets using Sketchfab (RECOMMENDED for animated models), Poly Pizza, and Tripo3D AI generation. Includes when to use each method, animation handling, and best practices.
dependencies:
  - skeletal-animations
  - 3d-game-defaults
  - loading-3d-assets
---

# Generating and Loading 3D Assets

This skill covers three methods for acquiring 3D models for your game:
1. **getSketchfabAsset** - ⭐ **RECOMMENDED** - Download 3D models from Sketchfab by tags (~5 seconds) - **Includes ANIMATED models for characters!**
2. **getPolyPizzaAsset** - Fast downloads from free asset library (~5 seconds)
3. **generateTripo3DAsset** - AI-generated custom assets from text prompts (30-120 seconds)

## When to Use Each Method

### Use getSketchfabAsset When (⭐ RECOMMENDED FIRST):
- **You need animated characters** (walking, running, jumping animations)
- You need vehicles with animations (helicopters with rotating rotors, cars)
- You want high-quality community-made assets
- Search by tags: "helicopter", "character", "lowpoly", "animated"
- Speed is important (immediate download, ~5 seconds)
- **This is the BEST option for characters and animated objects**

### Use getPolyPizzaAsset When:
- You need simple static props (trees, buildings, rocks)
- You need basic environment objects
- Generic terms work well: "tree", "rock", "building"
- **Note**: Poly Pizza assets are typically NOT animated

### Use generateTripo3DAsset When:
- Neither Sketchfab nor Poly Pizza has what you need
- You need a very specific or unique asset
- Customization is important
- You can wait 30-120 seconds for generation
- You need something with specific style/attributes
- **Note**: Generated assets are NOT animated

## Tool: getSketchfabAsset (⭐ RECOMMENDED FOR CHARACTERS)

Downloads 3D models from [Sketchfab](https://sketchfab.com/) - a library of over 1 million 3D assets including **ANIMATED models**.

**Requirements:**
- `SKETCHFAB_API_KEY` must be set in Convex environment variables

```typescript
// Example: Download an animated helicopter
getSketchfabAsset({
  tags: "helicopter",
  filename: "player_helicopter",
  mcpUrl: "..." // Dev server MCP URL
})

// Example: Download an animated character
getSketchfabAsset({
  tags: "character lowpoly animated",
  filename: "player_character",
  mcpUrl: "..."
})
```

**Returns:**
```typescript
{
  success: true,
  filePath: "assets/models/player_helicopter.glb",
  filename: "player_helicopter.glb",
  modelName: "Helicopter Mi-24 Hind",
  author: "creator_username",
  license: "CC Attribution",
  sourceUrl: "https://sketchfab.com/3d-models/...",
  isAnimated: true,  // ⭐ Check this flag!
  tags: "helicopter, vehicle, military",
  message: "Successfully downloaded... IMPORTANT: Check gltf.animations to see if this model has animations. If it does, use AnimationMixer to play them (see skeletal-animations skill)."
}
```

**Search Tips:**
- Use **tags** not full text search: "helicopter", "character", "lowpoly"
- Combine tags: "character animated", "helicopter lowpoly"
- Popular tags: character, animated, lowpoly, vehicle, animal, robot
- Check `isAnimated: true` in response to know if model has animations
- **CRITICAL**: If `isAnimated: true`, you MUST use AnimationMixer (see skeletal-animations skill)

**Animation Handling:**
When `isAnimated: true`, check the model's animations:
```typescript
// After loading with useLoader or useNormalizedModel
console.log('Available animations:', gltf.animations.map(a => a.name));

// See skeletal-animations skill for full AnimationMixer implementation
```

## Tool: getPolyPizzaAsset

Downloads free 3D models from [Poly Pizza](https://poly.pizza/) - a library of low-poly game-ready assets.

```typescript
// Example: Download a tree model
getPolyPizzaAsset({
  query: "tree",
  filename: "oak_tree",
  mcpUrl: "..." // Dev server MCP URL
})
```

**Returns:**
```typescript
{
  success: true,
  filePath: "assets/models/oak_tree.glb",
  filename: "oak_tree.glb",
  modelName: "Low Poly Tree",
  author: "creator_username",
  sourceUrl: "https://poly.pizza/m/...",
  glbUrl: "https://static.poly.pizza/...",
  message: "Successfully downloaded..."
}
```

**Search Tips:**
- Use simple, generic terms: "car", "tree", "sword"
- Add "low poly" if results are too complex: "low poly character"
- Try broader terms if specific search fails: "vehicle" instead of "sports car"
- Common categories: character, animal, vehicle, building, weapon, tree, plant, furniture

## Tool: generateTripo3DAsset

Generates custom 3D models using [Tripo3D](https://www.tripo3d.ai/) AI service.

**Requirements:**
- `TRIPO_API_KEY` must be set in Convex environment variables
- Takes 30-120 seconds to generate
- Suitable for creating unique, custom assets

```typescript
// Example: Generate a custom weapon
generateTripo3DAsset({
  prompt: "a medieval iron sword with ornate handle",
  filename: "custom_sword",
  mcpUrl: "..." // Dev server MCP URL
})
```

**Returns:**
```typescript
{
  success: true,
  filePath: "assets/models/custom_sword.glb",
  filename: "custom_sword.glb",
  taskId: "task_abc123",
  prompt: "a medieval iron sword with ornate handle",
  message: "Successfully generated 3D asset..."
}
```

**Prompt Tips:**
- Be descriptive but concise: "low poly cartoon spaceship with blue markings"
- Specify style: "cartoon", "low poly", "realistic", "stylized"
- Include key attributes: colors, materials, details
- Avoid overly complex prompts (keep under 50 words)

**Error Handling:**
```typescript
// If API key missing
{
  success: false,
  error: "TRIPO_API_KEY not configured",
  message: "Tripo3D API key not found..."
}

// If generation times out (>2 minutes)
{
  success: false,
  error: "Generation timeout",
  message: "Tripo3D generation timed out... Try again or use getPolyPizzaAsset instead."
}
```

## Recommended Workflow

### Step 1: Try Sketchfab First (Especially for Characters)
```typescript
// Quick search for animated assets
const result = await getSketchfabAsset({
  tags: "helicopter lowpoly",
  filename: "player_helicopter",
  mcpUrl
});

if (result.success) {
  console.log('Is animated:', result.isAnimated);
  console.log('See skeletal-animations skill for AnimationMixer setup');
  // Asset downloaded, proceed to load it with animations
}
```

### Step 2: Try Poly Pizza for Static Props
```typescript
// If you need simple static objects
const result = await getPolyPizzaAsset({
  query: "tree",
  filename: "tree",
  mcpUrl
});

if (result.success) {
  // Asset downloaded, proceed to load it
}
```

### Step 3: Fall Back to Generation if Needed
```typescript
// If neither Sketchfab nor Poly Pizza has what you need
const result = await generateTripo3DAsset({
  prompt: "low poly cartoon spaceship with blue energy trail",
  filename: "player_ship",
  mcpUrl
});

// This will take 30-120 seconds
if (result.success) {
  // Custom asset generated and downloaded
}
```

### Step 4: Load and Normalize the Asset
```typescript
// All tools save to assets/models/
// Always use useNormalizedModel to auto-scale
import { useNormalizedModel } from '@/hooks/useNormalizedModel';

function PlayerHelicopter() {
  const gltf = useNormalizedModel(
    require('../assets/models/player_helicopter.glb'),
    2.5  // Target size in units
  );

  // If model has animations, set up AnimationMixer
  // See skeletal-animations skill for complete implementation

  return <primitive object={gltf.scene} />;
}
```

## Complete Example: Dynamic Asset Loading

```typescript
// User requests: "Add a futuristic hover bike"

// Step 1: Try Poly Pizza
let assetPath;
const polyPizzaResult = await getPolyPizzaAsset({
  query: "hover bike",
  filename: "hover_bike",
  mcpUrl
});

if (polyPizzaResult.success) {
  assetPath = polyPizzaResult.filePath;
  console.log("Found existing hover bike asset");
} else {
  // Step 2: Generate custom asset
  console.log("No existing hover bike, generating custom one...");
  const tripoResult = await generateTripo3DAsset({
    prompt: "futuristic hover bike with glowing blue accents",
    filename: "hover_bike",
    mcpUrl
  });

  if (tripoResult.success) {
    assetPath = tripoResult.filePath;
    console.log("Custom hover bike generated");
  } else {
    throw new Error("Failed to acquire hover bike asset");
  }
}

// Step 3: Create component using the asset
// Write to app/components/HoverBike.tsx:
import { useNormalizedModel } from '@/hooks/useNormalizedModel';

function HoverBike({ position }) {
  const gltf = useNormalizedModel(
    require('../assets/models/hover_bike.glb'),
    3.0  // 3 units long (vehicle size)
  );

  return (
    <group position={position}>
      <primitive object={gltf.scene} />
    </group>
  );
}
```

## Common Asset Requests and Strategies

| Request | Strategy | Example |
|---------|----------|---------|
| "Add a character" | ⭐ Use Sketchfab (ANIMATED) | `getSketchfabAsset({ tags: "character lowpoly animated", filename: "player" })` |
| "Add a helicopter" | ⭐ Use Sketchfab (ANIMATED) | `getSketchfabAsset({ tags: "helicopter", filename: "helicopter" })` |
| "Add a tree" | Use Poly Pizza (static) | `getPolyPizzaAsset({ query: "tree", filename: "tree" })` |
| "Add a car" | Use Sketchfab (may be animated) | `getSketchfabAsset({ tags: "car lowpoly", filename: "car" })` |
| "Add a glowing magic sword" | Generate custom | `generateTripo3DAsset({ prompt: "glowing blue magic sword", filename: "magic_sword" })` |
| "Add a robot" | ⭐ Use Sketchfab (ANIMATED) | `getSketchfabAsset({ tags: "robot animated", filename: "robot" })` |

## Best Practices

### 1. Always Normalize Models
```typescript
// ❌ Don't use raw GLB (unknown scale)
const gltf = useLoader(GLTFLoader, require('../assets/models/model.glb'));

// ✅ Always normalize to target size
const gltf = useNormalizedModel(
  require('../assets/models/model.glb'),
  targetSize
);
```

### 2. Use Consistent File Paths
Both tools save to `assets/models/` directory:
```
assets/
  models/
    player.glb
    enemy.glb
    sword.glb
```

### 3. Handle Long Generation Times
```typescript
// Inform user that generation is in progress
console.log("Generating custom asset, this may take up to 2 minutes...");

const result = await generateTripo3DAsset({
  prompt: "...",
  filename: "...",
  mcpUrl
});

if (result.success) {
  console.log(`Asset ready: ${result.filePath}`);
}
```

### 4. Provide Fallbacks
```typescript
// If generation fails, suggest alternatives
try {
  const result = await generateTripo3DAsset({...});
  if (!result.success) {
    // Suggest using Poly Pizza or simplifying the prompt
    console.log("Generation failed. Try searching Poly Pizza or simplify your prompt.");
  }
} catch (error) {
  console.error("Asset generation error:", error);
}
```

## Troubleshooting

### Poly Pizza Returns No Results
- Try broader search terms: "vehicle" instead of "Ferrari"
- Add "low poly" to search
- Try synonyms: "character" vs "person", "gun" vs "weapon"

### Tripo3D Generation Fails
- Check TRIPO_API_KEY is set correctly
- Simplify the prompt (remove overly specific details)
- Try different wording or style descriptors
- Wait and retry if service is overloaded

### Model Appears Too Large/Small
- Always use `useNormalizedModel` with appropriate target size
- Reference 3d-game-defaults skill for standard sizes:
  - Player: 1.8 units
  - Vehicle: 2-4 units
  - Props: 0.3-1.0 units
  - Environment: 5-20 units

### Model Clips Through Ground
- Add Y-offset equal to collision radius (see 3d-game-defaults skill)
```typescript
<primitive
  object={gltf.scene}
  position={[0, 0.5, 0]}  // Lift by collision radius
/>
```

## Integration with Other Skills

This skill works best when combined with:
- **skeletal-animations** - ⭐ CRITICAL for animated models from Sketchfab - learn AnimationMixer workflow
- **3d-game-defaults** - Provides target sizes for normalization
- **loading-3d-assets** - Detailed guide on using useNormalizedModel hook
- **creating-platformer-mechanics** - Game mechanics with character animations
