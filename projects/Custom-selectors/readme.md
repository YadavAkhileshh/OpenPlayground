
# Custom Selectors Demo

>A small demo showing modern/custom select styling using the experimental `appearance: base-select` and `::picker`/`::picker-icon` features.

Overview
- Demonstrates advanced select UI patterns (picker positioning, option grids, corner shapes, diameter/stacked options, and visual previews).
- Uses CSS layers and feature-detection via `@supports (appearance: base-select)` with a graceful fallback message when unsupported.

Files
- `index.html` — complete demo and styles; open in a browser to interact with controls.

Browser support
- `appearance: base-select` and `::picker` are experimental and not widely supported. The demo includes a CSS fallback that shows a message when the feature is missing.

Usage
- Serve the project (recommended) and open the demo:

```bash
python -m http.server 8000

# then open:
http://localhost:8000/projects/Custom-selectors/index.html
```

Notes
- You can copy the `select` styles from `index.html` into your project; the demo groups styles into CSS layers for clarity.
- The demo sets CSS custom properties to control visual variables (border, radius, spacing, etc.) and updates a preview element via a small script.

Contributing
- Improvements, accessibility tweaks, and compatibility fixes are welcome — follow the repository contribution guidelines.

License
- See the repository `LICENSE` for license information.
