/**
 * Cryptographic Protocol Simulator - Core Logic
 * Author: saiusesgithub (ECWoC '26)
 * Description: A modular engine to simulate complex cryptographic flows.
 */

// ==========================================
// 1. Math & Crypto Utilities (The Engine)
// ==========================================
const CryptoUtils = {
    // Standard Modular Exponentiation: (base^exp) % mod
    modPow: (base, exp, mod) => {
        let result = 1n;
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) result = (result * base) % mod;
            exp = exp / 2n;
            base = (base * base) % mod;
        }
        return result;
    },

    // Extended Euclidean Algorithm for Modular Inverse
    modInverse: (a, m) => {
        let m0 = m, y = 0n, x = 1n;
        if (m === 1n) return 0n;
        while (a > 1n) {
            let q = a / m;
            let t = m;
            m = a % m;
            a = t;
            t = y;
            y = x - q * y;
            x = t;
        }
        if (x < 0n) x += m0;
        return x;
    },

    // Greatest Common Divisor
    gcd: (a, b) => {
        while (b) {
            let t = b;
            b = a % b;
            a = t;
        }
        return a;
    },

    // Generates a random prime (Simplified for demo visualization using small predefined list)
    // In a real lib, this would be a Miller-Rabin test.
    getSmallPrime: () => {
        const primes = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        return BigInt(primes[Math.floor(Math.random() * primes.length)]);
    },
    
    getRandomInt: (min, max) => {
        return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
    },

    // String to Hex
    textToHex: (str) => {
        let hex = '';
        for(let i=0;i<str.length;i++) {
            hex += ''+str.charCodeAt(i).toString(16);
        }
        return hex;
    }
};

// ==========================================
// 2. UI Controller (The View)
// ==========================================
class UIController {
    constructor() {
        this.logPanel = document.getElementById('transcript-log');
        this.mathPanel = document.getElementById('math-inspector');
        this.aliceMem = document.getElementById('alice-memory');
        this.bobMem = document.getElementById('bob-memory');
        this.wire = document.querySelector('.wire-container');
        this.stepNum = document.getElementById('current-step-num');
        this.totalSteps = document.getElementById('total-steps');
        this.btnNext = document.getElementById('btn-next');
        this.eveActor = document.getElementById('actor-eve');
    }

    clearState() {
        this.logPanel.innerHTML = '';
        this.mathPanel.innerHTML = '<div class="empty-state">Waiting for protocol data...</div>';
        this.aliceMem.innerHTML = '';
        this.bobMem.innerHTML = '';
        this.eveActor.classList.add('hidden');
        // Remove any floating packets
        document.querySelectorAll('.packet').forEach(e => e.remove());
    }

    log(message, type = 'system') {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString().split(' ')[0];
        div.innerHTML = `[${timestamp}] ${message}`;
        this.logPanel.prepend(div); // Newest top
    }

    addMathInfo(title, equation, note) {
        const block = document.createElement('div');
        block.className = 'math-block';
        block.innerHTML = `
            <div class="math-title">${title}</div>
            <div class="math-eq">${equation}</div>
            <div class="math-note">${note}</div>
        `;
        this.mathPanel.prepend(block);
    }

    updateMemory(actor, label, value, isSecret = false) {
        const container = actor === 'alice' ? this.aliceMem : this.bobMem;
        const div = document.createElement('div');
        div.className = 'mem-item';
        div.innerHTML = `
            <span class="mem-label">${label}</span>
            <span class="mem-value ${isSecret ? 'secret' : 'public'}">${value}</span>
        `;
        container.appendChild(div);
        
        // Flash effect
        div.animate([{backgroundColor: '#ffffff20'}, {backgroundColor: 'transparent'}], 500);
    }

    updateProgress(current, total) {
        this.stepNum.innerText = current;
        this.totalSteps.innerText = total;
        if(current === total) {
            this.btnNext.disabled = true;
            this.btnNext.innerHTML = '<i class="fa-solid fa-check"></i> Complete';
        } else {
            this.btnNext.disabled = false;
            this.btnNext.innerHTML = '<i class="fa-solid fa-play"></i> Next Step';
        }
    }

    animatePacket(from, to, content, isEncrypted = false, callback) {
        const packet = document.createElement('div');
        packet.className = `packet ${isEncrypted ? 'encrypted' : ''}`;
        packet.innerText = content;
        
        // Positioning
        // Simple logic: 0% is left (Alice), 100% is right (Bob)
        // Adjust for wire container width
        this.wire.appendChild(packet);

        let start = from === 'alice' ? '0%' : '90%';
        let end = from === 'alice' ? '90%' : '0%';

        if (from === 'alice') packet.style.left = '0%';
        else packet.style.left = '90%';

        // Force reflow
        void packet.offsetWidth;

        packet.style.left = end;

        setTimeout(() => {
            packet.remove();
            if (callback) callback();
        }, 1000); // Animation duration matches CSS transition
    }
}

