/**
 * LSB STEGANOGRAPHY TOOL - DIGITAL FORENSICS SUITE
 * * * ARCHITECTURE:
 * 1. StegoCore: Handles bit manipulation (LSB injection/extraction).
 * 2. CryptoLayer: Handles simple XOR/Vigenère encryption of payloads.
 * 3. AnalysisEngine: Handles bit-plane slicing and hex visualization.
 * 4. UIController: Manages DOM state, drag-and-drop, and navigation.
 * * * @author saiusesgithub
 * @version 1.0.0
 */

/* =========================================
   1. UTILITIES & CONFIG
   ========================================= */

const CONFIG = {
    headerLength: 32, // Bits reserved for message length
    delimiter: '::EOF::', // End of File marker (fallback)
    maxPreviewHex: 1024 // Bytes to show in inspector
};

const Utils = {
    // Convert string to binary string (UTF-16 support handled by treating chars as 8-bit for simplicity in LSB)
    // For robust LSB, we stick to ASCII/UTF-8 range 0-255
    textToBinary: (text) => {
        let binary = '';
        for (let i = 0; i < text.length; i++) {
            let bin = text.charCodeAt(i).toString(2);
            binary += '00000000'.substring(bin.length) + bin; // Pad to 8 bits
        }
        return binary;
    },

    // Convert binary string to text
    binaryToText: (binary) => {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            let byte = binary.substring(i, i + 8);
            text += String.fromCharCode(parseInt(byte, 2));
        }
        return text;
    },

    // Convert number to 32-bit binary string (for header)
    numberToBinary: (num) => {
        let bin = num.toString(2);
        return '0'.repeat(32 - bin.length) + bin;
    },

    // Convert 32-bit binary string to number
    binaryToNumber: (bin) => {
        return parseInt(bin, 2);
    },

    formatBytes: (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

/* =========================================
   2. CRYPTO LAYER (Vigenère Cipher)
   ========================================= */

class CryptoLayer {
    static encrypt(text, key) {
        if (!key) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            const k = key.charCodeAt(i % key.length);
            result += String.fromCharCode((c + k) % 256);
        }
        return result;
    }

    static decrypt(text, key) {
        if (!key) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            const k = key.charCodeAt(i % key.length);
            // Javascript modulo bug for negative numbers fix
            let val = (c - k) % 256;
            if (val < 0) val += 256;
            result += String.fromCharCode(val);
        }
        return result;
    }
}

/* =========================================
   3. STEGANOGRAPHY ENGINE (The Core)
   ========================================= */

