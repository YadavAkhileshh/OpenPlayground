
# Periodic Table Project

Interactive CSS/JS demo that renders the periodic table as a set of 3D-transformed cards with multiple layout modes (table, sphere, helix, grid). Click cards to expand details and use the layout buttons to switch views.

## Live preview
Open [projects/Periodic-Table-project/index.html](projects/Periodic-Table-project/index.html) in a modern browser. For consistent behavior and to avoid any file/CORS issues, serve the project folder over HTTP (see Usage).

## Features
- Table, Sphere, Helix and Grid layouts with animated transitions
- Pointer-driven scene parallax (move the mouse to tilt the scene)
- Click a card to expand and show additional properties (atomic mass, density, melting/boiling points)
- Keyboard `Escape` to collapse expanded cards
- Intro/randomized animation on load

## How it works
- Elements data is embedded in `index.html` (array of element fields).
- The demo uses a lightweight animation/layout helper (imported from a CDN) to compute transforms and animate the card properties.
- Layout transforms are applied via `transform: translate3d(...) rotateX(...) rotateY(...)` on each card.

## Usage
Serve the repository and open the demo in your browser:

```bash
python -m http.server 8000
# then open http://localhost:8000/projects/Periodic-Table-project/
```

Or use the VS Code Live Server extension.

## Controls
- Top buttons: switch layout mode (`table`, `sphere`, `helix`, `grid`)
- Mouse move: tilts/rotates scene for parallax effect
- Click a card: expand to show details
- `Escape`: collapse any expanded card

## Customization
- Update the element list in `index.html` to change or extend displayed elements.
- Tweak layout parameters (radius, gaps, spacing, animation easings) inside the `transformLayout` object in `index.html`.
- Adjust card styles via the CSS at the top of `index.html`.

## Dependencies
- `animejs` (imported from `https://esm.sh/animejs@4.3.0`) for layout and animation helpers.
- No build tools required — the demo runs as ES modules in the browser.

## Troubleshooting
- If animations or imports fail, check the browser console for network/CORS errors.
- If the page is blank, ensure the browser supports ES module `type="module"` and that the page is served via HTTP.

## Credits
Ported and inspired by the Three.js CSS3D periodic table demo and adapted for a pure DOM/CSS transform implementation with animation helpers.

## License
See the repository `LICENSE` file for licensing details.

