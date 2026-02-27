/* js/ui/hud.js */
export class HUD {
    constructor() {
        this.massDisplay = document.getElementById('mass-display');
        this.consumedDisplay = document.getElementById('consumed-display');
        this.traitsDisplay = document.getElementById('traits-display');
    }

    updateStats(mass, consumed) {
        this.massDisplay.innerText = Math.floor(mass);
        this.consumedDisplay.innerText = consumed;
    }

    addTrait(name, color) {
        const badge = document.createElement('span');
        badge.className = 'trait-badge';
        badge.innerText = name;
        badge.style.borderColor = color;
        badge.style.color = color;

        this.traitsDisplay.appendChild(badge);

        // Limit traits
        if (this.traitsDisplay.children.length > 5) {
            this.traitsDisplay.removeChild(this.traitsDisplay.firstChild);
        }
    }
}
