/**
 * InteractionManager
 * Handles mouse and touch events to drive the parallax effect.
 * Uses Vector3 for coordinate math to ensure smooth interpolation.
 */
class InteractionManager {
    /**
     * Creates a new InteractionManager instance.
     * Initializes vectors for mouse position and rotation targets.
     */
    constructor() {
        this.stage = Utils.qs('.stage');
        this.container = Utils.qs('#hologram-container');

        // Screen dimensions for normalization
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        // Use Vector3 for state storage
        this.mousePos = new Vector3(0, 0, 0);
        this.targetRotation = new Vector3(0, 0, 0);
        this.currentRotation = new Vector3(0, 0, 0);

        // Configuration
        this.maxRotation = 30; // degrees
    }

    /**
     * Initializes event listeners for mouse and touch interaction.
     */
    init() {
        // Event Listeners
        document.addEventListener('mousemove', this.onMouseMove.bind(this)); // Bound for correct 'this' context
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        window.addEventListener('resize', this.onResize.bind(this));

        console.log('InteractionManager: Initialized');
    }

    /**
     * Handles mouse move events.
     * Calculates normalized mouse position (-1 to 1).
     * @param {MouseEvent} event - The mouse event.
     */
    onMouseMove(event) {
        // Normalize mouse position from -1 to 1
        const x = (event.clientX - this.windowHalfX) / this.windowHalfX;
        const y = (event.clientY - this.windowHalfY) / this.windowHalfY;

        this.mousePos.set(x, y, 0);
        State.runtime.mouseX = x;
        State.runtime.mouseY = y;

        this.updateRotationTargets();
    }

    /**
     * Handles touch move events.
     * updates mouse position based on the first touch point.
     * @param {TouchEvent} event - The touch event.
     */
    onTouchMove(event) {
        if (event.touches.length > 0) {
            // event.preventDefault(); // Optional: prevent scrolling if desired
            const touch = event.touches[0];
            const x = (touch.clientX - this.windowHalfX) / this.windowHalfX;
            const y = (touch.clientY - this.windowHalfY) / this.windowHalfY;

            this.mousePos.set(x, y, 0);
            State.runtime.mouseX = x;
            State.runtime.mouseY = y;

            this.updateRotationTargets();
        }
    }

    /**
     * Handles window resize events.
     * Updates the center point for normalization calculations.
     */
    onResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        State.updateConfig('isMobile', window.innerWidth < 768);
    }

    /**
     * Calculates the target rotation based on current mouse position.
     * Inverts Y axis for a natural "look-at" feel.
     */
    updateRotationTargets() {
        // Map mouse position to rotation angles
        // Mouse X controls Rotation Y (Yaw)
        // Mouse Y controls Rotation X (Pitch) - Inverted
        const targetY = this.mousePos.x * this.maxRotation;
        const targetX = -this.mousePos.y * this.maxRotation;

        this.targetRotation.set(targetX, targetY, 0);

        // Update global state for other components
        State.runtime.targetRotateX = targetX;
        State.runtime.targetRotateY = targetY;
    }

    /**
     * Called every frame by the main loop.
     * Interpolates current rotation towards target rotation using linear interpolation.
     * Applies the final transform to the hologram container.
     */
    update() {
        // Smooth interpolation (lerp)
        const speed = State.config.rotateSpeed;

        // Use Vector3 lerp for cleaner code
        this.currentRotation.lerp(this.targetRotation, speed);

        // Sync back to global runtime state for others to read
        State.runtime.currentRotateX = this.currentRotation.x;
        State.runtime.currentRotateY = this.currentRotation.y;

        // Apply transform to container
        if (this.container) {
            // translateZ ensures the pivot point is correct relative to camera
            this.container.style.transform = `
                rotateX(${this.currentRotation.x}deg) 
                rotateY(${this.currentRotation.y}deg)
            `;
        }
    }
}
