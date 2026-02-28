/**
 * Command Palette - VS Code Style Omni-Search
 * Handles global keyboard shortcuts, project search, theme toggle, and navigation
 */

class CommandPalette {
    constructor(projectManager) {
        this.projectManager = projectManager;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.filteredActions = [];
        this.searchQuery = '';

        // Action Registry - All available commands
        this.actionRegistry = [
            // Navigation Actions
            {
                id: 'nav-home',
                label: 'Go to Home',
                description: 'Navigate to homepage',
                category: 'Navigation',
                icon: '🏠',
                action: () => window.location.href = '/'
            },
            {
                id: 'nav-about',
                label: 'Go to About',
                description: 'View project information',
                category: 'Navigation',
                icon: 'ℹ️',
                action: () => window.location.href = '/about.html'
            },
            {
                id: 'nav-contact',
                label: 'Go to Contact',
                description: 'Contact the maintainers',
                category: 'Navigation',
                icon: '📧',
                action: () => window.location.href = '/contact.html'
            },
            {
                id: 'nav-feedback',
                label: 'Go to Feedback',
                description: 'Send feedback or suggestions',
                category: 'Navigation',
                icon: '💬',
                action: () => window.location.href = '/feedback.html'
            },
            {
                id: 'nav-bookmarks',
                label: 'Go to Bookmarks',
                description: 'View your saved bookmarks',
                category: 'Navigation',
                icon: '⭐',
                action: () => window.location.href = '/bookmarks.html'
            },
            {
                id: 'nav-stats',
                label: 'Go to Stats',
                description: 'View project statistics',
                category: 'Navigation',
                icon: '📊',
                action: () => window.location.href = '/stats.html'
            },

            // View Actions
            {
                id: 'view-card',
                label: 'Switch to Card View',
                description: 'Display projects as cards',
                category: 'View',
                icon: '🗂️',
                action: () => this.projectManager?.switchViewMode?.('card')
            },
            {
                id: 'view-list',
                label: 'Switch to List View',
                description: 'Display projects as list',
                category: 'View',
                icon: '📋',
                action: () => this.projectManager?.switchViewMode?.('list')
            },

            // Theme Actions
            {
                id: 'theme-toggle',
                label: 'Toggle Dark Mode',
                description: 'Switch between light and dark theme',
                category: 'Theme',
                icon: '🌙',
                action: () => this.toggleTheme()
            },
            {
                id: 'theme-light',
                label: 'Set Light Theme',
                description: 'Use light theme',
                category: 'Theme',
                icon: '☀️',
                action: () => this.setTheme('light')
            },
            {
                id: 'theme-dark',
                label: 'Set Dark Theme',
                description: 'Use dark theme',
                category: 'Theme',
                icon: '🌙',
                action: () => this.setTheme('dark')
            },

            // Utility Actions
            {
                id: 'clear-filters',
                label: 'Clear All Filters',
                description: 'Reset all applied filters',
                category: 'Utility',
                icon: '✨',
                action: () => this.projectManager?.clearFilters?.()
            },
            {
                id: 'scroll-top',
                label: 'Scroll to Top',
                description: 'Jump to the top of the page',
                category: 'Utility',
                icon: '⬆️',
                action: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            },
            {
                id: 'scroll-bottom',
                label: 'Scroll to Bottom',
                description: 'Jump to the bottom of the page',
                category: 'Utility',
                icon: '⬇️',
                action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            },
            {
                id: 'random-project',
                label: 'Random Project',
                description: 'Jump to a random project',
                category: 'Utility',
                icon: '🎲',
                action: () => this.projectManager?.selectRandomProject?.()
            }
        ];

        this.init();
    }

    init() {
        // Create DOM elements if they don't exist
        this.createPaletteDOM();
        this.attachEventListeners();
    }

    createPaletteDOM() {
        if (document.getElementById('command-palette')) return;

        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="command-palette-overlay"></div>
            <div class="command-palette-container">
                <div class="command-palette-header">
                    <input 
                        type="text" 
                        class="command-palette-input" 
                        id="command-search" 
                        placeholder="Type a command or search projects..." 
                        aria-label="Command palette search"
                    />
                    <span class="command-palette-hint">ESC to close</span>
                </div>
                <div class="command-palette-results" id="command-results">
                    <div class="command-palette-empty">Start typing to search...</div>
                </div>
                <div class="command-palette-footer">
                    <div class="command-palette-shortcuts">
                        <span><kbd>↑↓</kbd> Navigate</span>
                        <span><kbd>↵</kbd> Execute</span>
                        <span><kbd>ESC</kbd> Close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(palette);

        this.palette = palette;
        this.searchInput = document.getElementById('command-search');
        this.resultsContainer = document.getElementById('command-results');
        this.overlay = palette.querySelector('.command-palette-overlay');
    }

