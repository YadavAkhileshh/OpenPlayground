/**
 * PixelGenerator - Procedural Art Algorithms
 */

const PixelGenerator = (() => {

    /**
     * Generates a noise-based pixel pattern
     */
    const generateNoise = async (res, complexity) => {
        const pixels = [];
        const scale = complexity / 10;

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                const n = MathUtils.noise2D(x * scale, y * scale);
                if (n > 0.1) {
                    pixels.push({
                        x, y,
                        color: ColorUtils.colorFromNoise(n)
                    });
                }
            }
        }
        return pixels;
    };

    /**
     * Generates shape-based patterns (circles, squares)
     */
    const generateShapes = async (res, complexity) => {
        const pixels = [];
        const numShapes = Math.floor(complexity / 5);

        for (let i = 0; i < numShapes; i++) {
            const centerX = Math.floor((Math.random() - 0.5) * res);
            const centerY = Math.floor((Math.random() - 0.5) * res);
            const radius = Math.floor(Math.random() * (res / 4));
            const color = ColorUtils.generatePalette(Math.random() * 360, 1)[0];

            // Add circle pixels
            const coords = MathUtils.circleCoords(radius, centerX, centerY);
            coords.forEach(c => {
                if (Math.abs(c.x) < res / 2 && Math.abs(c.y) < res / 2) {
                    pixels.push({ x: c.x, y: c.y, color });
                }
            });
        }
        return pixels;
    };

    /**
     * Generates a fractal-like pattern (Mandelbrot or simple recursive)
     */
    const generateFractal = async (res, complexity) => {
        const pixels = [];
        const maxIter = complexity;

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                let x0 = (x / (res / 4));
                let y0 = (y / (res / 4));
                let a = 0, b = 0;
                let iter = 0;

                while (a * a + b * b <= 4 && iter < maxIter) {
                    let nextA = a * a - b * b + x0;
                    b = 2 * a * b + y0;
                    a = nextA;
                    iter++;
                }

                if (iter < maxIter) {
                    const color = ColorUtils.colorFromNoise(iter / maxIter);
                    pixels.push({ x, y, color });
                }
            }
        }
        return pixels;
    };

    /**
     * Generates a simple gradient pattern
     */
    const generateGradient = async (res, complexity) => {
        const pixels = [];
        const color1 = "#00ff88";
        const color2 = "#0088ff";

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                const t = (x + res / 2) / res;
                const noise = MathUtils.noise2D(x * 0.1, y * 0.1) * 0.2;
                if (Math.random() > 0.5 + noise) {
                    const color = ColorUtils.lerpColor(color1, color2, t + noise);
                    pixels.push({ x, y, color });
                }
            }
        }
        return pixels;
    };

    return {
        generateNoise,
        generateShapes,
        generateFractal,
        generateGradient
    };

})();

window.PixelGenerator = PixelGenerator;
