import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * Handles the right-hand info panel when selecting tiles.
 */
export class InfoPanelController {
    /**
     * @param {EventEmitter} events
     */
    constructor(events) {
        this.events = events;

        this.panel = document.getElementById('info-panel');
        this.closeBtn = document.getElementById('close-info');

        this.els = {
            title: document.getElementById('info-title'),
            type: document.getElementById('info-type'),
            density: document.getElementById('info-density'),
            power: document.getElementById('info-power'),
            value: document.getElementById('info-value')
        };

        this._bindEvents();
    }

    _bindEvents() {
        this.closeBtn.addEventListener('click', () => this.hide());

        this.events.on('ui:selectTile', (tile) => {
            if (tile) this.show(tile);
            else this.hide();
        });
    }

    show(tile) {
        this.panel.classList.remove('hidden');

        this.els.title.textContent = `Tile [${tile.x}, ${tile.y}]`;

        if (tile.type === 'road') {
            this.els.type.textContent = 'Road Network';
            this.els.density.textContent = 'N/A';
        } else if (tile.type === 'power_plant') {
            this.els.type.textContent = 'Power Plant';
            this.els.density.textContent = 'High Output';
        } else if (tile.type === 'building') {
            let typeStr = 'Residential';
            if (tile.buildingType === 'C') typeStr = 'Commercial';
            if (tile.buildingType === 'I') typeStr = 'Industrial';
            this.els.type.textContent = typeStr;
            this.els.density.textContent = `Level ${tile.developmentLevel}`;
        } else {
            if (tile.zoning !== 'none') {
                this.els.type.textContent = `Zoned: ${tile.zoning}`;
            } else {
                this.els.type.textContent = 'Empty Terrain';
            }
            this.els.density.textContent = '0';
        }

        if (tile.hasPowerNode && tile.type !== 'road' && tile.type !== 'power_plant') {
            this.els.power.textContent = 'Utility Line';
        } else {
            this.els.power.textContent = tile.isPowered ? 'Connected' : 'Unpowered';
        }

        this.els.value.textContent = `$${tile.landValue}/sq`;
    }

    hide() {
        this.panel.classList.add('hidden');
    }
}
