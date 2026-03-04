/**
 * FlexDeadline - Evaluation Logic and Simulation
 * Version 1.3.0
 */

// =============================================================================
// Constants & Configuration
// =============================================================================
const CONFIG = {
    SCORE_MAX: 100,
    SCORE_MIN: 0,
    THRESHOLDS: {
        SAFE: 75,
        CAUTION: 45,
        CRITICAL: 20
    },
    WEIGHTS: {
        COMPLEXITY: 0.35,
        UNCERTAINTY: 0.25,
        URGENCY: 0.20,
        BUFFER: 0.20
    },
    SIMULATION: {
        DELAY_BUFFER_HIT: 10, // % buffer lost per delay click
        ACCEL_URGENCY_HIT: 1.0, // Urgency increase per accel
        ACCEL_BUFFER_HIT: 5,   // Buffer lost per accel
    }
};

// =============================================================================
// Core Logic: Elasticity Model
// =============================================================================
class ElasticityModel {
    constructor() {
        // Initial defaults
        this.complexity = 5.0;  // 1-10
        this.uncertainty = 3.0; // 1-10
        this.urgency = 7.0;     // 1-10
        this.buffer = 20;       // 0-50%

        // Backup for Reset
        this.defaults = {
            complexity: 5.0,
            uncertainty: 3.0,
            urgency: 7.0,
            buffer: 20
        };

        this.score = 0;
        this.riskProfile = 'Unknown';
        this.crunchProb = 0;

        // Pre-calculate initial score
        this.calculateScore();
    }

    /**
     * Updates one of the model parameters
     * @param {string} param - Property name
     * @param {number} value - New value
     */
    updateParam(param, value) {
        if (this.hasOwnProperty(param)) {
            this[param] = value;
            this.calculateScore();
        }
    }

    reset() {
        this.complexity = this.defaults.complexity;
        this.uncertainty = this.defaults.uncertainty;
        this.urgency = this.defaults.urgency;
        this.buffer = this.defaults.buffer;
        this.calculateScore();
        return this; // Chainable
    }

    /**
     * Calculates the Elasticity Score based on weighted factors.
     * Higher score = Higher Elasticity (Better).
     * Lower score = Rigid Deadline (Riskier).
     */
    calculateScore() {
        // Normalize 1-10 inputs to 0-1 scale, inverted where appropriate
        // Complexity: High complexity reduces elasticity -> Invert
        const normComplexity = 1 - (this.complexity / 10);

        // Uncertainty: High uncertainty reduces elasticity -> Invert
        const normUncertainty = 1 - (this.uncertainty / 10);

        // Urgency: High urgency reduces elasticity -> Invert
        const normUrgency = 1 - (this.urgency / 10);

        // Buffer: More buffer increases elasticity -> Normal (0-50% mapped to 0-1)
        const normBuffer = Math.min(this.buffer / 30, 1.0); // Capped at 30% for max points to encourage realistic buffers

        // Weighted Sum calculation
        const rawScore = (
            (normComplexity * CONFIG.WEIGHTS.COMPLEXITY) +
            (normUncertainty * CONFIG.WEIGHTS.UNCERTAINTY) +
            (normUrgency * CONFIG.WEIGHTS.URGENCY) +
            (normBuffer * CONFIG.WEIGHTS.BUFFER)
        ) * 100;

        // Apply non-linear penalties for extreme cases
        let penalty = 0;
        if (this.buffer <= 5) penalty += 25; // Massive risk if no buffer
        if (this.urgency >= 9) penalty += 15; // Extreme urgency overrides other good factors
        if (this.uncertainty >= 8 && this.complexity >= 8) penalty += 20; // The "Death March" combo

        this.score = Math.max(0, Math.min(100, Math.floor(rawScore - penalty)));

        this.calculateDerivedMetrics();
        this.determineRiskProfile();
        return this.score;
    }

    calculateDerivedMetrics() {
        // Crunch Probability: Likelihood of overtime/burnout
        // High complexity + High Urgency + Low Buffer
        let cp = (this.complexity * 5) + (this.urgency * 5) - (this.buffer * 2);
        this.crunchProb = Math.max(0, Math.min(100, Math.floor(cp)));
    }

    determineRiskProfile() {
        if (this.score >= CONFIG.THRESHOLDS.SAFE) {
            this.riskProfile = 'SAFE';
        } else if (this.score >= CONFIG.THRESHOLDS.CAUTION) {
            this.riskProfile = 'CAUTION';
        } else {
            this.riskProfile = 'CRITICAL';
        }
    }

