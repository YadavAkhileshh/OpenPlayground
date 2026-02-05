/**
 * @fileoverview View Mode Manager
 * Handles project card view modes, layouts, persistence, and user preferences
 * Features: Multiple layouts, sorting, keyboard shortcuts, LocalStorage persistence
 */

export class ViewModeManager {
    constructor() {
        this.currentViewMode = this.loadViewMode();
        this.currentSortMode = this.loadSortMode();
        this.categoryViewModes = this.loadCategoryViewModes();
        this.compactGridColumns = this.loadCompactGridColumns();
        
        this.viewModes = {
            standard: {
                name: 'Standard Grid',
                icon: 'ri-grid-2-line',
                description: 'Balanced 2-3 column layout',
                columns: 'auto-fit',
                minWidth: '300px',
                columnCount: null,
                class: 'view-standard'
            },
            compact: {
                name: 'Compact Grid',
                icon: 'ri-layout-grid-line',
                description: 'Dense 4-6 column layout',
                columns: 'auto-fit',
                minWidth: '180px',
                columnCount: null,
                class: 'view-compact'
            },
            large: {
                name: 'Large Cards',
                icon: 'ri-layout-column-line',
                description: 'Extended info & larger thumbnails',
                columns: 'auto-fit',
                minWidth: '500px',
                columnCount: null,
                class: 'view-large'
            },
            masonry: {
                name: 'Masonry',
                icon: 'ri-layout-masonry-line',
                description: 'Pinterest-style dynamic heights',
                columns: 'auto-fit',
                minWidth: '250px',
                columnCount: null,
                class: 'view-masonry'
            },
            timeline: {
                name: 'Timeline',
                icon: 'ri-calendar-line',
                description: 'Chronological date markers',
                columns: null,
                minWidth: null,
                columnCount: 1,
                class: 'view-timeline'
            },
            list: {
                name: 'List View',
                icon: 'ri-list-line',
                description: 'Compact list format',
                columns: null,
                minWidth: null,
                columnCount: 1,
                class: 'view-list'
            }
        };

        this.sortModes = {
            recent: { label: 'Recently Added', icon: 'ri-time-line' },
            popular: { label: 'Most Popular', icon: 'ri-star-line' },
            azSorted: { label: 'A-Z', icon: 'ri-sort-asc' },
            category: { label: 'By Category', icon: 'ri-folder-line' },
            difficulty: { label: 'By Difficulty', icon: 'ri-git-branch-line' }
        };

        this.setupKeyboardShortcuts();
        this.initializeUI();
    }

    /**
     * Load view mode from localStorage
     */
    loadViewMode() {
        const saved = localStorage.getItem('projectViewMode');
        return saved && this.viewModes[saved] ? saved : 'standard';
    }

    /**
     * Load sort mode from localStorage
     */
    loadSortMode() {
        const saved = localStorage.getItem('projectSortMode');
        return saved && this.sortModes[saved] ? saved : 'recent';
    }

