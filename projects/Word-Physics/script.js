/**
 * Word-Physics Engine
 * Parses text semantics to determine physical properties (Mass, Gravity, Restitution).
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY_CONST = 0.5;
const FRICTION_AIR = 0.99;
const SPAWN_Y = 100;

// --- Dictionary / Semantic Map ---
// Keywords map to physical property overrides
const DICTIONARY = {
    // Light / Floating
    'helium': { gravity: -0.2, mass: 1, color: '#e74c3c', type: 'balloon' },
    'balloon': { gravity: -0.2, mass: 1, color: '#e74c3c', type: 'balloon' },
    'feather': { gravity: 0.05, mass: 0.5, friction: 0.95, color: '#ecf0f1' },
    'bird': { gravity: -0.1, mass: 2, color: '#3498db' },
    'cloud': { gravity: 0, mass: 5, friction: 0.9, color: '#fff' },

    // Heavy / Solid
    'rock': { mass: 50, restitution: 0.1, color: '#7f8c8d' },
    'stone': { mass: 50, restitution: 0.1, color: '#7f8c8d' },
    'lead': { mass: 100, restitution: 0, color: '#2c3e50' },
    'heavy': { mass: 80, restitution: 0.1, color: '#34495e' },
    'anvil': { mass: 150, restitution: 0, color: '#2d3436' },

    // Bouncy
    'rubber': { restitution: 0.95, color: '#e67e22' },
    'ball': { restitution: 0.9, color: '#f39c12' },
    'bouncy': { restitution: 1.1, color: '#d35400' }, // Super bounce
    'slime': { restitution: 0.2, friction: 0.9, color: '#2ecc71', type: 'sticky' },

    // Friction
    'ice': { friction: 0.999, color: '#74b9ff' },
    'slippery': { friction: 0.999, color: '#81ecec' },
    'sand': { friction: 0.8, mass: 10, color: '#f1c40f' },

    // Special
    'fire': { gravity: -0.3, color: '#e74c3c', glow: true },
    'box': { mass: 10, color: '#95a5a6' } // Default
};

// --- State ---
let width, height;
let objects = [];
let globalGravity = true;

// --- Physics Object ---

class WordBox {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        
        // Parse Properties
        const props = this.parseSemantics(text.toLowerCase());
        
        // Physical Props
        this.w = Math.max(60, ctx.measureText(text).width + 30);
        this.h = 40;
        this.vx = (Math.random() - 0.5) * 4; // Slight random init vel
        this.vy = 0;
        
        this.mass = props.mass || 10;
        this.invMass = 1 / this.mass;
        this.restitution = props.restitution !== undefined ? props.restitution : 0.5; // Bounciness
        this.friction = props.friction || 0.9; // Ground friction
        this.gravityScale = props.gravity !== undefined ? props.gravity : 1;
        
        // Visual Props
        this.color = props.color || '#333';
        this.textColor = this.isBright(this.color) ? '#000' : '#fff';
        this.glow = props.glow || false;
    }

    parseSemantics(word) {
        // Direct match
        if (DICTIONARY[word]) return DICTIONARY[word];
        
        // Partial match (simple heuristics)
        for (let key in DICTIONARY) {
            if (word.includes(key)) return DICTIONARY[key];
        }
        
        // Fallback: Check for keywords inside string
        // Default properties
        return { color: `hsl(${Math.random()*360}, 70%, 60%)` };
    }

    isBright(hex) {
        // Simple heuristic for text contrast
        return false; // Assume dark backgrounds mostly
    }

    update() {
        // Apply Gravity
        if (globalGravity) {
            this.vy += GRAVITY_CONST * this.gravityScale;
        }

        // Apply Air Resistance
        this.vx *= FRICTION_AIR;
        this.vy *= FRICTION_AIR;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Floor Collision
        if (this.y + this.h > height) {
            this.y = height - this.h;
            this.vy *= -this.restitution;
            this.vx *= this.friction; // Ground friction
            
            // Stop if slow
            if (Math.abs(this.vy) < GRAVITY_CONST) this.vy = 0;
        }
        
        // Ceiling Collision
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -this.restitution;
        }

        // Wall Collision
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -this.restitution;
        }
        if (this.x + this.w > width) {
            this.x = width - this.w;
            this.vx *= -this.restitution;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        
        if (this.glow) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
        }

        // Round Rect
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 16px "Roboto Mono"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.w/2, this.y + this.h/2);
    }
}

// --- Physics Engine (AABB Collision) ---

function resolveCollisions() {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const a = objects[i];
            const b = objects[j];

            if (rectIntersect(a, b)) {
                // Determine overlap
                const dx = (a.x + a.w/2) - (b.x + b.w/2);
                const dy = (a.y + a.h/2) - (b.y + b.h/2);
                const width = (a.w + b.w) / 2;
                const height = (a.h + b.h) / 2;
                const crossWidth = width * dy;
                const crossHeight = height * dx;

                let collisionSide = 'none';

                if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                    if (crossWidth > crossHeight) {
                        collisionSide = (crossWidth > -crossHeight) ? 'bottom' : 'left';
                    } else {
                        collisionSide = (crossWidth > -crossHeight) ? 'right' : 'top';
                    }
                }

                // Resolve Position (Separate them) & Velocity (Impulse)
                // Simplified Impulse response
                const vRelativeX = a.vx - b.vx;
                const vRelativeY = a.vy - b.vy;
                
                // If moving apart, skip
                // Normal direction
                let nx = 0, ny = 0;
                if (collisionSide === 'top') ny = -1;
                else if (collisionSide === 'bottom') ny = 1;
                else if (collisionSide === 'left') nx = -1;
                else if (collisionSide === 'right') nx = 1;

                // Push apart (Positional Correction)
                // Not implemented fully for AABB to keep code short, 
                // but basic impulse works:
                
                if (nx !== 0 || ny !== 0) {
                    // Swap momentum roughly based on mass
                    const totalMass = a.mass + b.mass;
                    const f1 = (2 * b.mass / totalMass);
                    const f2 = (2 * a.mass / totalMass);
                    
                    // Elastic collision approximation
                    if (nx !== 0) {
                        const temp = a.vx;
                        a.vx = b.vx * f1 + a.vx * (a.mass - b.mass)/totalMass;
                        b.vx = temp * f2 + b.vx * (b.mass - a.mass)/totalMass;
                        
                        // Prevent overlap stickiness
                        const overlapX = width - Math.abs(dx);
                        if(a.x < b.x) a.x -= overlapX/2; else a.x += overlapX/2;
                        if(b.x < a.x) b.x -= overlapX/2; else b.x += overlapX/2;
                    }
                    if (ny !== 0) {
                        const temp = a.vy;
                        a.vy = b.vy * f1 + a.vy * (a.mass - b.mass)/totalMass;
                        b.vy = temp * f2 + b.vy * (b.mass - a.mass)/totalMass;
                        
                        const overlapY = height - Math.abs(dy);
                        if(a.y < b.y) a.y -= overlapY/2; else a.y += overlapY/2;
                        if(b.y < a.y) b.y -= overlapY/2; else b.y += overlapY/2;
                    }
                }
            }
        }
    }
}

function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.w || 
             r2.x + r2.w < r1.x || 
             r2.y > r1.y + r1.h || 
             r2.y + r2.h < r1.y);
}

// --- Main Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Inputs
    const input = document.getElementById('word-input');
    const btn = document.getElementById('btn-spawn');
    
    const spawn = () => {
        const text = input.value.trim();
        if (text) {
            objects.push(new WordBox(text, width/2 - 50, SPAWN_Y));
            input.value = '';
        }
    };

    btn.addEventListener('click', spawn);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') spawn();
    });

    // Hints
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            input.value = tag.innerText;
            spawn();
        });
    });

    // Tools
    document.getElementById('btn-clear').addEventListener('click', () => objects = []);
    document.getElementById('btn-gravity').addEventListener('click', () => globalGravity = !globalGravity);

    // Initial Object
    objects.push(new WordBox("Word", width/2 - 100, 300));
    objects.push(new WordBox("Physics", width/2 + 20, 300));

    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loop() {
    ctx.clearRect(0, 0, width, height);
    
    // Physics Sub-steps
    for (let i = 0; i < objects.length; i++) objects[i].update();
    resolveCollisions();

    // Draw
    for (let obj of objects) obj.draw();

    requestAnimationFrame(loop);
}

// Start
init();