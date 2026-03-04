/**
 * SingularityRay JS - Core - Engine Config
 * Holds global runtime configuration separate from mathematical constants
 */

export const EngineConfig = {
    // Quality settings 
    // Dynamically downscaled if running slow
    internalResolutionScale: 1.0,

    // Feature toggles
    enablePostProcessing: true,
    enableProgressiveRender: true,
    enableFXAA: false, // Too heavy for CPU usually, disabled by default

    // Safety stops
    maxDeltaTime: 100, // ms limit to prevent spiraling death on unfocus

    // Environment
    startupMessageDelay: 2000,

    // Rendering constraints
    canvasMaxWidth: 1280,   // Cap max CPU render size
    canvasMaxHeight: 720
};
