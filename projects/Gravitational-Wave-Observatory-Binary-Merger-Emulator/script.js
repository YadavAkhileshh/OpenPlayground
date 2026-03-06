// Gravitational Wave Observatory – Binary Merger Emulator Script

// Global variables
let scene, camera, renderer, controls;
let star1, star2, star1Light, star2Light;
let waveChart;
let animationId;
let isPlaying = false;
let time = 0;
let mergerDetected = false;

// Physics constants
const G = 6.67430e-11; // Gravitational constant
const c = 299792458; // Speed of light
const M_sun = 1.989e30; // Solar mass

// Simulation parameters
let mass1 = 10; // Solar masses
let mass2 = 10; // Solar masses
let separation = 50; // AU
let eccentricity = 0.0;
let speed = 1.0;

// Orbital elements
let semiMajorAxis;
let orbitalPeriod;
let totalMass;
let reducedMass;

// Wave data
let waveData = [];
let timeData = [];

// Initialize Three.js scene
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / 400, 0.1, 1000);
    camera.position.set(0, 50, 100);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Stars
    createStars();

    // Orbital path
    createOrbitalPath();

    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x00ffff, 0x004444);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);
}

// Create star objects
function createStars() {
    // Star 1
    const star1Geometry = new THREE.SphereGeometry(2, 32, 32);
    const star1Material = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0x442200 });
    star1 = new THREE.Mesh(star1Geometry, star1Material);
    star1.castShadow = true;
    scene.add(star1);

    star1Light = new THREE.PointLight(0xffaa00, 1, 100);
    star1Light.castShadow = true;
    star1Light.shadow.mapSize.width = 1024;
    star1Light.shadow.mapSize.height = 1024;
    scene.add(star1Light);

    // Star 2
    const star2Geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const star2Material = new THREE.MeshPhongMaterial({ color: 0x00aaff, emissive: 0x002244 });
    star2 = new THREE.Mesh(star2Geometry, star2Material);
    star2.castShadow = true;
    scene.add(star2);

    star2Light = new THREE.PointLight(0x00aaff, 0.8, 100);
    star2Light.castShadow = true;
    star2Light.shadow.mapSize.width = 1024;
    star2Light.shadow.mapSize.height = 1024;
    scene.add(star2Light);
}

// Create orbital path visualization
function createOrbitalPath() {
    const pathGeometry = new THREE.RingGeometry(separation - 0.5, separation + 0.5, 64);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const orbitalPath = new THREE.Mesh(pathGeometry, pathMaterial);
    orbitalPath.rotation.x = -Math.PI / 2;
    scene.add(orbitalPath);
}

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById('wave-chart').getContext('2d');
    waveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Gravitational Wave Strain (h)',
                data: waveData,
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (seconds)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Strain Amplitude',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            animation: {
                duration: 0
            }
        }
    });
}

// Update physics parameters
function updatePhysics() {
    totalMass = (mass1 + mass2) * M_sun;
    reducedMass = (mass1 * mass2) / (mass1 + mass2) * M_sun;
    semiMajorAxis = separation * 1.496e11; // Convert AU to meters
    orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * totalMass));
}

// Calculate orbital positions
function calculatePositions(t) {
    const meanAnomaly = 2 * Math.PI * t / orbitalPeriod;
    const eccentricAnomaly = solveKepler(meanAnomaly, eccentricity);
    const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(eccentricAnomaly / 2));

    const r = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
    const x = r * Math.cos(trueAnomaly);
    const y = r * Math.sin(trueAnomaly);

    return { x: x / 1.496e11, y: y / 1.496e11 }; // Convert back to AU for display
}

// Solve Kepler's equation numerically
function solveKepler(M, e) {
    let E = M;
    for (let i = 0; i < 10; i++) {
        E = M + e * Math.sin(E);
    }
    return E;
}

// Calculate gravitational wave strain
function calculateWaveStrain(positions, t) {
    // Simplified quadrupole formula
    const quadrupoleMoment = reducedMass * Math.pow(positions.x * 1.496e11, 2);
    const strain = (4 * G * quadrupoleMoment) / (c^4 * Math.pow(1e9, 2)); // Distance of 1 Gpc
    return strain * 1e21; // Scale for visibility
}

// Update star positions
function updatePositions() {
    const positions = calculatePositions(time);

    star1.position.set(positions.x, 0, positions.y);
    star1Light.position.copy(star1.position);

    star2.position.set(-positions.x, 0, -positions.y);
    star2Light.position.copy(star2.position);

    // Check for merger
    const distance = Math.sqrt(positions.x * positions.x + positions.y * positions.y);
    if (distance < 5 && !mergerDetected) {
        mergerDetected = true;
        document.getElementById('detection-info').innerHTML = '<strong>Merger Detected!</strong><br>Gravitational waves intensifying...';
        document.getElementById('detection-info').classList.add('merger-detected');
    }
}

// Update wave chart
function updateWaveChart() {
    const positions = calculatePositions(time);
    const strain = calculateWaveStrain(positions, time);

    timeData.push(time);
    waveData.push(strain);

    // Keep only last 1000 points
    if (timeData.length > 1000) {
        timeData.shift();
        waveData.shift();
    }

    waveChart.update();
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    if (isPlaying) {
        time += speed * 0.01;
        updatePositions();
        updateWaveChart();
    }

    controls.update();
    renderer.render(scene, camera);
}

// Control functions
function play() {
    isPlaying = true;
    document.getElementById('play-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
}

function pause() {
    isPlaying = false;
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

function reset() {
    isPlaying = false;
    time = 0;
    mergerDetected = false;
    waveData = [];
    timeData = [];
    waveChart.update();
    document.getElementById('detection-info').innerHTML = 'No merger detected yet.';
    document.getElementById('detection-info').classList.remove('merger-detected');
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

// Event listeners
document.getElementById('mass1').addEventListener('input', function() {
    mass1 = parseFloat(this.value);
    updatePhysics();
    document.getElementById('mass1-value').textContent = mass1.toFixed(1);
});

document.getElementById('mass2').addEventListener('input', function() {
    mass2 = parseFloat(this.value);
    updatePhysics();
    document.getElementById('mass2-value').textContent = mass2.toFixed(1);
});

document.getElementById('separation').addEventListener('input', function() {
    separation = parseFloat(this.value);
    updatePhysics();
    document.getElementById('separation-value').textContent = separation.toFixed(1);
});

document.getElementById('eccentricity').addEventListener('input', function() {
    eccentricity = parseFloat(this.value);
    updatePhysics();
    document.getElementById('eccentricity-value').textContent = eccentricity.toFixed(2);
});

document.getElementById('speed').addEventListener('input', function() {
    speed = parseFloat(this.value);
    document.getElementById('speed-value').textContent = speed.toFixed(1);
});

document.getElementById('play-btn').addEventListener('click', play);
document.getElementById('pause-btn').addEventListener('click', pause);
document.getElementById('reset-btn').addEventListener('click', reset);

// Window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / 2 / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, 400);
});

// Initialize everything
function init() {
    initThreeJS();
    initChart();
    updatePhysics();
    animate();
}

// Start the application
init();