    // Simulation Methods
    simulateDelay() {
        // A delay eats into the buffer.
        this.buffer = Math.max(0, this.buffer - CONFIG.SIMULATION.DELAY_BUFFER_HIT);
        // And increases urgency slightly as the remaining time is compressed
        this.urgency = Math.min(10, this.urgency + 0.5);
        this.calculateScore();
    }

    simulateAccelerate() {
        // Accelerating the timeline drastically increases Urgency
        this.urgency = Math.min(10, this.urgency + CONFIG.SIMULATION.ACCEL_URGENCY_HIT);
        // And reduces effective buffer (less time to react)
        this.buffer = Math.max(0, this.buffer - CONFIG.SIMULATION.ACCEL_BUFFER_HIT);
        this.calculateScore();
    }

    generateReport() {
        return `
ELASTICITY ASSESSMENT REPORT
Generated: ${new Date().toLocaleString()}
----------------------------------------

ELASTICITY SCORE: ${this.score}/100 [${this.riskProfile}]

IMPACT FACTORS:
- Complexity: ${this.complexity}/10
- Uncertainty: ${this.uncertainty}/10
- Urgency:    ${this.urgency}/10
- Buffer:     ${this.buffer}%

RISK ANALYSIS:
- Crunch Probability: ${this.crunchProb}%
- Risk Level: ${this.riskProfile}

INTERPRETATION:
${this.score > 75 ? "The deadline is flexible. Team has good autonomy." :
                this.score > 45 ? "The deadline is constrained. Efficiency is key." :
                    "The deadline is rigid and high-risk. Renegotiation recommended."}
        `.trim();
    }
}

// =============================================================================
// UI Controller: DOM & Visuals
// =============================================================================
class UIController {
    constructor(model) {
        this.model = model;

        // Cache DOM Elements
        this.elements = {
            inputs: {
                complexity: document.getElementById('complexityInput'),
                uncertainty: document.getElementById('uncertaintyInput'),
                urgency: document.getElementById('urgencyInput'),
                buffer: document.getElementById('bufferInput')
            },
            values: {
                complexity: document.getElementById('complexityValue'),
                uncertainty: document.getElementById('uncertaintyValue'),
                urgency: document.getElementById('urgencyValue'),
                buffer: document.getElementById('bufferValue')
            },
            displays: {
                score: document.getElementById('mainScore'),
                gaugeFill: document.getElementById('gaugeFill'),
                label: document.getElementById('elasticityLabel'),
                interpretation: document.getElementById('scoreInterpretation'),
                riskBar: document.getElementById('riskBar'),
                riskValue: document.getElementById('riskValue'),
                crunchBar: document.getElementById('crunchBar'),
                crunchValue: document.getElementById('crunchValue'),
                insightList: document.getElementById('insightList'),
                historyList: document.getElementById('historyList')
            },
            buttons: {
                delay: document.getElementById('simDelayBtn'),
                accelerate: document.getElementById('simAccelerateBtn'),
                reset: document.getElementById('resetBtn'),
                clearHistory: document.getElementById('clearHistoryBtn'),
                export: document.getElementById('exportBtn')
            },
            modal: {
                overlay: document.getElementById('reportModal'),
                text: document.getElementById('reportText'),
                close: document.getElementById('closeModalBtn'),
                copy: document.getElementById('copyReportBtn')
            }
        };

        this.history = []; // Store history objects
        this.lastScore = this.model.score;

        this.init();
    }

    init() {
        this.attachListeners();
        this.updateUI(); // Initial render
    }

