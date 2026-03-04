# WebKit Demo (easemate/web-kit)

This folder contains a small demo that uses the `@easemate/web-kit` web component toolkit to showcase UI primitives such as `ease-logo-loader`, `ease-panel`, `ease-dropdown`, `ease-toggle`, and more.

The demo is a self-contained HTML file that initializes the library via the ESM CDN and demonstrates interactive controls for the logo loader, panels with state, tabs, inputs and sliders.

## Quick Start

1. Open the demo in a modern browser that supports ES modules (Chrome, Firefox, Safari, Edge):

```bash
# From repository root
cd projects/webkit
# Windows
start index.html
# macOS
open index.html
# Linux
xdg-open index.html
```

2. The demo loads `@easemate/web-kit` as an ES module from CDN and initializes it with `initWebKit(...)`.

## What this demo shows

- `ease-logo-loader` — a logo animation component with `playIntro()` and `loading` state
- `ease-panel` and `ease-state` — reusable panel / state primitives used to group controls
- Form controls: `ease-input`, `ease-number-input`, `ease-slider`, `ease-dropdown`
- Accessibility-friendly components implemented as web components

## Initialization

The demo calls:

```js
import { initWebKit } from 'https://cdn.jsdelivr.net/npm/@easemate/web-kit@0.3.3/+esm';

initWebKit({
  theme: 'default',
  styles: 'main',
  fonts: 'default',
  dev: { logLoads: true }
});
```

This bootstraps the library (styles, fonts, and dev options). If you see errors in the console about TypeScript-only syntax (for example `Unexpected identifier 'LogoLoader'`), open the file in a text editor and ensure there is no `type` import or `interface` declaration — the browser expects plain JavaScript in module scripts.

## Interacting with the demo

- Use the "Intro: Wave" and "Intro: Particle" buttons to trigger the corresponding logo animations.
- Use "Toggle Loading" to start/stop the loader's loading animation.
- Explore panels to try sliders, dropdowns, and number inputs.

## Notes & Troubleshooting

- The page uses `type="module"` for the script. Serve the file via `file://` or a local static server (some browsers restrict module imports over `file://` in certain setups).
- The demo imports from the `+esm` CDN path; ensure you have network access. If you prefer local dependencies, install `@easemate/web-kit` and adapt imports for your bundler.
- If you previously modified the file to remove TypeScript-only syntax, that's correct — the browser cannot parse `type` imports, `interface` declarations, or TypeScript casts. Keep the script as plain JS.

## Extending the demo

- Extract behaviors into separate modules if you plan to reuse components in multiple pages.
- Replace CDN imports with a bundler-friendly setup (Vite/Rollup) for production.
- Add unit/integration tests using Playwright or Puppeteer if you need automation coverage for UI behaviors.

---

For developer questions or to add new demo items, open a PR with a focused change and a short description of the new component or behavior.
