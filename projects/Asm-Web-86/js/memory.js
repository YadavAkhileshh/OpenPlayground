import { toHex16, toHex8, getSafeChar } from './utils.js';

export class Memory {
    constructor(size = 65536) { // 64KB RAM
        this.size = size;
        this.data = new Uint8Array(size);
        this.viewStart = 0; // For Hex Editor scrolling
    }

    reset() {
        this.data.fill(0);
    }

    // Read 8-bit byte
    getByte(addr) {
        if (addr < 0 || addr >= this.size) {
            throw new Error(`Memory Access Violation: ${toHex16(addr)}`);
        }
        return this.data[addr];
    }

    // Write 8-bit byte
    setByte(addr, val) {
        if (addr < 0 || addr >= this.size) return;
        this.data[addr] = val & 0xFF;
        // Trigger UI update if visible? (Handled by render)
    }

    // Read 16-bit word (Little Endian)
    getWord(addr) {
        const low = this.getByte(addr);
        const high = this.getByte(addr + 1);
        return (high << 8) | low;
    }

    // Write 16-bit word (Little Endian)
    setWord(addr, val) {
        this.setByte(addr, val & 0xFF);
        this.setByte(addr + 1, (val >> 8) & 0xFF);
    }

    // Render the visual Hex Dump
    render(containerId, ip, sp) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        // Render 16 rows (128 bytes) starting from viewStart
        for (let i = 0; i < 16; i++) {
            const rowAddr = this.viewStart + (i * 8);
            if (rowAddr >= this.size) break;

            html += `<div class="mem-row">`;
            html += `<div class="mem-addr">${toHex16(rowAddr)}</div>`;
            html += `<div class="mem-data">`;

            let ascii = '';

            for (let j = 0; j < 8; j++) {
                const addr = rowAddr + j;
                if (addr >= this.size) break;

                const val = this.data[addr];
                ascii += getSafeChar(val);

                let classes = 'mem-cell';
                if (addr === ip) classes += ' active-pc';
                if (addr === sp) classes += ' active-sp';

                html += `<span class="${classes}" title="Addr: ${toHex16(addr)}">${toHex8(val)}</span>`;
            }

            html += `</div>`;
            html += `<div class="mem-ascii">${ascii.replace(/</g, '&lt;')}</div>`;
            html += `</div>`;
        }
        container.innerHTML = html;
    }
    
    loadProgram(offset, code) {
        for(let i=0; i<code.length; i++) {
            this.data[offset + i] = code[i];
        }
    }
}