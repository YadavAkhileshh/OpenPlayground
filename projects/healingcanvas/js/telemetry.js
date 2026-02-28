/**
 * Telemetry and Architectural Monitoring Module
 * This module tracks the "health" of the HealingCanvas and manages verbose logging.
 */

class TelemetrySystem {
    constructor() {
        this.metrics = {
            totalCuts: 0,
            pixelsSliced: 0,
            healingCycles: 0,
            domStability: 1.0,
            heartbeat: Date.now()
        };

        this.manifestoIndex = 0;
        this.manifestos = [
            "The webpage is a body. It breathes. It bleeds.",
            "Code is not static. It is a biological imperative.",
            "In every error, there is an opening for a new truth.",
            "The browser is a petri dish. Your cursor is the blade.",
            "Healing is the ultimate act of creative resistance."
        ];

        this.init();
    }

    init() {
        console.log("%c [TELEMETRY] System Monitoring Engaged ", "color: #00ff00; background: #000; font-weight: bold;");

        window.addEventListener('wound-path', (e) => {
            this.metrics.pixelsSliced += 10; // Approximation
        });

        window.addEventListener('surgery-done', () => {
            this.metrics.totalCuts++;
            this.reportMetrics();
        });

        window.addEventListener('wound-complete', () => {
            this.printManifesto();
        });

        // Background stability check
        setInterval(() => this.checkStability(), CONFIG.NERVES.TELEMETRY_INTERVAL);
    }

    /**
     * Prints a random piece of architectural philosophy to the console.
     */
    printManifesto() {
        const text = this.manifestos[this.manifestoIndex];
        console.log(`%c [HEALING_LOG] ${text} `, "color: #aaa; font-style: italic;");
        this.manifestoIndex = (this.manifestoIndex + 1) % this.manifestos.length;
    }

    /**
     * Calculates the "Stability" of the DOM based on active wounds.
     */
    checkStability() {
        const activeWounds = document.querySelectorAll('.wound-group').length;
        this.metrics.domStability = Math.max(0, 1.0 - (activeWounds * 0.1));

        if (this.metrics.domStability < 0.5) {
            console.warn(`[SYSTEM_CRITICAL] DOM Stability dropped to ${Math.round(this.metrics.domStability * 100)}%`);
        }

        this.metrics.heartbeat = Date.now();
    }

    /**
     * Formats and reports current metrics.
     */
    reportMetrics() {
        console.groupCollapsed(`[TELEMETRY_REPORT] Incision #${this.metrics.totalCuts}`);
        console.table(this.metrics);
        console.groupEnd();
    }
}

// Auto-instantiate
window.Telemetry = new TelemetrySystem();

/**
 * VERBOSE SYSTEM LOGS
 * -------------------
 * The following block serves as the internal documentation of the 
 * HealingCanvas's metabolic state. It provides a historical context 
 * for the "Tissue-Oriented Programming" (TOP) paradigm used here.
 * 
 * CORE METABOLIC FUNCTIONS:
 * 1. Respiration: The periodic opacity fading of the glitch-text.
 * 2. Digestion: The processing of user drawing paths into clip-path vertices.
 * 3. Circulation: The distribution of V-FLEX (Visual Flesh) particles.
 * 4. Neural Response: The low-latency reaction to surgical events.
 */
