import { Knob } from '../ui/knob.js';

export class BaseModule {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.element = this.createDOM();
        
        // Map of Jack ID -> AudioNode
        this.inputs = {}; 
        this.outputs = {};
        this.params = {};
    }

    createDOM() {
        const div = document.createElement('div');
        div.className = 'module';
        div.id = `mod-${this.id}`;
        
        div.innerHTML = `
            <div class="module-header">
                <span>${this.name}</span>
                ${this.type !== 'OUTPUT' ? '<button class="btn-remove"><i class="fas fa-times"></i></button>' : ''}
            </div>
            <div class="module-content" id="content-${this.id}"></div>
        `;

        if (this.type !== 'OUTPUT') {
            div.querySelector('.btn-remove').addEventListener('click', () => {
                // Trigger removal event (handled by main)
                div.dispatchEvent(new CustomEvent('remove-module', { bubbles: true, detail: { id: this.id } }));
            });
        }

        return div;
    }

    addKnob(label, min, max, initial, callback) {
        const container = document.getElementById(`content-${this.id}`);
        const wrapper = document.createElement('div');
        wrapper.className = 'knob-container';
        
        const kEl = document.createElement('div');
        kEl.className = 'knob';
        
        const lEl = document.createElement('span');
        lEl.className = 'knob-label';
        lEl.innerText = label;

        wrapper.appendChild(kEl);
        wrapper.appendChild(lEl);
        container.appendChild(wrapper);

        new Knob(kEl, min, max, initial, callback);
    }

    addJacks(inputs = [], outputs = []) {
        const container = document.getElementById(`content-${this.id}`);
        const row = document.createElement('div');
        row.className = 'jack-row';

        const createJack = (name, type) => {
            const jId = `${this.id}-${type}-${name}`;
            const wrap = document.createElement('div');
            wrap.className = 'jack-container';
            wrap.innerHTML = `
                <div class="jack ${type}" id="${jId}" data-id="${jId}" data-type="${type}" data-module="${this.id}"></div>
                <span class="jack-label">${name}</span>
            `;
            return wrap;
        };

        inputs.forEach(name => row.appendChild(createJack(name, 'input')));
        outputs.forEach(name => row.appendChild(createJack(name, 'output')));

        container.appendChild(row);
    }
}