// ============================================
// ChaosButtons - Behavior System
// Individual button behaviors and effects
// ============================================

const ChaosBehaviors = {
    // Available behavior types
    BEHAVIORS: {
        DODGER: 'dodger',
        SPINNER: 'spinner',
        MORPHER: 'morpher',
        GLITCHER: 'glitcher',
        INVISIBLE: 'invisible',
        TELEPORTER: 'teleporter',
        DELAYED: 'delayed',
        LIAR: 'liar',
        MULTIPLIER: 'multiplier',
        REVERSER: 'reverser'
    },

    // Behavior weights by chaos level
    getBehaviorWeights(chaosLevel) {
        const baseWeights = {
            [this.BEHAVIORS.DODGER]: 10,
            [this.BEHAVIORS.SPINNER]: 8,
            [this.BEHAVIORS.MORPHER]: 8,
            [this.BEHAVIORS.GLITCHER]: 6,
            [this.BEHAVIORS.INVISIBLE]: 5,
            [this.BEHAVIORS.TELEPORTER]: 7,
            [this.BEHAVIORS.DELAYED]: 9,
            [this.BEHAVIORS.LIAR]: 10,
            [this.BEHAVIORS.MULTIPLIER]: 4,
            [this.BEHAVIORS.REVERSER]: 6
        };

        // Increase weights for higher chaos
        const multiplier = 1 + (chaosLevel - 1) * 0.3;
        const weights = {};

        for (const [behavior, weight] of Object.entries(baseWeights)) {
            weights[behavior] = Math.floor(weight * multiplier);
        }

        return weights;
    },

    // Select random behavior based on chaos level
    selectRandomBehavior(chaosLevel) {
        const weights = this.getBehaviorWeights(chaosLevel);
        const choices = Object.entries(weights).map(([value, weight]) => ({
            value,
            weight
        }));

        return ChaosState.weightedChoice(choices);
    },

    // Apply behavior to button
    applyBehavior(button, behavior) {
        const behaviorClass = `behavior-${behavior}`;

        if (!button.classList.contains(behaviorClass)) {
            button.classList.add(behaviorClass);
            ChaosState.addBehavior(button.id, behavior);

            // Initialize behavior-specific handlers
            this.initializeBehavior(button, behavior);
        }
    },

    // Remove behavior from button
    removeBehavior(button, behavior) {
        const behaviorClass = `behavior-${behavior}`;
        button.classList.remove(behaviorClass);
        ChaosState.removeBehavior(button.id, behavior);
    },

    // Initialize behavior-specific event handlers
    initializeBehavior(button, behavior) {
        switch (behavior) {
            case this.BEHAVIORS.DODGER:
                this.initDodger(button);
                break;
            case this.BEHAVIORS.INVISIBLE:
                this.initInvisible(button);
                break;
            case this.BEHAVIORS.TELEPORTER:
                this.initTeleporter(button);
                break;
            default:
                // Other behaviors are CSS-only or handled in click
                break;
        }
    },

    // DODGER: Move away from cursor
    initDodger(button) {
        const dodgeDistance = 100;

        const handleMouseMove = (e) => {
            if (!button.classList.contains('behavior-dodger')) return;

            const rect = button.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;

            const deltaX = e.clientX - buttonCenterX;
            const deltaY = e.clientY - buttonCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Dodge if cursor is close
            if (distance < 150) {
                const angle = Math.atan2(deltaY, deltaX);
                const dodgeX = -Math.cos(angle) * dodgeDistance;
                const dodgeY = -Math.sin(angle) * dodgeDistance;

                button.style.setProperty('--dodge-x', `${dodgeX}px`);
                button.style.setProperty('--dodge-y', `${dodgeY}px`);
                button.classList.add('dodging');
            } else {
                button.style.setProperty('--dodge-x', '0px');
                button.style.setProperty('--dodge-y', '0px');
                button.classList.remove('dodging');
            }
        };

        button.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousemove', handleMouseMove);
    },

    // INVISIBLE: Fade on approach
    initInvisible(button) {
        const handleMouseMove = (e) => {
            if (!button.classList.contains('behavior-invisible')) return;

            const rect = button.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;

            const deltaX = e.clientX - buttonCenterX;
            const deltaY = e.clientY - buttonCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 200) {
                button.classList.add('fading');
            } else {
                button.classList.remove('fading');
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
    },

    // TELEPORTER: Jump to random position
    initTeleporter(button) {
        // Teleporter is triggered on click, no init needed
    },

    // Execute teleport
    executeTeleport(button) {
        const arena = button.closest('.arena-grid');
        if (!arena) return;

        button.classList.add('teleporting');

        setTimeout(() => {
            // Get random position within arena
            const arenaRect = arena.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            const maxX = arenaRect.width - buttonRect.width;
            const maxY = arenaRect.height - buttonRect.height;

            const randomX = ChaosState.randomInt(0, maxX);
            const randomY = ChaosState.randomInt(0, maxY);

            button.style.position = 'absolute';
            button.style.left = `${randomX}px`;
            button.style.top = `${randomY}px`;

            button.classList.remove('teleporting');
        }, 250);
    },

    // DELAYED: Add random delay before action
    executeDelayed(button, callback) {
        const delay = ChaosState.randomInt(500, 3000);

        button.classList.add('loading');
        button.disabled = true;

        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;
            callback();
        }, delay);
    },

    // LIAR: Show opposite feedback
    executeLiar(button, actualOutcome) {
        const lieOutcome = actualOutcome === 'success' ? 'failure' : 'success';
        const lieClass = `lying-${lieOutcome}`;

        button.classList.add(lieClass);

        setTimeout(() => {
            button.classList.remove(lieClass);
        }, 500);

        ChaosState.incrementLies();

        return lieOutcome;
    },

    // MULTIPLIER: Create fake clones
    executeMultiplier(button) {
        const cloneCount = ChaosState.randomInt(2, 5);
        const arena = button.closest('.arena-grid');
        if (!arena) return;

        for (let i = 0; i < cloneCount; i++) {
            const clone = button.cloneNode(true);
            clone.classList.add('button-clone');
            clone.style.position = 'absolute';

            const rect = button.getBoundingClientRect();
            const arenaRect = arena.getBoundingClientRect();

            clone.style.left = `${rect.left - arenaRect.left + ChaosState.randomInt(-50, 50)}px`;
            clone.style.top = `${rect.top - arenaRect.top + ChaosState.randomInt(-50, 50)}px`;

            arena.appendChild(clone);

            setTimeout(() => {
                clone.remove();
            }, 1000);
        }
    },

    // SPINNER: Trigger fast spin
    executeSpinner(button) {
        button.classList.add('spinning-fast');

        setTimeout(() => {
            button.classList.remove('spinning-fast');
        }, 1000);
    },

    // Handle button click with behaviors
    handleClick(button, event) {
        const state = ChaosState.getButtonState(button.id);
        const behaviors = state.behaviors;

        // Increment click count
        state.clickCount++;
        state.lastClicked = Date.now();

        // Add click animation
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 300);

        // Create ripple effect
        this.createRipple(button, event);

        // Determine actual outcome
        let actualOutcome = 'success';
        let displayOutcome = 'success';

        // Process behaviors
        if (behaviors.includes(this.BEHAVIORS.TELEPORTER)) {
            this.executeTeleport(button);
        }

        if (behaviors.includes(this.BEHAVIORS.MULTIPLIER)) {
            this.executeMultiplier(button);
        }

        if (behaviors.includes(this.BEHAVIORS.SPINNER)) {
            this.executeSpinner(button);
        }

        if (behaviors.includes(this.BEHAVIORS.LIAR)) {
            displayOutcome = this.executeLiar(button, actualOutcome);
        }

        if (behaviors.includes(this.BEHAVIORS.REVERSER)) {
            actualOutcome = 'failure';
        }

        // Handle delayed behavior
        if (behaviors.includes(this.BEHAVIORS.DELAYED)) {
            this.executeDelayed(button, () => {
                this.showFeedback(displayOutcome, button.dataset.label);
                this.updateScore(actualOutcome);
            });
        } else {
            this.showFeedback(displayOutcome, button.dataset.label);
            this.updateScore(actualOutcome);
        }

        // Create particles for high chaos
        if (ChaosState.chaosLevel >= 3) {
            this.createParticles(button, event);
        }

        // Increment interaction
        ChaosState.incrementInteraction();
    },

    // Create ripple effect
    createRipple(button, event) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    // Create particle effects
    createParticles(button, event) {
        const particleCount = ChaosState.randomInt(5, 10);
        const rect = button.getBoundingClientRect();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--particle-x', `${ChaosState.randomInt(-100, 100)}px`);
            particle.style.setProperty('--particle-y', `${ChaosState.randomInt(-150, -50)}px`);

            button.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    },

    // Show feedback overlay
    showFeedback(outcome, label) {
        const overlay = document.getElementById('feedback-overlay');
        const message = document.getElementById('feedback-message');
        const icon = document.getElementById('feedback-icon');

        if (!overlay || !message) return;

        // Set message
        const messages = {
            success: ['Success!', 'Great!', 'Nice!', 'Perfect!', 'Awesome!'],
            failure: ['Failed!', 'Oops!', 'Nope!', 'Try Again!', 'Error!'],
            chaos: ['CHAOS!', 'Unpredictable!', 'Mayhem!', 'Disorder!']
        };

        const messageText = ChaosState.randomChoice(messages[outcome] || messages.success);
        message.textContent = `${messageText} - ${label}`;

        // Set feedback class
        overlay.className = 'feedback-overlay active';
        overlay.classList.add(`feedback-${outcome}`);

        // Hide after delay
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 1500);
    },

    // Update score based on outcome
    updateScore(outcome) {
        const points = outcome === 'success' ? 10 : -5;
        const multiplier = ChaosState.getChaosMultiplier();
        ChaosState.addScore(Math.floor(points * multiplier));
    }
};

// Expose to window
if (typeof window !== 'undefined') {
    window.ChaosBehaviors = ChaosBehaviors;
}
