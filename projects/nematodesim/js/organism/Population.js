// NematodeSim — Population
// Manages the collection of NematodeOrganisms in the tank.
// Handles creation, update dispatching, viscosity/frequency propagation,
// and StabilityGuard reset coordination.

import { NematodeOrganism } from './NematodeOrganism.js';
import { BodyFactory } from './BodyFactory.js';
import { FluidMedium } from '../drag/FluidMedium.js';
import { StabilityGuard } from '../sim/StabilityGuard.js';
import Config from '../sim/Config.js';

export class Population {
    /**
     * @param {number} canvasW
     * @param {number} canvasH
     * @param {number} [count]   Number of organisms to spawn
     */
    constructor(canvasW, canvasH, count = Config.ORGANISM_COUNT) {
        this.canvasW = canvasW;
        this.canvasH = canvasH;
        this.count = count;
        this.fluid = new FluidMedium(Config.VISCOSITY_DEFAULT);
        this.factory = new BodyFactory(canvasW, canvasH);
        this.organisms = [];
        this.guard = new StabilityGuard();
        this._frame = 0;

        this._spawnAll(count);
    }

    /** Spawn N organisms at random positions. */
    _spawnAll(n) {
        for (let i = 0; i < n; i++) {
            const body = this.factory.create();
            const org = new NematodeOrganism(body, this.fluid, this.canvasW, this.canvasH);
            // Stagger CPG start phases so they swim differently
            org.cpg.clock._phase = Math.random() * 2 * Math.PI;
            this.organisms.push(org);
        }
    }

    /**
     * Update all organisms for one simulation frame.
     * @param {number} dt  Timestep (seconds)
     */
    update(dt) {
        const orgs = this.organisms;
        const n = orgs.length;
        for (let i = 0; i < n; i++) {
            orgs[i].update(dt);
        }

        // Periodic stability check
        this._frame++;
        if (this._frame % Config.NAN_RESET_INTERVAL === 0) {
            for (let i = 0; i < n; i++) {
                if (this.guard.check(orgs[i])) {
                    this.factory.respawn(orgs[i].body);
                }
            }
        }
    }

    /**
     * Set oscillation frequency for all organisms.
     * @param {number} hz
     */
    setFrequency(hz) {
        this.organisms.forEach(o => o.setFrequency(hz));
    }

    /**
     * Set viscosity for all organisms and the fluid medium.
     * @param {number} v  Normalized [0, 1]
     */
    setViscosity(v) {
        this.fluid.setViscosity(v);
        this.organisms.forEach(o => o.setViscosity(v));
    }

    /** Resize all organisms and the body factory. */
    resize(w, h) {
        this.canvasW = w;
        this.canvasH = h;
        this.factory.resize(w, h);
        this.organisms.forEach(o => o.resize(w, h));
    }

    /** Access organism by index. */
    get(i) { return this.organisms[i]; }

    /** Total organism count. */
    get size() { return this.organisms.length; }
}

export default Population;
