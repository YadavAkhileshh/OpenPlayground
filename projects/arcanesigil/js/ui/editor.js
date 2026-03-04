/* js/ui/editor.js */

/**
 * Code Editor Module
 * Manages the text area input, emitting code updates.
 */
class Editor {
    constructor() {
        this.textarea = document.getElementById('code-input');

        if (!this.textarea) {
            console.error("Editor textarea not found!");
            return;
        }

        // Initialize default code
        this.textarea.value = CONFIG.EDITOR.DEFAULT_CODE;

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Handle Tab key
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
        });

        // Trigger compilation on input with debounce
        const debouncedCompile = Utils.debounce(() => {
            const code = this.getCode();
            appEventBus.emit(EVENTS.CODE_CHANGED, code);
        }, 500);

        this.textarea.addEventListener('input', debouncedCompile);
    }

    insertTab() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const spaces = ' '.repeat(CONFIG.EDITOR.TAB_SIZE);

        this.textarea.value = this.textarea.value.substring(0, start) +
            spaces +
            this.textarea.value.substring(end);

        this.textarea.selectionStart = this.textarea.selectionEnd = start + spaces.length;
    }

    getCode() {
        return this.textarea.value;
    }

    setCode(code) {
        this.textarea.value = code;
        appEventBus.emit(EVENTS.CODE_CHANGED, code);
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.editorInstance = new Editor();
    // Emit initial code after a short delay
    setTimeout(() => {
        appEventBus.emit(EVENTS.CODE_CHANGED, window.editorInstance.getCode());
    }, 100);
});
