import { EventEmitter } from '../engine/EventEmitter.js';
import { CityMap } from '../simulation/CityMap.js';

/**
 * Manages City Funds, Taxes, and Upkeep.
 */
export class EconomySystem {
    /**
     * @param {CityMap} map
     * @param {EventEmitter} events
     */
    constructor(map, events) {
        this.map = map;
        this.events = events;

        this.funds = 10000;

        // Tax Rates (percentages)
        this.taxRateR = 0.09;
        this.taxRateC = 0.09;
        this.taxRateI = 0.09;

        this.events.on('sim:month', () => this.processMonthlyEconomy());
    }

    /**
     * Can we afford this?
     */
    canAfford(amount) {
        return this.funds >= amount;
    }

    /**
     * Spend money.
     */
    spend(amount) {
        if (this.canAfford(amount)) {
            this.funds -= amount;
            this.events.emit('economy:update', this.funds);
            return true;
        }
        this.events.emit('ui:error', 'Insufficient Funds!');
        return false;
    }

    /**
     * Called the end of every month to collect taxes and pay upkeep.
     */
    processMonthlyEconomy() {
        let revenue = 0;
        let upkeep = 0;

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const t = this.map.getTile(x, y);

                // Upkeep
                if (t.type === 'road') upkeep += 1; // 1 per road
                if (t.isPowerPlant) upkeep += 50; // 50 per power plant
                if (t.hasPowerNode && t.type === 'empty') upkeep += 2; // lines cost 2

                // Income
                if (t.type === 'building' && t.isPowered) {
                    if (t.buildingType === 'R') revenue += t.population * this.taxRateR * 2;
                    if (t.buildingType === 'C') revenue += t.jobs * this.taxRateC * 3;
                    if (t.buildingType === 'I') revenue += t.jobs * this.taxRateI * 4;
                }
            }
        }

        const net = Math.floor(revenue - upkeep);
        this.funds += net;

        this.events.emit('economy:monthlyReport', { revenue, upkeep, net, funds: this.funds });
        this.events.emit('economy:update', this.funds);
    }
}
