# Neuromorphic UI Components

A modern, accessible, and performant neuromorphic-style UI component library built with minimal vanilla HTML/CSS/JS and Tailwind for utilities. This project demonstrates a wide set of reusable UI patterns and controllers designed for real-world apps: buttons, toggles, inputs, toasts, modals, tabs, accordions, file uploads, charts, and more — all with focus on accessibility, animations, and developer ergonomics.

## Highlights

- Neuromorphic visual system with light/dark themes and focus-visible styles
- Accessible keyboard and ARIA patterns: tablist, dialogs, menus, focus trapping
- Lightweight dependency set: Tailwind (for utilities), Iconify, and vanilla JS controllers
- Performance-minded: instanced DOM updates, debouncing, and reduced-motion support
- Rich demo pages showcasing components and interactive controllers

## Components Covered

- Buttons (primary, secondary, pill, icon)
- Toggles & checkboxes (accessible switches)
- Radio groups
- Inputs: text, search, range, file upload
- Selects & multi-selects
- Tabs & tab panels
- Accordions
- Tooltips and toasts (ARIA live-region based)
- Modals with focus trap
- Context menu sample
- Progress bars and loading states
- Star rating, date/time picker, tree view demo
- Data table & simple chart examples

## JavaScript Controllers

The project contains modular controllers (found inline in `index.html`):

- `ToastManager` — toast creation and lifecycle
- `ThemeController` — light/dark theme persistence
- `TabController` — keyboard-accessible tablist behavior
- `ModalController` — dialog open/close and focus trapping
- `FileUploadController` — drag & drop + validation
- `SearchDropdownController`, `MultiSelectController`, `TreeViewController`, and more

Each controller is written to be framework-agnostic and easy to extract into separate modules if needed.

## Accessibility

- Semantic markup with ARIA attributes for all interactive widgets
- `focus-visible` styles and explicit focus traps for modals
- `prefers-reduced-motion` support to disable non-essential animations
- Skip link included for keyboard users

## Usage

No build step required for the demo — open the demo in a browser:

```bash
# From project root
cd projects/Neuromorphic-UI
# Open in default browser (Windows)
start index.html
# macOS
open index.html
# Linux
xdg-open index.html
```

To reuse components in another project, copy the relevant HTML/CSS snippets and controllers from `index.html` and adapt the styles into your app. Controllers are intentionally small and isolated to facilitate extraction.

## Configuration

Key configuration values are in the top-level `CONFIG` object inside `index.html`:

- `DEBUG` — enable/disable debug logs
- `TOAST_DURATION` — default toast visibility time
- `DEBOUNCE_DELAY` — common debounce used by inputs
- `STORAGE_KEY` — localStorage key used for theme persistence
- `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE` — file upload restrictions

## Extending the Library

- Extract controllers into ES modules for use with bundlers (Rollup, Webpack, Vite)
- Convert controllers to framework wrappers (React/Vue/Svelte) as needed
- Replace Tailwind CDN with a local Tailwind build for production
- Add unit tests for controllers using a DOM test runner (Jest + jsdom / Playwright)

## Development Notes

- Keep `CONFIG.DEBUG` true while iterating; toggle to `false` for production
- The demo includes many examples — when extracting a component, remove demo-only code and preserve ARIA semantics

## Contributing

Contributions are welcome. Open an issue describing the enhancement or bug, and submit a PR with focused changes and a short description of why the change is needed.

## License

Choose and add a license (e.g., MIT) to this repository.

---

Made with accessibility-first design and a love for tactile, delightful UI.