class StegoCore {
    constructor() {
        this.ctxSource = document.getElementById('canvas-source').getContext('2d', { willReadFrequently: true });
        this.ctxDecode = document.getElementById('canvas-decode').getContext('2d', { willReadFrequently: true });
        this.width = 0;
        this.height = 0;
        this.imageData = null;
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.width = img.width;
                    this.height = img.height;
                    
                    // Resize canvas
                    [document.getElementById('canvas-source'), document.getElementById('canvas-decode')].forEach(cvs => {
                        cvs.width = this.width;
                        cvs.height = this.height;
                    });

                    // Draw to source
                    this.ctxSource.drawImage(img, 0, 0);
                    this.imageData = this.ctxSource.getImageData(0, 0, this.width, this.height);
                    
                    resolve({ width: this.width, height: this.height });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Encode Logic:
     * 1. Header (32 bits) = Length of Message in bits
     * 2. Payload = Binary string of message
     */
    encode(message, password) {
        if (!this.imageData) throw new Error("No image loaded");

        // 1. Prepare Payload
        const encrypted = CryptoLayer.encrypt(message, password);
        const binaryMsg = Utils.textToBinary(encrypted);
        const binaryLen = Utils.numberToBinary(binaryMsg.length);
        const fullStream = binaryLen + binaryMsg;

        // 2. Check Capacity
        const totalPixels = this.width * this.height;
        const totalChannels = totalPixels * 3; // Use R, G, B (skip Alpha)
        if (fullStream.length > totalChannels) {
            throw new Error(`Message too large! Need ${fullStream.length} bits, have ${totalChannels} available.`);
        }

        // 3. Inject Bits
        const data = this.imageData.data;
        let streamIdx = 0;

        for (let i = 0; i < data.length; i += 4) {
            // Iterate R, G, B channels
            for (let j = 0; j < 3; j++) {
                if (streamIdx < fullStream.length) {
                    // Clear LSB ( & 254 ) then add bit ( | bit )
                    data[i + j] = (data[i + j] & 0xFE) | parseInt(fullStream[streamIdx]);
                    streamIdx++;
                }
            }
        }

        // 4. Update UI with modified image
        this.ctxSource.putImageData(this.imageData, 0, 0); // Update preview
        
        return true;
    }

    decode(password) {
        // Use the image currently in source canvas (assuming user loaded encoded image there)
        const data = this.ctxSource.getImageData(0, 0, this.width, this.height).data;
        
        // 1. Extract Header (32 bits)
        let headerBin = '';
        let pixelIdx = 0;

        // Extract first 32 bits
        while (headerBin.length < 32) {
            for (let j = 0; j < 3; j++) {
                if (headerBin.length < 32) {
                    headerBin += (data[pixelIdx + j] & 1).toString();
                }
            }
            pixelIdx += 4;
        }

        const msgLen = Utils.binaryToNumber(headerBin);
        
        // Safety check
        if (msgLen <= 0 || msgLen > data.length * 3) {
            throw new Error("No hidden message detected or header corrupted.");
        }

        // 2. Extract Body
        let bodyBin = '';
        // Note: pixelIdx is already advanced to where header ended.
        // But we need to be careful about channel alignment.
        // Let's simpler: restart loop and skip header bits
        
        let totalBitsToRead = 32 + msgLen;
        let currentBit = 0;
        let extractedStream = '';

        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                if (currentBit < totalBitsToRead) {
                    extractedStream += (data[i + j] & 1).toString();
                    currentBit++;
                } else {
                    break;
                }
            }
            if (currentBit >= totalBitsToRead) break;
        }

        // Remove header
        const payloadBin = extractedStream.substring(32);
        const encryptedText = Utils.binaryToText(payloadBin);
        
        // 3. Decrypt
        return CryptoLayer.decrypt(encryptedText, password);
    }

    getCapacity() {
        if (!this.width) return 0;
        // 3 bits per pixel (RGB), minus 32 bits for header
        const bits = (this.width * this.height * 3) - 32;
        return Math.floor(bits / 8); // Bytes
    }
}

/* =========================================
   4. ANALYSIS ENGINE (Bit Plane & Hex)
   ========================================= */

class AnalysisEngine {
    constructor(core) {
        this.core = core;
        this.canvas = document.getElementById('canvas-bitplane');
        this.ctx = this.canvas.getContext('2d');
    }

    renderBitPlane(channelIdx, bitIdx) {
        if (!this.core.imageData) return;
        
        const w = this.core.width;
        const h = this.core.height;
        this.canvas.width = w;
        this.canvas.height = h;

        const srcData = this.core.imageData.data;
        const destImg = this.ctx.createImageData(w, h);
        const destData = destImg.data;

        for (let i = 0; i < srcData.length; i += 4) {
            const pixelVal = srcData[i + channelIdx];
            // Extract specific bit
            const bit = (pixelVal >> bitIdx) & 1;
            // Scale to 0 or 255 for visibility
            const val = bit * 255;
            
            destData[i] = val;     // R
            destData[i+1] = val;   // G
            destData[i+2] = val;   // B
            destData[i+3] = 255;   // Alpha
        }

        this.ctx.putImageData(destImg, 0, 0);
    }

    renderHexDump() {
        if (!this.core.imageData) return;
        
        const el = document.getElementById('hex-view');
        const data = this.core.imageData.data;
        let output = '';
        
        // Show first 512 bytes
        for (let i = 0; i < CONFIG.maxPreviewHex; i += 16) {
            // Offset
            output += `<span class="hex-offset">${i.toString(16).padStart(8, '0')}</span>  `;
            
            // Hex Bytes
            let ascii = '';
            for (let j = 0; j < 16; j++) {
                if (i + j < data.length) {
                    const byte = data[i + j];
                    output += `<span class="hex-byte">${byte.toString(16).padStart(2, '0').toUpperCase()}</span> `;
                    ascii += (byte > 31 && byte < 127) ? String.fromCharCode(byte) : '.';
                }
            }
            output += ` | ${ascii}\n`;
        }
        
        el.innerHTML = output;
    }
}