    attachListeners() {
        // Attach input listeners
        Object.entries(this.elements.inputs).forEach(([key, element]) => {
            element.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.model.updateParam(key, val);
                // Update display immediately for responsiveness
                this.elements.values[key].textContent = key === 'buffer' ? val + '%' : val;
                this.updateUI();
            });

            // Log on change end (optional, or just log manual simulations)
            // For now only log simulations to keep history clean
        });

        // Simulation Button Listeners
        this.elements.buttons.delay.addEventListener('click', () => {
            this.model.simulateDelay();
            this.syncInputs();
            this.updateUI();
            this.logAction('Simulation: Delay', this.model.score);
            this.flashAlert('Simulation: Unexpected Delay (-Buffer)');
        });

        this.elements.buttons.accelerate.addEventListener('click', () => {
            this.model.simulateAccelerate();
            this.syncInputs();
            this.updateUI();
            this.logAction('Simulation: Acceleration', this.model.score);
            this.flashAlert('Simulation: Executive Acceleration (+Urgency)');
        });

        this.elements.buttons.reset.addEventListener('click', () => {
            this.model.reset();
            this.syncInputs();
            this.updateUI();
            this.logAction('Reset', this.model.score);
        });

        // History
        if (this.elements.buttons.clearHistory) {
            this.elements.buttons.clearHistory.addEventListener('click', () => {
                this.history = [];
                this.renderHistory();
            });
        }

        // Export
        if (this.elements.buttons.export) {
            this.elements.buttons.export.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Modal interactions
        if (this.elements.modal.close) {
            this.elements.modal.close.addEventListener('click', () => this.closeModal());
        }
        if (this.elements.modal.overlay) {
            this.elements.modal.overlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modal.overlay) this.closeModal();
            });
        }
        if (this.elements.modal.copy) {
            this.elements.modal.copy.addEventListener('click', async () => {
                const text = this.elements.modal.text.value;
                try {
                    await navigator.clipboard.writeText(text);
                    this.elements.modal.copy.textContent = 'Copied!';
                } catch (err) {
                    // Fallback
                    this.elements.modal.text.select();
                    document.execCommand('copy');
                    this.elements.modal.copy.textContent = 'Copied!';
                }
                setTimeout(() => this.elements.modal.copy.textContent = 'Copy to Clipboard', 2000);
            });
        }
    }

    syncInputs() {
        // Updates input sliders to match model state (needed after simulation)
        this.elements.inputs.complexity.value = this.model.complexity;
        this.elements.values.complexity.textContent = this.model.complexity;

        this.elements.inputs.uncertainty.value = this.model.uncertainty;
        this.elements.values.uncertainty.textContent = this.model.uncertainty;

        this.elements.inputs.urgency.value = this.model.urgency;
        this.elements.values.urgency.textContent = this.model.urgency;

        this.elements.inputs.buffer.value = this.model.buffer;
        this.elements.values.buffer.textContent = this.model.buffer + '%';
    }

    updateUI() {
        const score = this.model.score;
        const startScore = parseInt(this.elements.displays.score.textContent) || 0;

        // Use a single animation loop for both the number and the gauge
        this.animateScore(startScore, score, 800);

        this.updateTheme(score);
        this.updateMetrics();
        this.generateInsights();
    }

    animateScore(start, end, duration) {
        if (start === end) {
            this.updateGauge(end);
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Cubic ease out for smoother feel
            const ease = 1 - Math.pow(1 - progress, 3);

            const currentVal = Math.floor(ease * (end - start) + start);

            this.elements.displays.score.textContent = currentVal;
            this.updateGauge(currentVal);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    updateGauge(score) {
        // Update conic gradient percent
        // 0 score = 0% fill, 100 score = 100% fill

        let color;
        if (score >= CONFIG.THRESHOLDS.SAFE) color = 'var(--color-status-safe)';
        else if (score >= CONFIG.THRESHOLDS.CAUTION) color = 'var(--color-status-warning)';
        else color = 'var(--color-status-danger)';

        // Use conic-gradient for the fill
        this.elements.displays.gaugeFill.style.background = `conic-gradient(${color} ${score}%, transparent 0%)`;
    }

    updateMetrics() {
        // Risk Bar
        const risk = 100 - this.model.score; // Inverse of elasticity
        this.elements.displays.riskBar.style.width = risk + '%';
        this.elements.displays.riskBar.style.backgroundColor = this.getErrorColor(risk);

        // Crunch Bar
        const crunch = this.model.crunchProb;
        this.elements.displays.crunchBar.style.width = crunch + '%';
        // Crunch is always bad (red)
        this.elements.displays.crunchBar.style.backgroundColor = crunch > 50 ? 'var(--color-status-danger)' : 'var(--color-status-warning)';
        this.elements.displays.crunchValue.textContent = crunch + '%';
    }

    updateTheme(score) {
        let color, label, riskText;

        if (score >= CONFIG.THRESHOLDS.SAFE) {
            color = 'var(--color-status-safe)';
            label = 'Flexible';
            riskText = 'Low Risk';
        } else if (score >= CONFIG.THRESHOLDS.CAUTION) {
            color = 'var(--color-status-warning)';
            label = 'Strained';
            riskText = 'Medium Risk';
        } else {
            color = 'var(--color-status-danger)';
            label = 'Rigid';
            riskText = 'High Risk';
        }

        this.elements.displays.label.textContent = label;
        this.elements.displays.label.style.color = color;
        this.elements.displays.label.style.borderColor = color;
        this.elements.displays.label.style.backgroundColor = color.replace(')', ', 0.1)'); // Rough hack for opacity

        this.elements.displays.riskValue.textContent = riskText;
        this.elements.displays.riskValue.style.color = color;

        this.elements.displays.interpretation.textContent = this.getInterpretation(score);
    }

    getInterpretation(score) {
        if (score > 85) return "Excellent specificity. Team has autonomy to navigate challenges.";
        if (score > 70) return "Good balance. Minor setbacks can be absorbed safely.";
        if (score > 50) return "Tight margins. Efficiency is required; scope creep is dangerous.";
        if (score > 30) return "Fragile state. One mistake will cause a missed deadline.";
        return "Unrealistic. Failure is mathematically probable. Renegotiate immediately.";
    }

    getErrorColor(val) {
        if (val < 25) return 'var(--color-status-safe)';
        if (val < 55) return 'var(--color-status-warning)';
        return 'var(--color-status-danger)';
    }

    generateInsights() {
        const list = this.elements.displays.insightList;
        list.innerHTML = ''; // Clear current

        const createItem = (text, type = 'info') => {
            const li = document.createElement('li');
            li.className = `insight-item ${type}`;
            li.textContent = text;
            list.appendChild(li);
        };

        // Deep Analysis

        // 1. Zero Buffer Warning
        if (this.model.buffer <= 5) {
            createItem('Buffer Critical: You are operating with zero margin for error.', 'danger');
        }

        // 2. False Urgency (High Urgency, Low Complexity)
        if (this.model.urgency > 8 && this.model.complexity < 4) {
            createItem('False Urgency Detected: High pressure on a simple task. Is this deadline artificial?', 'warning');
        }

        // 3. The Death March (High C, High U, High Urg)
        if (this.model.complexity > 7 && this.model.uncertainty > 7 && this.model.urgency > 7) {
            createItem('Death March Scenario: High complexity, uncertainty, and urgency. Burnout IMMINENT.', 'danger');
        }

        // 4. Analysis Paralysis (High Uncertainty, Low Urgency)
        if (this.model.uncertainty > 8 && this.model.urgency < 4) {
            createItem('Drift Risk: Low urgency and high uncertainty encourages infinite research. Set milestones.', 'info');
        }

        // 5. Positive Reinforcement
        if (this.model.score > 80) {
            createItem('Optimal State: The team has the psychological safety to innovate.', 'info');
        }
    }

    logAction(action, newScore) {
        const delta = newScore - this.lastScore;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        this.history.unshift({
            time: timestamp,
            action: action,
            score: newScore,
            delta: delta
        });

        if (this.history.length > 20) this.history.pop();

        this.lastScore = newScore;
        this.renderHistory();
    }

    renderHistory() {
        const tbody = this.elements.displays.historyList;
        if (!tbody) return;

        tbody.innerHTML = '';

        this.history.forEach(entry => {
            const tr = document.createElement('tr');

            // Delta formatting
            const deltaSign = entry.delta > 0 ? '+' : '';
            const deltaClass = entry.delta > 0 ? 'good' : (entry.delta < 0 ? 'bad' : 'neutral');

            tr.innerHTML = `
                <td class="mono">${entry.time}</td>
                <td>${entry.action}</td>
                <td class="bold">${entry.score}</td>
                <td class="delta ${deltaClass}">${deltaSign}${entry.delta}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    flashAlert(message) {
        // Visual feedback for simulation
        const currentLabel = this.elements.displays.label.textContent;
        this.elements.displays.label.textContent = message;
        setTimeout(() => {
            this.updateTheme(this.model.score); // Revert
        }, 1500);
    }

    openModal() {
        this.elements.modal.text.value = this.model.generateReport();
        this.elements.modal.overlay.classList.add('active');
    }

    closeModal() {
        this.elements.modal.overlay.classList.remove('active');
    }
}

// =============================================================================
// Initialization
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const model = new ElasticityModel();
    const app = new UIController(model);

    // Debug helper
    window.flexApp = app;
    console.log('FlexDeadline v1.3 initialized.');
});