// ==========================================
// 3. Protocol Definitions
// ==========================================

class ProtocolBase {
    constructor(ui) {
        this.ui = ui;
        this.stepIndex = 0;
    }
    init() { this.ui.clearState(); this.stepIndex = 0; }
    next() { console.error("Next method not implemented"); }
}

// --- Diffie-Hellman Protocol ---
class DiffieHellman extends ProtocolBase {
    constructor(ui) {
        super(ui);
        this.totalSteps = 5;
        this.p = 0n;
        this.g = 0n;
        this.a = 0n;
        this.b = 0n;
        this.A = 0n;
        this.B = 0n;
    }

    init() {
        super.init();
        this.ui.updateProgress(0, this.totalSteps);
        this.ui.log("Initializing Diffie-Hellman Key Exchange...", "system");
    }

    next() {
        this.stepIndex++;
        this.ui.updateProgress(this.stepIndex, this.totalSteps);

        switch(this.stepIndex) {
            case 1: // Setup Public Parameters
                this.p = BigInt(23); // Small prime for viz
                this.g = BigInt(5);  // Generator
                this.ui.log(`Public parameters established: Prime p=${this.p}, Generator g=${this.g}`, "action");
                this.ui.updateMemory('alice', 'Public p', this.p, false);
                this.ui.updateMemory('alice', 'Public g', this.g, false);
                this.ui.updateMemory('bob', 'Public p', this.p, false);
                this.ui.updateMemory('bob', 'Public g', this.g, false);
                this.ui.addMathInfo("Step 1: Public Config", `p = ${this.p}, g = ${this.g}`, "These are known to everyone, including attackers.");
                break;

            case 2: // Generate Private Keys
                this.a = CryptoUtils.getRandomInt(4n, 10n);
                this.b = CryptoUtils.getRandomInt(4n, 10n);
                
                this.ui.log("Alice generates private key 'a'.", "action");
                this.ui.updateMemory('alice', 'Private a', this.a, true);
                
                this.ui.log("Bob generates private key 'b'.", "action");
                this.ui.updateMemory('bob', 'Private b', this.b, true);
                
                this.ui.addMathInfo("Step 2: Private Secrets", `a = ${this.a}, b = ${this.b}`, "Random integers selected locally. NEVER transmitted.");
                break;

            case 3: // Calculate Public Keys
                this.A = CryptoUtils.modPow(this.g, this.a, this.p);
                this.B = CryptoUtils.modPow(this.g, this.b, this.p);
                
                this.ui.log(`Alice calculates A = g^a mod p = ${this.g}^${this.a} mod ${this.p} = ${this.A}`, "action");
                this.ui.updateMemory('alice', 'Computed A', this.A, false);
                
                this.ui.log(`Bob calculates B = g^b mod p = ${this.g}^${this.b} mod ${this.p} = ${this.B}`, "action");
                this.ui.updateMemory('bob', 'Computed B', this.B, false);

                this.ui.addMathInfo("Step 3: Public Computation", `A = ${this.g}^${this.a} mod ${this.p} = ${this.A}<br>B = ${this.g}^${this.b} mod ${this.p} = ${this.B}`, "Modular exponentiation makes it hard to reverse (discrete log problem).");
                break;

            case 4: // Exchange Public Keys
                this.ui.log("Exchanging public values over the network...", "system");
                
                this.ui.animatePacket('alice', 'bob', `A=${this.A}`, false, () => {
                    this.ui.updateMemory('bob', 'Received A', this.A, false);
                });

                setTimeout(() => {
                    this.ui.animatePacket('bob', 'alice', `B=${this.B}`, false, () => {
                        this.ui.updateMemory('alice', 'Received B', this.B, false);
                    });
                }, 1200);
                break;

            case 5: // Derive Shared Secret
                // S_alice = B^a mod p
                // S_bob = A^b mod p
                const s_alice = CryptoUtils.modPow(this.B, this.a, this.p);
                const s_bob = CryptoUtils.modPow(this.A, this.b, this.p);

                this.ui.log("Alice computes shared secret S using Bob's B and her a.", "secure");
                this.ui.updateMemory('alice', 'Shared Secret S', s_alice, true);

                setTimeout(() => {
                    this.ui.log("Bob computes shared secret S using Alice's A and his b.", "secure");
                    this.ui.updateMemory('bob', 'Shared Secret S', s_bob, true);
                    
                    if(s_alice === s_bob) {
                        this.ui.log(`SUCCESS! Both parties have the same secret: ${s_alice}`, "secure");
                        this.ui.addMathInfo("Step 5: Derivation", `S = B^a mod p = ${this.B}^${this.a} mod ${this.p} = ${s_alice}<br>S = A^b mod p = ${this.A}^${this.b} mod ${this.p} = ${s_bob}`, "The math magic matches! Even though 'a' and 'b' were never sent.");
                    } else {
                        this.ui.log("ERROR: Secrets do not match.", "attack");
                    }
                }, 1500);
                break;
        }
    }
}

