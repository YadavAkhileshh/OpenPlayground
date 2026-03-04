/**
 * Levels Data
 */
import { Vector } from '../math/vector.js';

export const Levels = [
    {
        name: "Reflection 101",
        setup: (scene) => {
            // Emitter
            scene.add({ type: 'laser', x: 100, y: 300, angle: 0 });

            // Targets
            scene.add({ type: 'target', x: 700, y: 100, radius: 20 });

            // Obstacles
            scene.add({ type: 'wall', x: 400, y: 300, width: 20, height: 200, angle: 0 });

            // Players Tool (Mirror)
            scene.add({ type: 'mirror', x: 200, y: 500, width: 80, height: 10, angle: -Math.PI / 4, draggable: true, rotatable: true });
            scene.add({ type: 'mirror', x: 600, y: 500, width: 80, height: 10, angle: Math.PI / 4, draggable: true, rotatable: true });
        }
    },
    {
        name: "Refraction Basics",
        setup: (scene) => {
            scene.add({ type: 'laser', x: 100, y: 300, angle: 0 });
            scene.add({ type: 'target', x: 700, y: 350, radius: 20 });

            // Lens
            scene.add({ type: 'lens', x: 400, y: 300, width: 100, height: 200, refractiveIndex: 1.5 });
        }
    },
    {
        name: "Prism Break",
        setup: (scene) => {
            scene.add({ type: 'laser', x: 100, y: 300, angle: 0, color: '#ffffff' });

            // Targets requiring specific colors? 
            // Currently basic target logic just checks hit.
            scene.add({ type: 'target', x: 700, y: 150, radius: 20 }); // Red path?
            scene.add({ type: 'target', x: 700, y: 300, radius: 20 }); // Green path?
            scene.add({ type: 'target', x: 700, y: 450, radius: 20 }); // Blue path?

            // Prism
            scene.add({ type: 'prism', x: 400, y: 300, size: 100, angle: Math.PI / 2 });
        }
    }
];
