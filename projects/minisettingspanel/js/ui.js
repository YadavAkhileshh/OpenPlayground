/**
 * Mini Settings Panel - UI Manager
 * --------------------------------
 * Responsible for rendering the application interface based on state.
 * Uses a schema-based approach to generate settings pages dynamically.
 */

export class UIManager {
    constructor(store) {
        this.store = store;
        this.container = document.getElementById('settings-container');
        this.pageTitle = document.getElementById('page-title');

        // Subscribe to store updates to re-render or update UI
        this.store.subscribeAll((key, val) => this._onStateChange(key, val));

        // Initial Theme Apply
        this._applyTheme(this.store.get('theme'));
    }

    /**
     * Switch the main content view.
     * @param {string} targetId - The section ID to load (e.g., 'display').
     */
    switchView(targetId) {
        // Fade out
        this.container.style.opacity = '0';

        setTimeout(() => {
            this._renderPage(targetId);
            // Fade in
            this.container.style.opacity = '1';
        }, 200);
    }

    /**
     * Show a toast notification.
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info'
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Styles for toast (injected here or in CSS, but let's do inline for simplicity of the unit)
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: `4px solid var(--${type === 'error' ? 'danger' : 'success'}-500)`,
            zIndex: '1000',
            transform: 'translateY(100px)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
        });

        // Remove after 3s
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* Private Rendering Methods */

