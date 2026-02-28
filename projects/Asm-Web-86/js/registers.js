import { REGISTERS, REGISTER_NAMES } from './isa.js';
import { toHex16 } from './utils.js';

export class RegisterFile {
    constructor() {
        // DataView allows us to treat the ArrayBuffer as 16-bit integers
        this.buffer = new ArrayBuffer(REGISTERS.SP * 2 + 2); 
        this.view = new DataView(this.buffer);
        
        // Flags
        this.flags = {
            Z: false, // Zero
            S: false, // Sign
            C: false, // Carry
            O: false  // Overflow
        };

        this.reset();
    }

    reset() {
        // Zero out general purpose
        REGISTER_NAMES.forEach(reg => this.set(REGISTERS[reg], 0));
        // Reset specific pointers
        this.set(REGISTERS.SP, 0xFFFE); // Stack starts at end of RAM
        this.set(REGISTERS.IP, 0x0000); // Entry point
        
        this.flags = { Z: false, S: false, C: false, O: false };
        this.updateUI();
    }

    get(regIndex) {
        return this.view.getUint16(regIndex * 2, true); // True = Little Endian
    }

    set(regIndex, value) {
        this.view.setUint16(regIndex * 2, value, true);
        this.updateSingleUI(regIndex);
    }

    // Set flags based on result of an operation
    updateFlags(result, opSize = 16) {
        const maxVal = opSize === 16 ? 0xFFFF : 0xFF;
        
        this.flags.Z = (result & maxVal) === 0;
        this.flags.S = (result & (1 << (opSize - 1))) !== 0;
        // Carry and Overflow usually handled by specific arithmetic ALU functions
        this.updateFlagUI();
    }

    updateSingleUI(regIndex) {
        const name = REGISTER_NAMES.find(k => REGISTERS[k] === regIndex);
        if (!name) return;
        
        const el = document.getElementById(`reg-${name}`);
        if (el) {
            const hex = toHex16(this.get(regIndex));
            if (el.innerText !== hex) {
                el.innerText = hex;
                el.classList.remove('changed');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('changed');
            }
        }
    }

    updateFlagUI() {
        for (const [key, val] of Object.entries(this.flags)) {
            const el = document.getElementById(`flag-${key}`);
            if (el) {
                if (val) el.classList.add('active');
                else el.classList.remove('active');
            }
        }
    }

    updateUI() {
        Object.values(REGISTERS).forEach(idx => this.updateSingleUI(idx));
        this.updateFlagUI();
    }
}