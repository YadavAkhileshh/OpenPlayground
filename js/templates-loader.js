/**
 * Templates Loader - Loads and displays project templates
 */

class TemplatesLoader {
    constructor() {
        this.container = document.getElementById('templates-container');
        this.templates = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        await this.loadTemplates();
        this.renderTemplates();
        this.setupEventListeners();
    }

    async loadTemplates() {
        try {
            const response = await fetch('./templates.json');
            if (!response.ok) throw new Error('Failed to load templates');
            this.templates = await response.json();
        } catch (error) {
            console.error('Error loading templates:', error);
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="ri-error-warning-line"></i></div>
                    <h3>Failed to load templates</h3>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    renderTemplates() {
        this.container.innerHTML = '';
        
        const filtered = this.currentFilter === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.category === this.currentFilter);
        
        if (filtered.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="ri-folder-open-line"></i></div>
                    <h3>No templates found</h3>
                    <p>Try selecting a different category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(template => {
            const card = this.createTemplateCard(template);
            this.container.appendChild(card);
        });
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        
        const difficultyColor = {
            'Beginner': 'bg-green-100 text-green-700',
            'Intermediate': 'bg-yellow-100 text-yellow-700',
            'Advanced': 'bg-red-100 text-red-700'
        };

        const featuresHtml = (template.features || []).map(f => 
            `<span class="template-feature">${f}</span>`
        ).join('');

        const techHtml = (template.tech || []).map(t => 
            `<span class="template-tech">${t}</span>`
        ).join('');

        card.innerHTML = `
            <div class="template-card-header">
                <div class="template-icon">
                    <i class="ri-file-code-line"></i>
                </div>
                <span class="template-difficulty ${difficultyColor[template.difficulty] || ''}">${template.difficulty}</span>
            </div>
            <div class="template-card-body">
                <h3 class="template-title">${this.escapeHtml(template.title)}</h3>
                <p class="template-description">${this.escapeHtml(template.description)}</p>
                <div class="template-features">
                    ${featuresHtml}
                </div>
                <div class="template-tech-stack">
                    ${techHtml}
                </div>
            </div>
            <div class="template-card-footer">
                <button class="template-btn use-template" data-template-id="${template.id}">
                    <i class="ri-download-line"></i> Use Template
                </button>
                <button class="template-btn preview-template" data-template-id="${template.id}">
                    <i class="ri-eye-line"></i> Preview
                </button>
            </div>
        `;

        card.querySelector('.use-template').addEventListener('click', () => {
            this.useTemplate(template);
        });

        card.querySelector('.preview-template').addEventListener('click', () => {
            this.previewTemplate(template);
        });

        return card;
    }

    useTemplate(template) {
        const modal = document.createElement('div');
        modal.className = 'template-modal-overlay';
        modal.innerHTML = `
            <div class="template-modal">
                <div class="template-modal-header">
                    <h3>Use "${template.title}" Template</h3>
                    <button class="template-modal-close">&times;</button>
                </div>
                <div class="template-modal-body">
                    <p>This template includes:</p>
                    <ul>
                        ${(template.features || []).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    <p class="template-note">
                        <i class="ri-information-line"></i> 
                        Templates are boilerplate code structures to help you get started. 
                        Customize them to fit your needs!
                    </p>
                </div>
                <div class="template-modal-footer">
                    <button class="template-modal-btn secondary">Cancel</button>
                    <button class="template-modal-btn primary">Get Started</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.template-modal-close');
        const cancelBtn = modal.querySelector('.secondary');
        const getStartedBtn = modal.querySelector('.primary');

        const closeModal = () => modal.remove();
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        getStartedBtn.addEventListener('click', () => {
            modal.remove();
            this.showTemplateInstructions(template);
        });
    }

    previewTemplate(template) {
        const modal = document.createElement('div');
        modal.className = 'template-modal-overlay';
        modal.innerHTML = `
            <div class="template-modal template-preview-modal">
                <div class="template-modal-header">
                    <h3>${template.title} Preview</h3>
                    <button class="template-modal-close">&times;</button>
                </div>
                <div class="template-modal-body">
                    <div class="template-preview-content">
                        <h4>Project Structure</h4>
                        <pre class="template-structure">
${template.title}/
├── index.html
├── style.css
├── script.js
└── README.md
                        </pre>
                        <h4>Technologies Used</h4>
                        <div class="preview-tech-stack">
                            ${(template.tech || []).map(t => `<span>${t}</span>`).join('')}
                        </div>
                        <h4>Features</h4>
                        <ul>
                            ${(template.features || []).map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="template-modal-footer">
                    <button class="template-modal-btn primary">Use This Template</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.template-modal-close');
        const useBtn = modal.querySelector('.template-modal-btn.primary');

        const closeModal = () => modal.remove();
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        useBtn.addEventListener('click', () => {
            modal.remove();
            this.showTemplateInstructions(template);
        });
    }

    showTemplateInstructions(template) {
        const instructions = `
            <h4>Getting Started with "${template.title}" Template</h4>
            <ol>
                <li>Create a new project folder in the <code>projects/</code> directory</li>
                <li>Name it something descriptive (e.g., <code>my-${template.id}</code>)</li>
                <li>Create the following files in your project folder:
                    <ul>
                        <li><code>index.html</code> - Your main HTML structure</li>
                        <li><code>style.css</code> - Your CSS styling</li>
                        <li><code>script.js</code> - Your JavaScript logic</li>
                    </ul>
                </li>
                <li>Add your project to <code>projects.json</code></li>
                <li>Test your project and make it your own!</li>
            </ol>
            <p><strong>Tech Stack:</strong> ${template.tech.join(', ')}</p>
            <p><strong>Difficulty:</strong> ${template.difficulty}</p>
        `;

        alert(instructions.replace(/<[^>]*>/g, '\n').replace(/\n{3,}/g, '\n\n'));
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.template-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.category;
                this.renderTemplates();
            });
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

function initTemplatesLoader() {
    try {
        new TemplatesLoader();
    } catch (err) {
        console.error('[TemplatesLoader] initialization error:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemplatesLoader);
} else {
    initTemplatesLoader();
}
