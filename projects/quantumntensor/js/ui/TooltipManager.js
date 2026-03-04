/**
 * js/ui/TooltipManager.js
 * Shows math data hovering over gates.
 */

class TooltipManager {
    constructor() {
        this.tooltip = document.getElementById('global-tooltip');
        this.activeGridNodes = [];

        document.addEventListener('mouseover', this.onMouseOver.bind(this));
        document.addEventListener('mouseout', this.onMouseOut.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseOver(e) {
        let gate = e.target.closest('.quantum-gate[data-tooltip]');
        if (gate && !gate.classList.contains('dragging')) {
            this.show(gate.dataset.tooltip, gate.dataset.desc, e.pageX, e.pageY);
        }
    }

    onMouseOut(e) {
        let gate = e.target.closest('.quantum-gate');
        if (gate) {
            this.hide();
        }
    }

    onMouseMove(e) {
        if (!this.tooltip.classList.contains('hidden')) {
            this.tooltip.style.left = (e.pageX + 15) + 'px';
            this.tooltip.style.top = (e.pageY + 15) + 'px';
        }
    }

    show(title, desc, x, y) {
        this.tooltip.innerHTML = `<strong>${title}</strong><br/><span>${desc}</span>`;
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y + 15) + 'px';
        this.tooltip.classList.remove('hidden');
    }

    hide() {
        this.tooltip.classList.add('hidden');
    }
}

window.TooltipManager = TooltipManager;