    /**
     * Load per-category view modes from localStorage
     */
    loadCategoryViewModes() {
        const saved = localStorage.getItem('categorySortModes');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Load compact grid column preference from localStorage
     */
    loadCompactGridColumns() {
        const saved = localStorage.getItem('compactGridColumns');
        return saved ? parseInt(saved) : 5;
    }

    /**
     * Set current view mode and save preference
     */
    setViewMode(mode) {
        if (this.viewModes[mode]) {
            this.currentViewMode = mode;
            localStorage.setItem('projectViewMode', mode);
            this.updateUIViewMode(mode);
            this.dispatchViewModeChange(mode);
            return true;
        }
        return false;
    }

    /**
     * Set sort mode and save preference
     */
    setSortMode(mode) {
        if (this.sortModes[mode]) {
            this.currentSortMode = mode;
            localStorage.setItem('projectSortMode', mode);
            this.updateUISortMode(mode);
            this.dispatchSortModeChange(mode);
            return true;
        }
        return false;
    }

    /**
     * Set view mode for specific category
     */
    setCategoryViewMode(category, viewMode) {
        if (this.viewModes[viewMode]) {
            this.categoryViewModes[category] = viewMode;
            localStorage.setItem('categorySortModes', JSON.stringify(this.categoryViewModes));
            return true;
        }
        return false;
    }

    /**
     * Get view mode for specific category, fallback to global
     */
    getCategoryViewMode(category) {
        return this.categoryViewModes[category] || this.currentViewMode;
    }

    /**
     * Setup keyboard shortcuts for quick view switching
     * Shortcuts:
     * 1 - Standard Grid
     * 2 - Compact Grid
     * 3 - Large Cards
     * 4 - Masonry
     * 5 - Timeline
     * 6 - List View
     * Shift + S - Toggle between sort modes (cycling)
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in input
            if (e.target.matches('input, textarea, select')) return;

            const viewModeKeys = {
                '1': 'standard',
                '2': 'compact',
                '3': 'large',
                '4': 'masonry',
                '5': 'timeline',
                '6': 'list'
            };

            if (viewModeKeys[e.key]) {
                e.preventDefault();
                this.setViewMode(viewModeKeys[e.key]);
                this.showKeyboardShortcutFeedback(`View: ${this.viewModes[viewModeKeys[e.key]].name}`);
            }

            // Shift+S to cycle through sort modes
            if (e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.cycleSortMode();
                this.showKeyboardShortcutFeedback(`Sort: ${this.sortModes[this.currentSortMode].label}`);
            }
        });
    }

    /**
     * Cycle through sort modes
     */
    cycleSortMode() {
        const modes = Object.keys(this.sortModes);
        const currentIndex = modes.indexOf(this.currentSortMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        this.setSortMode(nextMode);
    }

    /**
     * Show temporary feedback for keyboard shortcuts
     */
    showKeyboardShortcutFeedback(message) {
        const existingFeedback = document.getElementById('keyboard-feedback');
        if (existingFeedback) existingFeedback.remove();

        const feedback = document.createElement('div');
        feedback.id = 'keyboard-feedback';
        feedback.className = 'keyboard-feedback';
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);

        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 1500);
    }

