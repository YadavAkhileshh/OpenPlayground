/**
 * Engine - State and Logic Orchestrator
 */

const Engine = (() => {

    const state = {
        resolution: 64,
        complexity: 50,
        scale: 10,
        isGenerating: false,
        currentPreset: 'noise',
        pixels: []
    };

    /**
     * Initialize the engine
     */
    const init = () => {
        console.log("Engine Initialized");
        // Initial render logic will go here
    };

    /**
     * Update a state parameter
     */
    const updateState = (key, value) => {
        if (state.hasOwnProperty(key)) {
            state[key] = value;
            return true;
        }
        return false;
    };

    /**
     * Trigger a new generation cycle
     */
    const generate = async () => {
        if (state.isGenerating) return;

        state.isGenerating = true;
        document.body.classList.add('generating');

        try {
            // Use the comprehensive Presets library
            let newPixels = await Presets.generate(
                state.currentPreset,
                state.resolution,
                state.complexity
            );

            // Optimization Step: Filter and decimate for performance
            state.pixels = Optimizer.optimize(
                newPixels,
                state.resolution,
                5000 // Shadow budget
            );

            // Render the results
            Renderer.render(state.pixels, {
                scale: state.scale,
                blur: 0,
                spread: 0
            });

            // Notify other modules
            window.dispatchEvent(new CustomEvent('single-div-render-complete', {
                detail: { pixels: state.pixels }
            }));

            // Sync background gradients
            if (window.GradientGenerator) {
                GradientGenerator.applyToViewport(state.complexity);
            }

        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            state.isGenerating = false;
            document.body.classList.remove('generating');
        }
    };

    /**
     * Get current state
     */
    const getState = () => ({ ...state });

    return {
        init,
        updateState,
        generate,
        getState
    };

})();

window.Engine = Engine;
