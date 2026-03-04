
# Perspective Playground

>A lightweight browser demo for interactively exploring CSS 3D transforms and the `perspective()` effect.

**Overview**
- Adjust `perspective`, `rotateX`, `rotateY`, and `rotateZ` to see how 3D transforms affect an element.
- Control the `transform-origin` via simple radio buttons and watch the preview update in real time.

**Features**
- Live preview of a box using CSS `transform` and `perspective`.
- Simple sliders for angles and perspective distance.
- Clean, dependency-light implementation using Vue for reactivity (CDN included).

**Usage**
1. Open [projects/Perspective-Playground/index.html](projects/Perspective-Playground/index.html) in a browser.
2. Move the sliders to change `perspective` and rotations.
3. Select `transform-origin` options to change the pivot point.

**Development / Local testing**
- The demo includes Vue via CDN; no build step required.
- For local testing, serve the folder to avoid any browser file restrictions:

	- `npx http-server .`
	- `python -m http.server 8000`

**Notes**
- Best tried in modern browsers that fully support CSS transforms.

**License**
- See repository root for license details.
