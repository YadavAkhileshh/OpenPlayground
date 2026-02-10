/**
 * CHIP-8 Emulator Core
 * Implements CPU, Memory, Display, and Input handling.
 */

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const SCALE = 10; // Scale 64x32 up to 640x320

// --- Emulator Configuration ---
const CPU_SPEED = 10; // Instructions per cycle (approx 600Hz)

class Chip8 {
    constructor() {
        this.reset();
        
        // Font Set (Hex Sprites 0-F)
        this.fontSet = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
    }

    reset() {
        // Memory (4KB)
        this.memory = new Uint8Array(4096);
        
        // Registers (V0-VF)
        this.v = new Uint8Array(16);
        
        // Index Register (I) and Program Counter (PC)
        this.i = 0;
        this.pc = 0x200; // ROMs start at 0x200
        
        // Stack
        this.stack = [];
        
        // Display (64x32 monochrome)
        this.display = new Array(64 * 32).fill(0);
        
        // Timers
        this.delayTimer = 0;
        this.soundTimer = 0;
        
        // Keypad state (16 keys)
        this.keys = new Array(16).fill(false);
        this.waitingForKey = false; // For FX0A opcode
        
        this.paused = false;
        
        // Load fonts into memory (0x050 - 0x0A0)
        for (let i = 0; i < this.fontSet.length; i++) {
            this.memory[0x50 + i] = this.fontSet[i];
        }
        
        // Clear screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    loadRom(romData) {
        this.reset();
        for (let i = 0; i < romData.length; i++) {
            this.memory[0x200 + i] = romData[i];
        }
        console.log("ROM Loaded. Size:", romData.length);
        this.running = true;
    }

    cycle() {
        if (this.paused || !this.running) return;

        // Fetch-Decode-Execute multiple times per frame for speed
        for (let i = 0; i < CPU_SPEED; i++) {
            if (this.waitingForKey) break;

            // Fetch Opcode (2 bytes)
            // Combine byte at PC and PC+1
            const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
            this.execute(opcode);
        }

        // Update Timers (60Hz rate)
        if (this.delayTimer > 0) this.delayTimer--;
        if (this.soundTimer > 0) this.soundTimer--;

        this.draw();
    }

    execute(opcode) {
        // Advance PC
        this.pc += 2;

        // Decode Nibbles
        // Opcode format: DXYN
        const x = (opcode & 0x0F00) >> 8;
        const y = (opcode & 0x00F0) >> 4;
        const n = opcode & 0x000F; // lowest nibble
        const nn = opcode & 0x00FF; // lowest byte
        const nnn = opcode & 0x0FFF; // lowest 12 bits (address)

        // Opcode Logic
        switch (opcode & 0xF000) {
            case 0x0000:
                if (opcode === 0x00E0) { // CLS: Clear Screen
                    this.display.fill(0);
                } else if (opcode === 0x00EE) { // RET: Return from subroutine
                    this.pc = this.stack.pop();
                }
                break;
            case 0x1000: // JP addr: Jump to NNN
                this.pc = nnn;
                break;
            case 0x2000: // CALL addr
                this.stack.push(this.pc);
                this.pc = nnn;
                break;
            case 0x3000: // SE Vx, byte: Skip if Vx == NN
                if (this.v[x] === nn) this.pc += 2;
                break;
            case 0x4000: // SNE Vx, byte: Skip if Vx != NN
                if (this.v[x] !== nn) this.pc += 2;
                break;
            case 0x5000: // SE Vx, Vy
                if (this.v[x] === this.v[y]) this.pc += 2;
                break;
            case 0x6000: // LD Vx, byte: Set Vx = NN
                this.v[x] = nn;
                break;
            case 0x7000: // ADD Vx, byte: Vx += NN
                this.v[x] += nn; // Uint8 auto-wraps
                break;
            case 0x8000:
                switch (n) {
                    case 0x0: this.v[x] = this.v[y]; break;
                    case 0x1: this.v[x] |= this.v[y]; break;
                    case 0x2: this.v[x] &= this.v[y]; break;
                    case 0x3: this.v[x] ^= this.v[y]; break;
                    case 0x4: // Add with Carry
                        const sum = this.v[x] + this.v[y];
                        this.v[0xF] = sum > 0xFF ? 1 : 0;
                        this.v[x] = sum;
                        break;
                    case 0x5: // Sub
                        this.v[0xF] = this.v[x] > this.v[y] ? 1 : 0;
                        this.v[x] -= this.v[y];
                        break;
                    case 0x6: // Shift Right
                        this.v[0xF] = this.v[x] & 0x1;
                        this.v[x] >>= 1;
                        break;
                    case 0x7: // SubN
                        this.v[0xF] = this.v[y] > this.v[x] ? 1 : 0;
                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE: // Shift Left
                        this.v[0xF] = (this.v[x] & 0x80) >> 7;
                        this.v[x] <<= 1;
                        break;
                }
                break;
            case 0x9000: // SNE Vx, Vy
                if (this.v[x] !== this.v[y]) this.pc += 2;
                break;
            case 0xA000: // LD I, addr: I = NNN
                this.i = nnn;
                break;
            case 0xB000: // JP V0, addr
                this.pc = nnn + this.v[0];
                break;
            case 0xC000: // RND Vx, byte
                this.v[x] = Math.floor(Math.random() * 256) & nn;
                break;
            case 0xD000: // DRW Vx, Vy, nibble (DRAW SPRITE)
                const startX = this.v[x];
                const startY = this.v[y];
                const height = n;
                this.v[0xF] = 0; // Collision flag

                for (let row = 0; row < height; row++) {
                    const spriteByte = this.memory[this.i + row];
                    for (let col = 0; col < 8; col++) {
                        // Check if bit at col is set (0x80 is 10000000)
                        if ((spriteByte & (0x80 >> col)) !== 0) {
                            const pixelIndex = ((startX + col) % 64) + ((startY + row) % 32) * 64;
                            
                            // XOR logic: if pixel on screen is 1, set collision
                            if (this.display[pixelIndex] === 1) {
                                this.v[0xF] = 1;
                            }
                            this.display[pixelIndex] ^= 1;
                        }
                    }
                }
                break;
            case 0xE000:
                if (nn === 0x9E) { // SKP Vx (Skip if key pressed)
                    if (this.keys[this.v[x]]) this.pc += 2;
                } else if (nn === 0xA1) { // SKNP Vx (Skip if key not pressed)
                    if (!this.keys[this.v[x]]) this.pc += 2;
                }
                break;
            case 0xF000:
                switch (nn) {
                    case 0x07: this.v[x] = this.delayTimer; break;
                    case 0x0A: // Wait for key
                        this.waitingForKey = true;
                        this.keyCallback = (key) => {
                            this.v[x] = key;
                            this.waitingForKey = false;
                        };
                        break;
                    case 0x15: this.delayTimer = this.v[x]; break;
                    case 0x18: this.soundTimer = this.v[x]; break;
                    case 0x1E: this.i += this.v[x]; break;
                    case 0x29: this.i = 0x50 + (this.v[x] * 5); break; // Font char
                    case 0x33: // BCD
                        this.memory[this.i] = Math.floor(this.v[x] / 100);
                        this.memory[this.i + 1] = Math.floor((this.v[x] % 100) / 10);
                        this.memory[this.i + 2] = this.v[x] % 10;
                        break;
                    case 0x55: // Dump Regs
                        for (let r = 0; r <= x; r++) this.memory[this.i + r] = this.v[r];
                        break;
                    case 0x65: // Load Regs
                        for (let r = 0; r <= x; r++) this.v[r] = this.memory[this.i + r];
                        break;
                }
                break;
            default:
                console.warn(`Unknown opcode: ${opcode.toString(16)}`);
        }
    }

    draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#33ff33'; // Green phosphor
        
        for (let i = 0; i < this.display.length; i++) {
            if (this.display[i]) {
                const x = (i % 64) * SCALE;
                const y = Math.floor(i / 64) * SCALE;
                ctx.fillRect(x, y, SCALE - 1, SCALE - 1); // -1 for grid effect
            }
        }
    }
}

// --- Interaction ---

const emulator = new Chip8();
let loopInterval;

// Key Mapping (Modern -> Hex Keypad)
const keyMap = {
    '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
    'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
    'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
    'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
};

window.addEventListener('keydown', (e) => {
    const k = keyMap[e.key];
    if (k !== undefined) {
        emulator.keys[k] = true;
        if (emulator.waitingForKey) emulator.keyCallback(k);
        highlightKey(k, true);
    }
});

window.addEventListener('keyup', (e) => {
    const k = keyMap[e.key];
    if (k !== undefined) {
        emulator.keys[k] = false;
        highlightKey(k, false);
    }
});

function highlightKey(keyVal, pressed) {
    const hex = keyVal.toString(16).toUpperCase();
    const btn = document.querySelector(`.key[data-k="${hex}"]`);
    if (btn) {
        if (pressed) btn.classList.add('pressed');
        else btn.classList.remove('pressed');
    }
}

// File Loader
document.getElementById('rom-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById('rom-name').textContent = file.name;
    document.getElementById('led-status').classList.add('on');
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        const buffer = evt.target.result;
        const rom = new Uint8Array(buffer);
        emulator.loadRom(rom);
    };
    reader.readAsArrayBuffer(file);
});

// Controls
document.getElementById('btn-pause').onclick = () => {
    emulator.paused = !emulator.paused;
    const btn = document.getElementById('btn-pause');
    btn.innerHTML = emulator.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
};

document.getElementById('btn-reset').onclick = () => {
    emulator.reset(); // Need to reload ROM logic if fully reset, simplified here
    document.getElementById('led-status').classList.remove('on');
    // Ideally store last ROM data to reload
};

document.getElementById('btn-step').onclick = () => {
    emulator.paused = true;
    emulator.cycle();
};

// Main Loop
function loop() {
    emulator.cycle();
    requestAnimationFrame(loop);
}

loop();