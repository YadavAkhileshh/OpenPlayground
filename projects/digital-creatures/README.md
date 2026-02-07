# Entropic Life VIII - Evolutionary Ecosystem

An interactive canvas-based evolutionary simulation where digital creatures compete for resources, reproduce, and evolve through natural selection. Watch as species adapt and develop emergent behaviors in real-time.

![Ecosystem Simulation](https://img.shields.io/badge/status-active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🌟 Features

### Core Mechanics
- **🧬 Evolution & Genetics**: Creatures inherit traits from parents with random mutations
- **⚡ Energy System**: Movement and life consume energy; starvation leads to death
- **🍃 Food Ecosystem**: Nutrient particles spawn and drift; creatures must eat to survive
- **🔄 Reproduction**: High-energy creatures divide through mitosis, passing mutated genes
- **💀 Natural Selection**: Unfit organisms die; adapted ones thrive and reproduce

### Physics Simulation
- **Soft-body dynamics** with spring-like bonds between nearby creatures
- **Phase synchronization** creating wave-like movement patterns
- **Velocity alignment** for schooling/flocking behaviors
- **Repulsion zones** preventing overlap
- **Adjustable viscosity** and gravity wells

### Interactive Controls
- **Paint-to-Spawn**: Click and drag to seed creatures into the ecosystem
- **Species Selection**: Choose from 4 distinct species with unique traits
- **Real-time Parameters**: Adjust food rate, metabolism, mutation rate, and physics
- **Live Statistics**: Monitor population, food count, average energy, and generation

## 🎮 How to Use

### Getting Started
1. Open `index.html` in a modern web browser
2. The simulation starts with a small colony of Swimmers
3. Observe the ecosystem or interact to seed new life

### Controls

#### Spawning Creatures
1. Select a species from the **Seeder** panel (Builder, Swimmer, Darter, or Mimic)
2. Click and drag on the canvas to paint creatures into existence
3. Adjust **Brush Size** slider to control spawn area

#### Ecosystem Parameters
- **Food Rate** (0-20): Controls how frequently nutrient particles spawn
- **Metabolism** (0.1-2.0): Energy consumption rate multiplier
- **Mutation Rate** (0-0.5): Genetic variation in offspring
- **Viscosity** (0.01-0.3): Movement resistance/drag

#### Actions
- **Extinct**: Mass extinction event (kills all creatures)
- **Reset**: Restart with fresh colony and food supply
- **Pause**: Freeze/resume simulation
- **≡ Toggle**: Collapse/expand control panel

## 🦠 Species Guide

### 🔵 Builder
- **Mass**: Heavy (3.0)
- **Muscle**: Low (0.05)
- **Behavior**: Forms stable, rigid structures
- **Best For**: Static colonies and defensive formations

### 🟢 Swimmer (Default)
- **Mass**: Medium (1.0)
- **Muscle**: Moderate (0.45)
- **Lag**: High (0.6) - Creates wave-like swimming
- **Behavior**: Coordinated schooling with fluid movement
- **Best For**: Balanced survival and adaptability

### 🔴 Darter
- **Mass**: Light (0.5)
- **Muscle**: High (0.8)
- **Behavior**: Fast, erratic movements with loose bonds
- **Best For**: Quick food gathering and exploration

### ⚪ Mimic
- **Mass**: Medium (1.0)
- **Behavior**: Generalist with moderate traits
- **Best For**: Experimental evolution and adaptation

## 📊 Statistics

The **Ecosystem Monitor** displays real-time metrics:

- **Population**: Current number of living creatures
- **Food Count**: Available nutrient particles
- **Avg Energy**: Mean energy level across all creatures
- **Generation**: Highest generation number achieved (evolution depth)

## 🔬 Technical Details

### Genetic Traits
Each creature carries a genome with mutable properties:
- `mass`: Physical weight (affects inertia and energy burn)
- `muscle`: Contraction strength (movement power)
- `lag`: Phase offset for wave patterns
- `bondDist`: Interaction range with neighbors
- `stiffness`: Spring constant for bonds
- `align`: Velocity alignment factor (schooling)
- `repulsion`: Personal space preference

### Energy Mechanics
```
Energy Cost = (0.5 + mass × 0.1 + speed × muscle × 2) × metabolism
```
- Movement drains energy continuously
- Heavier/faster creatures burn more
- Food consumption restores 400 energy
- Reproduction requires 1500 energy (costs 800)
- Death occurs at 0 energy

### Optimization
- **Spatial hashing** (80px grid) for efficient collision detection
- **Line buffering** for bond rendering
- **Adaptive food spawning** to maintain ecosystem balance
- **Touch-optimized** for mobile devices

## 🎯 Gameplay Tips

1. **Start Small**: Let initial population stabilize before adding more
2. **Balance Food**: Too little causes starvation; too much causes overpopulation
3. **Mix Species**: Different species create interesting dynamics
4. **Watch Evolution**: Increase mutation rate to see faster adaptation
5. **Create Niches**: Use painters to seed isolated colonies
6. **Experiment**: Try extreme parameter values to discover emergent behaviors

## 🐛 Known Behaviors

- **Population Booms**: Abundant food can cause explosive growth
- **Mass Die-offs**: Food scarcity leads to extinction cascades
- **Species Dominance**: One species may out-compete others
- **Trait Drift**: Colors remain constant, but physical traits evolve
- **Colony Formation**: Builders often form stable mega-structures

## 🛠️ Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (touch-enabled)

**Requirements**: HTML5 Canvas support, ES6+ JavaScript

## 📝 Credits

**Concept**: Artificial life simulation inspired by evolutionary algorithms and particle physics

**Technologies**: Pure HTML5 Canvas, Vanilla JavaScript (no dependencies)

## 📄 License

Open-source project. Feel free to modify, learn from, and build upon this simulation.

---

**Tip**: For best experience, use a large screen and let the simulation run for several minutes to observe multi-generational evolution!