/* =========================================
   5. UI CONTROLLER
   ========================================= */

class UIController {
    constructor() {
        this.stego = new StegoCore();
        this.analysis = new AnalysisEngine(this.stego);
        
        this.bindEvents();
        this.setupDragDrop();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');

                // Trigger analysis render if tab selected
                if (btn.dataset.tab === 'analyze') {
                    this.analysis.renderHexDump();
                }
            });
        });

        // Encode
        document.getElementById('input-message').addEventListener('input', (e) => this.updateStats(e.target.value));
        document.getElementById('btn-encode').addEventListener('click', () => {
            try {
                const msg = document.getElementById('input-message').value;
                const pass = document.getElementById('input-pass-enc').value;
                if (!msg) throw new Error("Please enter a message.");
                
                this.stego.encode(msg, pass);
                this.showToast("Message encoded successfully!", "success");
                
                // Enable download
                const btn = document.getElementById('btn-download');
                btn.disabled = false;
                btn.onclick = () => this.downloadImage();
                
            } catch (err) {
                this.showToast(err.message, "error");
            }
        });

        // Decode
        document.getElementById('btn-decode').addEventListener('click', () => {
            try {
                const pass = document.getElementById('input-pass-dec').value;
                const msg = this.stego.decode(pass);
                
                const consoleEl = document.getElementById('output-console');
                consoleEl.innerText = msg;
                consoleEl.classList.add('success');
                this.showToast("Message extracted!", "success");
            } catch (err) {
                this.showToast(err.message, "error");
                document.getElementById('output-console').innerText = "ERROR: " + err.message;
            }
        });

        // Analysis
        document.getElementById('btn-render-plane').addEventListener('click', () => {
            const val = document.getElementById('plane-select').value;
            // Value map: 0=R(LSB), 1=G(LSB), etc. 
            // In UI we mapped basic ones. Let's assume LSB (bit 0) for RGB, MSB (bit 7) for Alpha.
            // Simplified logic for demo:
            if (val == 7) this.analysis.renderBitPlane(3, 7); // Alpha MSB
            else this.analysis.renderBitPlane(parseInt(val), 0); // RGB LSB
        });

        // Reset
        document.getElementById('btn-reset').addEventListener('click', () => location.reload());
    }

    setupDragDrop() {
        const zone = document.getElementById('drop-zone');
        const input = document.getElementById('file-input');

        ['dragenter', 'dragover'].forEach(evt => {
            document.body.addEventListener(evt, (e) => {
                e.preventDefault();
                zone.classList.remove('hidden');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            zone.addEventListener(evt, (e) => {
                e.preventDefault();
                if (evt === 'drop') {
                    this.handleFile(e.dataTransfer.files[0]);
                }
                zone.classList.add('hidden');
            });
        });

        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFile(e.target.files[0]);
                zone.classList.add('hidden');
            }
        });
    }

    async handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast("Invalid file type. Please upload an image.", "error");
            return;
        }

        try {
            const dims = await this.stego.loadImage(file);
            document.getElementById('file-info-display').innerHTML = `
                <i class='bx bx-check-circle'></i> ${file.name} (${dims.width}x${dims.height})
            `;
            
            const cap = this.stego.getCapacity();
            document.getElementById('stat-capacity').innerText = Utils.formatBytes(cap);
            this.showToast("Image loaded successfully.", "success");
        } catch (err) {
            this.showToast("Failed to load image.", "error");
        }
    }

    updateStats(text) {
        document.getElementById('count-chars').innerText = text.length;
        // bits = chars * 8 + 32 header
        const bits = text.length * 8 + 32;
        document.getElementById('count-bits').innerText = bits;

        const cap = this.stego.getCapacity(); // in bytes
        const capBits = cap * 8;
        
        if (capBits > 0) {
            const pct = (bits / capBits) * 100;
            document.getElementById('stat-usage').style.width = `${Math.min(pct, 100)}%`;
        }
    }

    downloadImage() {
        const link = document.createElement('a');
        link.download = 'stego_encoded_image.png';
        link.href = document.getElementById('canvas-source').toDataURL('image/png');
        link.click();
    }

    showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerText = msg;
        container.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.app = new UIController();
});