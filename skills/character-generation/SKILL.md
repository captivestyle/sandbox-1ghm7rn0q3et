---
name: character-generation
description: Generate AI-powered 3D characters from text descriptions. Phase 1 (image preview) and Phase 2 (3D generation) complete. Uses Gemini for images and Meshy for 3D models.
dependencies: []
---

# AI Character Generation

Generate 3D game characters from natural language descriptions using AI. The system creates a preview image for user approval, then generates a fully textured and rigged 3D GLB model.

## Current Status: Phase 1 & 2 Complete

**Available Now:**
- ✅ Image generation from text descriptions (Gemini)
- ✅ Preview image with user approval workflow
- ✅ Prompt enhancement for optimal rigging (A-pose)
- ✅ 3D model generation from approved images (Meshy)
- ✅ Fully textured GLB files ready for game use

**Coming Soon (Phase 3-4):**
- Advanced rigging options
- Pre-made animations library

## How to Use: Generate Character Preview

### Step 1: When User Requests a Character

If the user asks for a character (e.g., "add a knight character", "create a hero"), use the `generateCharacterPreview` tool.

**Example user requests:**
- "Add a brave knight character"
- "I need a wizard for my game"
- "Create a robot character"
- "Make a fantasy elf"

### Step 2: Enhance the User's Prompt

**CRITICAL**: You must enhance the user's description with rigging-optimal details. This ensures the generated image can be properly converted to 3D and rigged for animation.

**Required enhancements:**
1. `standing in neutral A-pose`
2. `arms extended at a 30 degree angle`
3. `neutral facial expression`
4. `full body visible from head to toe`
5. `character facing directly forward`
6. `standing upright with feet shoulder-width apart`
7. `ready for 3D rigging and animation`

**Example Transformation:**

User says: `"a brave knight"`

You enhance to:
```
A brave knight character, standing in neutral A-pose with arms extended
at a 30 degree angle, neutral facial expression, full body visible
from head to toe, character facing directly forward, wearing medieval armor
with detailed textures, standing upright with feet shoulder-width apart,
ready for 3D rigging and animation
```

### Step 3: Call the Tool

```typescript
generateCharacterPreview({
  threadId: "...", // Current thread ID
  prompt: "A brave knight character, standing in neutral A-pose..." // Your enhanced version
})
```

**Tool Arguments:**
- `threadId` (string): The current conversation thread ID
- `prompt` (string): Your enhanced prompt with all the A-pose and rigging details

### Step 4: Wait for User Feedback

After calling the tool:

1. **Image appears in chat** - The system automatically injects the preview image
2. **Tell the user to review** - Explain they should look at the preview
3. **Wait for their response** - They will either:
   - Request modifications ("make the armor shinier", "change hair color")
   - Approve it ("looks good", "perfect", "yes")

**Your response after generating should be:**
```
I've generated a character preview based on your description. Please review
the image above and let me know:

• If you'd like any modifications, describe the changes
• If you're happy with it, I can proceed to generate the full 3D model (this
  takes 2-5 minutes)

What would you like to do?
```

### Step 5: Handle User Feedback

**If user wants modifications:**
- Take their feedback
- Enhance the prompt again with their changes + T-pose details
- Call `generateCharacterPreview` again with updated prompt
- Repeat until they're satisfied

**If user approves:**
- Call `generate3DCharacter` tool with the imageId from the preview
- This will take 2-5 minutes to complete
- The tool will create a fully textured, rigged GLB file ready for use

### Step 6: Generate 3D Model (Phase 2)

When the user approves the preview, call the `generate3DCharacter` tool:

```typescript
generate3DCharacter({
  imageId: "...", // The imageId from generateCharacterPreview result
  threadId: "..."
});
```

**What happens:**
1. Tool converts the preview image to a 3D GLB model using Meshy AI
2. Takes 2-5 minutes to complete
3. Saves the GLB file to `assets/models/characters/[name]_character.glb`
4. Model is fully textured and rigged in A-pose
5. Ready to use in the game with AnimationMixer

**Tell the user:**
"Generating your 3D character model now! This will take about 2-5 minutes. The model will be fully textured and ready to animate when complete."

## Complete Example Workflow

### User Message:
```
"I want to add a wizard character to my game"
```

### Your Response:
```typescript
// Step 1: Identify character request
// Step 2: Enhance prompt and generate preview
generateCharacterPreview({
  threadId: "...",
  prompt: `A wizard character with flowing robes and pointed hat,
standing in neutral A-pose with arms extended at 30 degree angle,
neutral facial expression, full body visible from head to toe, character facing
directly forward, holding a wooden staff, standing upright with feet shoulder-width
apart, ready for 3D rigging and animation`
});

// Step 3: Guide user
// (Tool returns this message automatically, but you can add to it)
```

### User Sees:
- Preview image of wizard in T-pose
- Two buttons: "🔄 Modify" and "✅ Approve & Generate 3D"

### If User Says: "Make the hat taller"
```typescript
// Regenerate with modification
generateCharacterPreview({
  threadId: "...",
  prompt: `A wizard character with flowing robes and a tall pointed hat,
standing in neutral A-pose with arms extended at 30 degree angle,
neutral facial expression, full body visible from head to toe, character facing
directly forward, holding a wooden staff, standing upright with feet shoulder-width
apart, ready for 3D rigging and animation`
});
```

