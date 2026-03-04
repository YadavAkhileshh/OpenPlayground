
# Liquid Glass Animation

>A WebGL shader-based demo that renders a repeating liquid/glass cell pattern with interactive controls for amplitude, chromatic offset, speed, shape, image/video input, ripples and parallax.

## Live preview
Open [projects/Liquid-Glass-Animation/index.html](projects/Liquid-Glass-Animation/index.html) in a modern browser. For reliable media loading and to avoid CORS restrictions, serve the project over HTTP (see Usage).

## Features
- Real-time fragment shader rendering (WebGL) producing glassy refractive cells (hex, circle, box, triangle shapes)
- Image or video texture input (play/pause, loop, mute controls)
- UI controls: amplitude, chromatic aberration, animation speed, cell size, wireframe toggle, ripple trigger and parallax
- Click/double-click interactions: click to ripple, double-click to toggle wireframe
- Shape selector to switch cell geometry

## Controls
- Toolbar sliders and pills: adjust `Amplitude`, `Chromatic`, `Speed`, `Cell` size
- Shape switch: choose a cell shape (hex, circle, box, triangle)
- Media tabs: load an image or a video URL to use as the background texture
- Click canvas: creates a ripple; double-click toggles wireframe; mouse movement drives parallax and lighting

## Usage
1. Serve the repository and open the demo in your browser:

```bash
python -m http.server 8000
# then open http://localhost:8000/projects/Liquid-Glass-Animation/
```

2. Alternatively use the VS Code Live Server extension.

## Dependencies & Compatibility
- Requires a browser with WebGL support and ES module support.
- No build step; the demo runs directly in the browser.
- If using remote media (images/videos) ensure the host permits cross-origin requests.

## Customization
- Adjust shader uniforms (in `index.html`): `uCell`, `uAmp`, `uChrom`, `uSpeed`, `uShape` and other toggles.
- Swap the default media by changing `DEFAULT_VIDEO` or using the UI to load a custom image/video URL.
- Modify SDFs or add new shapes inside the fragment shader (`fragSrc`) to extend cell geometry.

## Troubleshooting
- Blank canvas / error: confirm WebGL is available (check browser console). If unavailable, try a different browser or update GPU drivers.
- Media not appearing: check the network console for CORS errors; serving over HTTP typically fixes this.
- Shader compile/link failures: open DevTools console to view GLSL compile/link messages.

## Credits
Built with a custom GLSL fragment shader and a minimal WebGL bootstrap. Media controls and UI are implemented in vanilla JS.

## License
See the repository `LICENSE` file for licensing details.

