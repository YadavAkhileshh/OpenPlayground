/**
 * Manages toolbar buttons and active tool state.
 */
export class ToolbarController {
    /**
     * @param {ToolManager} toolManager
     * @param {OverlayRenderer} overlayRenderer
     */
    constructor(toolManager, overlayRenderer) {
        this.toolManager = toolManager;
        this.overlayRenderer = overlayRenderer;

        this.buttons = document.querySelectorAll('.tool-btn[data-tool]');
        this.powerViewBtn = document.getElementById('btn-toggle-power-view');

        this._bindEvents();
    }

    _bindEvents() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = btn.dataset.tool;
                this.toolManager.setTool(toolName);

                this.buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        if (this.powerViewBtn) {
            this.powerViewBtn.addEventListener('click', () => {
                this.overlayRenderer.showPower = !this.overlayRenderer.showPower;
                this.powerViewBtn.classList.toggle('active', this.overlayRenderer.showPower);
            });
        }
    }
}
