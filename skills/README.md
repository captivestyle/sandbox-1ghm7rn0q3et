# Operational Skills

**Purpose:** Code patterns and examples for generating 3D games

**Audience:** The agent when building games, and developers learning 3D game patterns

## ✅ Important Note

**These skills ARE for the agent to use during game generation.**

These provide code examples, patterns, and best practices that the agent should reference when building games for users. They help the agent generate better, more complete games.

## Planned Skills

### creating-platformer-mechanics
How to implement platformer game mechanics with @react-three/fiber.

**Will cover:**
- Gravity and physics
- Jump mechanics
- Collision detection
- Platform interactions
- Player movement

**Use when:** User requests a platformer game

---

### implementing-3d-controls
Touch and keyboard control patterns for 3D games on mobile/web.

**Will cover:**
- Touch controls (virtual joystick, buttons)
- Keyboard controls (WASD, arrows)
- Gesture controls (swipe, pinch)
- Control UI overlays
- Input handling best practices

**Use when:** Adding controls to any 3D game

---

### designing-game-cameras
Camera systems that follow players and enhance gameplay.

**Will cover:**
- Third-person follow camera
- First-person camera
- Fixed/cinematic cameras
- Camera smoothing and interpolation
- Camera constraints and bounds

**Use when:** Setting up game views and perspectives

---

### building-3d-environments
Creating game worlds with terrain, platforms, and obstacles.

**Will cover:**
- Procedural terrain generation
- Platform layouts
- Environmental objects
- Lighting and atmosphere
- Performance optimization

**Use when:** Creating game worlds and levels

---

### implementing-game-physics
Physics systems for realistic movement and interactions.

**Will cover:**
- Gravity and velocity
- Collision detection and response
- Rigid body physics
- Character controllers
- Physics optimization

**Use when:** Games need realistic movement

## Looking for Meta Skills?

If you're looking for documentation on HOW to build agent systems (not game mechanics), see `skills/meta/` instead.

## Contributing

When creating new operational skills:

1. **Focus on code examples** - Show working implementations
2. **Keep it practical** - Agent should be able to copy and adapt
3. **Include variations** - Different approaches for different game types
4. **Test everything** - All code should work with @react-three/fiber on React Native
5. **Avoid web-only libraries** - NO @react-three/drei (breaks on React Native)
