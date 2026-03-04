# Cosmic Inflation Lab – Early Universe Expansion Simulator

An interactive simulation of the early universe's expansion, focusing on the cosmic inflation period.

## Features

- 3D particle simulation of universe expansion
- Interactive time controls with play/pause/reset
- Visualization of different expansion phases: Pre-Inflation, Inflation, Post-Inflation
- Dynamic color changes representing temperature cooling
- Real-time scale factor display

## How to Run

Open `index.html` in a modern web browser that supports WebGL.

## Controls

- **Time Slider**: Manually control the simulation time
- **Play/Pause**: Start or stop automatic simulation
- **Reset**: Return to the beginning of the simulation
- **Mouse**: Rotate and zoom the 3D view

## Scientific Background

Cosmic inflation is a theory proposing that the universe underwent a period of extremely rapid expansion shortly after the Big Bang. This simulator demonstrates:

1. **Pre-Inflation**: Slow initial expansion
2. **Inflation**: Exponential expansion phase
3. **Post-Inflation**: Return to decelerating expansion

The scale factor represents how much the universe has expanded, and particle colors indicate the cooling temperature over time.

## Technical Details

- Built with Three.js for 3D rendering
- Uses point cloud geometry for particle representation
- Implements simplified inflationary cosmology equations
- Interactive controls for educational exploration