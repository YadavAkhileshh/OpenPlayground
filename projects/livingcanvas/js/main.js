/**
 * main.js
 * Entry point. Initializes the modules.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("LivingCanvas Initializing...");

    // 1. Initialize Grid
    const grid = new Grid(Config.GRID_ROWS, Config.GRID_COLS);

    // 2. Initialize Renderer
    const renderer = new Renderer('simulation-canvas', grid, Config);

    // 3. Initialize Theme Manager (needs renderer)
    const themeManager = new ThemeManager(Config, renderer);
    themeManager.setTheme('cyberpunk'); // Default

    // 4. Initialize Input
    const input = new InputHandler(renderer, grid, Config);

    // 5. Initialize Loop logic
    const loop = new Loop(grid, renderer, null, Config);

    // 6. Initialize UI (needs ThemeManager)
    const ui = new UI(Config, loop, grid, themeManager);

    // 7. Initialize Stats
    const stats = new Stats(grid);
    loop.stats = stats;

    // 8. Initialize Keyboard
    const keyboard = new KeyboardHandler(Config, loop, grid, ui);

    // 9. Link UI back to loop
    loop.setUI(ui);

    // Initial draw
    renderer.draw();

    // Start with a random world
    grid.randomize();
    renderer.draw();
    ui.updateStats();

    console.log("LivingCanvas Ready.");
});
