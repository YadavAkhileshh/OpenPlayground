/**
 * Editor - Markdown Input Handler
 * Extracted logic from View/Controller to meet file count constraints
 * and provide dedicated input management.
 */
class Editor {
    constructor(inputSelector) {
        this.input = $(inputSelector);
        this.bindEvents();
    }

    bindEvents() {
        // Auto-expand
        this.input.on('input', (e) => {
            this.autoResize(e.target);
        });

        // Handle Tab key for indentation (optional polish)
        this.input.on('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.input.elements[0].selectionStart;
                const end = this.input.elements[0].selectionEnd;
                const val = this.input.val();
                this.input.val(val.substring(0, start) + '    ' + val.substring(end));
                this.input.elements[0].selectionStart = this.input.elements[0].selectionEnd = start + 4;
            }
        });
    }

    autoResize(element) {
        element.style.height = 'auto';
        element.style.height = (element.scrollHeight) + 'px';
    }

    clear() {
        this.input.val('');
        this.input.css('height', 'auto');
    }

    getValue() {
        return this.input.val();
    }

    focus() {
        this.input.focus();
    }
}

// Defer initialization until DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.Editor = new Editor('#message-input');
    });
} else {
    window.Editor = new Editor('#message-input');
}
