import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';
import { MusicUtils } from '../utils/MusicUtils.js';

export class Sequencer extends BaseModule {
    constructor(container) {
        super("SEQUENCER");
        this.container = container;

        this.steps = 8;
        this.currentStep = 0;
        this.bpm = 120;
        this.isPlaying = false;
        this.nextNoteTime = 0.0;
        this.timerID = null;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // sec

        // Step Data (Pitch: 0-1)
        this.stepData = new Array(8).fill(0.5); // Default mid pitch
        this.gateData = new Array(8).fill(true); // All active

        this.outputs['pitch'] = audioCtx.createConstantSource(); // CV Out
        this.outputs['pitch'].start();

        // Gate output is handled via direct method invocation in PatchManager
        // but we'll expose a dummy node for connection logic
        this.outputs['gate'] = { isGate: true };

        this.initUI();
    }

    initUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "32"; // Wide
        this.id = "SEQ_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">8-STEP SEQ</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        // BPM Control
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';

        new Knob(topRow, "BPM", 120, 40, 300, v => {
            this.bpm = v;
            document.getElementById('global-bpm').textContent = Math.round(v);
        });

        const runBtn = document.createElement('button');
        runBtn.textContent = "RUN";
        runBtn.className = "seq-run-btn";
        runBtn.style.padding = "5px 15px";
        runBtn.style.background = "#333";
        runBtn.style.color = "#fff";
        runBtn.style.border = "1px solid #555";
        runBtn.onclick = () => this.toggleRun();
        topRow.appendChild(runBtn);
        this.runBtn = runBtn;

        content.appendChild(topRow);

        // Steps UI
        const grid = document.createElement('div');
        grid.className = 'seq-grid';
        grid.style.gridTemplateColumns = `repeat(8, 1fr)`;

        this.stepEls = [];

        for (let i = 0; i < 8; i++) {
            const stepBox = document.createElement('div');
            stepBox.style.display = 'flex';
            stepBox.style.flexDirection = 'column';
            stepBox.style.alignItems = 'center';

            // Pitch Knob (Small)
            const knobContainer = document.createElement('div');
            knobContainer.style.transform = "scale(0.7)";
            new Knob(knobContainer, "", 0.5, 0, 1, v => this.stepData[i] = v);
            stepBox.appendChild(knobContainer);

            // Gate Button
            const gateBtn = document.createElement('div');
            gateBtn.className = 'led on';
            gateBtn.style.cursor = 'pointer';
            gateBtn.onclick = () => {
                this.gateData[i] = !this.gateData[i];
                gateBtn.className = this.gateData[i] ? 'led on' : 'led';
            };
            stepBox.appendChild(gateBtn);

            // LED Indicator (Current Step)
            const indicator = document.createElement('div');
            indicator.style.width = "100%";
            indicator.style.height = "4px";
            indicator.style.background = "#222";
            indicator.style.marginTop = "5px";
            stepBox.appendChild(indicator);

            this.stepEls.push({ indicator, gateBtn });
            grid.appendChild(stepBox);
        }
        content.appendChild(grid);

        // Jacks
        const jackBox = document.createElement('div');
        jackBox.style.display = "flex";
        jackBox.style.justifyContent = "space-around";
        jackBox.style.width = "100%";
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">PITCH</span><div class="jack" data-module-id="${this.id}" data-port="pitch" data-type="out"></div></div>
            <div class="jack-container"><span class="jack-label">GATE</span><div class="jack" data-module-id="${this.id}" data-port="gate" data-type="out"></div></div>
        `;
        content.appendChild(jackBox);

        panel.appendChild(content);
        this.container.appendChild(panel);
    }

    toggleRun() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.runBtn.style.background = "#333";
            this.runBtn.textContent = "RUN";
            clearTimeout(this.timerID);
        } else {
            this.isPlaying = true;
            this.runBtn.style.background = "var(--accent-primary)";
            this.runBtn.textContent = "STOP";
            this.nextNoteTime = audioCtx.time + 0.1;
            this.timer();
        }
    }

    timer() {
        if (!this.isPlaying) return;

        // Schedule items
        while (this.nextNoteTime < audioCtx.time + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextNote();
        }

        this.timerID = setTimeout(() => this.timer(), this.lookahead);
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        // 8th notes
        this.nextNoteTime += 0.5 * secondsPerBeat;
        this.currentStep = (this.currentStep + 1) % 8;
    }

    scheduleNote(step, time) {
        // Visual Update
        const drawTime = (time - audioCtx.time) * 1000;
        setTimeout(() => {
            this.stepEls.forEach((el, i) => {
                el.indicator.style.background = (i === step) ? "#fff" : "#222";
            });
        }, Math.max(0, drawTime));

        // Audio Update
        if (this.gateData[step]) {
            // Quantize pitch
            const freq = MusicUtils.quantize(this.stepData[step], 48, 'MINOR', 2);
            this.outputs['pitch'].offset.setValueAtTime(freq, time);

            // Trigger Gate
            this.triggerGate(time);
        }
    }

    // This will be accessible by PatchManager to push events to connected modules
    setGateCallback(cb) {
        this.gateCallback = cb;
    }

    triggerGate(time) {
        if (this.gateCallback) {
            this.gateCallback(time, 1); // Note On
            this.gateCallback(time + 0.1, 0); // Note Off
        }
    }
}
