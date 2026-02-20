/**
 * toolbar.js — WaveTank Tool Selector
 * Manages tool mode state (ripple / barrier / depth / eraser).
 * Highlights the active tool button and exposes current tool name.
 */

export const TOOLS = {
    RIPPLE: 'ripple',
    BARRIER: 'barrier',
    DEPTH: 'depth',
    ERASER: 'eraser',
};

export class Toolbar {
    constructor() {
        this.activeTool = TOOLS.RIPPLE;
        this._buttons = {};
    }

    /** Call once DOM is ready to bind tool buttons. */
    bind() {
        const toolIds = [
            { id: 'tool-ripple', tool: TOOLS.RIPPLE },
            { id: 'tool-barrier', tool: TOOLS.BARRIER },
            { id: 'tool-depth', tool: TOOLS.DEPTH },
            { id: 'tool-eraser', tool: TOOLS.ERASER },
        ];

        toolIds.forEach(({ id, tool }) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            this._buttons[tool] = btn;
            btn.addEventListener('click', () => this.setTool(tool));
        });

        this.setTool(TOOLS.RIPPLE); // default
    }

    /** Activate a tool by name. */
    setTool(tool) {
        this.activeTool = tool;
        Object.entries(this._buttons).forEach(([t, btn]) => {
            btn.classList.toggle('active', t === tool);
        });
    }

    get tool() {
        return this.activeTool;
    }
}
