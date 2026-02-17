/**
 * @file main.js
 * @description Entry point for the MatrixMirror application.
 * Initializes core systems and orchestrates the render loop.
 */

import { VideoSource } from './video/VideoSource.js';
import { AsciiMapper } from './engine/AsciiMapper.js';
import { MatrixRenderer } from './engine/MatrixRenderer.js';
import { UIController } from './ui/UIController.js';
import { DigitalRain } from './effects/DigitalRain.js';
import { EventBus } from './core/EventBus.js';
import { Configuration } from './core/Configuration.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import { HelpOverlay } from './ui/HelpOverlay.js';

class App {
    constructor() {
        console.log('System booting...');

        // 1. Core Systems
        this.bus = new EventBus();
        this.config = new Configuration(this.bus);

        // 2. Performance Tracking
        this.perf = null; // Instantiated after UI

        this.lastTime = 0;

        this.init();
    }

    async init() {
        try {
            // 3. Video Input
            this.videoSource = new VideoSource();
            await this.videoSource.initialize();

            // 4. Engine
            this.asciiMapper = new AsciiMapper();

            // 5. Renderer
            this.renderer = new MatrixRenderer(
                document.getElementById('ascii-canvas'),
                this.config.get('ascii') // Pass initial config
            );

            // 6. Effects
            this.digitalRain = new DigitalRain(
                this.renderer.context,
                this.config.get('effects')
            );

            // 7. UI & Overlays
            this.ui = new UIController(this);
            this.perf = new PerformanceMonitor(this.ui);
            this.help = new HelpOverlay();

            // 8. Event Listeners regarding Config
            this.setupConfigListeners();

            // 9. Start Loop
            this.startLoop();

        } catch (error) {
            console.error('System Failure:', error);
            document.body.innerHTML = \`<h1 style="color:red;text-align:center;margin-top:20%">CRITICAL FAILURE: \${error.message}</h1>\`;
        }
    }

    setupConfigListeners() {
        // When density changes, renderer needs resize
        this.bus.on('config:changed:ascii', (asciiConfig) => {
            if (asciiConfig.density !== this.renderer.config.density) {
                this.renderer.config.density = asciiConfig.density;
                this.renderer.resize();
            }
        });

        // Effect toggles
        this.bus.on('config:changed:effects', (effects) => {
           this.digitalRain.config = effects;
        });
    }

    startLoop() {
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(currentTime) {
        if (!this.perf) return; // Wait for init
        this.perf.startFrame();
        
        const delta = currentTime - this.lastTime;
        const targetFPS = this.config.get('render.fps');
        
        if (delta >= (1000 / targetFPS)) {
            
            this.perf.markProcessStart();
            
            // 1. Get Configs
            const asciiConfig = this.config.get('ascii');
            const renderConfig = this.config.get('render');
            
            // 2. Video Capture (Resized to grid)
            const frameData = this.videoSource.getFrameData(
                this.renderer.cols, 
                this.renderer.rows
            );

            // 3. ASCII Mapping
            const asciiGrid = this.asciiMapper.mapFrame(
                frameData, 
                this.renderer.cols, 
                this.renderer.rows,
                asciiConfig
            );
            
            this.perf.markProcessEnd();
            this.perf.markRenderStart();

            // 4. Rendering
            this.renderer.clear(renderConfig.phosphorFade);
            
            // Background Rain
            if (this.config.get('effects.digitalRain')) {
                this.digitalRain.update(delta);
            }

            // Draw Video ASCII
            this.renderer.render(asciiGrid, renderConfig);
            
            // Foreground Rain (Overlay)
            if (this.config.get('effects.digitalRain')) {
               this.digitalRain.draw(); 
            }

            this.perf.markRenderEnd(this.digitalRain.streams.length);

            // 5. Stats
            this.ui.updateStats(delta); // Keeps existing FPS counter too

            this.lastTime = currentTime;
        }

        requestAnimationFrame((time) => this.loop(time));
    }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