## Best Practices

### ✅ DO:
- **Always enhance prompts** with T-pose and rigging details
- **Keep original prompt short** - just capture user's core request
- **Wait for approval** before moving to next phase
- **Iterate based on feedback** - regenerate as many times as needed
- **Be descriptive in enhancements** - colors, materials, details help image quality

### ❌ DON'T:
- **Don't skip the T-pose details** - they're essential for 3D conversion
- **Don't proceed without approval** - user must review the image first
- **Don't generate multiple variations** - one at a time, iterate based on feedback
- **Don't add "as any"** - the tool handles typing properly

## Prompt Enhancement Templates

### Humanoid Character Template:
```
A [character description], standing in neutral T-pose with arms extended
horizontally at shoulder height, neutral facial expression, full body visible
from head to toe, character facing directly forward, [specific details like
clothing, weapons, colors], standing upright with feet shoulder-width apart,
ready for 3D rigging and animation
```

### Non-Humanoid (Future - Not Yet Supported):
For now, only humanoid characters work well (bipedal with clear limbs).
Tell users that creatures, animals, or non-humanoid characters are coming in
future updates.

## Technical Details

### What Happens Under the Hood:

1. **Tool receives prompts** → Validates inputs
2. **Calls Gemini 3 Pro Image Preview** → Generates 1:1 aspect ratio image
3. **Image returned as base64** → Stored in `generatedImages` table
4. **Custom message part created** → Injected into conversation
5. **UI displays image** → With approval buttons
6. **User feedback captured** → Stored for iteration

### Error Handling:

If image generation fails:
- Tool returns `{ success: false, error: "..." }`
- Tell user: "Image generation failed: [error]. Let me try again with adjusted settings."
- Retry with simplified prompt (remove excessive details)

## Integration with Game Code

**Current Phase (Image Only):**
- Images are stored in database
- No code generation yet
- Preview only for user approval

**Future Phases (3D Model):**
- GLB model saved to `assets/models/characters/`
- Auto-generated component with AnimationMixer
- Rigged and ready for game use

## Troubleshooting

### Problem: Image doesn't show T-pose
**Solution**: Emphasize T-pose more in prompt
```
"IMPORTANT: character MUST be in T-pose with arms fully extended horizontally"
```

### Problem: Character facing sideways
**Solution**: Add emphasis
```
"character facing directly forward toward camera, front view"
```

### Problem: Only upper body visible
**Solution**: Emphasize full body
```
"full body shot from head to toe, entire character visible including feet"
```

### Problem: User asks for multiple characters at once
**Solution**: Generate one at a time
```
"Let's create them one at a time so we can perfect each one.
Which character would you like to start with?"
```

## Examples of Good Enhanced Prompts

### Knight:
```
A brave knight character in shining silver armor with blue cape, standing in
neutral T-pose with arms extended horizontally at shoulder height, neutral
facial expression with closed helmet, full body visible from head to toe,
character facing directly forward, holding a long sword in right hand, standing
upright with feet shoulder-width apart, ready for 3D rigging and animation
```

### Wizard:
```
An elderly wizard with long white beard and purple robes decorated with stars,
standing in neutral T-pose with arms extended horizontally at shoulder height,
neutral wise expression, full body visible from head to toe, character facing
directly forward, holding a twisted wooden staff with glowing crystal, standing
upright with feet shoulder-width apart, ready for 3D rigging and animation
```

### Sci-Fi Soldier:
```
A futuristic soldier in high-tech powered armor with glowing blue energy lines,
standing in neutral T-pose with arms extended horizontally at shoulder height,
neutral expression with armored helmet, full body visible from head to toe,
character facing directly forward, equipped with advanced plasma rifle, standing
upright with feet shoulder-width apart, ready for 3D rigging and animation
```

### Robot:
```
A humanoid robot with metallic silver body and glowing orange eye sensors,
standing in neutral T-pose with arms extended horizontally at shoulder height,
expressionless mechanical face, full body visible from head to toe, character
facing directly forward, visible joints and mechanical details, standing upright
with feet shoulder-width apart, ready for 3D rigging and animation
```

## Future Roadmap

### Phase 2: 3D Generation (Coming Soon)
- `generate3DCharacter` tool
- Meshy Image-to-3D integration
- GLB model download and saving

### Phase 3: Rigging (Coming Soon)
- `rigCharacter` tool
- Auto-rigging with Mixamo-compatible skeleton
- Ready for animation

### Phase 4: Animation (Coming Soon)
- `animateCharacter` tool
- 500+ pre-made animations
- Idle, walk, run, jump, combat moves

## Summary

**Current Workflow (Phase 1):**
1. User requests character
2. You enhance prompt with T-pose details
3. Call `generateCharacterPreview` tool
4. User reviews image
5. Iterate or approve

**Key Takeaway:**
Always enhance prompts with T-pose and rigging details. This ensures the preview
image can be converted to a properly rigged 3D model in future phases.

## Quick Reference

```typescript
// When user requests character:
generateCharacterPreview({
  threadId: "[current-thread-id]",
  prompt: "[user's words] + A-pose (30° arms) + full body + forward facing + rigging ready"
});

// Then wait for user feedback and iterate
```