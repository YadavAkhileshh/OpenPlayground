# 3D Quantum Neural Network

An immersive 3D visualization of a quantum neural network that brings artificial intelligence concepts to life through interactive, animated graphics. Experience the beauty of neural connections with dynamic pulse propagation, morphing network structures, and stunning visual effects.

## Features

- **Interactive 3D Neural Network**: Explore a fully interactive neural network with nodes and synaptic connections in 3D space
- **Energy Pulse Propagation**: Click anywhere to send energy pulses that ripple through the network, creating mesmerizing wave effects
- **Multiple Network Formations**: Three distinct network architectures that smoothly morph between each other
- **Dynamic Themes**: Three beautiful color palettes:
  - Purple Nebula (cosmic purple gradients)
  - Sunset Fire (warm orange and red tones)
  - Ocean Aurora (cool blue and green hues)
- **Real-time Controls**:
  - Density slider to adjust network complexity (30%-100%)
  - Pause/Play to freeze animations
  - Camera reset for optimal viewing
  - Orbit controls for 360° exploration
- **Advanced Visual Effects**:
  - Bloom post-processing for glowing nodes
  - Starfield background with twinkling stars
  - Custom GLSL shaders for realistic lighting
  - Procedural noise-based animations
  - Distance-based fading and depth cues

## Technologies Used

- **Three.js**: 3D graphics engine with WebGL rendering
- **GLSL Shaders**: Custom vertex and fragment shaders for nodes and connections
- **Post-Processing**: EffectComposer with UnrealBloomPass for atmospheric effects
- **OrbitControls**: Smooth camera navigation and interaction
- **ES6 Modules**: Modern JavaScript with import maps
- **HTML5 Canvas**: Hardware-accelerated rendering
- **CSS3**: Glass-morphism UI panels and responsive design

## How to Use

1. **Open the Application**: Open `index.html` in a modern web browser with WebGL support.

2. **Navigate the Scene**:
   - **Mouse**: Left-click and drag to rotate the view, scroll to zoom
   - **Touch**: Drag to rotate, pinch to zoom

3. **Interact with the Network**:
   - **Click/Tap**: Send energy pulses that propagate through the neural connections
   - **Morph**: Click "Morph" to cycle through different network formations
   - **Freeze**: Click "Freeze" to pause all animations, "Play" to resume

4. **Customize Appearance**:
   - **Themes**: Choose from three color palettes using the theme buttons
   - **Density**: Adjust the network complexity with the density slider
   - **Camera**: Click "Reset" to return to the default camera position

5. **Explore**: The camera auto-rotates slowly, but you can take manual control anytime.

## Network Formations

- **Formation 1**: Spherical cluster with radial connections
- **Formation 2**: Toroidal (donut-shaped) network structure
- **Formation 3**: Complex multi-layered architecture

Each formation maintains the same neural connectivity while presenting different spatial arrangements.

## Technical Details

- **Rendering**: Real-time WebGL with custom shader materials
- **Performance**: Optimized for 60fps with efficient geometry instancing
- **Shaders**: Separate vertex/fragment shaders for nodes and connections
- **Effects**: Pulse propagation using distance-based calculations
- **Animation**: Procedural noise functions for organic movement
- **Interaction**: Raycasting for precise 3D interaction

## Browser Compatibility

Requires WebGL support and modern browser features:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

This project is part of the [OpenPlayground](https://github.com/YadavAkhileshh/OpenPlayground) repository. To contribute:

1. Clone the repository
2. Navigate to `projects/3D-quantum/`
3. Open `index.html` in your browser for development
4. Edit `app.js` for core functionality, modify shaders for visual effects

## Inspiration

This visualization draws inspiration from quantum computing concepts, neural network architectures, and the aesthetic of sci-fi interfaces. The pulsing energy waves represent information flow through the network, while the morphing formations demonstrate the adaptability of neural systems.

## Performance Notes

- Optimized for desktop browsers; may require hardware acceleration on mobile
- Density slider affects performance - lower settings improve frame rates
- Bloom effects can be disabled by commenting out the UnrealBloomPass

## License

This project follows the same license as the main OpenPlayground repository.