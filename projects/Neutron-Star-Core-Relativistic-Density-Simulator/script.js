// Neutron Star Core – Relativistic Density Simulator

// Global variables
let scene, camera, renderer, controls, neutronStar;
let densityChart;
let simulationData = {
    mass: 1.4, // Solar masses
    centralDensity: 1e15, // g/cm³
    radius: 10, // km
    temperature: 1e8, // K
    eos: 'polytrope'
};

// Constants
const G = 6.67430e-11; // Gravitational constant
const c = 299792458; // Speed of light
const M_sun = 1.989e30; // Solar mass in kg
const km_to_m = 1000;

// Initialize Three.js scene
function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    camera = new THREE.PerspectiveCamera(75, document.getElementById('three-container').clientWidth / document.getElementById('three-container').clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(document.getElementById('three-container').clientWidth, document.getElementById('three-container').clientHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    createNeutronStar();
    animate();
}

// Create neutron star 3D model
function createNeutronStar() {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: 0x4444ff,
        emissive: 0x001122,
        transparent: true,
        opacity: 0.8
    });
    neutronStar = new THREE.Mesh(geometry, material);
    scene.add(neutronStar);

    // Add density layers
    for (let i = 0; i < 5; i++) {
        const layerGeometry = new THREE.SphereGeometry(5 - i * 0.5, 32, 32);
        const layerMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.6 - i * 0.1, 1, 0.5),
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const layer = new THREE.Mesh(layerGeometry, layerMaterial);
        neutronStar.add(layer);
    }
}

// Update neutron star appearance based on parameters
function updateNeutronStar() {
    const scale = simulationData.radius / 10; // Normalize to 10km base
    neutronStar.scale.setScalar(scale);

    // Update colors based on density
    neutronStar.material.color.setHSL(0.6, 1, Math.min(0.8, simulationData.centralDensity / 1e16));
    neutronStar.material.emissive.setHSL(0.6, 0.5, Math.min(0.3, simulationData.centralDensity / 1e16 * 0.3));
}

// Initialize Chart.js for density profile
function initChart() {
    const ctx = document.getElementById('density-canvas').getContext('2d');
    densityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Density (g/cm³)',
                data: [],
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Radius (km)',
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Density (g/cm³)',
                        color: '#e0e0e0'
                    },
                    type: 'logarithmic',
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Calculate neutron star properties
function calculateProperties() {
    const M = simulationData.mass * M_sun; // Mass in kg
    const R = simulationData.radius * km_to_m; // Radius in m

    // Simplified calculations (not fully relativistic)
    const rho_c = simulationData.centralDensity * 1000; // kg/m³
    const P_c = (3/8/Math.PI) * (G * M**2 / R**4) * (1 - 2*G*M/(c**2*R)) / (1 - G*M/(c**2*R)); // Central pressure approximation

    // Update display
    document.getElementById('radius').textContent = simulationData.radius.toFixed(2);
    document.getElementById('max-density').textContent = simulationData.centralDensity.toExponential(2);
    document.getElementById('central-pressure').textContent = (P_c / 1e30).toFixed(2) + 'e30';
    document.getElementById('surface-gravity').textContent = (G * M / R**2 / 1e12).toFixed(2) + 'e12';
    document.getElementById('escape-velocity').textContent = Math.sqrt(2 * G * M / R) / c;
    document.getElementById('binding-energy').textContent = (G * M**2 / R / 2 / 1e46).toFixed(2) + 'e46';
}

// Generate density profile
function generateDensityProfile() {
    const r_max = simulationData.radius;
    const dr = r_max / 100;
    const radii = [];
    const densities = [];

    for (let r = 0; r <= r_max; r += dr) {
        let rho;
        if (simulationData.eos === 'polytrope') {
            // Simple polytropic model
            const n = 1; // Polytropic index
            const K = 1e-2; // Constant
            rho = simulationData.centralDensity * Math.pow(1 - Math.pow(r/r_max, 2), 1/n);
        } else if (simulationData.eos === 'ultra-relativistic') {
            // Ultra-relativistic degenerate gas
            rho = simulationData.centralDensity * Math.pow(1 - Math.pow(r/r_max, 4), 1/4);
        } else {
            // Realistic approximation
            rho = simulationData.centralDensity * Math.exp(- Math.pow(r/r_max, 2));
        }

        if (rho > 1e10) { // Only show significant densities
            radii.push(r.toFixed(2));
            densities.push(rho);
        }
    }

    densityChart.data.labels = radii;
    densityChart.data.datasets[0].data = densities;
    densityChart.update();
}

