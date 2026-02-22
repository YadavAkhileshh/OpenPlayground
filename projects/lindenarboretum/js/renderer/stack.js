/**
 * LindenArboretum - Matrix/Turtle Stack
 * Handles the branching logic `[` and `]`.
 * Memory pre-allocated stack to prevent slow object creation inside deep recursive loops.
 */

import { Turtle } from './turtle.js';

export class SaveStack {
    constructor(maxDepth = 100000) {
        // Pre-allocate array
        this.stack = new Array(maxDepth);
        this.pointer = 0;
        this.maxDepth = maxDepth;

        // Pre-fill with empty turtle objects to reuse
        for (let i = 0; i < maxDepth; i++) {
            this.stack[i] = new Turtle();
        }
    }

    /**
     * Pushes the current turtle state to the stack.
     * @param {Turtle} state 
     */
    push(state) {
        if (this.pointer >= this.maxDepth) {
            throw new Error("Stack Overflow: Tree is too complex or depth is too high.");
        }

        // Copy state into the pre-allocated object instead of creating a new one
        const target = this.stack[this.pointer++];
        target.position.copy(state.position);
        target.angle = state.angle;
        target.thickness = state.thickness;
        target.length = state.length;
        target.depth = state.depth;
        target.windOffset = state.windOffset;
    }

    /**
     * Pops the state from the stack and writes it onto the target.
     * @param {Turtle} targetState 
     */
    pop(targetState) {
        if (this.pointer <= 0) {
            console.warn("Stack Underflow: More ']' operators than '[' in rules.");
            return;
        }

        const source = this.stack[--this.pointer];
        targetState.position.copy(source.position);
        targetState.angle = source.angle;
        targetState.thickness = source.thickness;
        targetState.length = source.length;
        targetState.depth = source.depth;
        targetState.windOffset = source.windOffset;
    }

    clear() {
        this.pointer = 0;
    }
}
