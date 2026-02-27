// Molecular Structure Explorer - Advanced JavaScript

// Canvas Setup
const canvas = document.getElementById('moleculeCanvas');
const ctx = canvas.getContext('2d');
const bgCanvas = document.getElementById('particleBackground');
const bgCtx = bgCanvas.getContext('2d');

// State Management
let currentMolecule = null;
let animationId = null;
let rotationAngle = 0;
let isRotating = true;
let showElectrons = true;
let time = 0;

// Resize Canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Molecular Data Structures
const molecules = {
    water: {
        name: 'Water',
        formula: 'H₂O',
        description: 'The most essential molecule for life. Two hydrogen atoms bonded to one oxygen atom.',
        atoms: [
            { x: 0, y: 0, element: 'O', color: '#ff4444', radius: 30 },
            { x: -50, y: 40, element: 'H', color: '#ffffff', radius: 20 },
            { x: 50, y: 40, element: 'H', color: '#ffffff', radius: 20 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 }
        ],
        electrons: 10
    },
    methane: {
        name: 'Methane',
        formula: 'CH₄',
        description: 'A simple hydrocarbon and major component of natural gas. One carbon atom bonded to four hydrogen atoms.',
        atoms: [
            { x: 0, y: 0, element: 'C', color: '#444444', radius: 28 },
            { x: -60, y: -60, element: 'H', color: '#ffffff', radius: 18 },
            { x: 60, y: -60, element: 'H', color: '#ffffff', radius: 18 },
            { x: -60, y: 60, element: 'H', color: '#ffffff', radius: 18 },
            { x: 60, y: 60, element: 'H', color: '#ffffff', radius: 18 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 }
        ],
        electrons: 10
    },
    ammonia: {
        name: 'Ammonia',
        formula: 'NH₃',
        description: 'A compound crucial for fertilizers and cleaning products. One nitrogen atom bonded to three hydrogen atoms.',
        atoms: [
            { x: 0, y: 0, element: 'N', color: '#4444ff', radius: 28 },
            { x: -55, y: 35, element: 'H', color: '#ffffff', radius: 18 },
            { x: 55, y: 35, element: 'H', color: '#ffffff', radius: 18 },
            { x: 0, y: -60, element: 'H', color: '#ffffff', radius: 18 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 }
        ],
        electrons: 10
    },
    benzene: {
        name: 'Benzene',
        formula: 'C₆H₆',
        description: 'An aromatic hydrocarbon with a distinctive hexagonal ring structure. Foundation of many organic compounds.',
        atoms: [
            { x: 0, y: -70, element: 'C', color: '#444444', radius: 25 },
            { x: 60, y: -35, element: 'C', color: '#444444', radius: 25 },
            { x: 60, y: 35, element: 'C', color: '#444444', radius: 25 },
            { x: 0, y: 70, element: 'C', color: '#444444', radius: 25 },
            { x: -60, y: 35, element: 'C', color: '#444444', radius: 25 },
            { x: -60, y: -35, element: 'C', color: '#444444', radius: 25 },
            { x: 0, y: -100, element: 'H', color: '#ffffff', radius: 16 },
            { x: 85, y: -50, element: 'H', color: '#ffffff', radius: 16 },
            { x: 85, y: 50, element: 'H', color: '#ffffff', radius: 16 },
            { x: 0, y: 100, element: 'H', color: '#ffffff', radius: 16 },
            { x: -85, y: 50, element: 'H', color: '#ffffff', radius: 16 },
            { x: -85, y: -50, element: 'H', color: '#ffffff', radius: 16 }
        ],
        bonds: [
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ],
        electrons: 42
    },
    dna: {
        name: 'DNA Helix',
        formula: 'Double Helix',
        description: 'The iconic double helix structure that carries genetic information in all living organisms.',
        atoms: [
            // First strand
            { x: -40, y: -80, element: 'P', color: '#ff9933', radius: 20 },
            { x: -30, y: -40, element: 'S', color: '#ffcc00', radius: 18 },
            { x: -20, y: 0, element: 'P', color: '#ff9933', radius: 20 },
            { x: -10, y: 40, element: 'S', color: '#ffcc00', radius: 18 },
            { x: 0, y: 80, element: 'P', color: '#ff9933', radius: 20 },
            // Second strand
            { x: 40, y: -80, element: 'P', color: '#ff9933', radius: 20 },
            { x: 30, y: -40, element: 'S', color: '#ffcc00', radius: 18 },
            { x: 20, y: 0, element: 'P', color: '#ff9933', radius: 20 },
            { x: 10, y: 40, element: 'S', color: '#ffcc00', radius: 18 },
            { x: 0, y: 80, element: 'P', color: '#ff9933', radius: 20 },
            // Base pairs
            { x: -20, y: -60, element: 'A', color: '#00ff88', radius: 15 },
            { x: 20, y: -60, element: 'T', color: '#ff0088', radius: 15 },
            { x: -15, y: -20, element: 'G', color: '#0088ff', radius: 15 },
            { x: 15, y: -20, element: 'C', color: '#ffff00', radius: 15 },
            { x: -10, y: 20, element: 'T', color: '#ff0088', radius: 15 },
            { x: 10, y: 20, element: 'A', color: '#00ff88', radius: 15 },
            { x: -5, y: 60, element: 'C', color: '#ffff00', radius: 15 },
            { x: 5, y: 60, element: 'G', color: '#0088ff', radius: 15 }
        ],
        bonds: [
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
            { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
            { from: 10, to: 11 }, { from: 12, to: 13 }, { from: 14, to: 15 }, { from: 16, to: 17 }
        ],
        electrons: 0
    }
};

// Background Particles
class Particle {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > bgCanvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > bgCanvas.height) this.speedY *= -1;
    }

    draw() {
        bgCtx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Draw connections
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                bgCtx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 150)})`;
                bgCtx.lineWidth = 1;
                bgCtx.beginPath();
                bgCtx.moveTo(p1.x, p1.y);
                bgCtx.lineTo(p2.x, p2.y);
                bgCtx.stroke();
            }
        });
    });
    
    requestAnimationFrame(animateBackground);
}
animateBackground();

// Drawing Functions
function rotatePoint(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

function drawBond(atom1, atom2) {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
    
    ctx.beginPath();
    ctx.moveTo(atom1.x, atom1.y);
    ctx.lineTo(atom2.x, atom2.y);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

function drawAtom(atom) {
    // Outer glow
    const gradient = ctx.createRadialGradient(atom.x, atom.y, 0, atom.x, atom.y, atom.radius * 1.5);
    gradient.addColorStop(0, atom.color);
    gradient.addColorStop(0.7, atom.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, atom.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main atom
    ctx.fillStyle = atom.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = atom.color;
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner highlight
    const highlightGradient = ctx.createRadialGradient(
        atom.x - atom.radius * 0.3,
        atom.y - atom.radius * 0.3,
        0,
        atom.x,
        atom.y,
        atom.radius
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Element label
    ctx.fillStyle = 'white';
    ctx.font = `bold ${atom.radius * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(atom.element, atom.x, atom.y);
    ctx.shadowBlur = 0;
}

