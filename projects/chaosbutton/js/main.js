// ============================================
// ChaosButtons - Main Application
// Initialization and event coordination
// ============================================

// Main application controller
const ChaosApp = {
    // Initialize application
    init() {
        console.log('Initializing ChaosButtons...');

        // Initialize state
        this.initializeState();

        // Set up event listeners
        this.setupEventListeners();

        // Apply initial behaviors
        ChaosMutations.applyInitialBehaviors();

        // Start mutation loop
        ChaosMutations.startMutationLoop();

        // Initialize UI
        ChaosState.updateUI();

        console.log('ChaosButtons initialized successfully');
    },

    // Initialize state for all buttons
    initializeState() {
        const buttons = document.querySelectorAll('.chaos-btn');
        buttons.forEach(button => {
            ChaosState.initButton(button.id);
        });
    },

    // Set up all event listeners
    setupEventListeners() {
        // Button click handlers
        this.setupButtonListeners();

        // Reset button
        this.setupResetButton();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Window events
        this.setupWindowEvents();
    },

    // Set up button click listeners
    setupButtonListeners() {
        const buttons = document.querySelectorAll('.chaos-btn');

        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                ChaosBehaviors.handleClick(button, event);
            });

            // Hover effects
            button.addEventListener('mouseenter', () => {
                this.handleButtonHover(button);
            });

            button.addEventListener('mouseleave', () => {
                this.handleButtonLeave(button);
            });
        });
    },

    // Handle button hover
    handleButtonHover(button) {
        const state = ChaosState.getButtonState(button.id);

        // Add hover effects based on chaos level
        if (ChaosState.chaosLevel >= 3) {
            if (ChaosState.seededRandom() < 0.2) {
                button.style.transform = `scale(${1 + ChaosState.seededRandom() * 0.2})`;
            }
        }
    },

    // Handle button leave
    handleButtonLeave(button) {
        // Reset hover effects
        if (!button.classList.contains('behavior-dodger')) {
            button.style.transform = '';
        }
    },

    // Set up reset button
    setupResetButton() {
        const resetBtn = document.getElementById('reset-btn');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetChaos();
            });
        }
    },

    // Reset chaos state
    resetChaos() {
        console.log('Resetting chaos...');

        // Stop mutations
        ChaosMutations.stopMutationLoop();

        // Clear all mutations
        ChaosMutations.clearAllMutations();

        // Reset state
        ChaosState.reset();

        // Restart mutations
        ChaosMutations.startMutationLoop();

        // Show feedback
        ChaosBehaviors.showFeedback('success', 'Chaos Reset');

        console.log('Chaos reset complete');
    },

    // Set up keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // R key - Reset
            if (event.key === 'r' || event.key === 'R') {
                this.resetChaos();
            }

            // D key - Debug info
            if (event.key === 'd' || event.key === 'D') {
                this.showDebugInfo();
            }

            // M key - Force mutation
            if (event.key === 'm' || event.key === 'M') {
                ChaosMutations.executeMutation();
            }

            // C key - Clear behaviors
            if (event.key === 'c' || event.key === 'C') {
                ChaosMutations.clearAllMutations();
            }

            // Space - Random button click
            if (event.key === ' ') {
                event.preventDefault();
                const button = ChaosState.getRandomButton();
                if (button) {
                    button.click();
                }
            }
        });
    },

    // Set up window events
    setupWindowEvents() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause mutations when tab is hidden
                ChaosMutations.stopMutationLoop();
            } else {
                // Resume mutations when tab is visible
                ChaosMutations.startMutationLoop();
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    },

    // Handle window resize
    handleResize() {
        // Reset absolute positioned buttons
        const buttons = document.querySelectorAll('.chaos-btn');
        buttons.forEach(button => {
            if (button.style.position === 'absolute') {
                button.style.position = '';
                button.style.left = '';
                button.style.top = '';
            }
        });
    },

    // Show debug information
    showDebugInfo() {
        const state = ChaosState.exportState();
        const mutationStats = ChaosMutations.getMutationStats();

        console.group('ChaosButtons Debug Info');
        console.log('State:', state);
        console.log('Mutation Stats:', mutationStats);
        console.log('Chaos Level:', ChaosState.chaosLevel);
        console.log('Interactions:', ChaosState.interactionCount);
        console.log('Score:', ChaosState.score);
        console.log('Lies Detected:', ChaosState.liesDetected);
        console.groupEnd();

        // Show in feedback overlay
        const debugMessage = `
            Level: ${ChaosState.chaosLevel} | 
            Interactions: ${ChaosState.interactionCount} | 
            Score: ${ChaosState.score} | 
            Buttons w/ Behaviors: ${mutationStats.buttonsWithBehaviors}/${mutationStats.totalButtons}
        `;

        ChaosBehaviors.showFeedback('chaos', debugMessage);
    },

    // Auto-play mode for testing
    autoPlay(duration = 30000) {
        console.log(`Starting auto-play for ${duration}ms`);

        const interval = setInterval(() => {
            const button = ChaosState.getRandomButton();
            if (button) {
                button.click();
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            console.log('Auto-play complete');
            this.showDebugInfo();
        }, duration);
    },

    // Performance monitoring
    monitorPerformance() {
        if (window.performance && window.performance.memory) {
            console.group('Performance Stats');
            console.log('Memory:', {
                used: `${(window.performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
                total: `${(window.performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
                limit: `${(window.performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
            });
            console.groupEnd();
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ChaosApp.init();
    });
} else {
    ChaosApp.init();
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
    window.ChaosApp = ChaosApp;

    // Add helpful console messages
    console.log('%cChaosButtons', 'font-size: 24px; font-weight: bold; color: #ff3366;');
    console.log('%cKeyboard Shortcuts:', 'font-weight: bold; color: #33ff99;');
    console.log('  R - Reset chaos');
    console.log('  D - Show debug info');
    console.log('  M - Force mutation');
    console.log('  C - Clear all behaviors');
    console.log('  Space - Click random button');
    console.log('%cDebug Commands:', 'font-weight: bold; color: #33ff99;');
    console.log('  ChaosApp.autoPlay(30000) - Auto-play for 30 seconds');
    console.log('  ChaosApp.showDebugInfo() - Show debug information');
    console.log('  ChaosApp.monitorPerformance() - Show performance stats');
    console.log('  ChaosState.exportState() - Export current state');
    console.log('  ChaosMutations.getMutationStats() - Get mutation statistics');
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('ChaosButtons Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});
