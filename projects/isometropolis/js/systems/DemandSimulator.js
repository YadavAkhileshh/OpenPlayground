import { EventEmitter } from '../engine/EventEmitter.js';
import { Utils } from '../math/Utils.js';

/**
 * Calculates RCI (Residential, Commercial, Industrial) demand dynamically
 * based on population, jobs, and taxes.
 */
export class DemandSimulator {
    /**
     * @param {CityMap} map
     * @param {EventEmitter} events
     */
    constructor(map, events) {
        this.map = map;
        this.events = events;

        // [-100, 100]
        this.res = 50;
        this.com = 50;
        this.ind = 50;

        this.events.on('sim:day', () => this.updateDemand());
    }

    updateDemand() {
        let pop = 0;
        let jobsC = 0;
        let jobsI = 0;

        for (let i = 0; i < this.map.grid.length; i++) {
            const t = this.map.grid[i];
            if (t.type === 'building') {
                if (t.buildingType === 'R') pop += t.population;
                if (t.buildingType === 'C') jobsC += t.jobs;
                if (t.buildingType === 'I') jobsI += t.jobs;
            }
        }

        const totalJobs = jobsC + jobsI;

        // Very basic RCI economics

        // Industry wants workers (demand goes up if workers exceed jobs)
        if (pop > totalJobs) {
            this.ind += 2;
        } else {
            this.ind -= 2;
        }

        // Commercial wants customers (population) and workers
        if (pop > (jobsC * 2)) {
            this.com += 2;
        } else {
            this.com -= 2;
        }

        // Residential wants jobs
        if (totalJobs > (pop * 0.8)) {
            this.res += 2;
        } else {
            this.res -= 2;
        }

        // Add tiny random fluctuation
        this.res += Utils.randomInt(-2, 2);
        this.com += Utils.randomInt(-2, 2);
        this.ind += Utils.randomInt(-2, 2);

        // Clamp
        this.res = Utils.clamp(this.res, -100, 100);
        this.com = Utils.clamp(this.com, -100, 100);
        this.ind = Utils.clamp(this.ind, -100, 100);

        this.events.emit('ui:demand', { r: this.res, c: this.com, i: this.ind });
        this.events.emit('ui:population', { pop });
    }
}