function drawElectron(centerX, centerY, radius, angle, size = 3) {
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#00aaff');
    gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawMolecule(molecule) {
    if (!molecule) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Transform and draw bonds
    const transformedAtoms = molecule.atoms.map(atom => {
        const rotated = isRotating ? rotatePoint(atom.x, atom.y, rotationAngle) : { x: atom.x, y: atom.y };
        return {
            ...atom,
            x: centerX + rotated.x,
            y: centerY + rotated.y
        };
    });
    
    molecule.bonds.forEach(bond => {
        drawBond(transformedAtoms[bond.from], transformedAtoms[bond.to]);
    });
    
    // Draw atoms
    transformedAtoms.forEach(atom => {
        drawAtom(atom);
    });
    
    // Draw electron orbits
    if (showElectrons && molecule.electrons > 0) {
        const numOrbits = Math.ceil(molecule.electrons / 4);
        
        for (let orbit = 0; orbit < numOrbits; orbit++) {
            const orbitRadius = 150 + orbit * 50;
            const electronsInOrbit = Math.min(4, molecule.electrons - orbit * 4);
            
            // Draw orbit path
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw electrons
            for (let i = 0; i < electronsInOrbit; i++) {
                const angle = (time * 0.02) + (orbit * 0.5) + (i * Math.PI * 2 / electronsInOrbit);
                drawElectron(centerX, centerY, orbitRadius, angle);
            }
        }
    }
    
    if (isRotating) {
        rotationAngle += 0.01;
    }
    time++;
}

function animate() {
    drawMolecule(currentMolecule);
    animationId = requestAnimationFrame(animate);
}

function loadMolecule(moleculeKey) {
    currentMolecule = molecules[moleculeKey];
    
    if (currentMolecule) {
        document.getElementById('moleculeName').textContent = currentMolecule.name;
        document.getElementById('moleculeFormula').textContent = currentMolecule.formula;
        document.getElementById('moleculeDescription').textContent = currentMolecule.description;
        document.getElementById('atomCount').textContent = currentMolecule.atoms.length;
        document.getElementById('bondCount').textContent = currentMolecule.bonds.length;
        document.getElementById('electronCount').textContent = currentMolecule.electrons;
    }
}

// Event Listeners
document.querySelectorAll('[data-molecule]').forEach(button => {
    button.addEventListener('click', (e) => {
        const moleculeKey = e.currentTarget.dataset.molecule;
        loadMolecule(moleculeKey);
    });
});

document.getElementById('toggleRotation').addEventListener('click', () => {
    isRotating = !isRotating;
    document.getElementById('rotationIcon').textContent = isRotating ? '⏸' : '▶';
});

document.getElementById('toggleElectrons').addEventListener('click', () => {
    showElectrons = !showElectrons;
});

document.getElementById('randomColor').addEventListener('click', () => {
    if (currentMolecule) {
        currentMolecule.atoms.forEach(atom => {
            atom.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        });
    }
});

// Start animation
animate();

// Load default molecule
loadMolecule('water');

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

console.log('🔬 Molecular Structure Explorer loaded successfully!');
console.log('💡 Click molecule buttons to explore different structures');
console.log('⚡ Use controls to interact with the visualization');
