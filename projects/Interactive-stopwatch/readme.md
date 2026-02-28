# Interactive Stopwatch

A sleek, browser-based stopwatch application with lap timing, start/pause/reset controls, and a modern glassmorphism UI. Tracks elapsed time with millisecond precision and maintains a history of lap times.

## Demo

- Open `projects/Interactive-stopwatch/index.html` in a modern browser.
- Click "Start" to begin timing, "Pause" to stop, "Reset" to clear, and "Lap" to record split times.

## Features

- **Precise Timing**: Displays minutes, seconds, and milliseconds using `performance.now()` for high accuracy.
- **Lap Tracking**: Record and display multiple lap times with animations.
- **Responsive Controls**: Start/Pause toggle, Lap, and Reset buttons with visual feedback.
- **Glassmorphism Design**: Modern UI with gradients, shadows, and rounded elements.
- **Accessibility**: Proper ARIA labels and live regions for screen readers.
- **Mobile-Friendly**: Responsive design that works on various screen sizes.

## Controls

- **Start/Pause**: Toggle button to start or pause the timer.
- **Lap**: Records the current elapsed time as a lap (only active when running).
- **Reset**: Clears the timer and lap history (only active when stopped and has time).

## Technologies

- **HTML**: Structure and semantic elements.
- **CSS**: Custom properties, gradients, shadows, and animations.
- **JavaScript**: Timer logic using `requestAnimationFrame` and `performance.now()`.

## Files

- `index.html` — Complete app with HTML, CSS, and JavaScript.

## Implementation Notes

- Uses `requestAnimationFrame` for smooth updates and `performance.now()` for precise timing.
- Lap times are stored in an array and rendered dynamically.
- Button states are managed to prevent invalid actions (e.g., lap when stopped).
- CSS uses custom properties for theming and glassmorphism effects.

## Browser Support

Works in all modern browsers with ES6 support.

## Credits

Inspired by stopwatch designs and glassmorphism trends.

## License

This project follows the repository license. Check the top-level `LICENSE` file.