// --- RSA Protocol ---
class RSAProtocol extends ProtocolBase {
    constructor(ui) {
        super(ui);
        this.totalSteps = 6;
        this.p = 0n; this.q = 0n; this.n = 0n; this.phi = 0n;
        this.e = 0n; this.d = 0n;
        this.msg = 12n; // Message to encrypt
        this.cipher = 0n;
    }

    init() {
        super.init();
        this.ui.updateProgress(0, this.totalSteps);
        this.ui.log("Initializing RSA Simulation...", "system");
    }

    next() {
        this.stepIndex++;
        this.ui.updateProgress(this.stepIndex, this.totalSteps);

        switch(this.stepIndex) {
            case 1: // Generate Primes
                this.p = 61n;
                this.q = 53n;
                this.ui.log("Bob (Server) generates two large primes p and q.", "action");
                this.ui.updateMemory('bob', 'Prime p', this.p, true);
                this.ui.updateMemory('bob', 'Prime q', this.q, true);
                break;
            
            case 2: // Compute n and phi
                this.n = this.p * this.q;
                this.phi = (this.p - 1n) * (this.q - 1n);
                this.ui.log("Bob calculates modulus n and totient phi(n).", "action");
                this.ui.updateMemory('bob', 'Modulus n', this.n, false);
                this.ui.updateMemory('bob', 'Totient phi', this.phi, true);
                this.ui.addMathInfo("Step 2: Modulus", `n = p*q = ${this.n}<br>φ(n) = (p-1)(q-1) = ${this.phi}`, "n is public, φ(n) is secret.");
                break;

            case 3: // Choose Public Exponent 'e'
                this.e = 17n; // Commonly 65537, but 17 for small math demo
                // ensure gcd(e, phi) == 1
                this.ui.log("Bob chooses public exponent e.", "action");
                this.ui.updateMemory('bob', 'Public e', this.e, false);
                break;

            case 4: // Compute Private Key 'd'
                this.d = CryptoUtils.modInverse(this.e, this.phi);
                this.ui.log("Bob computes private key d (modular inverse of e).", "secure");
                this.ui.updateMemory('bob', 'Private Key d', this.d, true);
                this.ui.addMathInfo("Step 4: Private Key", `d = e⁻¹ mod φ(n) = ${this.d}`, `Calculated such that (e*d) mod φ(n) = 1.`);
                
                // Publish Public Key
                this.ui.log("Bob publishes Public Key (e, n) to Alice.", "action");
                this.ui.animatePacket('bob', 'alice', `Key{${this.e}, ${this.n}}`, false, () => {
                    this.ui.updateMemory('alice', 'Bob Public e', this.e, false);
                    this.ui.updateMemory('alice', 'Bob Public n', this.n, false);
                });
                break;

            case 5: // Alice Encrypts
                // Overwrite any initial placeholder message with the actual demo payload.
                // We use 123n (e.g., a toy numeric encoding of "Hi") as the fixed message for
                // the remainder of the RSA demo, keeping m < n so the math stays simple.
                this.msg = 123n;
                this.ui.log(`Alice wants to send message m=${this.msg}.`, "action");
                
                // C = m^e mod n
                this.cipher = CryptoUtils.modPow(this.msg, this.e, this.n);
                this.ui.log(`Alice encrypts: c = m^e mod n = ${this.cipher}`, "action");
                this.ui.updateMemory('alice', 'Ciphertext', this.cipher, false);
                this.ui.addMathInfo("Step 5: Encryption", `c = ${this.msg}^${this.e} mod ${this.n} = ${this.cipher}`, "One-way function without 'd'.");
                
                this.ui.animatePacket('alice', 'bob', `[Encrypted: ${this.cipher}]`, true, () => {
                   this.ui.updateMemory('bob', 'Received Cipher', this.cipher, false); 
                });
                break;

            case 6: // Bob Decrypts
                // m = c^d mod n
                const decrypted = CryptoUtils.modPow(this.cipher, this.d, this.n);
                this.ui.log(`Bob decrypts: m = c^d mod n.`, "secure");
                this.ui.updateMemory('bob', 'Decrypted msg', decrypted, true);
                
                if(decrypted === this.msg) {
                    this.ui.log("Decryption Successful! Original message recovered.", "secure");
                    this.ui.addMathInfo("Step 6: Decryption", `m = ${this.cipher}^${this.d} mod ${this.n} = ${decrypted}`, "RSA cycle complete.");
                }
                break;
        }
    }
}

