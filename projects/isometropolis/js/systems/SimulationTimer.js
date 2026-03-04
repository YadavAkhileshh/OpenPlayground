import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * Handles macro-level time (Days, Months, Years) independently from drawing frames.
 */
export class SimulationTimer {
    /**
     * @param {EventEmitter} events
     */
    constructor(events) {
        this.events = events;

        // 1 day = 1 real second at 1x speed
        this.dayDuration = 1.0;
        this.timer = 0;

        this.day = 1;
        this.month = 0; // 0-based
        this.year = 2000;

        this.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    /**
     * @param {number} dt Delta time
     */
    update(dt) {
        this.timer += dt;

        while (this.timer >= this.dayDuration) {
            this.timer -= this.dayDuration;
            this.advanceDay();
        }
    }

    advanceDay() {
        this.day++;
        let endOfMonth = false;

        // Simple 30 day months
        if (this.day > 30) {
            this.day = 1;
            this.month++;
            endOfMonth = true;

            if (this.month > 11) {
                this.month = 0;
                this.year++;
            }
        }

        this.events.emit('sim:day', this.getDateString());

        if (endOfMonth) {
            this.events.emit('sim:month', this.getDateString());
        }
    }

    getDateString() {
        return `${this.monthNames[this.month]} ${this.year}`;
    }
}
