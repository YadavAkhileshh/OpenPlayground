export default class NoteNode {
    constructor(id, data, onUpdate, viewport) {
        this.id = id || Date.now();
        this.data = data || { title: 'New Star', text: '', x: 0, y: 0, file: null };
        this.onUpdate = onUpdate;
        this.viewport = viewport;

        this.element = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    render(parent) {
        const div = document.createElement('div');
        div.className = 'note-node';
        div.style.left = `${this.data.x}px`;
        div.style.top = `${this.data.y}px`;
        div.dataset.id = this.id;

        const fileHtml = this.data.file ? `
            <div class="file-attachment">
                <span class="file-icon">📄</span>
                <span class="file-name">${this.data.file.name}</span>
            </div>
        ` : '';

        div.innerHTML = `
            <header>
                <span>Star #${String(this.id).slice(-4)}</span>
                <div class="header-tools">
                    <button class="link-node" title="Connect to another star">🔗</button>
                    <button class="delete-node" title="Remove star">&times;</button>
                </div>
            </header>
            <textarea class="content" placeholder="Ethereal thoughts...">${this.data.text}</textarea>
            ${fileHtml}
        `;

        this.element = div;
        parent.appendChild(div);

        this.bindEvents();
        return div;
    }

    bindEvents() {
        const textarea = this.element.querySelector('.content');
        const deleteBtn = this.element.querySelector('.delete-node');
        const linkBtn = this.element.querySelector('.link-node');

        textarea.addEventListener('input', (e) => {
            this.data.text = e.target.value;
            this.onUpdate();
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.element.remove();
            this.onUpdate(true, this.id);
        });

        linkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.element.dispatchEvent(new CustomEvent('node:request-link', {
                bubbles: true,
                detail: { id: this.id }
            }));
        });

        // Click for linking selection
        this.element.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            e.stopPropagation(); // Prevents canvas background click
            this.element.dispatchEvent(new CustomEvent('node:click', {
                bubbles: true,
                detail: { id: this.id }
            }));
        });

        // Draggable Star Fix
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;

            this.isDragging = true;

            // Convert current mouse to world position
            const worldMouse = this.viewport.toWorld(e.clientX, e.clientY);
            this.dragOffset = {
                x: worldMouse.x - this.data.x,
                y: worldMouse.y - this.data.y
            };

            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const worldMouse = this.viewport.toWorld(e.clientX, e.clientY);
            this.data.x = worldMouse.x - this.dragOffset.x;
            this.data.y = worldMouse.y - this.dragOffset.y;

            this.element.style.left = `${this.data.x}px`;
            this.element.style.top = `${this.data.y}px`;
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.onUpdate();
            }
        });
    }
}
