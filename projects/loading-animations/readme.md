
# Loading Animations

A small demo collection of CSS + minimal JS loading animations used for UI placeholders and micro-interactions.

Overview
- A gallery of 24 loading patterns (spinners, pulses, bars, skeletons, SVG dash animations, orbit, comet, etc.).
- Each demo is interactive: global controls allow changing `size`, `speed`, and the `accent` color, plus pause and theme toggles.

Files
- `index.html` — demo gallery and controls (open in a browser to view).
- All styles are embedded in the demo for easy copying; no build step required.

Usage
- Open the demo in your browser:

```bash
# from the project root (recommended) — serves the demo on http://localhost:8000
python -m http.server 8000

# then open:
http://localhost:8000/projects/Loading-Animations/index.html
```

Tips
- Use the size/slider to scale animations globally, the speed control to speed them up/slow them down, and the color picker to change the accent color.
- Click the Pause button to freeze all animations (useful for screenshots or accessibility testing).

License
- See the repository `LICENSE` file for license details.

Credits
- Patterns inspired by common CSS loading libraries and small SVG/JS tweaks for smoother dash/path animations.
