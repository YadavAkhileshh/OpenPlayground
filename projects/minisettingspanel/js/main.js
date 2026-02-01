/**
 * Mini Settings Panel - Main Entry Point
 * --------------------------------------
 * Bootstraps the application.
 */

import { SettingsStore } from './state.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { EventHandler } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Booting up...');

    // 1. Initialize Storage
    const storage = new StorageManager();

    // 2. Load Persisted State
    const savedState = storage.load();

    // 3. Initialize Store with Saved State (or defaults)
    const store = new SettingsStore(savedState || {});

    // 4. Initialize UI
    const ui = new UIManager(store);

    // 5. Initialize Events
    const events = new EventHandler(store, ui);

    // 6. Setup Auto-Save Subscription
    store.subscribeAll((key, val) => {
        // We debounce this slightly in a real app, but for now direct save is fine
        storage.save(store.getState());

        // Simulating "System Effect"
        if (key === 'wifi' && val === true) {
            setTimeout(() => ui.showToast('Connected to "Home Network"', 'success'), 1500);
        }
        if (key === 'bluetooth' && val === true) {
            setTimeout(() => ui.showToast('Bluetooth Enabled', 'info'), 500);
        }
        if (key === 'airplaneMode' && val === true) {
            // Force off others
            store.set('wifi', false, 'system');
            store.set('bluetooth', false, 'system');
            store.set('cellularData', false, 'system');
            ui.showToast('Airplane Mode Enabled', 'warning');
        }
    });

    // 7. Initial Render
    // Check URL hash or default to 'general'
    const initialPage = 'general';
    ui.switchView(initialPage);

    console.log('[App] Ready.');
});
