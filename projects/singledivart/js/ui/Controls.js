/**
 * Controls - UI Event Handlers
 */

const Controls = (() => {

    const presetsList = [
        { id: 'noise', name: 'Noise Flow', color: '#00ff88' },
        { id: 'shape', name: 'Geometry', color: '#ff00ff' },
        { id: 'fractal', name: 'Mandelbrot', color: '#0088ff' },
        { id: 'gradient', name: 'Prism', color: '#ffff00' }
    ];

    /**
     * Initialize all UI controls
     */
    const init = () => {
        setupSliders();
        setupPresets();
        setupButtons();
        console.log("Controls Initialized");
    };

    const setupSliders = () => {
        const sliders = [
            { id: 'resolution', key: 'resolution' },
            { id: 'complexity', key: 'complexity' },
            { id: 'scale', key: 'scale' }
        ];

        sliders.forEach(s => {
            const el = document.getElementById(s.id);
            const display = el.nextElementSibling;

            el.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                display.textContent = s.id === 'scale' ? `${val}x` : s.id === 'resolution' ? `${val}px` : `${val}%`;
                Engine.updateState(s.key, val);
            });
        });
    };

    const setupPresets = () => {
        const container = document.getElementById('presets');
        if (!container) return;

        presetsList.forEach(p => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.title = p.name;
            card.dataset.id = p.id;

            const preview = document.createElement('div');
            preview.className = 'preset-preview';
            preview.style.backgroundColor = p.color;
            if (p.id === 'noise') card.classList.add('active');

            card.appendChild(preview);
            card.addEventListener('click', () => {
                document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                Engine.updateState('currentPreset', p.id);
                Engine.generate();
            });

            container.appendChild(card);
        });
    };

    const setupButtons = () => {
        document.getElementById('generate-btn').addEventListener('click', () => {
            Engine.generate();
        });

        document.getElementById('export-css').addEventListener('click', () => {
            const state = Engine.getState();
            const cssText = Renderer.getCSSText(state.pixels, { scale: state.scale });

            // Simple download/copy logic
            const blob = new Blob([cssText], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'singlediv-art.css';
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return {
        init
    };

})();

window.Controls = Controls;
