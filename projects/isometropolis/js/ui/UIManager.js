import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * Handles general UI updates (Top bar stats, demand bars, system buttons)
 */
export class UIManager {
    /**
     * @param {EventEmitter} events
     * @param {Time} time
     * @param {EconomySystem} economy
     */
    constructor(events, time, economy) {
        this.events = events;
        this.time = time;
        this.economy = economy;

        this.els = {
            pop: document.getElementById('stat-population'),
            funds: document.getElementById('stat-funds'),
            date: document.getElementById('stat-date'),
            power: document.getElementById('stat-power'),
            btnPause: document.getElementById('btn-pause'),
            btnPlay: document.getElementById('btn-play'),
            btnFast: document.getElementById('btn-fast'),
            barR: document.getElementById('bar-r'),
            barC: document.getElementById('bar-c'),
            barI: document.getElementById('bar-i')
        };

        this._bindEvents();
    }

    _bindEvents() {
        // System speed buttons
        this.els.btnPause.addEventListener('click', () => { this.time.setScale(0); this._updateSpeedUI(); });
        this.els.btnPlay.addEventListener('click', () => { this.time.setScale(1); this._updateSpeedUI(); });
        this.els.btnFast.addEventListener('click', () => { this.time.setScale(5); this._updateSpeedUI(); }); // 5x

        // Listen to engine events
        this.events.on('sim:day', (d) => {
            this.els.date.textContent = d;
        });

        this.events.on('economy:update', (f) => {
            this.els.funds.textContent = Math.floor(f).toLocaleString();
        });

        this.events.on('ui:population', (p) => {
            this.els.pop.textContent = Math.floor(p.pop).toLocaleString();
        });

        this.events.on('ui:demand', (d) => {
            // Map [-100, 100] to [0%, 100%]
            const mapDemand = (val) => Math.max(0, Math.min(100, ((val + 100) / 200) * 100)) + '%';
            this.els.barR.style.height = mapDemand(d.r);
            this.els.barC.style.height = mapDemand(d.c);
            this.els.barI.style.height = mapDemand(d.i);
        });

        this.events.on('power:updated', (p) => {
            this.els.power.textContent = `${p.demand}/${p.output}`;
            if (p.demand > p.output) {
                this.els.power.style.color = '#e74c3c';
            } else {
                this.els.power.style.color = '';
            }
        });

        this.events.on('ui:error', (msg) => {
            // Shake funds element to indicate error visually
            const el = this.els.funds.parentElement;
            el.classList.remove('error-shake');
            void el.offsetWidth; // reset animation
            el.classList.add('error-shake');
            console.warn("UI Error:", msg);
        });
    }

    _updateSpeedUI() {
        this.els.btnPause.classList.remove('active');
        this.els.btnPlay.classList.remove('active');
        this.els.btnFast.classList.remove('active');

        if (this.time.timeScale === 0) this.els.btnPause.classList.add('active');
        else if (this.time.timeScale === 1) this.els.btnPlay.classList.add('active');
        else this.els.btnFast.classList.add('active');
    }
}
