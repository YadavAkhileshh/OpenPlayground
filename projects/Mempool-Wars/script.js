/**
 * Mempool-Wars Engine
 * Simulates a Blockchain Mempool using Priority Queues and Canvas Animation.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const BLOCK_TIME = 10000; // 10 seconds
const BLOCK_CAPACITY = 8; // Max cars per bus
let width, height;

// --- State ---
let transactions = []; // The Mempool
let blocks = []; // Mined blocks driving away
let lastTime = 0;
let timer = 0;
let blocksMined = 0;
let chaosMode = false;
let chaosInterval;

// --- Assets/shapes ---
// We draw cars procedurally to avoid image dependencies

// --- Classes ---

class Transaction {
    constructor(fee) {
        this.id = Math.random().toString(36).substr(2, 5);
        this.fee = fee; // Gas Price
        this.size = 20 + Math.random() * 10;
        
        // Spawn Position (Left side, random scatter)
        this.x = -50;
        this.y = height - 100 - (Math.random() * 200);
        
        // Target Position (Parking lot)
        this.targetX = 50 + (Math.random() * 300);
        this.targetY = height - 100 - (Math.random() * (height/2));
        
        this.state = 'waiting'; // waiting, mining, mined
        this.speed = 2 + Math.random() * 2;
    }

    update(dt) {
        if (this.state === 'waiting') {
            // Move to parking spot
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > 5) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        }
    }

    draw() {
        if (this.state === 'mined') return; // Handled by Block drawing

        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Color based on Fee
        if (this.fee < 11) ctx.fillStyle = '#f7768e'; // Red
        else if (this.fee < 31) ctx.fillStyle = '#e0af68'; // Yellow
        else ctx.fillStyle = '#9ece6a'; // Green

        // Car Body
        ctx.fillRect(0, 0, 40, 20);
        // Roof
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(10, 5, 20, 10);
        
        // Fee Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(this.fee, 12, 14);
        
        ctx.restore();
    }
}

class Block {
    constructor(txs) {
        this.txs = txs; // Array of Transactions inside
        this.x = width + 200; // Start off-screen right (arrival)
        this.y = height / 2 - 50;
        this.targetX = width / 2; // Stop in middle
        this.state = 'arriving'; // arriving, loading, departing
        this.timer = 0;
    }

    update(dt) {
        if (this.state === 'arriving') {
            // Move left towards center
            if (this.x > width / 2 - 100) {
                this.x -= 10;
            } else {
                this.state = 'loading';
                this.timer = 0;
                this.mineTransactions();
            }
        } else if (this.state === 'loading') {
            // Wait for visual effect
            this.timer += dt;
            if (this.timer > 1000) {
                this.state = 'departing';
                // Mark txs as removed
                this.txs.forEach(tx => tx.state = 'mined');
            }
        } else if (this.state === 'departing') {
            this.x -= 10; // Drive away left
        }
    }

    mineTransactions() {
        // Logic handled by main loop, this is just visual trigger
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Bus Body
        ctx.fillStyle = '#7aa2f7'; // Blue
        ctx.fillRect(0, 0, 200, 80);
        
        // Wheels
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(40, 80, 15, 0, Math.PI*2);
        ctx.arc(160, 80, 15, 0, Math.PI*2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`BLOCK #${blocksMined + 1}`, 50, 45);

        // Draw Passengers (Transactions) inside
        if (this.state !== 'arriving') {
            this.txs.forEach((tx, i) => {
                const px = 10 + (i % 4) * 45;
                const py = 10 + Math.floor(i / 4) * 30;
                
                // Mini Car
                ctx.fillStyle = tx.fee < 11 ? '#f7768e' : tx.fee < 31 ? '#e0af68' : '#9ece6a';
                ctx.fillRect(px, py + 50, 30, 15);
            });
        }

        ctx.restore();
    }
}

// --- Init & Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // UI Events
    document.getElementById('btn-chaos').addEventListener('click', toggleChaos);
    
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

// --- Logic ---

function spawnTx(type) {
    let fee;
    if (type === 'low') fee = Math.floor(Math.random() * 10) + 1;
    else if (type === 'med') fee = Math.floor(Math.random() * 20) + 11;
    else fee = Math.floor(Math.random() * 70) + 31;
    
    // Randomly rarely add a WHALE
    if (Math.random() < 0.05) fee += 100;

    const tx = new Transaction(fee);
    transactions.push(tx);
    updateStats();
}

function mineBlock() {
    // 1. Sort Mempool by Fee (Priority Queue)
    // Descending order
    transactions.sort((a, b) => b.fee - a.fee);
    
    // 2. Pick top N
    const toMine = transactions.slice(0, BLOCK_CAPACITY);
    const remaining = transactions.slice(BLOCK_CAPACITY);
    
    if (toMine.length > 0) {
        // Create Block visual
        const block = new Block(toMine);
        blocks.push(block);
        
        // Remove from mempool array immediately (logic), visuals handle themselves
        transactions = remaining;
        
        blocksMined++;
        updateStats();
    }
}

function updateStats() {
    document.getElementById('stat-pending').innerText = transactions.length;
    document.getElementById('stat-blocks').innerText = blocksMined;
    
    const totalFee = transactions.reduce((acc, t) => acc + t.fee, 0);
    const avg = transactions.length ? (totalFee / transactions.length).toFixed(0) : 0;
    document.getElementById('stat-avg-gas').innerText = avg + " Gwei";
}

function toggleChaos() {
    chaosMode = !chaosMode;
    const btn = document.getElementById('btn-chaos');
    
    if (chaosMode) {
        btn.innerText = "STOP CHAOS";
        btn.style.background = "#f7768e";
        chaosInterval = setInterval(() => {
            // Spawn random stuff rapidly
            const r = Math.random();
            if (r < 0.6) spawnTx('low');
            else if (r < 0.9) spawnTx('med');
            else spawnTx('high');
        }, 200);
    } else {
        btn.innerText = "CHAOS MODE (Auto)";
        btn.style.background = "#bb9af7";
        clearInterval(chaosInterval);
    }
}

// --- Animation Loop ---

function animate(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Update Timer
    timer += dt;
    const progress = Math.min((timer / BLOCK_TIME) * 100, 100);
    document.getElementById('timer-bar').style.width = `${progress}%`;

    if (timer >= BLOCK_TIME) {
        mineBlock();
        timer = 0;
    }

    // Update & Draw Mempool
    transactions.forEach(tx => {
        tx.update(dt);
        tx.draw();
    });

    // Update & Draw Blocks
    blocks.forEach((b, i) => {
        b.update(dt);
        b.draw();
        // Remove departed blocks
        if (b.x < -300) {
            blocks.splice(i, 1);
        }
    });

    requestAnimationFrame(animate);
}

// Start
init();