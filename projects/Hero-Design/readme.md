# PRISM — Interactive 3D Hero Design

An immersive, browser-based hero section featuring a dynamic 3D prism rendered with WebGL. The design showcases raymarching techniques, refraction effects, and interactive mouse controls, creating a mesmerizing spectrum of light with a nebula background.

## Demo

- Open `projects/Hero-Design/index.html` in a modern browser with WebGL support.
- Move the mouse to interact with the 3D scene and buttons.

## Features

- **3D Raymarching**: Real-time rendering of a complex prism geometry with distortion effects.
- **Refraction & Optics**: Simulates light refraction through the prism, splitting into RGB components.
- **Interactive Controls**: Mouse movement rotates and affects the 3D view.
- **Glass Morphism UI**: Modern glass buttons with hover effects, shimmer animations, and gradient borders.
- **Nebula Background**: Procedurally generated starry sky with nebula effects.
- **Responsive Design**: Adapts to window resizing.

## Technologies

- **WebGL**: For hardware-accelerated 3D rendering.
- **GLSL Shaders**: Custom vertex and fragment shaders for advanced visual effects.
- **JavaScript**: Handles WebGL setup, uniforms, and event listeners.
- **CSS**: Styling for the overlay content, buttons, and animations.

## Files

- `index.html` — Complete demo with HTML, CSS, GLSL shaders, and JavaScript.

## Implementation Notes

- The fragment shader performs raymarching to render the 3D scene, including refraction calculations for the prism effect.
- Mouse position influences camera rotation and prism interaction.
- Buttons use CSS for glassmorphism effects with animated borders and shimmers.
- Optimized for performance with efficient shader code and minimal draw calls.

## Browser Support

Requires a browser with WebGL support (most modern browsers). For best experience, use Chrome, Firefox, or Safari.

## Credits

Inspired by creative coding and shader art communities. Uses WebGL for rendering.

## License

This project follows the repository license. Check the top-level `LICENSE` file.
