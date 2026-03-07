/**
 * Controller - The Logic Glue
 * Connects User Inputs -> Model -> View
 */
class Controller {
    constructor() {
        this.model = window.Model;
        this.view = window.View;
        this.bus = window.StorageBus;

        this.init();
    }

    init() {
        // Initial Render
        this.view.init(this.model.isDarkMode(), this.model.getCurrentUser());
        this.refreshView();
        this.updateUserCount();

        // Bind View Events
        this.view.bindSendMessage(this.handleSendMessage.bind(this));
        this.view.bindUpdateUsername(this.handleUpdateUsername.bind(this));
        this.view.bindToggleDarkMode(this.handleToggleDarkMode.bind(this));
        this.view.bindClearChat(this.handleClearChat.bind(this));

        // Bind Model Events (indirectly via StorageBus callback in Model or here)
        // The Model already calls refreshView on 'new-message'

        // Heartbeat UI update
        setInterval(() => this.updateUserCount(), 2000);
    }

    refreshView() {
        const messages = this.model.getMessages();
        const currentUser = this.model.getCurrentUser();
        this.view.renderMessages(messages, currentUser);
    }

    handleSendMessage(text) {
        if (!text.trim()) return;

        // Parse markdown (simple regex-based)
        // Note: The View will render HTML, so we rely on the parser to be safe-ish
        // We will move the parser logic to a utility or keep it simple here.
        // Ideally the Model stores raw text, and View renders it parsed.
        // BUT strict requirements say "Rich Text Editor (From Scratch) ... Custom Markdown parser"
        // so we probably want to store the raw markdown and parse on display OR parse before send.
        // Let's store RAW markdown to allow editing later if we wanted, and parse on render.

        this.model.postMessage(text);
    }

    handleUpdateUsername(name) {
        this.model.updateUsername(name);
        this.refreshView(); // Re-render to update "Me" bubbles
    }

    handleToggleDarkMode() {
        const isDark = this.model.toggleDarkMode();
        this.view.setDarkMode(isDark);
    }

    handleClearChat() {
        this.bus.clearData();
    }

    updateUserCount() {
        // We count localStorage keys for heartbeats
        // Since StorageBus logic is encapsulated, we can expose a method there
        // or just rely on the manual check we added to StorageBus.
        // Let's use the method we added to StorageBus.
        if (this.bus.getActiveUsers) {
            const count = this.bus.getActiveUsers();
            this.view.updateUserCount(count); // Local + other tabs
        }
    }
}

// Will be initialized in main.js or at end of loading
// window.Controller = new Controller();
// We defer instantiation until View is ready.
