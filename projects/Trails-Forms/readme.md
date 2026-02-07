# Trails-Forms

An interactive 3D visualization project that generates animated geometric forms with flowing signal trails using Three.js. Watch as mathematical shapes come to life with customizable parameters and stunning visual effects.

## Features

### Geometric Shapes
- **Cube**: Classic 3D cube with signal trails
- **Sphere**: Spherical form with flowing animations
- **Pyramid**: Pyramidal structure with dynamic trails
- **Hexagon**: Hexagonal geometry with signal flow
- **Torus**: Toroidal (donut-shaped) form with animated signals

### Visual Effects
- **Bloom Post-Processing**: Unreal Engine-style bloom effects for enhanced visuals
- **Fog**: Atmospheric fog with adjustable density
- **Signal Animation**: Flowing dots that travel along the geometric paths
- **Customizable Colors**: Background, wire, and signal colors

### Interactive Controls
- **Orbit Controls**: Mouse-controlled camera movement
- **Auto-Rotation**: Automatic slow rotation for dynamic viewing
- **Real-time GUI**: Live parameter adjustment with lil-gui interface

### Rendering Modes
- **Shell Mode**: Only external surfaces show trails (default)
- **Full Volume**: Trails throughout the entire geometric volume

## Controls & Parameters

### Geometry
- **Form Factor**: Choose between Cube, Sphere, Pyramid, Hexagon, or Torus
- **Only External**: Toggle between shell and full volume rendering

### Colors
- **Background**: Scene background color
- **Wire Color**: Color of the geometric lines
- **Signal Color**: Color of the flowing signal dots

### Signal Properties
- **Flow Speed**: Speed of signal movement (0.1 - 2.0)
- **Signal Tail**: Length of signal trails (0.01 - 0.5)
- **Density**: Frequency of signal dots (1.0 - 10.0)

### Rendering
- **Fog Enabled**: Toggle atmospheric fog
- **Fog Density**: Adjust fog thickness (0.0 - 0.1)
- **Bloom Effect**: Enable/disable bloom post-processing
- **Bloom Threshold**: Minimum brightness for bloom (0.0 - 1.0)
- **Bloom Strength**: Intensity of bloom effect (0.0 - 3.0)
- **Bloom Radius**: Spread of bloom effect (0.0 - 1.0)

## How to Run

1. **Open the Project**: Navigate to the `Trails-Forms` directory
2. **Launch**: Open `index.html` in a modern web browser
3. **Interact**: Use the GUI panel in the bottom-right corner to adjust parameters
4. **Navigate**: Click and drag to orbit around the shape, scroll to zoom

## Technical Details

### Dependencies
- **Three.js**: Core 3D library (v0.160.0)
- **OrbitControls**: Camera controls for mouse interaction
- **lil-gui**: Lightweight GUI for parameter control
- **EffectComposer**: Post-processing pipeline
- **UnrealBloomPass**: Bloom effect implementation

### Browser Requirements
- Modern browser with WebGL support
- ES6 Modules support
- Recommended: Chrome, Firefox, Safari, or Edge

### Performance
- Optimized for 60fps on modern hardware
- Adaptive pixel ratio (max 2x)
- Efficient geometry generation algorithms

## Architecture

The project uses a modular approach with:
- **Scene Management**: Three.js scene, camera, and renderer setup
- **Geometry Generation**: Procedural creation of shape vertices and connections
- **Shader System**: Custom vertex/fragment shaders for signal animation
- **Post-Processing**: Bloom and tone mapping for enhanced visuals
- **GUI Integration**: Real-time parameter control and feedback

## Customization

The code is structured for easy modification:
- Shape definitions in `isPointInside()` function
- Shader parameters in uniforms
- GUI controls in the setup section
- Post-processing effects in the composer pipeline

## License

This project is part of the Dev Card Showcase collection. See the main repository for licensing information.

## Contributing

Feel free to experiment with new shapes, effects, or parameters. The modular design makes it easy to extend functionality.