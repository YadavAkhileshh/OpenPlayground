/* js/utils/profiler.js */
export class Profiler {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.entityCount = 0;

        this.panel = document.createElement('div');
        this.panel.style.position = 'fixed';
        this.panel.style.bottom = '10px';
        this.panel.style.left = '10px';
        this.panel.style.background = 'rgba(0, 0, 0, 0.7)';
        this.panel.style.color = '#0f0';
        this.panel.style.padding = '10px';
        this.panel.style.fontFamily = 'monospace';
        this.panel.style.fontSize = '12px';
        this.panel.style.pointerEvents = 'none';
        this.panel.style.zIndex = '9999';

        document.body.appendChild(this.panel);
    }

    update(entityCount) {
        this.frames++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
        }

        this.entityCount = entityCount;
        this.render();
    }

    render() {
        this.panel.innerHTML = `
            FPS: ${this.fps}<br>
            Entities: ${this.entityCount}<br>
            Memory: ${performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 'N/A'} MB
        `;
    }
}
