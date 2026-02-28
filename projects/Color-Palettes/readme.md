
# Color Palettes — Liquid Emotion

>A visual demo that generates mood-based color palettes and renders a fluid, liquid-like background using an HTML5 canvas.

Overview
- Interactive palette generator with five mood presets (Joy, Serenity, Energy, Melancholy, Mystery).
- Uses a particle-based canvas rendering to produce merging, glowing blobs; UI shows swatches and allows copying hex values.

Files
- `index.html` — demo page containing styles, palette data, canvas simulation, and UI controls.

Usage
- Serve locally and open the demo in a browser:

```bash
python -m http.server 8000

# then open:
http://localhost:8000/projects/color-palettes/index.html
```

Notes
- The core visual is rendered to an HTML5 `<canvas>` for performance; CSS provides the overlay UI and glassmorphism styling.
- Particle colors and background update when selecting moods; swatches support copy-to-clipboard on click.
- For best performance, use a modern desktop browser. Reduce `PARTICLE_COUNT` in the script if performance is an issue on low-end devices.

Contributing
- Suggestions, palette additions, and performance improvements are welcome — follow repository contribution guidelines.

License
- See the repository `LICENSE` for license details.
