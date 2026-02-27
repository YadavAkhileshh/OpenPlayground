# Paint — Interactive Splash Brush

A small, browser-based painting demo that creates organic brush strokes, splashes, and ink drops. It uses an HTML5 `<canvas>` and a customizable `Brush` implementation with support for mouse and touch input and a `dat.GUI` controls panel.

## Demo

- Open `projects/paint/index.html` in a modern browser.
- Drag the mouse (or touch and drag) to paint on the canvas.

## Controls

- Mouse / Touch: drag to paint; release to stop.
- Random Color: toggles automatic random color when starting a stroke.
- Random Size: toggles random brush size when starting a stroke.
- Clear: clears the canvas and resets brush drops.

The live UI is provided by `dat.GUI` (included via CDN).

## Features

- Multi-hair brush tips for organic strokes.
- Splashes generated when moving the brush quickly.
- Drips/drops that animate and fade naturally.
- Works with mouse and touch events.

## Files

- `index.html` — the demo page and JavaScript implementation.

## Implementation notes

- The core `Brush` class manages a tip composed of many `Hair` segments and `Drop` objects for dripping effects.
- Canvas auto-resizes to the window; resizing clears the canvas to avoid stretching artifacts.

## Credits

Inspired by creative-coding brush experiments; uses `dat.GUI` for controls.

## License

This project follows the repository license. Check the top-level `LICENSE` file.
