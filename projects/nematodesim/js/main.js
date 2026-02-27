// NematodeSim — Application Entry Point
// Initialises the canvas, simulation engine, and control panel,
// then starts the RAF loop. Also handles window resize events.

import { SimulationEngine } from './sim/SimulationEngine.js';
import { ControlPanel } from './ui/ControlPanel.js';

/** Wait for DOM to be fully ready. */
function onReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
        fn();
    }
}

onReady(() => {
    // ── Canvas setup ─────────────────────────────────────────────────────────
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) {
        console.error('[NematodeSim] Canvas element #sim-canvas not found.');
        return;
    }

    function sizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    sizeCanvas();

    // ── Engine ───────────────────────────────────────────────────────────────
    const engine = new SimulationEngine(canvas);
    engine.init();

    // ── Controls ─────────────────────────────────────────────────────────────
    const panel = new ControlPanel(engine);

    // ── Start ────────────────────────────────────────────────────────────────
    engine.start();

    // ── Resize handler ───────────────────────────────────────────────────────
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            sizeCanvas();
            engine.resize(canvas.width, canvas.height);
        }, 150);
    });

    // ── Keyboard shortcuts ───────────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                // Toggle pause
                const pauseBtn = document.getElementById('pause-btn');
                if (pauseBtn) pauseBtn.click();
                break;
            case 'd':
            case 'D':
                // Toggle drag visualization
                const dragBtn = document.getElementById('drag-toggle');
                if (dragBtn) dragBtn.click();
                break;
            case 'ArrowUp':
                e.preventDefault();
                {
                    const sl = document.getElementById('freq-slider');
                    if (sl) {
                        sl.value = Math.min(parseFloat(sl.max), parseFloat(sl.value) + 0.1);
                        sl.dispatchEvent(new Event('input'));
                    }
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                {
                    const sl = document.getElementById('freq-slider');
                    if (sl) {
                        sl.value = Math.max(parseFloat(sl.min), parseFloat(sl.value) - 0.1);
                        sl.dispatchEvent(new Event('input'));
                    }
                }
                break;
        }
    });

    console.log('[NematodeSim] Initialized. Press SPACE to pause, D for drag viz, ↑↓ frequency.');
});
