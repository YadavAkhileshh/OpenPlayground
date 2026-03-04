# Kinetic Wave

An interactive 3D visualization featuring a dynamic grid of cubes that respond to mouse movement with flowing waves and explosive effects. Built with Three.js and enhanced with smooth GSAP animations.

## Features

### Interactive Wave Physics
- **Mouse Ripples**: Move your mouse to create real-time wave propagation across the cube grid
- **Dynamic Height**: Cubes rise and fall based on wave calculations and mouse proximity
- **Smooth Animations**: GSAP-powered transitions for fluid motion

### Explosive Interactions
- **Click Explosions**: Click anywhere to trigger dramatic grid explosions
- **Chaos Effects**: Cubes scatter and rotate during explosion sequences
- **Visual Feedback**: Flashing lights and particle effects during explosions

### Visual Themes
- **Neon Theme**: Electric pink and blue gradients
- **Ocean Theme**: Cool blue and cyan color palette
- **Sunset Theme**: Warm orange and red tones
- **Matrix Theme**: Classic green digital aesthetic

### Lighting & Materials
- **Dynamic Lighting**: Multiple colored point lights that change with themes
- **Metallic Materials**: Shiny, reflective cube surfaces
- **Shadow System**: Realistic shadows for depth and immersion
- **Mouse Light**: Follows cursor for interactive illumination

### Camera Controls
- **Mouse Drag**: Click and drag to orbit around the scene
- **Smooth Interpolation**: Fluid camera movement with easing
- **Adaptive Angles**: Camera adjusts based on interaction intensity

### Theme Modes
- **Dark Mode**: Deep black background with glowing effects
- **Light Mode**: Clean white background with subtle lighting
- **Smooth Transitions**: Animated theme switching

## Controls

### Mouse Interactions
- **Move**: Create waves and ripples across the grid
- **Click**: Trigger explosion effects
- **Drag**: Orbit camera around the scene
- **Scroll**: Alternative camera rotation (wheel)

### UI Elements
- **Color Dots**: Click to switch between visual themes
- **Theme Toggle**: Sun/Moon button for dark/light mode switching

## Technical Details

### Dependencies
- **Three.js r128**: Core 3D rendering engine
- **GSAP 3.7.1**: Animation library for smooth transitions
- **Google Fonts**: Space Grotesk typography

### Performance Optimizations
- **InstancedMesh**: Efficient rendering of 1600+ cubes
- **LOD System**: Adaptive detail based on distance
- **Optimized Shadows**: PCFSoftShadowMap for quality shadows

### Browser Compatibility
- Modern browsers with WebGL support
- Hardware acceleration recommended
- Responsive design for various screen sizes

## Configuration

The visualization includes several customizable parameters:

```javascript
const CONFIG = {
    gridSize: 40,      // Number of cubes per side (40x40 = 1600 cubes)
    spacing: 0.9,      // Distance between cubes
    boxSize: 0.6,      // Size of individual cubes
    waveSpeed: 1.5,    // Speed of wave propagation
    waveHeight: 2.5,   // Maximum wave amplitude
    mouseRadius: 10,   // Mouse influence radius
    mouseStrength: 4,  // Mouse interaction strength
    chaos: 0           // Explosion randomness factor
};
```

## How to Run

1. **Open the Project**: Navigate to the `kinetic-waves` directory
2. **Launch**: Open `index.html` in a modern web browser
3. **Interact**: Move your mouse to create waves, click to explode
4. **Customize**: Use the color dots to change themes, toggle dark/light mode

## Architecture

### Core Components
- **Scene Management**: Three.js scene setup with fog and lighting
- **Geometry System**: InstancedMesh for efficient cube rendering
- **Animation Engine**: GSAP timeline for complex sequences
- **Interaction System**: Raycasting for mouse-world intersection
- **Theme System**: Dynamic color and material switching

### Rendering Pipeline
- **Real-time Updates**: 60fps animation loop
- **Matrix Updates**: Efficient instance matrix transformations
- **Color Interpolation**: Smooth theme transitions
- **Camera Smoothing**: Interpolated camera movements

## Customization

### Adding New Themes
Themes are defined in the `colors` object within `updateTheme()`:

```javascript
const colors = {
    custom: [0xhex1, 0xhex2, 0xhex3]  // Add your color palette
};
```

### Modifying Wave Behavior
Adjust wave parameters in the CONFIG object or modify the wave calculation in the animation loop.

### Performance Tuning
- Reduce `gridSize` for better performance on lower-end devices
- Adjust `mouseRadius` and `mouseStrength` for different interaction feels
- Modify lighting intensities for different visual styles

## Browser Requirements

- **WebGL Support**: Required for 3D rendering
- **ES6 Modules**: Modern JavaScript features
- **Hardware Acceleration**: GPU acceleration recommended
- **Minimum Resolution**: 1024x768 for optimal experience

## Mobile Considerations

While primarily designed for desktop interaction, the visualization includes:
- Touch event handling for mobile devices
- Responsive UI elements
- Adaptive performance settings

## Contributing

The project is structured for easy extension:
- Modular theme system for adding new color schemes
- Configurable parameters for different visual styles
- Clean separation of interaction, animation, and rendering logic

## License

This project is part of the Dev Card Showcase collection. See the main repository for licensing information.

## Credits

Built with Three.js and GSAP for smooth, interactive 3D experiences.