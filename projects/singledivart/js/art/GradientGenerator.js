/**
 * GradientGenerator - Dynamic Gradient Synthesis
 */

const GradientGenerator = (() => {

    /**
     * Generates complex gradient stacks for the background
     */
    const generateBackgroundGradients = (complexity) => {
        const count = Math.floor(complexity / 20) + 1;
        let gradients = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.floor(Math.random() * 360);
            const color1 = ColorUtils.colorFromNoise(Math.random());
            const color2 = "transparent";
            gradients.push(`linear-gradient(${angle}deg, ${color1}, ${color2})`);
        }

        return gradients.join(", ");
    };

    /**
     * Applies generated gradients to the viewport background
     */
    const applyToViewport = (complexity) => {
        const viewport = document.getElementById('viewport');
        if (viewport) {
            const baseGradients = "radial-gradient(circle at 50% 50%, #111 0%, transparent 80%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)";
            const dynamicGradients = generateBackgroundGradients(complexity);
            viewport.style.backgroundImage = `${dynamicGradients}, ${baseGradients}`;
        }
    };

    return {
        generateBackgroundGradients,
        applyToViewport
    };

})();

window.GradientGenerator = GradientGenerator;