    _renderPage(targetId) {
        this.container.innerHTML = '';
        const config = this._getPageConfig(targetId);

        if (!config) {
            this.container.innerHTML = `<h3>Page Not Found</h3>`;
            return;
        }

        // Update Header
        this.pageTitle.textContent = config.title;

        // Render Title Section
        const header = document.createElement('section');
        header.className = 'settings-section active-section';
        header.innerHTML = `
            <h2 class="section-title">${config.title}</h2>
            <p class="section-desc">${config.description}</p>
        `;
        this.container.appendChild(header);

        // Render Groups
        config.groups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'card-group';

            group.items.forEach((item, index) => {
                if (index > 0) {
                    const divider = document.createElement('div');
                    divider.className = 'divider';
                    groupEl.appendChild(divider);
                }
                groupEl.appendChild(this._createSettingRow(item));
            });

            this.container.appendChild(groupEl);
        });
    }

    _createSettingRow(item) {
        const row = document.createElement('div');
        row.className = 'setting-row';

        // Info Column
        const info = document.createElement('div');
        info.className = 'setting-info';
        info.innerHTML = `
            <h3>${item.label}</h3>
            ${item.subtitle ? `<p>${item.subtitle}</p>` : ''}
        `;
        row.appendChild(info);

        // Control Column
        const control = document.createElement('div');
        control.className = 'setting-control';

        if (item.type === 'toggle') {
            control.innerHTML = `
                <label class="switch">
                    <input type="checkbox" data-key="${item.key}" ${this.store.get(item.key) ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            `;
        } else if (item.type === 'range') {
            control.innerHTML = `
                <div style="display:flex; align-items:center; gap: 10px;">
                    <span style="font-size: var(--fs-xs); color: var(--text-secondary); width: 24px;">${this.store.get(item.key)}%</span>
                    <input type="range" min="0" max="100" class="range-input" data-key="${item.key}" value="${this.store.get(item.key)}">
                </div>
            `;
        } else if (item.type === 'info') {
            control.innerHTML = `<span style="color: var(--text-secondary); font-size: var(--fs-sm);">${item.value || ''}</span>`;
        } else if (item.type === 'storage-bar') {
            const used = this.store.get('storageUsed');
            const total = this.store.get('storageTotal');
            const percent = (used / total) * 100;

            // We use the full row for this one
            row.classList.add('column-layout');
            row.innerHTML = `
                <div class="setting-info" style="margin-bottom: var(--space-3)">
                    <h3>${item.label}</h3>
                    <p>${used} GB of ${total} GB used</p>
                </div>
                <div class="storage-track">
                    <div class="storage-bar" style="width: ${percent}%"></div>
                </div>
                <div class="storage-legend">
                    <span class="legend-item"><span class="dot apps"></span> Apps</span>
                    <span class="legend-item"><span class="dot media"></span> Photos</span>
                    <span class="legend-item"><span class="dot system"></span> System</span>
                </div>
            `;
            return row; // Early return as we overwrote the whole row
        } else if (item.type === 'wallpaper-picker') {
            row.classList.add('column-layout');
            const current = this.store.get('wallpaper');
            const options = ['default', 'ocean', 'sunset', 'forest', 'midnight'];

            const optionsHtml = options.map(opt => `
                <div class="wallpaper-option ${current === opt ? 'selected' : ''}" 
                     data-value="${opt}" 
                     onclick="window.dispatchEvent(new CustomEvent('wallpaper-change', {detail: '${opt}'}))">
                     <div class="preview ${opt}"></div>
                     <span class="label">${opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                </div>
            `).join('');

            row.innerHTML = `
                <div class="setting-info" style="margin-bottom: var(--space-3)">
                    <h3>${item.label}</h3>
                </div>
                <div class="wallpaper-grid">
                    ${optionsHtml}
                </div>
            `;
            return row;
        } else if (item.type === 'system-update') {
            row.classList.add('column-layout');
            row.innerHTML = `
                <div class="setting-info" style="margin-bottom: var(--space-3)">
                    <h3>${item.label}</h3>
                    <p id="update-status-text">Last checked: Just now</p>
                </div>
                <div class="update-actions">
                    <button class="btn-primary" id="btn-check-update">Check for Updates</button>
                    <div class="spinner hidden" id="update-spinner"></div>
                </div>
             `;

            // Bind click immediately (simple delegation would be better but this works for specific component)
            setTimeout(() => {
                document.getElementById('btn-check-update')?.addEventListener('click', () => {
                    this._simulateUpdateCheck();
                });
            }, 0);

            return row;
        }

        row.appendChild(control);
        return row;
    }

    _simulateUpdateCheck() {
        const btn = document.getElementById('btn-check-update');
        const spinner = document.getElementById('update-spinner');
        const text = document.getElementById('update-status-text');

        btn.disabled = true;
        btn.textContent = 'Checking...';
        spinner.classList.remove('hidden');

        // Simulate checking
        setTimeout(() => {
            spinner.classList.add('hidden');
            btn.textContent = 'Check for Updates';
            btn.disabled = false;

            // Random result
            const isUpdate = Math.random() > 0.7;
            if (isUpdate) {
                text.textContent = 'Update Available: v2.2.0 (Security Patch)';
                text.style.color = 'var(--brand-500)';
                btn.textContent = 'Download & Install';
            } else {
                text.textContent = 'Your system is up to date.';
                text.style.color = 'var(--success-500)';
            }
        }, 2000);
    }

    /**
     * Show the HUD overlay for brightness/volume changes.
     * @param {string} type - 'brightness' or 'volume'
     * @param {number} value - 0 to 100
     */
    showHud(type, value) {
        let hud = document.getElementById('hud-overlay');

        // Lazy create HUD
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'hud-overlay';
            hud.className = 'hud-overlay';
            hud.innerHTML = `
                <div class="hud-icon" id="hud-icon"></div>
                <div class="hud-bar-container">
                    <div class="hud-bar-fill" id="hud-bar-fill"></div>
                </div>
            `;
            document.body.appendChild(hud);
        }

        const iconEl = document.getElementById('hud-icon');
        const barEl = document.getElementById('hud-bar-fill');

        // Icon Map
        const icons = {
            brightness: '☀️',
            volume: value === 0 ? '🔇' : (value < 50 ? '🔉' : '🔊')
        };

        if (icons[type]) {
            iconEl.textContent = icons[type];
        }

        // Update Bar
        barEl.style.width = `${value}%`;

        // Show
        hud.classList.add('visible');

        // Clear existing timeout
        if (this.hudTimeout) {
            clearTimeout(this.hudTimeout);
        }

        // Hide after 2 seconds
        this.hudTimeout = setTimeout(() => {
            hud.classList.remove('visible');
        }, 1500);
    }

    _onStateChange(key, val) {
        // Handle Theme Immediately
        if (key === 'theme') {
            this._applyTheme(val);
        }

        // Handle Wallpaper
        if (key === 'wallpaper') {
            document.body.setAttribute('data-wallpaper', val);
            // Update visual selection in grid if visible
            document.querySelectorAll('.wallpaper-option').forEach(el => {
                el.classList.toggle('selected', el.dataset.value === val);
            });
        }

        // Handle HUD triggers
        if (key === 'brightness' || key === 'volume') {
            this.showHud(key, val);
        }

        // Update inputs if they exist in current DOM
        const inputs = document.querySelectorAll(`[data-key="${key}"]`);
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = val;
            } else if (input.type === 'range') {
                input.value = val;
                // Update label processing (hacky but works for demo)
                const sibling = input.previousElementSibling;
                if (sibling) sibling.textContent = val + '%';
            }
        });
    }

    _applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /* Configuration Data (Simulating a Schema) */
    _getPageConfig(id) {
        const dictionary = {
            'general': {
                title: 'General',
                description: 'Customize your core system experience.',
                groups: [
                    {
                        items: [
                            { type: 'toggle', key: 'darkMode', label: 'Dark Mode', subtitle: 'Use a dark color scheme.' },
                            { type: 'toggle', key: 'notifications', label: 'Notifications', subtitle: 'Allow system-wide alerts.' }
                        ]
                    },
                    {
                        items: [
                            { type: 'toggle', key: 'locationServices', label: 'Location Services', subtitle: 'Allow apps to access your location.' },
                            { type: 'system-update', label: 'Software Update' }
                        ]
                    }
                ]
            },
            'display': {
                title: 'Display & Brightness',
                description: 'Adjust screen settings and appearance.',
                groups: [
                    {
                        items: [
                            { type: 'range', key: 'brightness', label: 'Brightness', subtitle: 'Adjust screen intensity.' },
                            { type: 'toggle', key: 'autoBrightness', label: 'True Tone', subtitle: 'Adapt display validation to ambient lighting.' }
                        ]
                    },
                    {
                        items: [
                            { type: 'wallpaper-picker', key: 'wallpaper', label: 'Wallpaper' }
                        ]
                    },
                    {
                        items: [
                            { type: 'toggle', key: 'nightShift', label: 'Night Shift', subtitle: 'Automatically warmer colors at night.' }
                        ]
                    }
                ]
            },
            'sound': {
                title: 'Sound & Haptics',
                description: 'Volume controls and feedback preferences.',
                groups: [
                    {
                        items: [
                            { type: 'range', key: 'volume', label: 'Master Volume', subtitle: 'Main system output.' },
                            { type: 'toggle', key: 'silentMode', label: 'Silent Mode', subtitle: 'Mute all sounds.' }
                        ]
                    },
                    {
                        items: [
                            { type: 'toggle', key: 'haptics', label: 'System Haptics', subtitle: 'Vibrate on interaction.' },
                            { type: 'toggle', key: 'systemSounds', label: 'UI Sounds', subtitle: 'Play sounds for clicks and errors.' }
                        ]
                    }
                ]
            },
            'connectivity': {
                title: 'Connectivity',
                description: 'Manage Wi-Fi, Bluetooth, and Airplane Mode.',
                groups: [
                    {
                        items: [
                            { type: 'toggle', key: 'wifi', label: 'Wi-Fi', subtitle: 'Connect to wireless networks.' },
                            { type: 'toggle', key: 'bluetooth', label: 'Bluetooth', subtitle: 'Allow connections to accessories.' }
                        ]
                    },
                    {
                        items: [
                            { type: 'toggle', key: 'airplaneMode', label: 'Airplane Mode', subtitle: 'Disable all wireless communications.' },
                            { type: 'toggle', key: 'cellularData', label: 'Cellular Data', subtitle: 'Use mobile network for internet.' }
                        ]
                    }
                ]
            },
            'privacy': {
                title: 'Privacy & Security',
                description: 'Control your data and permissions.',
                groups: [
                    {
                        items: [
                            { type: 'toggle', key: 'adTracking', label: 'Limit Ad Tracking', subtitle: 'Reduce personalized advertising.' },
                            { type: 'toggle', key: 'analyticsShare', label: 'Share Analytics', subtitle: 'Help improve the system.' }
                        ]
                    },
                    {
                        items: [
                            { type: 'toggle', key: 'cameraAccess', label: 'Camera Access', subtitle: 'Global switch for camera hardware.' },
                            { type: 'toggle', key: 'micAccess', label: 'Microphone Access', subtitle: 'Global switch for microphone.' }
                        ]
                    }
                ]
            },
            'system': {
                title: 'System Info',
                description: 'About this device.',
                groups: [
                    {
                        items: [
                            { type: 'storage-bar', key: 'storage', label: 'Storage' }
                        ]
                    },
                    {
                        items: [
                            { type: 'info', label: 'Model Name', value: 'Mini Settings P1' },
                            { type: 'info', label: 'Software Version', value: 'v2.1.0' },
                            { type: 'info', label: 'Serial Number', value: 'XJ9-992-KLA' }
                        ]
                    }
                ]
            }
        };

        return dictionary[id];
    }
}
