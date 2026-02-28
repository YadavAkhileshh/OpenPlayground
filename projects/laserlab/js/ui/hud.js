/**
 * HUD Class
 * Manages UI overlays.
 */
export class HUD {
    constructor() {
        this.infoPanel = document.getElementById('info-panel');
    }

    update(levelIndex, targetsHit, totalTargets) {
        if (this.infoPanel) {
            this.infoPanel.innerText = `Level: ${levelIndex + 1} | Targets: ${targetsHit}/${totalTargets}`;
            if (targetsHit === totalTargets && totalTargets > 0) {
                this.infoPanel.style.color = '#0f0';
                this.infoPanel.innerText += " - SUCCESS!";
            } else {
                this.infoPanel.style.color = '#aaa';
            }
        }
    }
}
