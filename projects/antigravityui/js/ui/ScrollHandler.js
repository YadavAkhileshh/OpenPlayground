// js/ui/ScrollHandler.js
import { Vector2D } from '../core/Vector2D.js';

export class ScrollHandler {
    constructor(engine) {
        this.engine = engine;
        this.scrollVelocity = new Vector2D(0, 0);
        this.multiplier = 0.5;
        this.initEvents();
    }

    initEvents() {
        window.addEventListener('wheel', (e) => {
            // Inject lateral forces based on scroll delta
            // wheel delta usually represents scroll amount
            this.scrollVelocity.x -= e.deltaX * this.multiplier;
            this.scrollVelocity.y -= e.deltaY * this.multiplier;

            // Limit the instantaneous scroll injection
            this.scrollVelocity.limit(50);

            this.engine.setScrollInfo(this.scrollVelocity);
        }, { passive: true });

        // Touch panning also injects force
        let lastTouchY = 0;
        let lastTouchX = 0;

        window.addEventListener('touchstart', (e) => {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const deltaX = lastTouchX - e.touches[0].clientX;
                const deltaY = lastTouchY - e.touches[0].clientY;

                this.scrollVelocity.x -= deltaX * this.multiplier * 0.5;
                this.scrollVelocity.y -= deltaY * this.multiplier * 0.5;

                this.scrollVelocity.limit(50);
                this.engine.setScrollInfo(this.scrollVelocity);

                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        }, { passive: false });
    }
}
