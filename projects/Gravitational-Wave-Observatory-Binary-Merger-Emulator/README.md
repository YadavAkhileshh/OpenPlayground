# Gravitational Wave Observatory – Binary Merger Emulator

An interactive 3D simulation of binary star systems and the gravitational waves they produce during inspiral and merger, based on real astrophysical phenomena detected by LIGO and Virgo.

## 🌌 Overview

This simulation demonstrates the physics of binary black hole or neutron star mergers, showing:
- Orbital mechanics of two massive objects
- Energy loss through gravitational wave emission
- The "chirp" signal as orbits decay
- Merger detection and ringdown

## 🔬 Physics Background

### Gravitational Waves
Gravitational waves are ripples in spacetime caused by accelerating masses. Binary systems emit these waves continuously, losing orbital energy and causing their orbits to decay.

### Orbital Decay
The power radiated in gravitational waves is given by:
```
P = (32/5) * (G⁴/c⁵) * (μ² M³ / r⁵)
```

Where:
- G is the gravitational constant
- c is the speed of light
- μ is the reduced mass
- M is the total mass
- r is the orbital separation

### The Chirp Signal
As orbits decay, frequency increases (chirp), creating the characteristic waveform detected by observatories like LIGO.

## 🎮 How to Use

1. **Adjust Parameters:**
   - **Mass 1/Mass 2**: Stellar masses in solar masses
   - **Separation**: Initial orbital distance in AU
   - **Eccentricity**: Orbital shape (0 = circular, 1 = parabolic)
   - **Speed**: Simulation time multiplier

2. **Controls:**
   - **Play**: Start the simulation
   - **Pause**: Stop the animation
   - **Reset**: Return to initial state

3. **Visualization:**
   - **3D Scene**: Orbital motion with glowing stars
   - **Wave Chart**: Real-time gravitational wave strain
   - **Detection Panel**: Merger alerts and physics info

## 🧮 Technical Details

### Orbital Mechanics
- Uses Kepler's laws for elliptical orbits
- Numerical solution of Kepler's equation
- Relativistic corrections for high velocities

### Wave Calculation
- Quadrupole approximation for wave strain
- Simplified for educational purposes
- Scaled for visualization

### Technologies
- **Three.js**: 3D rendering and orbital visualization
- **Chart.js**: Real-time wave signal plotting
- **HTML5/CSS3**: Responsive UI with space theme

## 📚 Educational Value

This simulation helps understand:
- General relativity and spacetime curvature
- Multi-messenger astronomy
- Detection of gravitational waves
- Binary system evolution

## 🔍 Real-World Connection

Based on events like:
- GW150914: First detected black hole merger
- GW170817: Neutron star merger with gamma rays
- Ongoing LIGO/Virgo/KAGRA observations

## 🚀 Future Enhancements

- Add relativistic effects
- Include spin-orbit coupling
- Multiple waveform polarizations
- Sound generation from waves
- Compare with real LIGO data

## 📄 License

This project is part of the OpenPlayground educational collection. Feel free to use and modify for learning purposes.

---

*Simulate the universe's most violent events from your browser!*