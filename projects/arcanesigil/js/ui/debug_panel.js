/* js/ui/debug_panel.js */

/**
 * AST Viewer Debug overlay
 */
class DebugPanel {
    constructor() {
        this.toggleBtn = document.getElementById('btn-toggle-ast');
        this.overlay = document.getElementById('ast-overlay');
        this.treeView = document.getElementById('ast-tree-view');

        this.isVisible = false;

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Listen for new ASTs
        appEventBus.on(EVENTS.AST_GENERATED, this.renderAst.bind(this));
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.overlay.classList.remove('hidden');
            this.toggleBtn.classList.add('active');
        } else {
            this.overlay.classList.add('hidden');
            this.toggleBtn.classList.remove('active');
        }
    }

    renderAst(ast) {
        if (!this.treeView) return;
        if (!ast) {
            this.treeView.innerHTML = "No Valid AST";
            return;
        }

        // Pretty print AST JSON
        // Using a custom formatter since JSON.stringify is plain
        try {
            const formatted = JSON.stringify(ast, (key, value) => {
                // filter out recursive refs or excessive details if needed, usually AST is acyclic
                return value;
            }, 2);

            // Syntax highlight the JSON roughly
            let htmlForm = formatted.replace(/"(\w+)":/g, '<span style="color:var(--color-sigil-cyan)">"$1"</span>:')
                .replace(/: "(.*?)"/g, ': <span style="color:var(--color-sigil-gold)">"$1"</span>')
                .replace(/: (true|false)/g, ': <span style="color:var(--color-sigil-magenta)">$1</span>')
                .replace(/: ([0-9]+)/g, ': <span style="color:var(--color-sigil-red)">$1</span>');

            this.treeView.innerHTML = htmlForm;
        } catch (e) {
            this.treeView.innerHTML = "Error rendering AST: " + e.message;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.debugPanel = new DebugPanel();
});
