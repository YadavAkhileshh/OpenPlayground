# BiasSim - Cognitive Bias Experiment Engine

BiasSim is a psychological experiment engine running entirely in the client-side browser. it demonstrates how e-commerce interfaces can subtly manipulate user choices using established cognitive biases.

## Features

### 1. Dynamic Bias Injection
The engine randomly selects one of three bias scenarios per session:
- **The Decoy Effect**: Introduces an inferior "decoy" option to make a target product look more attractive.
- **Scarcity Bias**: Uses artificial low-stock warnings ("Only 2 left!") to induce FOMO.
- **Social Proof**: Simulates real-time popularity ("128 people viewing this") to trigger herd behavior.

### 2. Behavioral Tracking
Unlike standard analytics, BiasSim tracks **psychological indicators**:
- **Hesitation Index**: calculated from the linearity of mouse movements.
- **Attention Capture**: Measures millisecond-level hover interactions using `requestAnimationFrame`.
- **Decision Latency**: Tracks the exact time to conversion.

### 3. Influence Analytics
Post-selection, the engine calculates an **Influence Score (0-100%)** revealing how strongly the user was manipulated based on their behavioral patterns.

## Architecture

The project follows a component-based architecture without frameworks:

```
/
├── js/
│   ├── engine/       # Logic Core
│   │   ├── bias/     # Strategy Pattern for biases
│   │   ├── tracking/ # Mouse & Event logging
│   │   └── analytics/# Scoring algorithms
│   ├── ui/           # Rendering & Visualization
│   └── data/         # Static catalogs
└── css/              # Modular CSS system
```

## Setup

No build step required. Simply open `index.html` in a modern browser.
(Note: ES Modules require serving via HTTP, e.g., `npx serve` or VS Code Live Server).

## License
MIT
