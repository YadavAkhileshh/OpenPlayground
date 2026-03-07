/**
 * View - UI Rendering & Event Handling
 * Manages the DOM, renders messages, and handles user interactions.
 */
class View {
    constructor() {
        this.app = $('#app');
        this.messageList = $('#message-list');
        this.inputArea = $('#message-input');
        this.sendBtn = $('#send-btn');
        this.settingsBtn = $('#settings-btn');
        this.settingsModal = $('#settings-modal');
        this.usernameInput = $('#username-input');
        this.darkModeToggle = $('#dark-mode-toggle');
        this.clearChatBtn = $('#clear-chat-btn');
        this.emojiBtn = $('#emoji-btn');
        this.userCountDisplay = $('#user-count');

        this._initListeners();
    }

    init(isDarkMode, username) {
        this.setDarkMode(isDarkMode);
        if (username) {
            this.usernameInput.val(username);
        } else if (this.usernameInput.val() === '') {
            this.usernameInput.val('Anonymous');
        }
    }

    _initListeners() {
        // Redundant auto-expand removed (handled by Editor.js)

        // Enter to send
        this.inputArea.on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendBtn.elements[0].click(); // Trigger click
            }
        });

        // Settings Modal Toggle
        this.settingsBtn.on('click', () => {
            this.settingsModal.toggleClass('hidden');
        });

        // Close modal on click outside
        $(window).on('click', (e) => {
            if (e.target === this.settingsModal.elements[0]) {
                this.settingsModal.addClass('hidden');
            }
        });
    }

    bindSendMessage(handler) {
        const sendMessage = () => {
            if (!window.Editor) return;
            const text = window.Editor.getValue();
            if (text && text.trim()) {
                handler(text);
                window.Editor.clear();
                this.messageList.scrollToBottom();
            }
        };

        this.sendBtn.on('click', sendMessage);
    }

    bindUpdateUsername(handler) {
        this.usernameInput.on('change', (e) => {
            handler(e.target.value);
        });
    }

    bindToggleDarkMode(handler) {
        this.darkModeToggle.on('change', () => {
            handler();
        });
    }

    bindClearChat(handler) {
        this.clearChatBtn.on('click', () => {
            if (confirm('Are you sure you want to clear the chat history?')) {
                handler();
                this.settingsModal.addClass('hidden');
            }
        });
    }

    setDarkMode(isDark) {
        if (isDark) {
            $('body').addClass('dark-mode');
            this.darkModeToggle.elements[0].checked = true;
        } else {
            $('body').removeClass('dark-mode');
            this.darkModeToggle.elements[0].checked = false;
        }
    }

    renderMessages(messages, currentUser) {
        this.messageList.html(''); // Clear

        // Group by consecutive authors could be a nice polish, 
        // but for now let's just render standard bubbles.

        messages.forEach(msg => {
            const isMe = msg.author === currentUser;
            const bubbleClass = isMe ? 'message-bubble me' : 'message-bubble other';
            const alignClass = isMe ? 'message-row me' : 'message-row other';

            // Format Timestamp
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Parse Markdown (We'll use a helper method here)
            const content = this._parseMarkdown(msg.text);

            const html = `
                <div class="${alignClass}">
                    ${!isMe ? `<div class="message-avatar" title="${msg.author}">${msg.author.charAt(0).toUpperCase()}</div>` : ''}
                    <div class="${bubbleClass}">
                        <div class="message-content">${content}</div>
                        <div class="message-meta">${time}</div>
                    </div>
                </div>
            `;
            this.messageList.append(html);
        });

        this.messageList.scrollToBottom();
    }

    updateUserCount(count) {
        this.userCountDisplay.text(`${count} Active`);
    }

    // Custom Markdown Parser (Requirement: Regex-based)
    _parseMarkdown(text) {
        if (!text) return '';

        // Escape HTML to prevent XSS
        let safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Code Block (multi-line) - ```code```
        safeText = safeText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Inline Code - `code`
        safeText = safeText.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold - **bold**
        safeText = safeText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic - *italic*
        safeText = safeText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Line breaks
        safeText = safeText.replace(/\n/g, '<br>');

        return safeText;
    }
}

// Defer initialization until DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.View = new View();
    });
} else {
    window.View = new View();
}
