// Cosmic Inflation Lab – Early Universe Expansion Simulator

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 50);
controls.update();

// Create particles representing matter in the universe
const particleCount = 1000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    // Initial positions in a small volume
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

    // Colors: hot at start (white/yellow), cool later (blue)
    colors[i * 3] = 1; // R
    colors[i * 3 + 1] = 1; // G
    colors[i * 3 + 2] = 0.5; // B
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
const points = new THREE.Points(geometry, material);
scene.add(points);

// Simulation parameters
let time = 0;
const maxTime = 100;
let isPlaying = false;
let scaleFactor = 1.0;

// DOM elements
const timeSlider = document.getElementById('timeSlider');
const timeValue = document.getElementById('timeValue');
const playPauseBtn = document.getElementById('playPause');
const resetBtn = document.getElementById('reset');
const scaleFactorDisplay = document.getElementById('scaleFactor');
const phaseDisplay = document.getElementById('phase');

// Event listeners
timeSlider.addEventListener('input', (e) => {
    time = parseFloat(e.target.value);
    updateSimulation();
});

playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
});

resetBtn.addEventListener('click', () => {
    time = 0;
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    updateSimulation();
});

// Function to calculate scale factor based on time
function getScaleFactor(t) {
    if (t < 20) {
        // Pre-inflation: slow expansion
        return 1 + t * 0.1;
    } else if (t < 60) {
        // Inflation: exponential expansion
        const inflationTime = t - 20;
        return 3 * Math.exp(inflationTime * 0.1);
    } else {
        // Post-inflation: decelerating expansion
        const postTime = t - 60;
        return 3 * Math.exp(4) + postTime * 0.5;
    }
}

// Function to get phase name
function getPhase(t) {
    if (t < 20) return 'Pre-Inflation';
    else if (t < 60) return 'Inflation';
    else return 'Post-Inflation';
}

// Update simulation
function updateSimulation() {
    scaleFactor = getScaleFactor(time);
    const phase = getPhase(time);

    // Update particle positions
    const posArray = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        // Scale initial positions by scale factor
        const initialX = (i % 10 - 5) * 0.4;
        const initialY = (Math.floor(i / 10) % 10 - 5) * 0.4;
        const initialZ = (Math.floor(i / 100) - 5) * 0.4;

        posArray[i * 3] = initialX * scaleFactor;
        posArray[i * 3 + 1] = initialY * scaleFactor;
        posArray[i * 3 + 2] = initialZ * scaleFactor;
    }
    geometry.attributes.position.needsUpdate = true;

    // Update colors based on temperature (simulated cooling)
    const colorArray = geometry.attributes.color.array;
    const temp = Math.max(0, 1 - time / maxTime);
    for (let i = 0; i < particleCount; i++) {
        colorArray[i * 3] = temp; // R
        colorArray[i * 3 + 1] = temp * 0.8; // G
        colorArray[i * 3 + 2] = 1 - temp; // B
    }
    geometry.attributes.color.needsUpdate = true;

    // Update UI
    timeSlider.value = time;
    timeValue.textContent = time.toFixed(1);
    scaleFactorDisplay.textContent = scaleFactor.toFixed(2);
    phaseDisplay.textContent = phase;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && time < maxTime) {
        time += 0.5;
        updateSimulation();
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial update
updateSimulation();