// Run simulation
function runSimulation() {
    // Show loading
    document.getElementById('status').classList.add('show');
    document.getElementById('status').innerHTML = '<p>Running simulation...</p><div id="progress-bar"><div id="progress-fill"></div></div>';

    // Simulate calculation time
    setTimeout(() => {
        // Update radius based on mass (simplified relation)
        simulationData.radius = 10 * Math.pow(simulationData.mass / 1.4, -1/3);

        calculateProperties();
        updateNeutronStar();
        generateDensityProfile();

        // Hide loading
        document.getElementById('status').classList.remove('show');
    }, 1000);
}

// Event listeners
document.getElementById('mass-slider').addEventListener('input', (e) => {
    simulationData.mass = parseFloat(e.target.value);
    document.getElementById('mass-value').textContent = simulationData.mass;
});

document.getElementById('central-density-slider').addEventListener('input', (e) => {
    simulationData.centralDensity = parseFloat(e.target.value);
    document.getElementById('central-density-value').textContent = simulationData.centralDensity.toExponential(0);
});

document.getElementById('temperature-slider').addEventListener('input', (e) => {
    simulationData.temperature = parseFloat(e.target.value);
    document.getElementById('temperature-value').textContent = simulationData.temperature.toExponential(0);
});

document.getElementById('equation-of-state').addEventListener('change', (e) => {
    simulationData.eos = e.target.value;
});

document.getElementById('simulate-btn').addEventListener('click', runSimulation);

document.getElementById('reset-btn').addEventListener('click', () => {
    simulationData.mass = 1.4;
    simulationData.centralDensity = 1e15;
    simulationData.temperature = 1e8;
    simulationData.eos = 'polytrope';

    document.getElementById('mass-slider').value = 1.4;
    document.getElementById('mass-value').textContent = '1.4';
    document.getElementById('central-density-slider').value = 1e15;
    document.getElementById('central-density-value').textContent = '1e15';
    document.getElementById('temperature-slider').value = 1e8;
    document.getElementById('temperature-value').textContent = '1e8';
    document.getElementById('equation-of-state').value = 'polytrope';

    runSimulation();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    neutronStar.rotation.y += 0.005;
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = document.getElementById('three-container').clientWidth / document.getElementById('three-container').clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.getElementById('three-container').clientWidth, document.getElementById('three-container').clientHeight);
});

// Initialize everything
initThreeJS();
initChart();
runSimulation();

// Advanced controls toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Advanced Controls';
    toggleBtn.className = 'toggle-advanced';
    document.getElementById('controls').appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('show-advanced');
        toggleBtn.textContent = document.body.classList.contains('show-advanced') ? 'Hide Advanced' : 'Advanced Controls';
    });

    // Add export functionality
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Data';
    exportBtn.addEventListener('click', () => {
        const data = {
            parameters: simulationData,
            properties: {
                radius: document.getElementById('radius').textContent,
                maxDensity: document.getElementById('max-density').textContent,
                centralPressure: document.getElementById('central-pressure').textContent,
                surfaceGravity: document.getElementById('surface-gravity').textContent,
                escapeVelocity: document.getElementById('escape-velocity').textContent,
                bindingEnergy: document.getElementById('binding-energy').textContent
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neutron-star-data.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    document.querySelector('.export-controls')?.appendChild(exportBtn);
});

// Theme toggle (placeholder for future)
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        document.getElementById('reset-btn').click();
    }
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('simulate-btn').click();
    }
});

// Tooltips
document.querySelectorAll('.tooltip').forEach(el => {
    el.addEventListener('mouseover', (e) => {
        // Could add dynamic tooltip content here
    });
});

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();

function monitorPerformance() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = currentTime;
    }
    requestAnimationFrame(monitorPerformance);
}

// monitorPerformance(); // Uncomment to enable performance monitoring

// Error handling
window.addEventListener('error', (e) => {
    console.error('Simulation error:', e.error);
    alert('An error occurred in the simulation. Please check the console for details.');
});

