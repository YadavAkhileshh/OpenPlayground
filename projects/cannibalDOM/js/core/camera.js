/* js/core/camera.js */
export class Camera {
    constructor(worldSelector, player) {
        this.world = document.querySelector(worldSelector);
        this.player = player;
        this.x = 0;
        this.y = 0;
    }

    update() {
        // Center player on screen
        const targetX = -this.player.x + window.innerWidth / 2 - this.player.size / 2;
        const targetY = -this.player.y + window.innerHeight / 2 - this.player.size / 2;

        // Smooth lerp
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;

        this.world.style.transform = `translate(${this.x}px, ${this.y}px)`;

        // Also move the player visually? 
        // No, the player is ABSOLUTE inside the game container. 
        // If we move the WORLD, does the player move?
        // In the HTML structure:
        // #game-container
        //   #world
        //   #player

        // If #player is a sibling of #world, moving #world does NOT move #player.
        // This is good. Player stays "centered" on screen visually if we move the world opposite.
        // BUT `player.x` and `player.y` are WORLD coordinates.
        // If `player` is sibling, `player.style.transform` moves it on screen.
        // So if player.x = 1000, player is drawn at 1000.
        // Camera moves world to -1000.
        // BUT player is NOT in world.

        // CORRECTION: Player should be inside #world?
        // If player is inside #world, then `translate(player.x)` moves it relative to #world.
        // Then moving #world moves everything.
        // This is the easiest way.
    }
}
