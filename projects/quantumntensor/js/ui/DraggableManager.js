/**
 * js/ui/DraggableManager.js
 * Translates mouse/touch events into visual dragging states
 * and relays drop events back to the Controller.
 */

class DraggableManager {
    constructor(callbacks) {
        this.onDrop = callbacks.onDrop || function () { };
        this.onClickDrag = callbacks.onClickDrag || function () { };

        this.dragNode = null;
        this.sourceType = null; // 'palette' or 'grid'
        this.sourceGateId = null;

        this.offsetX = 0;
        this.offsetY = 0;

        // Bindings to preserve 'this'
        this._onPointerDown = this.onPointerDown.bind(this);
        this._onPointerMove = this.onPointerMove.bind(this);
        this._onPointerUp = this.onPointerUp.bind(this);
    }

    attachListeners() {
        document.addEventListener('pointerdown', this._onPointerDown);
        document.addEventListener('pointermove', this._onPointerMove);
        document.addEventListener('pointerup', this._onPointerUp);
    }

    detachListeners() {
        document.removeEventListener('pointerdown', this._onPointerDown);
        document.removeEventListener('pointermove', this._onPointerMove);
        document.removeEventListener('pointerup', this._onPointerUp);
    }

    onPointerDown(e) {
        // Did we click a gate?
        const target = e.target.closest('.quantum-gate');
        if (!target) return;

        // Ignore right clicks
        if (e.button === 2) return;

        e.preventDefault();

        this.sourceType = target.classList.contains('palette-gate') ? 'palette' : 'grid';

        if (this.sourceType === 'palette') {
            // Clone the palette node for dragging
            this.dragNode = target.cloneNode(true);
            this.dragNode.classList.remove('palette-gate');
            this.dragNode.classList.add('grid-gate', 'dragging');
            document.body.appendChild(this.dragNode);
        } else {
            // Detach grid node and make absolute
            this.sourceGateId = target.dataset.instanceId;
            this.dragNode = target;

            // Store original rect to calculate absolute coordinates properly
            let rect = target.getBoundingClientRect();
            document.body.appendChild(this.dragNode);
            this.dragNode.classList.add('dragging');

            // Re-apply absolute starting positions matching previous visual location
            this.dragNode.style.left = rect.left + 'px';
            this.dragNode.style.top = rect.top + 'px';
        }

        // Calculate offset so we drag by where user clicked, not top-left
        let dRect = this.dragNode.getBoundingClientRect();
        this.offsetX = e.clientX - dRect.left;
        this.offsetY = e.clientY - dRect.top;

        // Initial manual position sync
        this.onPointerMove(e);

        // Trigger generic callback
        this.onClickDrag();
    }

    onPointerMove(e) {
        if (!this.dragNode) return;

        e.preventDefault();

        // Apply position
        const newX = e.clientX - this.offsetX;
        const newY = e.clientY - this.offsetY;

        this.dragNode.style.position = 'absolute';
        this.dragNode.style.zIndex = '9999';
        this.dragNode.style.left = `${newX}px`;
        this.dragNode.style.top = `${newY}px`;
    }

    onPointerUp(e) {
        if (!this.dragNode) return;

        e.preventDefault();
        this.dragNode.classList.remove('dragging');

        let gateType = this.dragNode.dataset.type;

        // Fire drop callback
        let successInfo = this.onDrop({
            clientX: e.clientX,
            clientY: e.clientY,
            type: gateType,
            sourceType: this.sourceType,
            sourceInstanceId: this.sourceGateId,
            dragNode: this.dragNode
        });

        if (!successInfo) {
            // Failed drop (e.g. out of grid or occupied), destroy DOM element visually
            this.dragNode.remove();
        }

        // Cleanup state
        this.dragNode = null;
        this.sourceType = null;
        this.sourceGateId = null;
    }
}

window.DraggableManager = DraggableManager;