    /**
     * Get CSS Grid configuration for current view mode
     */
    getGridConfig() {
        const mode = this.viewModes[this.currentViewMode];
        if (mode.columnCount) {
            return {
                gridTemplateColumns: `repeat(${mode.columnCount}, 1fr)`,
                gridAutoRows: this.currentViewMode === 'masonry' ? 'auto' : undefined
            };
        }
        return {
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${mode.minWidth}, 1fr))`,
            gap: this.getGridGap()
        };
    }

    /**
     * Get appropriate gap for current view mode
     */
    getGridGap() {
        const gapMap = {
            standard: '1.5rem',
            compact: '1rem',
            large: '2rem',
            masonry: '1.5rem',
            timeline: '2rem',
            list: '1rem'
        };
        return gapMap[this.currentViewMode] || '1.5rem';
    }

    /**
     * Get CSS class for view mode
     */
    getViewModeClass() {
        return this.viewModes[this.currentViewMode]?.class || 'view-standard';
    }

    /**
     * Update UI to reflect current view mode
     */
    updateUIViewMode(mode) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        // Remove old view mode classes
        Object.keys(this.viewModes).forEach(m => {
            container.classList.remove(this.viewModes[m].class);
        });

        // Add new view mode class
        container.classList.add(this.viewModes[mode].class);

        // Update button states
        const buttons = document.querySelectorAll('[data-view-mode]');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewMode === mode);
        });

        // Update sort buttons if they exist
        this.updateSortButtons();
    }

    /**
     * Update UI to reflect current sort mode
     */
    updateUISortMode(mode) {
        const buttons = document.querySelectorAll('[data-sort-mode]');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sortMode === mode);
        });
    }

    /**
     * Update sort buttons in UI
     */
    updateSortButtons() {
        const buttons = document.querySelectorAll('[data-sort-mode]');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sortMode === this.currentSortMode);
        });
    }

    /**
     * Initialize UI controls
     */
    initializeUI() {
        this.createViewModeControls();
    }

    /**
     * Create view mode selector UI if it doesn't exist
     */
    createViewModeControls() {
        // Check if controls already exist
        if (document.getElementById('view-mode-controls')) {
            this.updateUIViewMode(this.currentViewMode);
            return;
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'view-mode-controls';
        controlsContainer.className = 'view-mode-controls';

        // View mode buttons
        const viewModesHtml = Object.entries(this.viewModes)
            .map(([key, mode]) => `
                <button 
                    class="view-mode-btn ${key === this.currentViewMode ? 'active' : ''}"
                    data-view-mode="${key}"
                    title="${mode.description} (Press ${key === 'standard' ? '1' : key === 'compact' ? '2' : key === 'large' ? '3' : key === 'masonry' ? '4' : key === 'timeline' ? '5' : '6'})"
                >
                    <i class="${mode.icon}"></i>
                    <span class="view-mode-label">${mode.name}</span>
                </button>
            `)
            .join('');

        controlsContainer.innerHTML = `
            <div class="view-modes-group">
                <label class="controls-label">View Modes:</label>
                <div class="view-mode-buttons">
                    ${viewModesHtml}
                </div>
            </div>
        `;

        // Try to insert into dedicated container first
        let targetContainer = document.getElementById('view-mode-controls-container');
        
        if (targetContainer) {
            targetContainer.appendChild(controlsContainer);
        } else {
            // Fallback: Insert before projects container or at the end of filters
            const filterSection = document.querySelector('.category-filter');
            
            if (filterSection) {
                filterSection.insertAdjacentElement('afterend', controlsContainer);
            } else {
                const projectsContainer = document.querySelector('.projects-container');
                if (projectsContainer) {
                    projectsContainer.insertAdjacentElement('beforebegin', controlsContainer);
                }
            }
        }

        // Attach event listeners
        this.attachControlListeners();
    }

    /**
     * Attach event listeners to view mode buttons
     */
    attachControlListeners() {
        const buttons = document.querySelectorAll('[data-view-mode]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.dataset.viewMode;
                this.setViewMode(mode);
            });
        });
    }

    /**
     * Dispatch custom event when view mode changes
     */
    dispatchViewModeChange(mode) {
        window.dispatchEvent(new CustomEvent('viewModeChanged', {
            detail: { viewMode: mode, config: this.viewModes[mode] }
        }));
    }

    /**
     * Dispatch custom event when sort mode changes
     */
    dispatchSortModeChange(mode) {
        window.dispatchEvent(new CustomEvent('sortModeChanged', {
            detail: { sortMode: mode, config: this.sortModes[mode] }
        }));
    }

    /**
     * Export view preferences as JSON
     */
    exportPreferences() {
        return {
            viewMode: this.currentViewMode,
            sortMode: this.currentSortMode,
            categoryViewModes: this.categoryViewModes,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import view preferences from JSON
     */
    importPreferences(preferences) {
        if (preferences.viewMode) this.setViewMode(preferences.viewMode);
        if (preferences.sortMode) this.setSortMode(preferences.sortMode);
        if (preferences.categoryViewModes) {
            this.categoryViewModes = preferences.categoryViewModes;
            localStorage.setItem('categorySortModes', JSON.stringify(this.categoryViewModes));
        }
    }

    /**
     * Reset all preferences to defaults
     */
    resetPreferences() {
        localStorage.removeItem('projectViewMode');
        localStorage.removeItem('projectSortMode');
        localStorage.removeItem('categorySortModes');
        localStorage.removeItem('compactGridColumns');
        
        this.currentViewMode = 'standard';
        this.currentSortMode = 'recent';
        this.categoryViewModes = {};
        this.compactGridColumns = 5;
        
        this.updateUIViewMode('standard');
        this.updateUISortMode('recent');
        this.dispatchViewModeChange('standard');
        this.dispatchSortModeChange('recent');
    }

    /**
     * Get statistics for current view configuration
     */
    getStats() {
        return {
            currentViewMode: this.currentViewMode,
            currentSortMode: this.currentSortMode,
            availableViewModes: Object.keys(this.viewModes).length,
            categoriesWithCustomViews: Object.keys(this.categoryViewModes).length
        };
    }
}

// Export singleton instance
export const viewModeManager = new ViewModeManager();
