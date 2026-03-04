/**
 * MarchingMesher — Main Application
 *
 * 7 new features implemented here:
 *  1. Screenshot capture (saves canvas as PNG)
 *  2. Pause/Resume (Space key)
 *  3. Metaball count control (slider rebuilds scene)
 *  4. Auto-rotate camera toggle
 *  5. Show/hide metaball centers (debug markers)
 *  6. Color theme switcher (4 themes)
 *  7. Gravity attractor (right-click in viewport)
 *
 * All previously-broken UI controls are wired up correctly.
 */
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    //  DOM refs
    // =============================================
    const canvas = document.getElementById('canvas');
    const introOverlay = document.getElementById('intro-overlay');

    // Stats
    const fpsDis = document.getElementById('fps-display');
    const triDis = document.getElementById('tri-display');
    const vertDis = document.getElementById('vert-display');
    const msDis = document.getElementById('frame-ms-display');

    // Sliders
    const isoSlider = document.getElementById('iso-slider');
    const isoVal = document.getElementById('iso-value');
    const speedSlider = document.getElementById('speed-slider');
    const speedVal = document.getElementById('speed-value');
    const ballCountSlider = document.getElementById('ball-count-slider');
    const ballCountVal = document.getElementById('ball-count-value');
    const ambientSlider = document.getElementById('ambient-slider');
    const ambientVal = document.getElementById('ambient-value');
    const specularSlider = document.getElementById('specular-slider');
    const specularVal = document.getElementById('specular-value');
    const rimSlider = document.getElementById('rim-slider');
    const rimVal = document.getElementById('rim-value');

    // Selects
    const resSelect = document.getElementById('resolution-select');
    const renderModeSelect = document.getElementById('render-mode-select');
    const colorThemeSelect = document.getElementById('color-theme-select');

    // Toggles
    const floorToggle = document.getElementById('floor-toggle');
    const ballsToggle = document.getElementById('balls-toggle');
    const autorotToggle = document.getElementById('autorotate-toggle');

    // Buttons
    const btnScreenshot = document.getElementById('btn-screenshot');
    const btnReset = document.getElementById('btn-reset');

    // =============================================
    //  App state
    // =============================================
    let scalarField, mesher, cam, renderer;
    let paused = false;
    let lastTime = performance.now();
    let frameMs = 0;
    let running = false;

    // FPS tracking
    const fpsBuf = new Float32Array(30);
    let fpsIdx = 0;

    // Mouse
    const mouse = { down: false, x: 0, y: 0 };

    // Feature 7 — attractor
    let attractorMode = false;

    // =============================================
    //  Canvas resize — must be done BEFORE init
    // =============================================
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (renderer) renderer.resize(canvas.width, canvas.height);
    }

    // =============================================
    //  Init — wrapped in try/catch
    // =============================================
    function init() {
        try {
            resizeCanvas();

            const res = parseInt(resSelect.value);
            const balls = parseInt(ballCountSlider.value);

            scalarField = new ScalarField(res, 50);
            _spawnBalls(balls);

            mesher = new MarchingCubes(scalarField);
            cam = new Camera();
            renderer = new Renderer(canvas);
            renderer.resize(canvas.width, canvas.height);

            _syncRendererToUI();
            _bindEvents();

            // Always hide overlay — use short timeout for visual effect
            setTimeout(() => {
                if (introOverlay) introOverlay.classList.add('hidden');
            }, 600);

            // Start loop
            if (!running) {
                running = true;
                lastTime = performance.now();
                requestAnimationFrame(_loop);
            }
        } catch (err) {
            console.error('MarchingMesher init error:', err);
            // Still hide overlay so UI is visible even if 3D fails
            if (introOverlay) introOverlay.classList.add('hidden');
        }
    }

    function _spawnBalls(count) {
        scalarField.clearMetaballs();
        for (let i = 0; i < count; i++) {
            const r = 9 + Math.random() * 7;
            const s = 0.5 + Math.random() * 1.2;
            scalarField.addMetaball(r, s);
        }
    }

    // =============================================
    //  Main loop
    // =============================================
    function _loop(ts) {
        try {
            const t0 = performance.now();

            let dt = (ts - lastTime) / 1000;
            lastTime = ts;
            dt = Math.min(dt, 0.05); // cap at 50ms

            if (!paused) {
                const spd = parseFloat(speedSlider.value);
                scalarField.update(dt * spd);
            }

            const iso = parseFloat(isoSlider.value);
            mesher.generate(iso);

            cam.update();
            const stats = renderer.render(mesher, scalarField, cam);

            // Update stats display
            frameMs = performance.now() - t0;
            fpsBuf[fpsIdx % 30] = dt > 0 ? (1 / dt) : 60;
            fpsIdx++;

            let fpsSum = 0;
            for (let i = 0; i < 30; i++) fpsSum += fpsBuf[i];
            const avg = fpsSum / 30;

            if (fpsDis) fpsDis.textContent = avg.toFixed(0);
            if (triDis) triDis.textContent = stats.triCount;
            if (vertDis) vertDis.textContent = stats.vertCount;
            if (msDis) msDis.textContent = frameMs.toFixed(1);

        } catch (err) {
            console.error('Loop error:', err);
        }

        requestAnimationFrame(_loop);
    }

    // =============================================
    //  Event Binding
    // =============================================
    function _bindEvents() {

        // --- Canvas mouse orbit ---
        canvas.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            mouse.down = true;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseup', () => { mouse.down = false; });
        window.addEventListener('mousemove', e => {
            if (!mouse.down) return;
            cam.rotate(e.clientX - mouse.x, e.clientY - mouse.y);
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Zoom
        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            cam.zoom(e.deltaY);
        }, { passive: false });

        // Touch: pinch to zoom + drag to orbit
        let lastTouchDist = 0;
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            if (e.touches.length === 1) {
                mouse.down = true;
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (e.touches.length === 1 && mouse.down) {
                cam.rotate(e.touches[0].clientX - mouse.x, e.touches[0].clientY - mouse.y);
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const d = Math.sqrt(dx * dx + dy * dy);
                cam.zoom(lastTouchDist - d);
                lastTouchDist = d;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => { mouse.down = false; });

        // --- Window resize ---
        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        // --- Keyboard shortcuts ---
        window.addEventListener('keydown', e => {
            // Feature 2: Space = pause/resume
            if (e.code === 'Space') {
                e.preventDefault();
                paused = !paused;
            }
            // [R] = reset
            if (e.code === 'KeyR') _reset();
            // [A] = toggle attractor
            if (e.code === 'KeyA') {
                attractorMode = !attractorMode;
                scalarField.useAttractor = attractorMode;
            }
            // [W] = cycle render modes
            if (e.code === 'KeyW') {
                const modes = ['shaded', 'wireframe', 'xray'];
                const idx = modes.indexOf(renderer.mode);
                renderer.mode = modes[(idx + 1) % modes.length];
                renderModeSelect.value = renderer.mode;
            }
        });

        // Feature 7: Right-click sets gravity attractor position
        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
            const x = (e.clientX - renderer.halfW) / cam.focalLen * cam.radius * 0.4;
            const y = -(e.clientY - renderer.halfH) / cam.focalLen * cam.radius * 0.4;
            scalarField.attractorPos.set(x * 1.5, y * 0.8, 0);
            scalarField.useAttractor = true;
            attractorMode = true;
        });

        // --- Slider: ISO ---
        isoSlider.addEventListener('input', e => {
            isoVal.textContent = parseFloat(e.target.value).toFixed(2);
        });

        // --- Slider: Speed ---
        speedSlider.addEventListener('input', e => {
            speedVal.textContent = parseFloat(e.target.value).toFixed(1);
        });

        // --- Slider: Ball count (Feature 3) ---
        ballCountSlider.addEventListener('input', e => {
            const c = parseInt(e.target.value);
            ballCountVal.textContent = c;
            _spawnBalls(c);
        });

        // --- Slider: Ambient ---
        ambientSlider.addEventListener('input', e => {
            const v = parseFloat(e.target.value);
            renderer.ambient = v;
            ambientVal.textContent = v.toFixed(2);
        });

        // --- Slider: Specular ---
        specularSlider.addEventListener('input', e => {
            const v = parseFloat(e.target.value);
            renderer.specPower = v;
            specularVal.textContent = v.toFixed(1);
        });

        // --- Slider: Rim ---
        rimSlider.addEventListener('input', e => {
            const v = parseFloat(e.target.value);
            renderer.rimPower = v;
            rimVal.textContent = v.toFixed(1);
        });

        // --- Select: Resolution ---
        resSelect.addEventListener('change', e => {
            const res = parseInt(e.target.value);
            const balls = parseInt(ballCountSlider.value);
            scalarField = new ScalarField(res, 50);
            _spawnBalls(balls);
            mesher.field = scalarField;
        });

        // --- Select: Render Mode (Feature 6 part) ---
        renderModeSelect.addEventListener('change', e => {
            renderer.mode = e.target.value;
        });

        // --- Select: Color Theme (Feature 6) ---
        colorThemeSelect.addEventListener('change', e => {
            renderer.theme = e.target.value;
        });

        // --- Toggle: Floor ---
        floorToggle.addEventListener('change', e => {
            renderer.showFloor = e.target.checked;
        });

        // --- Toggle: Show Balls (Feature 5) ---
        ballsToggle.addEventListener('change', e => {
            renderer.showBalls = e.target.checked;
        });

        // --- Toggle: Auto-rotate (Feature 4) ---
        autorotToggle.addEventListener('change', e => {
            cam.autoRotate = e.target.checked;
        });

        // Feature 1: Screenshot
        btnScreenshot.addEventListener('click', () => {
            _takeScreenshot();
        });

        // Reset
        btnReset.addEventListener('click', _reset);
    }

    // =============================================
    //  Helpers
    // =============================================

    function _syncRendererToUI() {
        renderer.mode = renderModeSelect.value;
        renderer.theme = colorThemeSelect.value;
        renderer.showFloor = floorToggle.checked;
        renderer.showBalls = ballsToggle.checked;
        renderer.ambient = parseFloat(ambientSlider.value);
        renderer.specPower = parseFloat(specularSlider.value);
        renderer.rimPower = parseFloat(rimSlider.value);
        cam.autoRotate = autorotToggle.checked;
    }

    /** Feature 1: Screenshot — download canvas as PNG */
    function _takeScreenshot() {
        try {
            const link = document.createElement('a');
            link.download = 'marching-mesher-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Screenshot failed:', e);
        }
    }

    function _reset() {
        const balls = parseInt(ballCountSlider.value);
        _spawnBalls(balls);
        if (cam) {
            cam.theta = 0.4;
            cam.phi = Math.PI / 3;
            cam.radius = 65;
        }
        attractorMode = false;
        if (scalarField) scalarField.useAttractor = false;
    }

    // =============================================
    //  Boot
    // =============================================
    init();

});
