export class Toolbar {
    constructor(elementId, app) {
        this.element = document.getElementById(elementId);
        this.app = app;
        this.tools = [
            { id: 'laser', icon: '🔦', label: 'Laser' },
            { id: 'mirror', icon: '🪞', label: 'Mirror' },
            { id: 'splitter', icon: '✨', label: 'Splitter' },
            { id: 'sensor', icon: '📡', label: 'Sensor' },
            { id: 'filter', icon: '🎨', label: 'Filter' },
            { id: 'prism', icon: '💎', label: 'Prism' },
            { id: 'AND', icon: '&', label: 'AND Gate' },
            { id: 'OR', icon: '≥1', label: 'OR Gate' },
            { id: 'NOT', icon: '!', label: 'NOT Gate' }
        ];
        this.init();
    }

    init() {
        this.element.innerHTML = '';
        this.tools.forEach(tool => {
            const btn = document.createElement('div');
            btn.className = 'palette-item';
            btn.innerHTML = `<span class="palette-icon">${tool.icon}</span><span class="palette-label">${tool.label}</span>`;
            btn.onclick = () => this.app.input.addComponent(tool.id);
            this.element.appendChild(btn);
        });
    }
}
