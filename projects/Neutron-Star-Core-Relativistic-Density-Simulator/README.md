# Neutron Star Core – Relativistic Density Simulator

An advanced interactive simulator exploring the extreme physics inside neutron stars, featuring relativistic effects, multiple equations of state, and comprehensive visualizations.

## Features

- **3D Visualization**: Interactive Three.js model of a neutron star with density layers
- **Parameter Controls**: Adjust mass, central density, temperature, and equation of state
- **Real-time Calculations**: Compute radius, pressure, gravity, and binding energy
- **Density Profile Chart**: Visual representation of density distribution using Chart.js
- **Multiple EOS**: Polytropic, ultra-relativistic, and realistic equations of state
- **Advanced Controls**: Toggle advanced options for detailed parameter tuning
- **Data Export**: Export simulation results as JSON
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels and keyboard navigation support

## Physics Background

Neutron stars are the densest objects in the universe, with masses comparable to the Sun packed into spheres about 10-20 km in diameter. This simulator models:

- **Hydrostatic Equilibrium**: Balance between gravity and pressure
- **Tolman-Oppenheimer-Volkoff Equation**: General relativistic structure equation
- **Equations of State**: Different models for matter at extreme densities
- **Relativistic Effects**: Light bending, time dilation, and strong gravity

## How to Use

1. Open `index.html` in a modern web browser
2. Adjust parameters using the sliders and dropdowns
3. Click "Run Simulation" to calculate properties
4. Explore the 3D model with mouse controls
5. View the density profile in the chart
6. Use "Advanced Controls" for more options

## Controls

- **Mass**: Neutron star mass in solar masses (1.0 - 2.5 M☉)
- **Central Density**: Density at the core in g/cm³ (10¹⁴ - 10¹⁶ g/cm³)
- **Temperature**: Internal temperature in Kelvin (10⁷ - 10¹⁰ K)
- **Equation of State**: Matter model (Polytropic, Ultra-Relativistic, Realistic)

## Output Properties

- **Radius**: Stellar radius in kilometers
- **Max Density**: Maximum density in the star
- **Central Pressure**: Pressure at the center
- **Surface Gravity**: Gravitational acceleration at surface
- **Escape Velocity**: Speed needed to escape (fraction of c)
- **Binding Energy**: Gravitational binding energy

## Technical Details

- Built with Three.js for 3D rendering and Chart.js for data visualization
- Implements simplified stellar structure equations
- Uses numerical methods for density profile calculation
- Responsive CSS with mobile support
- Local storage for saving simulation state

## Educational Value

This simulator helps understand:
- Extreme states of matter
- General relativity in astrophysics
- Stellar evolution and supernovae
- Nuclear physics at high densities
- Observational astronomy techniques

## Limitations

- Simplified 1D stellar structure (spherical symmetry assumed)
- Approximated equations of state
- No magnetic field effects
- No rotation included
- Educational tool, not for research

## Future Enhancements

- Full TOV equation solver
- More realistic equations of state
- Rotation and magnetic field effects
- Pulsar emission modeling
- Multi-star systems
- Time evolution simulations

## References

- Shapiro, S. L., & Teukolsky, S. A. (1983). Black holes, white dwarfs, and neutron stars
- Lattimer, J. M., & Prakash, M. (2004). The physics of neutron stars
- Özel, F., & Freire, P. (2016). Masses, radii, and the equation of state of neutron stars

## License

Educational use only. Not for commercial or research purposes without permission.