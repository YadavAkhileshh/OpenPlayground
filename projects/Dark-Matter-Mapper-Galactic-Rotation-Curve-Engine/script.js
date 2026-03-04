// Dark Matter Mapper – Galactic Rotation Curve Engine

const galaxyCanvas = document.getElementById('galaxy-canvas');
const galaxyCtx = galaxyCanvas.getContext('2d');

const massSlider = document.getElementById('mass-slider');
const darkMatterSlider = document.getElementById('dark-matter-slider');
const animationSpeedSlider = document.getElementById('animation-speed');
const massValue = document.getElementById('mass-value');
const darkMatterValue = document.getElementById('dark-matter-value');
const speedValue = document.getElementById('speed-value');
const playPauseBtn = document.getElementById('play-pause');
const resetBtn = document.getElementById('reset-btn');

let centralMass = 1.0;
let darkMatterFraction = 0.5;
let animationSpeed = 1.0;
const G = 4.3e-6; // Gravitational constant in pc/M_sun/(km/s)^2
const numParticles = 100;
const maxRadius = 300;
const centerX = galaxyCanvas.width / 2;
const centerY = galaxyCanvas.height / 2;

let particles = [];
let animationId;
let isPlaying = false;

// Chart.js setup
const ctx = document.getElementById('curve-chart').getContext('2d');
const rotationChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Newtonian (No Dark Matter)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
        }, {
            label: 'With Dark Matter',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1
        }, {
            label: 'Observed Data',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            showLine: false,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Galactic Rotation Curve',
                color: '#00ffff',
                font: {
                    size: 16
                }
            },
            legend: {
                labels: {
                    color: '#ffffff'
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Distance from Center (kpc)',
                    color: '#ffffff'
                },
                ticks: {
                    color: '#ffffff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Rotation Velocity (km/s)',
                    color: '#ffffff'
                },
                ticks: {
                    color: '#ffffff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: {
            point: {
                backgroundColor: '#00ffff'
            }
        }
    }
});

function initParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        const r = (i + 1) * maxRadius / numParticles;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        const v = calculateVelocity(r);
        particles.push({
            x: x,
            y: y,
            r: r,
            angle: angle,
            v: v
        });
    }
}

function calculateVelocity(r) {
    // Convert r from pixels to kpc (assuming 1 pixel = 0.1 kpc)
    const rKpc = r * 0.1;

    // Newtonian velocity: v = sqrt(G * M / r)
    const newtonianV = Math.sqrt(G * centralMass / rKpc);

    // With dark matter: assume isothermal halo
    // v = sqrt(G * M(r) / r), where M(r) = M_bulge + M_halo
    // For simplicity, assume dark matter dominates at large r
    const haloMass = darkMatterFraction * centralMass * (rKpc / 10); // Simplified
    const totalMass = centralMass + haloMass;
    const darkMatterV = Math.sqrt(G * totalMass / rKpc);

    return darkMatterV;
}

function updateParticles() {
    particles.forEach(particle => {
        particle.angle += particle.v * 0.002 * animationSpeed; // Time step
        particle.x = centerX + particle.r * Math.cos(particle.angle);
        particle.y = centerY + particle.r * Math.sin(particle.angle);
    });
}

function drawGalaxy() {
    galaxyCtx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);

    // Draw central bulge
    const gradient = galaxyCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
    gradient.addColorStop(0, 'yellow');
    gradient.addColorStop(1, 'orange');
    galaxyCtx.fillStyle = gradient;
    galaxyCtx.beginPath();
    galaxyCtx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    galaxyCtx.fill();

    // Draw particles
    galaxyCtx.fillStyle = 'white';
    particles.forEach(particle => {
        galaxyCtx.beginPath();
        galaxyCtx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        galaxyCtx.fill();
    });

    // Draw spiral arms (simplified)
    galaxyCtx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    galaxyCtx.lineWidth = 2;
    for (let arm = 0; arm < 2; arm++) {
        galaxyCtx.beginPath();
        for (let r = 20; r < maxRadius; r += 5) {
            const angle = arm * Math.PI + r * 0.02;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            if (r === 20) {
                galaxyCtx.moveTo(x, y);
            } else {
                galaxyCtx.lineTo(x, y);
            }
        }
        galaxyCtx.stroke();
    }
}

function updateChart() {
    const labels = [];
    const newtonianData = [];
    const darkMatterData = [];
    const observedData = [];

    for (let r = 1; r <= 20; r++) { // r in kpc
        labels.push(r);
        const pixelR = r / 0.1; // Convert back to pixels for calculation
        const newtonianV = Math.sqrt(G * centralMass / r);
        const haloMass = darkMatterFraction * centralMass * (r / 10);
        const totalMass = centralMass + haloMass;
        const darkMatterV = Math.sqrt(G * totalMass / r);

        newtonianData.push(newtonianV);
        darkMatterData.push(darkMatterV);

        // Simulated observed data with some noise
        const observedV = darkMatterV + (Math.random() - 0.5) * 10;
        observedData.push(Math.max(0, observedV));
    }

    rotationChart.data.labels = labels;
    rotationChart.data.datasets[0].data = newtonianData;
    rotationChart.data.datasets[1].data = darkMatterData;
    rotationChart.data.datasets[2].data = observedData;
    rotationChart.update();
}

function animate() {
    if (isPlaying) {
        updateParticles();
        drawGalaxy();
    }
    animationId = requestAnimationFrame(animate);
}

// Event listeners
massSlider.addEventListener('input', (e) => {
    centralMass = parseFloat(e.target.value);
    massValue.textContent = centralMass.toFixed(1);
    initParticles();
    updateChart();
});

darkMatterSlider.addEventListener('input', (e) => {
    darkMatterFraction = parseFloat(e.target.value);
    darkMatterValue.textContent = darkMatterFraction.toFixed(1);
    initParticles();
    updateChart();
});

animationSpeedSlider.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = animationSpeed.toFixed(1);
});

playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    playPauseBtn.className = isPlaying ? 'pause' : 'play';
});

resetBtn.addEventListener('click', () => {
    centralMass = 1.0;
    darkMatterFraction = 0.5;
    animationSpeed = 1.0;
    massSlider.value = centralMass;
    darkMatterSlider.value = darkMatterFraction;
    animationSpeedSlider.value = animationSpeed;
    massValue.textContent = centralMass.toFixed(1);
    darkMatterValue.textContent = darkMatterFraction.toFixed(1);
    speedValue.textContent = animationSpeed.toFixed(1);
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    playPauseBtn.className = 'play';
    initParticles();
    updateChart();
});

// Initialize
initParticles();
updateChart();
animate();

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust canvas size if needed
    const rect = galaxyCanvas.getBoundingClientRect();
    galaxyCanvas.width = rect.width;
    galaxyCanvas.height = rect.height;
    drawGalaxy();
});