/**
 * Mini Settings Panel - Event Handler
 * -----------------------------------
 * Centralized event delegation and dispatching.
 */

export class EventHandler {
    /**
     * @param {SettingsStore} store 
     * @param {UIManager} ui 
     */
    constructor(store, ui) {
        this.store = store;
        this.ui = ui;

        this._initGlobalListeners();
    }

    _initGlobalListeners() {
        // Toggle Switch Changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"][data-key]')) {
                this._handleToggleChange(e);
            }

            if (e.target.matches('input[type="range"][data-key]')) {
                this._handleRangeChange(e);
            }
        });

        // Wallpaper Change (Custom Event)
        window.addEventListener('wallpaper-change', (e) => {
            const newVal = e.detail;
            this.store.set('wallpaper', newVal);
            // The UI updater handles the visual selection
        });

        // Navigation Clicks (Delegation)
        document.getElementById('sidebar')?.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this._handleNavClick(navItem);
            }
        });

        // Mobile Menu Toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.getElementById('menu-toggle');

            if (window.innerWidth <= 1024 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !toggle.contains(e.target)
            ) {
                sidebar.classList.remove('open');
            }
        });
    }

    _handleToggleChange(e) {
        const key = e.target.dataset.key;
        const checked = e.target.checked;

        console.log(`[Event] Toggle '${key}' -> ${checked}`);

        // Optimistic UI update is handled by browser for checkboxes,
        // but we push to store to trigger side effects
        const success = this.store.set(key, checked);

        if (!success) {
            // Revert if state update failed (unlikely in this local app)
            e.target.checked = !checked;
            this.ui.showToast('Failed to update setting', 'error');
        }
    }

    _handleRangeChange(e) {
        const key = e.target.dataset.key;
        const value = parseInt(e.target.value, 10);

        console.log(`[Event] Range '${key}' -> ${value}`);
        this.store.set(key, value);
    }

    _handleNavClick(navItem) {
        // Remove active class from all
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        // Add to current
        navItem.classList.add('active');

        // Get target view
        const target = navItem.dataset.target;

        // Tell UI to switch views
        this.ui.switchView(target);

        // Close menu on mobile
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar').classList.remove('open');
        }
    }
}
