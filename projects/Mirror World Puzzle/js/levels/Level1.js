export default {
    id: 1,
    start: { x: 64, y: 64 },
    exit: { x: 704, y: 512 },
    walls: [
        // Outer boundaries
        { x: 0, y: 0, w: 800, h: 32 },
        { x: 0, y: 568, w: 800, h: 32 },
        { x: 0, y: 0, w: 32, h: 600 },
        { x: 768, y: 0, w: 32, h: 600 },

        // Obstacles
        { x: 200, y: 100, w: 32, h: 400 },
        { x: 400, y: 200, w: 200, h: 32 },
        { x: 500, y: 400, w: 32, h: 100 }
    ]
};
