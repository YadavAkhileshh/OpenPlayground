
# Card Animation Demo

>A scroll-driven card stack animation using modern CSS features such as `animation-timeline`, `scroll-timeline`, and new container/sequence helpers where available.

Overview
- The demo (`index.html`) shows a stack of colored cards animated by the page scroll. It demonstrates:
	- `animation-timeline` / `scroll-timeline` to tie animations to scrolling,
	- use of `sibling-count()` / `sibling-index()` for per-item calculations,
	- CSS-only reveal and transform effects with fallbacks.

Files
- `index.html` — the demo page and all styles; open in a modern browser to view the behavior.

Usage
- Serve the project locally and open the demo in a browser:

```bash
python -m http.server 8000

# then open:
http://localhost:8000/projects/card-animation/index.html
```

Browser support
- `animation-timeline` / `scroll-timeline` and `sibling-*()` functions are experimental and only supported in newer browser builds (Chromium & Firefox have varying levels of support). The demo includes a visible fallback message when the timeline API isn't available.

Notes & tips
- If the animation doesn't run, check the console for related warnings and try a Chromium-based browser with experimental features enabled.
- You can change the number of cards by editing the `<article>` elements inside the `.cards` container or adjust `--total-cards`/`--card-angle` CSS variables in `index.html`.
- The demo is intentionally CSS-first; minimal JS is used only for progressive enhancement.

Contributing
- Improvements and compatibility fixes are welcome. Follow the repository `CONTRIBUTING.md` for PR guidelines.

License
- See the repository `LICENSE` file for license details.
