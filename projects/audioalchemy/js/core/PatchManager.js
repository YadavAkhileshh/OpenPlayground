/**
 * PatchManager Class.
 * Handles the logic for connecting modules via virtual patch cables.
 * Manages the state of connections, handles mouse drag interactions for cables,
 * and updates the underlying Web Audio graph when connections are made or broken.
 */
export class PatchManager {
    constructor(audioEngine, cableRenderer) {
        this.audioEngine = audioEngine;
        this.renderer = cableRenderer;
        this.cables = []; // { sourceModule, sourcePort, destModule, destPort, color }
        this.tempCable = null; // { startX, startY, currentX, currentY }
        this.modules = {}; // Map<id, ModuleInstance>

        this.initInteraction();
        this.colors = ['#ff9f1c', '#2ec4b6', '#e71d36', '#ff5400', '#3a86ff', '#8338ec'];
    }

    registerModule(module) {
        this.modules[module.id] = module;
    }

    initInteraction() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('jack')) {
                this.handleJackDown(e.target);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.tempCable) {
                this.tempCable.currentX = e.clientX;
                this.tempCable.currentY = e.clientY;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.tempCable) {
                // Check if released over a valid target jack
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (target && target.classList.contains('jack')) {
                    this.completeConnection(this.tempCable.originJack, target);
                }
                this.tempCable = null;
            }
        });

        // Listen for Sequencer Gate Trigger Events (Global fake bus or direct coupled)
        // For strict modularity, we might need a better event bus, 
        // but since we have direct module references, we handle routing in completeConnection.
    }

    handleJackDown(jack) {
        const rect = jack.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // If clicking an input that is already connected, disconnect it (drag connection away)
        const type = jack.dataset.type;
        if (type === 'in') {
            const existingIndex = this.cables.findIndex(c =>
                c.destModule.id === jack.dataset.moduleId && c.destPort === jack.dataset.port
            );

            if (existingIndex !== -1) {
                // Found existing cable. Disconnect it and start dragging from its SOURCE
                const cable = this.cables[existingIndex];

                // Disconnect audio
                cable.sourceModule.disconnect(cable.sourcePort, cable.destModule, cable.destPort);

                // Remove from list
                this.cables.splice(existingIndex, 1);

                // Start dragging from the source jack instead
                // Find source jack DOM element?
                // We don't have direct ref to DOM element in cable struct usually...
                // Only if we stored it. 
                // Workaround: We just start a new temp cable from the SOURCE coordinates.
                // We need to look up the source jack position.
                const sourceJack = document.querySelector(`.jack[data-module-id="${cable.sourceModule.id}"][data-port="${cable.sourcePort}"]`);
                if (sourceJack) {
                    const sRect = sourceJack.getBoundingClientRect();
                    this.tempCable = {
                        originJack: sourceJack,
                        startX: sRect.left + sRect.width / 2,
                        startY: sRect.top + sRect.height / 2,
                        currentX: centerX, // Start at mouse pos
                        currentY: centerY,
                        color: cable.color
                    };
                    return;
                }
            }
        }

        // Standard new connection start
        this.tempCable = {
            originJack: jack,
            startX: centerX,
            startY: centerY,
            currentX: centerX,
            currentY: centerY,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        };
    }

    completeConnection(originJack, targetJack) {
        const originType = originJack.dataset.type;
        const targetType = targetJack.dataset.type;

        // Validation: Must be In -> Out or Out -> In
        if (originType === targetType) return;

        // Determine which is source and which is dest
        let sourceJack = originType === 'out' ? originJack : targetJack;
        let destJack = originType === 'in' ? originJack : targetJack;

        const sourceModId = sourceJack.dataset.moduleId;
        const sourcePort = sourceJack.dataset.port;
        const destModId = destJack.dataset.moduleId;
        const destPort = destJack.dataset.port;

        // Recursion/Self-patch check? (Audio API allows feedback loops, but let's allow it)

        const sourceModule = this.modules[sourceModId];
        const destModule = this.modules[destModId];

        if (!sourceModule || !destModule) return;

        // Check if destination is already connected? 
        // Inputs usually accept one cable (unless we have a mixer). 
        // Web Audio allows multiple, but standard synths usually replace.
        // Let's replace.
        const existingIdx = this.cables.findIndex(c => c.destModule === destModule && c.destPort === destPort);
        if (existingIdx !== -1) {
            const oldLink = this.cables[existingIdx];
            oldLink.sourceModule.disconnect(oldLink.sourcePort, oldLink.destModule, oldLink.destPort);
            this.cables.splice(existingIdx, 1);
        }

        // Connect Logic
        const success = sourceModule.connect(sourcePort, destModule, destPort);

        if (success || success === undefined) {
            // success is undefined because connect returns void/boolean depending on impl. 
            // Our BaseModule returns true/false.
            this.cables.push({
                sourceModule,
                sourcePort,
                destModule,
                destPort,
                color: this.tempCable.color
            });

            // Special Loop: If connecting Gate from Sequencer to VCA
            // We need to register the callback.
            // This is "magic" logic that simulates CV.
            if (sourceModule.name === 'SEQUENCER' && destPort === 'gate') {
                // Sequencer outputs triggers logic
                // If VCA has a gate input method...
                if (destModule.gateInput && sourcePort === 'gate') {
                    // We need to tell sequencer to call this.
                    sourceModule.setGateCallback((t, type) => destModule.gateInput.trigger(t, type));
                }
            }
        }
    }

    // Called by renderer
    getCables() {
        // We need real-time coordinates for drawn cables
        // This is expensive to query DOM every frame? 
        // Better: Cache coords and update on resize. 
        // for MVP: Query DOM is fine for < 20 cables.

        return this.cables.map(c => {
            const sEl = document.querySelector(`.jack[data-module-id="${c.sourceModule.id}"][data-port="${c.sourcePort}"]`);
            const dEl = document.querySelector(`.jack[data-module-id="${c.destModule.id}"][data-port="${c.destPort}"]`);
            if (!sEl || !dEl) return null;

            const r1 = sEl.getBoundingClientRect();
            const r2 = dEl.getBoundingClientRect();

            return {
                x1: r1.left + r1.width / 2,
                y1: r1.top + r1.height / 2,
                x2: r2.left + r2.width / 2,
                y2: r2.top + r2.height / 2,
                color: c.color
            };
        }).filter(Boolean);
    }

    getTempCable() {
        return this.tempCable;
    }

    clearAll() {
        this.cables.forEach(c => {
            c.sourceModule.disconnect(c.sourcePort, c.destModule, c.destPort);
        });
        this.cables = [];
    }
}
