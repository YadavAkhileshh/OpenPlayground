# 3D Model Particle Viewer

A web-based 3D model viewer that transforms 3D models into dynamic particle systems with ASCII character rendering. Built with Three.js, this application allows you to load FBX and OBJ files and visualize them as animated, interactive particle clouds.

## Features

- **Model Loading**: Support for FBX and OBJ file formats
- **Particle System**: Converts 3D geometry into thousands of animated particles
- **ASCII Rendering**: Optional ASCII character display for retro-style visualization
- **Interactive Controls**: Trackball controls for rotation, zoom, and pan
- **Real-time GUI**: Live parameter adjustment with lil-gui interface
- **URL Loading**: Load models directly from URLs
- **File Upload**: Drag-and-drop or click-to-upload functionality
- **Animation Effects**: Particle movement with customizable speed and patterns
- **Visual Customization**:
  - Background and particle colors
  - Particle size and density
  - Opacity and depth effects
  - Model scaling and rotation

## Technologies Used

- **Three.js**: 3D graphics library
- **WebGL**: Hardware-accelerated rendering
- **JavaScript ES6 Modules**: Modern JavaScript with import maps
- **lil-gui**: Lightweight GUI library for parameter controls
- **Custom Shaders**: GLSL vertex and fragment shaders for particle rendering

## How to Use

1. **Open the Application**: Open `index.html` in a modern web browser that supports WebGL and ES6 modules.

2. **Load a Model**:
   - **From File**: Click "Upload 3D File OBJ/FBX" in the GUI and select a local FBX or OBJ file.
   - **From URL**: Enter a URL to a FBX or OBJ file in the "Model URL" field and click "Load from URL".

3. **Customize Appearance**:
   - Use the GUI panels to adjust colors, sizes, density, and effects.
   - Toggle ASCII mode for character-based rendering.
   - Enable particle animation and adjust speed.

4. **Interact**:
   - Left-click and drag to rotate the view.
   - Right-click and drag to pan.
   - Scroll to zoom in/out.

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome 51+
- Firefox 45+
- Safari 10+
- Edge 79+

## File Format Support

- **FBX**: Autodesk FBX format (.fbx)
- **OBJ**: Wavefront OBJ format (.obj)

Note: Models are automatically scaled and centered for optimal viewing.

## Development

This project is part of the [OpenPlayground](https://github.com/YadavAkhileshh/OpenPlayground) repository. To contribute or modify:

1. Clone the repository
2. Navigate to `projects/3d-models-project/`
3. Open `index.html` in your browser for development
4. Edit `app.js` for core functionality, `style.css` for styling

## License

This project follows the same license as the main OpenPlayground repository.