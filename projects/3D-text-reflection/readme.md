
# 3D Text Reflection

Interactive Three.js demo that renders 3D text above a reflective water surface with realtime controls.

## Live preview
Open [projects/3D-text-reflection/index.html](projects/3D-text-reflection/index.html) in a modern browser. For best results serve the folder over HTTP (see Usage).

## Features
- Live-editable 3D text (content, size, weight, spacing)
- Realistic reflective water with adjustable ripple strength, flow speed and reflection opacity
- Directional + ambient lighting controls
- Orbit camera controls (rotate/zoom)
- Simple GUI (lil-gui) for all major scene parameters

## Usage
1. From the project root, serve files (recommended) or open the HTML directly.

Run a quick local server:

```bash
python -m http.server 8000
# then open http://localhost:8000/projects/3D-text-reflection/
```

Or use the VS Code Live Server extension.

## Controls
- Mouse drag: rotate camera
- Mouse wheel: zoom
- GUI (bottom-right): tweak Text, Water & Reflection, Lighting, and Background settings

## Customization
- Change default text and appearance by editing the `params` object in `index.html`.
- Fonts are loaded via the `fontFiles` map; add or swap font files there.
- Water parameters (distortionScale, speed, waterColor, sunColor, waterOpacity) are exposed in the GUI.

## Dependencies
- three.js (via importmap)
- three.js examples: OrbitControls, TextGeometry, Water, Font/TTF loaders
- opentype.js (imported via importmap)

No build step required — the page uses ES modules and CDN-hosted modules.

## Troubleshooting
- If fonts or textures fail to load due to CORS, run a local HTTP server as shown above.
- If the scene appears blank, open the browser console to inspect loading errors.

## Credits
Built with Three.js and example assets from the Three.js repository.

## License
See the project root `LICENSE` for repository licensing.

