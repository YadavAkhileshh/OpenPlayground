/**
 * @file controls.js
 * @description Manages UI interactions and updates simulation parameters.
 */

import { PRESETS } from '../simulation/presets.js';

export function setupControls(simulation) {
    const ids = {
        density: 'density-slider',
        accel: 'accel-slider',
        headway: 'headway-slider',
        speed: 'speed-slider',
        chaos: 'chaos-slider',
        reset: 'reset-btn',
        pause: 'pause-btn',
        time: 'time-slider',
        camGlobal: 'cam-global',
        camFollow: 'cam-follow'
    };

    // ... existing wire function ...

    // Setup Presets
    const presetContainer = document.getElementById('preset-buttons');
    if (presetContainer) {
        Object.keys(PRESETS).forEach(key => {
            const preset = PRESETS[key];
            const btn = document.createElement('button');
            btn.textContent = preset.name;
            btn.title = preset.description;
            btn.addEventListener('click', () => {
                applyPreset(simulation, preset);
            });
            presetContainer.appendChild(btn);
        });
    }

    function applyPreset(sim, preset) {
        const p = preset.params;
        sim.setParam('targetDensity', p.targetDensity);
        sim.setParam('a', p.a);
        sim.setParam('T', p.T);
        sim.setParam('v0', p.v0);
        sim.setParam('perturbation', p.perturbation);

        // Update UI sliders
        updateSlider('density-slider', p.targetDensity);
        updateSlider('accel-slider', p.a);
        updateSlider('headway-slider', p.T);
        updateSlider('speed-slider', p.v0);
        updateSlider('chaos-slider', p.perturbation);

        sim.reset(); // Apply cleanly
    }

    function updateSlider(id, val) {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event('input')); // Trigger update
        }
    }


    const displayIds = {
        density: 'density-val',
        accel: 'accel-val',
        headway: 'headway-val',
        speed: 'speed-val',
        chaos: 'chaos-val'
    };

    // Helper to wire up slider
    function wire(id, param, displaySuffix = '') {
        const el = document.getElementById(ids[id]);
        const display = document.getElementById(displayIds[id]);

        if (!el) return;

        // Initial value
        if (display) display.textContent = el.value + displaySuffix;

        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (display) display.textContent = val + displaySuffix;

            // Map specific params
            if (id === 'density') {
                simulation.setParam('targetDensity', val);
            } else if (id === 'accel') {
                simulation.setParam('a', val);
            } else if (id === 'headway') {
                simulation.setParam('T', val);
            } else if (id === 'speed') {
                simulation.setParam('v0', val);
            } else if (id === 'chaos') {
                simulation.setParam('perturbation', val);
            }
        });
    }

    wire('density', 'targetDensity');
    wire('accel', 'a');
    wire('headway', 'T', 's');
    wire('speed', 'v0', ' m/s');
    wire('chaos', 'perturbation', '%');
    wire('time', 'timeScale', 'x');

    // Buttons
    document.getElementById(ids.reset).addEventListener('click', () => {
        simulation.reset();
    });

    const pauseBtn = document.getElementById(ids.pause);
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            simulation.toggle();
            pauseBtn.textContent = simulation.isRunning ? 'Pause' : 'Resume';
            pauseBtn.classList.toggle('active', !simulation.isRunning);
        });
    }

    // Camera Controls
    // We need access to renderer, but setupControls only takes simulation from main.js call
    // We can emit event or attach to simulation if simulation holds renderer? No, separate.
    // Better: pass a callback or specific object for camera control?
    // Or just dispatch custom events on window?
    const camGlobalBtn = document.getElementById(ids.camGlobal);
    const camFollowBtn = document.getElementById(ids.camFollow);

    if (camGlobalBtn) {
        camGlobalBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('camera-change', { detail: { mode: 'global' } }));
            setActiveCamBtn(camGlobalBtn);
        });
    }

    if (camFollowBtn) {
        camFollowBtn.addEventListener('click', () => {
            // Pick random vehicle
            const vehicles = simulation.vehicles;
            if (vehicles.length > 0) {
                const randomId = vehicles[Math.floor(Math.random() * vehicles.length)].id;
                window.dispatchEvent(new CustomEvent('camera-change', { detail: { mode: 'follow', targetId: randomId } }));
                setActiveCamBtn(camFollowBtn);
            }
        });
    }

    function setActiveCamBtn(activeBtn) {
        [camGlobalBtn, camFollowBtn].forEach(btn => {
            if (btn) btn.classList.remove('primary');
        });
        if (activeBtn) activeBtn.classList.add('primary');
    }
}

/**
 * Updates the stats display.
 * @param {Object} stats - { avgSpeed, flow, jamFactor }
 */
export function updateStats(stats) {
    document.getElementById('stat-avg-speed').textContent = stats.avgSpeed.toFixed(1) + ' km/h';
    document.getElementById('stat-flow').textContent = stats.flow.toFixed(0) + ' veh/min';

    // Colorize jam factor
    const jamEl = document.getElementById('stat-jam');
    jamEl.textContent = (stats.jamFactor * 100).toFixed(0) + '%';

    if (stats.jamFactor > 0.5) jamEl.style.color = '#ff0055';
    else if (stats.jamFactor > 0.2) jamEl.style.color = '#ffaa00';
    else jamEl.style.color = '#00ffaa';
}