    attachEventListeners() {
        // Search input handler
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterActions();
            this.renderResults();
            this.selectedIndex = 0;
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Overlay click to close
        this.overlay.addEventListener('click', () => this.close());

        // Results click handler
        this.resultsContainer.addEventListener('click', (e) => {
            const actionItem = e.target.closest('.command-item');
            if (actionItem) {
                const index = Array.from(this.resultsContainer.children).indexOf(actionItem);
                this.executeAction(index);
            }
        });

        // Result hover handler
        this.resultsContainer.addEventListener('mouseover', (e) => {
            const actionItem = e.target.closest('.command-item');
            if (actionItem) {
                this.selectedIndex = Array.from(this.resultsContainer.children).indexOf(actionItem);
                this.highlightSelected();
            }
        });
    }

    filterActions() {
        const query = this.searchQuery;

        // If no query, show all actions grouped by category
        if (!query) {
            this.filteredActions = this.actionRegistry;
            return;
        }

        // Search in actions first
        let filtered = this.actionRegistry.filter(action => 
            action.label.toLowerCase().includes(query) ||
            action.description.toLowerCase().includes(query) ||
            action.category.toLowerCase().includes(query)
        );

        // If projectManager exists, also search in projects
        if (this.projectManager?.state?.allProjects) {
            const projectMatches = this.projectManager.state.allProjects
                .filter(project => project.title.toLowerCase().includes(query))
                .slice(0, 5)
                .map(project => ({
                    id: `project-${project.link}`,
                    label: project.title,
                    description: 'Open project',
                    category: 'Projects',
                    icon: '▶️',
                    action: () => {
                        if (project.link.startsWith('http')) {
                            window.open(project.link, '_blank');
                        } else {
                            window.location.href = project.link;
                        }
                    }
                }));

            filtered = [...filtered, ...projectMatches];
        }

        this.filteredActions = filtered;
    }

    renderResults() {
        this.resultsContainer.innerHTML = '';

        if (this.filteredActions.length === 0) {
            this.resultsContainer.innerHTML = '<div class="command-palette-empty">No results found</div>';
            return;
        }

        // Group by category
        const grouped = {};
        this.filteredActions.forEach(action => {
            if (!grouped[action.category]) {
                grouped[action.category] = [];
            }
            grouped[action.category].push(action);
        });

        // Render grouped results
        Object.entries(grouped).forEach(([category, actions]) => {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'command-category-header';
            categoryHeader.textContent = category;
            this.resultsContainer.appendChild(categoryHeader);

            actions.forEach((action, idx) => {
                const item = document.createElement('div');
                item.className = 'command-item';
                item.innerHTML = `
                    <span class="command-icon">${action.icon}</span>
                    <div class="command-details">
                        <div class="command-label">${this.highlightMatch(action.label)}</div>
                        <div class="command-description">${action.description}</div>
                    </div>
                `;
                item.setAttribute('tabindex', '0');
                this.resultsContainer.appendChild(item);
            });
        });

        this.highlightSelected();
    }

    highlightMatch(text) {
        if (!this.searchQuery) return text;
        const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    highlightSelected() {
        const items = this.resultsContainer.querySelectorAll('.command-item');
        items.forEach((item, idx) => {
            item.classList.toggle('selected', idx === this.selectedIndex);
        });

        // Scroll into view
        if (items[this.selectedIndex]) {
            items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.highlightSelected();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(
                    this.resultsContainer.querySelectorAll('.command-item').length - 1,
                    this.selectedIndex + 1
                );
                this.highlightSelected();
                break;
            case 'Enter':
                e.preventDefault();
                this.executeAction(this.selectedIndex);
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                } else {
                    this.selectedIndex = Math.min(
                        this.resultsContainer.querySelectorAll('.command-item').length - 1,
                        this.selectedIndex + 1
                    );
                }
                this.highlightSelected();
                break;
        }
    }

    executeAction(index) {
        const items = this.resultsContainer.querySelectorAll('.command-item');
        if (index < 0 || index >= items.length) return;

        // Find the action by counting items
        let actionIndex = 0;
        for (const action of this.filteredActions) {
            if (actionIndex === index) {
                action.action();
                this.close();
                return;
            }
            actionIndex++;
        }
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.palette.classList.add('open');
        this.searchInput.value = '';
        this.searchQuery = '';
        this.selectedIndex = 0;
        this.filterActions();
        this.renderResults();
        this.searchInput.focus();
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.palette.classList.remove('open');
        this.searchInput.blur();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Add custom actions dynamically
    registerAction(action) {
        this.actionRegistry.push(action);
    }

    removeAction(id) {
        this.actionRegistry = this.actionRegistry.filter(a => a.id !== id);
    }
}

export { CommandPalette };
