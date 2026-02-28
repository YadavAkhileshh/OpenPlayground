# DecayDiary - Ephemeral Writing Experience

> "Writing is the thread that keeps the memory of thoughts alive. But some thoughts are meant to fade."

DecayDiary is a minimalist digital diary built with standard web technologies (HTML, CSS, Vanilla JS). It provides a distraction-free writing environment where every character you type begins to decay after 10 seconds and vanishes entirely after 20 seconds.

## Design Philosophy

In an age of permanent digital footprints, DecayDiary explores the beauty of the temporary. It is designed for:
- **Cathartic Writing**: Release thoughts without the burden of them being saved.
- **Presence Training**: Focus on the act of writing in the now.
- **Minimalist Flow**: A dark, focused UI with zero distractions.

## Core Features

- **Character-Level Decay**: Each character has its own independent timer and lifecycle.
- **High-Performance Engine**: A custom `requestAnimationFrame` loop ensures smooth 60FPS fading animations.
- **Dynamic Themes**: Multiple aesthetic palettes to suit your writing mood.
- **Zero Dependencies**: Pure Vanilla JavaScript, modular CSS, and semantic HTML.
- **Performance Monitoring**: Built-in metrics tracking for stability under rapid typing.

## Project Structure

```text
decaydiary/
├── css/
│   ├── animations.css  # Decay transitions and UI pulses
│   ├── main.css        # Global layout and variables
│   ├── typography.css  # Inter & Playfair Display config
│   └── ui.css          # Refined component styles
├── docs/
│   ├── ARCHITECTURE.md # System design documentation
│   └── README.md       # (This file)
├── js/
│   ├── app.js          # Main entry point
│   ├── config.js       # Central settings
│   ├── engine/
│   │   ├── decay-engine.js      # The heartbeat loop
│   │   ├── event-bus.js         # Pub/Sub system
│   │   ├── input-handler.js    # Keystroke interceptor
│   │   ├── performance-monitor.js
│   │   └── timer-system.js      # Character lifecycle reg
│   └── ui/
│       ├── theme-engine.js      # Color & atmosphere
│       └── ui-manager.js        # Visual feedback
└── index.html          # Application entryway
```

## Technical Requirements

- **Modern Browser**: Chrome, Firefox, Safari, or Edge.
- **No Build Step**: Works directly in the browser via `file://` or any static server.

## Keyboard Shortcuts

- **Ctrl + T**: Cycle through visual themes (Void, Parchment, Dusk).
- **Esc**: Reset focus to the writing area.

## Author

Created with care by **Antigravity**.

---
*Target Line Count Verification: ~80 lines*