// Service worker for offline functionality (placeholder)
if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('/sw.js');
}

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels
    document.getElementById('mass-slider').setAttribute('aria-label', 'Mass in solar masses');
    document.getElementById('central-density-slider').setAttribute('aria-label', 'Central density in grams per cubic centimeter');
    document.getElementById('temperature-slider').setAttribute('aria-label', 'Temperature in Kelvin');

    // Focus management
    document.getElementById('simulate-btn').focus();
});

// Data validation
function validateInput(value, min, max, type = 'number') {
    if (type === 'number') {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }
    return true;
}

// Enhanced calculation functions
function calculateTOV() {
    // Placeholder for full TOV equation solver
    // This would require numerical integration
    console.log('TOV calculation would go here');
}

function calculateBindingEnergy() {
    // More accurate binding energy calculation
    const M = simulationData.mass * M_sun;
    const R = simulationData.radius * km_to_m;
    return G * M**2 / R / 2;
}

// Unit conversions
function kgToSolarMass(kg) { return kg / M_sun; }
function solarMassToKg(sm) { return sm * M_sun; }
function mToKm(m) { return m / km_to_m; }
function kmToM(km) { return km * km_to_m; }

// Constants object for better organization
const PHYSICAL_CONSTANTS = {
    G: 6.67430e-11,
    c: 299792458,
    hbar: 1.0545718e-34,
    k_B: 1.380649e-23,
    m_n: 1.67492749804e-27, // Neutron mass
    M_sun: 1.989e30,
    km_to_m: 1000
};

// Equation of state implementations
const EOS = {
    polytrope: (rho, K, n) => K * Math.pow(rho, 1 + 1/n),
    ultraRelativistic: (rho) => (3/4) * Math.PI * Math.pow(hbar * c / (3 * Math.pow(Math.PI, 2/3) * Math.pow(rho / m_n, 1/3)), 4/3) * rho,
    realistic: (rho, T) => {
        // Placeholder for more realistic EOS
        return EOS.polytrope(rho, 1e-2, 1) + PHYSICAL_CONSTANTS.k_B * T * rho / (m_n * c**2);
    }
};

// Future enhancement: Add more EOS options
// EOS.sludge = ...
// EOS.hyperonic = ...

// Visualization enhancements
function addParticleEffects() {
    // Could add particle systems for ejected material or accretion disk
}

function addRelativisticEffects() {
    // Visual effects for light bending, time dilation, etc.
}

// Data export in multiple formats
function exportToCSV() {
    // Export density profile as CSV
}

function exportToPNG() {
    // Screenshot the 3D view
}

// Multi-language support (placeholder)
const translations = {
    en: {
        mass: 'Mass',
        density: 'Density',
        // ...
    },
    es: {
        mass: 'Masa',
        density: 'Densidad',
        // ...
    }
};

// Real-time updates
let updateInterval;
function startRealTimeUpdates() {
    updateInterval = setInterval(() => {
        // Periodic updates if needed
    }, 1000);
}

function stopRealTimeUpdates() {
    clearInterval(updateInterval);
}

// Save/load simulation state
function saveState() {
    localStorage.setItem('neutronStarSim', JSON.stringify(simulationData));
}

function loadState() {
    const saved = localStorage.getItem('neutronStarSim');
    if (saved) {
        simulationData = JSON.parse(saved);
        // Update UI to match loaded state
    }
}

// Auto-save
setInterval(saveState, 30000); // Save every 30 seconds

// Load on startup
loadState();

// Help system
function showHelp() {
    alert('Use the sliders to adjust neutron star parameters. Click "Run Simulation" to calculate properties. The 3D view shows the star, and the chart displays the density profile.');
}

// Add help button
document.addEventListener('DOMContentLoaded', () => {
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '?';
    helpBtn.title = 'Help';
    helpBtn.addEventListener('click', showHelp);
    document.getElementById('header').appendChild(helpBtn);
});

// Version info
const VERSION = '1.0.0';
console.log(`Neutron Star Simulator v${VERSION}`);

// Performance optimizations
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Memory management
function disposeScene() {
    // Clean up Three.js objects when needed
}

// Final initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Neutron Star Simulator initialized');
});