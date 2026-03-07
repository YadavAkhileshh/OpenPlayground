/**
 * Emoji Picker - Standard 50+ Emoji Grid
 */
class EmojiPicker {
    constructor() {
        this.emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '☺', '😊',
            '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
            '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
            '🤩', '🥳', '😏', '😒', '😞', '😔', 'worried', '😕', '🙁', '☹',
            '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
            '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
            '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
            '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
            '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌', '🤟', '🤘',
            '👌', '🤏', '👈', '👉', '👆', '👇', '☝', '✋', 'hc', '🖐'
        ];

        this.picker = $('#emoji-picker');
        this.btn = $('#emoji-btn');
        this.input = $('#message-input');

        this.render();
        this.bindEvents();
    }

    render() {
        // Filter out text fallbacks if any (like 'worried') - just in case
        const validEmojis = this.emojis.filter(e => e.length < 5);

        const html = validEmojis.map(emoji =>
            `<button class="emoji-item" type="button">${emoji}</button>`
        ).join('');

        this.picker.html(html);
    }

    bindEvents() {
        // Toggle picker
        this.btn.on('click', (e) => {
            e.stopPropagation();
            this.picker.toggleClass('hidden');
        });

        // Insert Emoji
        this.picker.on('click', (e) => {
            if (e.target.classList.contains('emoji-item')) {
                const emoji = e.target.textContent;
                this.insertAtCursor(emoji);
                this.picker.addClass('hidden'); // Close after pick
            }
        });

        // Close on outside click
        $(window).on('click', (e) => {
            if (!this.picker.elements[0].contains(e.target) && e.target !== this.btn.elements[0]) {
                this.picker.addClass('hidden');
            }
        });
    }

    insertAtCursor(text) {
        const input = this.input.elements[0];
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const val = input.value;

        input.value = val.substring(0, start) + text + val.substring(end);
        input.selectionStart = input.selectionEnd = start + text.length;
        input.focus();

        // Trigger generic input event to auto-resize
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Window load init
window.addEventListener('DOMContentLoaded', () => {
    // We can init this after the DOM is ready
    setTimeout(() => new EmojiPicker(), 100);
});
