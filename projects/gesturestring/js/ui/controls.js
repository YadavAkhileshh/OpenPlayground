/**
 * Controls Module
 * Handles UI interactions and parameter adjustments.
 */

export class Controls {
    constructor(engine) {
        this.engine = engine;
        this.isVisible = true;
        this.init();
    }

    init() {
        // Here we could attach listeners to sliders if we had them
        // For now, let's implement keyboard shortcuts

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'c':
                this.engine.clearRibbons();
                break;
            case 'h':
                this.toggleHUD();
                break;
            case ' ':
                // Pause physics?
                // this.engine.togglePause();
                break;
        }
    }

    toggleHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            this.isVisible = !this.isVisible;
            hud.style.opacity = this.isVisible ? '1' : '0';
            hud.style.pointerEvents = this.isVisible ? 'auto' : 'none';
        }
    }
}
