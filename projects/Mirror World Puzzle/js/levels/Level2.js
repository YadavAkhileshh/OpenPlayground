export default {
    id: 2,
    start: { x: 64, y: 512 },
    exit: { x: 704, y: 64 },
    walls: [
        // Outer boundaries
        { x: 0, y: 0, w: 800, h: 32 },
        { x: 0, y: 568, w: 800, h: 32 },
        { x: 0, y: 0, w: 32, h: 600 },
        { x: 768, y: 0, w: 32, h: 600 },

        // Maze-like structure
        { x: 100, y: 100, w: 600, h: 32 },
        { x: 100, y: 300, w: 32, h: 200 },
        { x: 400, y: 200, w: 32, h: 300 },
        { x: 600, y: 132, w: 32, h: 200 }
    ]
};