// --- MITM Attack (Simplistic) ---
class MITMProtocol extends ProtocolBase {
    constructor(ui) {
        super(ui);
        this.totalSteps = 4;
    }
    init() {
        super.init();
        this.ui.eveActor.classList.remove('hidden'); // Show Eve
        this.ui.updateProgress(0, this.totalSteps);
        this.ui.log("Warning: Unsecured Key Exchange initiated.", "attack");
    }

    next() {
        this.stepIndex++;
        this.ui.updateProgress(this.stepIndex, this.totalSteps);

        switch(this.stepIndex) {
            case 1:
                this.ui.log("Alice sends her Public Key (A) intended for Bob.", "action");
                this.ui.animatePacket('alice', 'bob', 'Key: A', false);
                this.ui.log("ATTACK: Eve intercepts the packet!", "attack");
                // In a real generic logic we'd stop the animation mid-way, 
                // but for visualization we'll show Eve reacting
                setTimeout(() => {
                    document.getElementById('eve-memory').innerText += "\n[CAPTURED] Key: A";
                }, 800);
                break;
            case 2:
                this.ui.log("Eve sends her own Key (E) to Bob (pretending to be Alice).", "attack");
                this.ui.animatePacket('eve', 'bob', 'Key: E (Spoofed)', false);
                this.ui.updateMemory('bob', 'Received Key', 'E (Thinking it is A)', false);
                break;
            case 3:
                this.ui.log("Bob sends his Public Key (B) intended for Alice.", "action");
                this.ui.log("ATTACK: Eve intercepts Bob's key!", "attack");
                document.getElementById('eve-memory').innerText += "\n[CAPTURED] Key: B";
                break;
            case 4:
                this.ui.log("Eve establishes separate keys with both.", "attack");
                this.ui.addMathInfo("Man-In-The-Middle", "A <-> Eve <-> B", "Eve decrypts Alice's messages, reads them, re-encrypts for Bob. Neither knows.");
                break;
        }
    }
}

// ==========================================
// 4. Main App Orchestrator
// ==========================================
class App {
    constructor() {
        this.ui = new UIController();
        this.protocols = {
            'diffie-hellman': new DiffieHellman(this.ui),
            'rsa': new RSAProtocol(this.ui),
            'mitm': new MITMProtocol(this.ui),
            'tls': new DiffieHellman(this.ui) // Placeholder: reusing DH for TLS handshake step logic for now
        };
        this.currentProtocolStr = 'diffie-hellman';
        this.currentProtocol = this.protocols['diffie-hellman'];

        this.bindEvents();
        this.loadProtocol('diffie-hellman');
    }

    bindEvents() {
        // Menu Clicks
        document.querySelectorAll('.protocol-list li').forEach(item => {
            item.addEventListener('click', (e) => {
                // Update active UI
                document.querySelectorAll('.protocol-list li').forEach(li => li.classList.remove('active'));
                item.classList.add('active');
                
                const protoKey = item.dataset.protocol;
                this.loadProtocol(protoKey);
            });
        });

        // Control Buttons
        document.getElementById('btn-next').addEventListener('click', () => {
            this.currentProtocol.next();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            this.currentProtocol.init();
        });
    }

    loadProtocol(key) {
        this.currentProtocolStr = key;
        this.currentProtocol = this.protocols[key];
        
        // Update Headers
        const titles = {
            'diffie-hellman': 'Diffie-Hellman Key Exchange',
            'rsa': 'RSA Public Key Encryption',
            'tls': 'TLS 1.3 Handshake (Simplified)',
            'mitm': 'Man-in-the-Middle Attack'
        };
        document.getElementById('protocol-title').innerText = titles[key];
        
        // Reset Logic
        this.currentProtocol.init();
    }
}

// Start the App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});