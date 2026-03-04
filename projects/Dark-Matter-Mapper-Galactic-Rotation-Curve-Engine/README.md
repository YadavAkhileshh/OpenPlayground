# Dark Matter Mapper – Galactic Rotation Curve Engine

An interactive visualization tool for exploring galactic rotation curves and the evidence for dark matter in galaxies.

## Features

- **3D Galaxy Simulation**: Animated view of orbiting stars around a galactic center
- **Interactive Rotation Curve Chart**: Real-time plotting using Chart.js showing:
  - Newtonian prediction (without dark matter)
  - Curve with dark matter halo
  - Simulated observed data points
- **Adjustable Parameters**:
  - Central galaxy mass
  - Dark matter fraction
  - Animation speed
- **Play/Pause Controls**: Control the galaxy rotation animation
- **Responsive Design**: Works on different screen sizes

## How to Run

Open `index.html` in a modern web browser with JavaScript enabled.

## Scientific Background

Galactic rotation curves plot the orbital speed of stars and gas as a function of their distance from the galactic center. According to Newtonian gravity, the rotation speed should decrease with distance from the center. However, observations show that rotation curves remain flat or even increase at large distances, suggesting the presence of unseen dark matter.

This simulator demonstrates:
- How rotation curves behave under Newtonian gravity
- The effect of adding a dark matter halo
- Comparison with simulated observational data

## Controls

- **Galaxy Mass Slider**: Adjust the central mass of the galaxy (affects all curves)
- **Dark Matter Fraction**: Control the amount of dark matter in the halo
- **Animation Speed**: Speed up or slow down the galaxy rotation
- **Play/Pause**: Start or stop the animation
- **Reset**: Return all parameters to default values

## Technical Details

- Built with HTML5 Canvas for galaxy visualization
- Chart.js for interactive rotation curve plotting
- Real-time physics calculations based on gravitational dynamics
- Simplified dark matter halo model (isothermal sphere approximation)

## Educational Value

This tool helps visualize one of the key pieces of evidence for dark matter in astrophysics. By adjusting parameters and observing how the rotation curves change, users can gain intuition about how dark matter affects galactic dynamics.

## References

- Rubin, V. C., & Ford, W. K. (1970). Rotation of the Andromeda Nebula from a Spectroscopic Survey of Emission Regions.
- Bosma, A. (1978). The distribution and kinematics of neutral hydrogen in spiral galaxies of various morphological types.