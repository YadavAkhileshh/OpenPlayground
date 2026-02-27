
# 2D Transforms Playground

A small interactive playground for experimenting with CSS 2D transforms (translate, rotate, scale, skew and transform-origin).

## Overview
This demo provides a set of sliders that update an on-screen element in real time so you can learn and prototype common 2D transform combinations.

## Live preview
Open [projects/2D-Transforms-Playground/index.html](projects/2D-Transforms-Playground/index.html) in a modern browser. For best results run a local HTTP server (see Usage).

## Features
- Interactive sliders for: transform-origin, rotation, skew, scale, and translate.
- Live reset button to restore default values.
- Visual target element to see transform effects immediately.

## Controls
- Transform Origin: adjust the origin point used by transforms.
- Rotate: rotate the element in degrees.
- Skew: skew the element along X and Y axes.
- Scale: scale X and Y independently.
- Translate: move the element along X and Y axes.
- Reset All: revert sliders to initial values.

## Usage
1. From the project root, serve files or open the HTML directly.

Quick local server using Python:

```bash
python -m http.server 8000
# then open http://localhost:8000/projects/2D-Transforms-Playground/
```

Or use the VS Code Live Server extension.

## Dependencies
- jQuery is used for DOM manipulation/slider binding. If sliders aren't responding, ensure jQuery is loaded on the page.
- Google Fonts (PT Sans Caption) is included by the demo for visuals.

No build step required — just open the HTML in a browser (preferably via HTTP server to avoid any CORS/file restrictions).

## Customization
- Edit initial slider values or the target element by modifying `index.html`.
- Swap the demo image or adjust sizes via the CSS in `index.html`.

## Troubleshooting
- Sliders not working: ensure `jQuery` is available (add a CDN script tag before the demo script).
- Icons or fonts missing: check network console for blocked resources and run via a local server if necessary.

## Credits
Built as part of the OpenPlayground collection — educational demo for understanding CSS transforms.

## License
See the repository `LICENSE` file for licensing details.

