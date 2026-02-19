# Three.js ASCII Tornado

An interactive 3D particle tornado simulation built with Three.js, featuring ASCII character rendering, customizable parameters via GUI, and optional bloom effects. Particles form swirling vortex streams that can display as circles or ASCII characters (digits and letters).

## Demo

- Open `projects/Particles-Tornado/index.html` in a modern browser with WebGL support.
- Use the GUI panel (bottom-right) to adjust tornado parameters in real-time.
- Drag to orbit the camera around the tornado.

## Features

- **Particle Vortex**: Thousands of particles arranged in helical streams forming a tornado shape.
- **ASCII Mode**: Toggle to display particles as random ASCII characters (0-9, A-Z) instead of circles.
- **Dynamic Animation**: Vertical movement, rotation, and twisting effects.
- **Interactive GUI**: Real-time controls for speed, colors, shape, bloom, and more.
- **Bloom Effects**: Optional post-processing glow for enhanced visuals.
- **Responsive**: Adapts to window resizing.

## Controls (GUI Panel)

- **Movement**: Adjust vertical speed, spin speed, and twist factor.
- **Vortex Streams**: Number of streams, spread, and chaos randomness.
- **Colors & Gradient**: Top/bottom colors and background.
- **Glow (Bloom)**: Enable/disable bloom with strength, radius, and threshold.
- **Shape**: Particle count, size, top/bottom radius, and height.
- **ASCII Mode**: Toggle between circle and ASCII particle rendering.

## Technologies

- **Three.js**: 3D rendering and particle system.
- **WebGL Shaders**: Custom vertex/fragment shaders for particle positioning and rendering.
- **Lil-GUI**: User interface for parameter controls.
- **Post-Processing**: UnrealBloomPass for glow effects.
- **OrbitControls**: Camera interaction.

## Files

- `index.html` — Complete demo with HTML, CSS, and JavaScript.

## Implementation Notes

- Particles are positioned using mathematical formulas for helical motion with offsets and phases.
- ASCII rendering uses a generated texture atlas of characters, sampled in the fragment shader.
- Font loading is handled asynchronously to ensure proper rendering.
- Optimized for performance with instanced rendering and efficient shader code.

## Browser Support

Requires WebGL support. Best in Chrome, Firefox, or Safari.

## Credits

Inspired by particle simulations and creative coding. Uses Three.js ecosystem libraries.

## License

This project follows the repository license. Check the top-level `LICENSE` file.