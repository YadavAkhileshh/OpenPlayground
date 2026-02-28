// ============================================
// ChaosButtons - Mutation Engine
// Evolves button behaviors over time
// ============================================

const ChaosMutations = {
    // Mutation strategies
    STRATEGIES: {
        ADD_BEHAVIOR: 'add_behavior',
        STACK_BEHAVIORS: 'stack_behaviors',
        SWAP_BEHAVIOR: 'swap_behavior',
        INTENSIFY: 'intensify',
        RANDOMIZE_ALL: 'randomize_all'
    },

    // Mutation intervals by chaos level (milliseconds)
    getMutationInterval(chaosLevel) {
        const baseInterval = 5000;
        return baseInterval / chaosLevel;
    },

    // Start mutation loop
    startMutationLoop() {
        this.mutationTimer = setInterval(() => {
            this.mutationTick();
        }, 1000);
    },

    // Stop mutation loop
    stopMutationLoop() {
        if (this.mutationTimer) {
            clearInterval(this.mutationTimer);
            this.mutationTimer = null;
        }
    },

    // Mutation tick
    mutationTick() {
        if (ChaosState.shouldMutate()) {
            this.executeMutation();
        }
    },

    // Execute a random mutation
    executeMutation() {
        const strategy = this.selectMutationStrategy();

        console.log(`Executing mutation: ${strategy}`);

        switch (strategy) {
            case this.STRATEGIES.ADD_BEHAVIOR:
                this.addBehaviorMutation();
                break;
            case this.STRATEGIES.STACK_BEHAVIORS:
                this.stackBehaviorsMutation();
                break;
            case this.STRATEGIES.SWAP_BEHAVIOR:
                this.swapBehaviorMutation();
                break;
            case this.STRATEGIES.INTENSIFY:
                this.intensifyMutation();
                break;
            case this.STRATEGIES.RANDOMIZE_ALL:
                this.randomizeAllMutation();
                break;
        }
    },

    // Select mutation strategy based on chaos level
    selectMutationStrategy() {
        const chaosLevel = ChaosState.chaosLevel;

        const weights = {
            [this.STRATEGIES.ADD_BEHAVIOR]: 10,
            [this.STRATEGIES.STACK_BEHAVIORS]: chaosLevel >= 3 ? 8 : 2,
            [this.STRATEGIES.SWAP_BEHAVIOR]: 6,
            [this.STRATEGIES.INTENSIFY]: chaosLevel >= 4 ? 7 : 3,
            [this.STRATEGIES.RANDOMIZE_ALL]: chaosLevel === 5 ? 5 : 1
        };

        const choices = Object.entries(weights).map(([value, weight]) => ({
            value,
            weight
        }));

        return ChaosState.weightedChoice(choices);
    },

    // ADD_BEHAVIOR: Add one behavior to random button
    addBehaviorMutation() {
        const button = ChaosState.getRandomButton();
        if (!button) return;

        const behavior = ChaosBehaviors.selectRandomBehavior(ChaosState.chaosLevel);
        ChaosBehaviors.applyBehavior(button, behavior);

        console.log(`Added ${behavior} to ${button.id}`);
    },

    // STACK_BEHAVIORS: Add multiple behaviors to one button
    stackBehaviorsMutation() {
        const button = ChaosState.getRandomButton();
        if (!button) return;

        const behaviorCount = ChaosState.randomInt(2, 4);

        for (let i = 0; i < behaviorCount; i++) {
            const behavior = ChaosBehaviors.selectRandomBehavior(ChaosState.chaosLevel);
            ChaosBehaviors.applyBehavior(button, behavior);
        }

        console.log(`Stacked ${behaviorCount} behaviors on ${button.id}`);
    },

    // SWAP_BEHAVIOR: Replace existing behavior with new one
    swapBehaviorMutation() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));
        const buttonsWithBehaviors = buttons.filter(btn => {
            const state = ChaosState.getButtonState(btn.id);
            return state.behaviors.length > 0;
        });

        if (buttonsWithBehaviors.length === 0) {
            this.addBehaviorMutation();
            return;
        }

        const button = ChaosState.randomChoice(buttonsWithBehaviors);
        const state = ChaosState.getButtonState(button.id);

        // Remove random existing behavior
        const oldBehavior = ChaosState.randomChoice(state.behaviors);
        ChaosBehaviors.removeBehavior(button, oldBehavior);

        // Add new behavior
        const newBehavior = ChaosBehaviors.selectRandomBehavior(ChaosState.chaosLevel);
        ChaosBehaviors.applyBehavior(button, newBehavior);

        console.log(`Swapped ${oldBehavior} with ${newBehavior} on ${button.id}`);
    },

    // INTENSIFY: Increase chaos effects
    intensifyMutation() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));

        buttons.forEach(button => {
            // Add visual intensity
            if (ChaosState.seededRandom() < 0.3) {
                button.classList.add('pulse-glow');
            }

            if (ChaosState.seededRandom() < 0.2) {
                button.classList.add('distortion-wave');
            }

            if (ChaosState.seededRandom() < 0.15) {
                button.classList.add('color-shift');
            }
        });

        console.log('Intensified chaos effects');
    },

    // RANDOMIZE_ALL: Chaos mode - randomize all buttons
    randomizeAllMutation() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));

        buttons.forEach(button => {
            // Clear existing behaviors
            const state = ChaosState.getButtonState(button.id);
            state.behaviors.forEach(behavior => {
                ChaosBehaviors.removeBehavior(button, behavior);
            });

            // Add random number of behaviors
            const behaviorCount = ChaosState.randomInt(1, 3);
            for (let i = 0; i < behaviorCount; i++) {
                const behavior = ChaosBehaviors.selectRandomBehavior(ChaosState.chaosLevel);
                ChaosBehaviors.applyBehavior(button, behavior);
            }
        });

        // Show chaos feedback
        ChaosBehaviors.showFeedback('chaos', 'All buttons randomized!');

        console.log('Randomized all buttons');
    },

    // Apply initial behaviors to buttons
    applyInitialBehaviors() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));

        // Give some buttons initial behaviors
        buttons.forEach((button, index) => {
            if (index % 3 === 0) {
                const behavior = ChaosBehaviors.selectRandomBehavior(1);
                ChaosBehaviors.applyBehavior(button, behavior);
            }
        });
    },

    // Escalate chaos based on level
    escalateChaos(chaosLevel) {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));

        // Add more behaviors as chaos increases
        const behaviorsToAdd = Math.floor(chaosLevel * 1.5);

        for (let i = 0; i < behaviorsToAdd; i++) {
            const button = ChaosState.randomChoice(buttons);
            const behavior = ChaosBehaviors.selectRandomBehavior(chaosLevel);
            ChaosBehaviors.applyBehavior(button, behavior);
        }

        console.log(`Escalated chaos to level ${chaosLevel}, added ${behaviorsToAdd} behaviors`);
    },

    // Remove all mutations
    clearAllMutations() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));

        buttons.forEach(button => {
            // Remove all behavior classes
            Object.values(ChaosBehaviors.BEHAVIORS).forEach(behavior => {
                button.classList.remove(`behavior-${behavior}`);
            });

            // Remove visual effects
            button.classList.remove('pulse-glow', 'distortion-wave', 'color-shift');

            // Reset inline styles
            button.style.position = '';
            button.style.left = '';
            button.style.top = '';
            button.style.setProperty('--dodge-x', '0px');
            button.style.setProperty('--dodge-y', '0px');
        });

        console.log('Cleared all mutations');
    },

    // Get mutation statistics
    getMutationStats() {
        const buttons = Array.from(document.querySelectorAll('.chaos-btn'));
        const stats = {
            totalButtons: buttons.length,
            buttonsWithBehaviors: 0,
            behaviorCounts: {},
            averageBehaviorsPerButton: 0
        };

        let totalBehaviors = 0;

        buttons.forEach(button => {
            const state = ChaosState.getButtonState(button.id);
            if (state.behaviors.length > 0) {
                stats.buttonsWithBehaviors++;
            }

            totalBehaviors += state.behaviors.length;

            state.behaviors.forEach(behavior => {
                stats.behaviorCounts[behavior] = (stats.behaviorCounts[behavior] || 0) + 1;
            });
        });

        stats.averageBehaviorsPerButton = totalBehaviors / buttons.length;

        return stats;
    }
};

// Expose to window
if (typeof window !== 'undefined') {
    window.ChaosMutations = ChaosMutations;
}
