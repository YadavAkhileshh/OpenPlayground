/**
 * js/simulation/agentPool.js
 * Pre-allocates and manages the 10,000 agents to avoid GC.
 */

import { Agent } from './agent.js';
import { CONFIG } from '../core/config.js';

export class AgentPool {
    constructor(maxSize = CONFIG.MAX_AGENTS) {
        this.maxSize = maxSize;
        this.pool = new Array(maxSize);
        this.activeCount = 0;

        // Initialize pool with inactive agents
        for (let i = 0; i < maxSize; i++) {
            this.pool[i] = new Agent(i, 0, 0);
        }
    }

    // Activate a new agent from the pool and place it
    spawn(x, y) {
        if (this.activeCount < this.maxSize) {
            const agent = this.pool[this.activeCount];
            agent.reset(x, y);
            this.activeCount++;
            return agent;
        }
        return null; // Pool full
    }

    // To remove an agent, we swap it with the last active agent
    // This maintains O(1) removal without arrays splicing
    remove(index) {
        if (index >= 0 && index < this.activeCount) {
            const agentToRemove = this.pool[index];
            agentToRemove.isActive = false;

            const lastActiveIndex = this.activeCount - 1;

            if (index !== lastActiveIndex) {
                // Swap
                const lastAgent = this.pool[lastActiveIndex];
                this.pool[index] = lastAgent;
                this.pool[lastActiveIndex] = agentToRemove;
            }

            this.activeCount--;
            return true;
        }
        return false;
    }

    clear() {
        for (let i = 0; i < this.activeCount; i++) {
            this.pool[i].isActive = false;
        }
        this.activeCount = 0;
    }

    // Returns just the active portion of the array for fast iteration
    getActive() {
        // Warning: This mutates the original array reference, returning a view
        // Do not store this reference long term.
        // It's faster than Array.slice()
        // We will just iterate up to activeCount externally for max speed.
        return this.pool;
    }
}
