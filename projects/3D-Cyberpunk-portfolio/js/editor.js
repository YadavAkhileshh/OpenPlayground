import { defaultConfig } from './data/defaultConfig.js';

export const editor = {
    config: { ...defaultConfig },

    init(onUpdate) {
        this.onUpdate = onUpdate;
        this.loadConfig();
        this.cacheElements();
        this.bindEvents();
        this.hydrateUI();
    },

    loadConfig() {
        // Load from local storage or use default
        const saved = localStorage.getItem('nexus_portfolio_config');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
            } catch (e) {
                console.warn('CONFIG_CORRUPT: Resetting to default.');
            }
        }
    },

    cacheElements() {
        this.elements = {
            panel: document.getElementById('customizer-panel'),
            openBtn: document.getElementById('customize-btn'),
            closeBtn: document.getElementById('close-customizer'),
            saveBtn: document.getElementById('save-config-btn'),
            addProjectBtn: document.getElementById('add-project-btn'),
            projectsList: document.getElementById('projects-list'),
            inputs: {
                username: document.getElementById('input-username'),
                title: document.getElementById('input-title'),
                colorPrimary: document.getElementById('input-color-primary'),
                colorSecondary: document.getElementById('input-color-secondary'),
                floor: document.getElementById('input-floor')
            },
            tabs: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content')
        };
    },

    bindEvents() {
        // Toggle Panel
        this.elements.openBtn.onclick = () => this.elements.panel.classList.remove('hidden');
        this.elements.closeBtn.onclick = () => this.elements.panel.classList.add('hidden');

        // Tabs
        this.elements.tabs.forEach(tab => {
            tab.onclick = () => {
                // Reset active state
                this.elements.tabs.forEach(t => t.classList.remove('active'));
                this.elements.tabContents.forEach(c => c.classList.remove('active'));

                // Set new active
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            };
        });

        // Add Project
        this.elements.addProjectBtn.onclick = () => this.addProject();

        // Save
        this.elements.saveBtn.onclick = () => this.save();
    },

    hydrateUI() {
        const { inputs } = this.elements;
        inputs.username.value = this.config.username;
        inputs.title.value = this.config.title;
        inputs.colorPrimary.value = this.config.theme.primary;
        inputs.colorSecondary.value = this.config.theme.secondary;
        inputs.floor.value = this.config.theme.floor;

        this.renderProjects();
        this.updateHeroUI();
    },

    renderProjects() {
        const list = this.elements.projectsList;
        list.innerHTML = '';

        this.config.projects.forEach((proj, index) => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.innerHTML = `
                <button class="delete-project" data-index="${index}">X</button>
                <div class="input-group">
                    <label>ID: ${proj.id}</label>
                    <input type="text" value="${proj.name}" data-field="name" data-index="${index}">
                </div>
                <div class="input-group">
                    <input type="text" value="${proj.desc}" data-field="desc" data-index="${index}">
                </div>
                 <div class="input-group">
                    <input type="color" value="${proj.color}" data-field="color" data-index="${index}">
                </div>
            `;

            // Bind inputs
            item.querySelectorAll('input').forEach(input => {
                input.oninput = (e) => {
                    const field = e.target.dataset.field;
                    this.config.projects[index][field] = e.target.value;
                };
            });

            item.querySelector('.delete-project').onclick = () => {
                this.config.projects.splice(index, 1);
                this.renderProjects();
            };

            list.appendChild(item);
        });
    },

    addProject() {
        this.config.projects.push({
            id: Date.now(),
            name: "NEW_NODE",
            desc: "Project Description",
            color: "#ffffff",
            link: "#"
        });
        this.renderProjects();
    },

    save() {
        // Collect Main Inputs
        const { inputs } = this.elements;
        this.config.username = inputs.username.value;
        this.config.title = inputs.title.value;
        this.config.theme = {
            primary: inputs.colorPrimary.value,
            secondary: inputs.colorSecondary.value,
            floor: inputs.floor.value
        };

        // Persist
        localStorage.setItem('nexus_portfolio_config', JSON.stringify(this.config));

        // Update UI info immediately
        this.updateHeroUI();

        // Callback to main.js to rebuild 3D world
        if (this.onUpdate) this.onUpdate(this.config);

        alert("SYSTEM_UPDATED :: RELOADING_WORLD");
        this.elements.panel.classList.add('hidden');
    },

    updateHeroUI() {
        document.getElementById('hero-title').textContent = this.config.title || "THE_NEXUS";
        document.getElementById('hero-subtitle').textContent = `ARCHITECT: ${this.config.username}`;

        // Dynamic CSS Variables
        document.documentElement.style.setProperty('--neon-blue', this.config.theme.primary);
        document.documentElement.style.setProperty('--neon-pink', this.config.theme.secondary);
    }
};
