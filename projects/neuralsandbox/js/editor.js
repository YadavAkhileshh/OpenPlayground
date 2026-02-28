/**
 * Handles the Track Editor functionality.
 * Allows users to click on the canvas to define new road segments.
 */
class Editor {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {Road} road 
     */
    constructor(canvas, road) {
        this.canvas = canvas;
        this.road = road;
        this.mouse = null;
        this.active = false; // Is editor mode active?

        this.#addEventListeners();
    }

    /**
     * Adds mouse listeners to the canvas.
     * Dispatches visual events for the main loop to handle if needed, or handles click.
     */
    #addEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => {
            if (!this.active) return;
            // Get mouse pos relative to canvas and camera (offset)
            // The logic for converting screen to world space is handled in Main.js
            // where the camera transform is known.

            const rect = this.canvas.getBoundingClientRect();

            // Dispatch a custom event with screen coordinates
            const event = new CustomEvent("editorClick", {
                detail: {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }
            });
            this.canvas.dispatchEvent(event);
        });

        // Context Menu prevent
        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}
