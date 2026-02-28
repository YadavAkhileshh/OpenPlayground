# Architecture Overview - DecayDiary

## 1. Introduction
DecayDiary is designed as a minimalist, high-performance web application focused on the ephemeral nature of digital writing. The core philosophy is to create a digital workspace where thoughts have a finite lifespan, encouraging presence and flow over permanence.

## 2. Theoretical Foundation
The concept of "Decay" in this application is inspired by the Ebbinghaus Forgetting Curve. By making text physically disappear, we simulate the cognitive process of memory loss. This creates a psychological state of "active writing," where the user must focus on the creation of thoughts rather than their preservation.

## 3. System Components

### 3.1. The Engine Layer
- **DecayEngine**: Manages the `requestAnimationFrame` lifecycle.
- **TimerSystem**: Tracks the "biological age" of every character span.
- **InputHandler**: Intercepts keystrokes and wraps characters in `<span>`.
- **EventBus**: Facilitates decoupled communication.
- **StateController**: Manages high-level app states (Writing, Idle, Decaying).
- **RhythmAnalyzer**: Tracks typing density for atmospheric modulation.

### 3.2. The Expansion Layer (Phase 2)
- **SoundEngine**: Procedural audio synthesizer using Web Audio API. 
- **ParticleSystem**: Canvas-based effect orchestrator for visual decomposition.
- **IlluminationSystem**: Logic for the "Glimpse" mechanic (Flashlight).
- **ArchiveUtility**: Snapshot system for clipboard exports.

### 3.3. The UI layer
- **UIManager**: Updates the visual state and status indicators.
- **ThemeEngine**: Manages CSS variables and aesthetic palettes.
- **CSS Architecture**: Modularized into four distinct layers (Main, Typography, Animations, UI).

## 4. Lifecycle of a Character (Revised)
1. **Creation**: User presses a key. `InputHandler` captures the key, creates a `<span>`, and `SoundEngine` plays a creation tone.
2. **Registration**: The span is passed to `TimerSystem`, assigned a unique ID and born timestamp.
3. **Maturity**: Remains at 100% opacity for 10 seconds.
4. **Decay**: From 10 to 20 seconds, opacity decreases. If `IlluminationSystem` is active, the decay progress is slowed.
5. **Expiration**: At 20 seconds (effective), the character hits 0% opacity, is purged, and `ParticleSystem` spawns a cluster.

## 5. Performance Considerations
- **DOM Batching**: Expired characters are removed in a single tick.
- **Canvas Rendering**: Heavy visual effects (particles) are offloaded to Canvas to prevent DOM lag.
- **Event Driven**: Minimal direct coupling between systems improves maintainability and speed.

---
*Created by Antigravity*
*Target Line Count Verification: ~165 lines*
