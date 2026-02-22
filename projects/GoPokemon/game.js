// ====== PIXI Setup ======
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x87ceeb
});
document.getElementById("game-container").appendChild(app.view);

// ====== Config ======
const TILE_SIZE = 32;
const TILE_SCALE = 3;
const PLAYER_SPEED = 4;
const POKEMON_SPEED = 1.2; // stable speed
const POKEMON_BATCH = 3; // spawn 3-4 Pokémon every interval
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;

// ====== Variables ======
let mapContainer, player, wildPokemons = [];
let keys = {};
let collectedCount = 0;
let playerFrame = 0, frameTicker = 0;
let mapWidth, mapHeight;
let walkableTiles = [];

// ====== Assets ======
const assets = [
    "assets/player.png",
    "assets/pokemon1.png",
    "assets/pokemon2.png",
    "assets/pokemon3.png",
    "assets/grass1.png",
    "assets/grass2.png"
];

// ====== Load Assets ======
PIXI.Assets.load(assets).then(setup);

function setup() {
    mapContainer = new PIXI.Container();
    app.stage.addChild(mapContainer);

    const mapRows = 30;
    const mapCols = 40;
    mapWidth = mapCols * TILE_SIZE * TILE_SCALE;
    mapHeight = mapRows * TILE_SIZE * TILE_SCALE;

    // ====== Create Grass Map ======
    for (let i = 0; i < mapRows; i++) {
        for (let j = 0; j < mapCols; j++) {
            let tileTexture = Math.random() > 0.5 ? PIXI.Texture.from("assets/grass1.png") : PIXI.Texture.from("assets/grass2.png");
            let tile = new PIXI.Sprite(tileTexture);
            tile.width = TILE_SIZE * TILE_SCALE;
            tile.height = TILE_SIZE * TILE_SCALE;
            tile.x = j * TILE_SIZE * TILE_SCALE;
            tile.y = i * TILE_SIZE * TILE_SCALE;
            mapContainer.addChild(tile);

            if (tileTexture.textureCacheIds[0].includes("grass")) {
                walkableTiles.push({x: tile.x, y: tile.y});
            }
        }
    }

    // ====== Create Player ======
    const texture = PIXI.Texture.from("assets/player.png");
    const baseTexture = texture.baseTexture;
    player = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(0,0,FRAME_WIDTH,FRAME_HEIGHT)));
    player.anchor.set(0.5);
    player.scale.set(TILE_SCALE);
    player.x = app.view.width / 2;
    player.y = app.view.height / 2;
    app.stage.addChild(player);

    // ====== Spawn initial Pokémon ======
    for (let i = 0; i < POKEMON_BATCH; i++) spawnPokemonNearPlayer();

    // ====== Keyboard ======
    window.addEventListener("keydown", e => keys[e.key] = true);
    window.addEventListener("keyup", e => keys[e.key] = false);

    // ====== Game Loop ======
    app.ticker.add(gameLoop);

    // ====== Spawn Pokémon batch every 15 seconds ======
    setInterval(() => {
        const count = Math.floor(Math.random() * 2) + POKEMON_BATCH; // 3-4 Pokémon
        for (let i = 0; i < count; i++) spawnPokemonNearPlayer();
    }, 15000);
}
// ======Count ======
const pokeCounter = new PIXI.Text("Pokémon: 0", {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
    stroke: 0x000000,
    strokeThickness: 3
});
pokeCounter.x = 20;
pokeCounter.y = 20;
app.stage.addChild(pokeCounter);

function collectPokemon(index) {
    const poke = wildPokemons[index];
    app.stage.removeChild(poke);
    wildPokemons.splice(index,1);

    collectedCount++;
    pokeCounter.text = "Pokémon: " + collectedCount;

    console.log("Pokémon collected! Total:", collectedCount);
}
// ====== Game Loop ======
function gameLoop(delta) {
    let moving = false;

    // ====== Player Movement ======
    if (keys["ArrowUp"] && player.y - PLAYER_SPEED > 0) { player.y -= PLAYER_SPEED; moving = true; }
    if (keys["ArrowDown"] && player.y + PLAYER_SPEED < mapHeight) { player.y += PLAYER_SPEED; moving = true; }
    if (keys["ArrowLeft"] && player.x - PLAYER_SPEED > 0) { player.x -= PLAYER_SPEED; moving = true; }
    if (keys["ArrowRight"] && player.x + PLAYER_SPEED < mapWidth) { player.x += PLAYER_SPEED; moving = true; }

    // ====== Animate Player ======
    if (moving) {
        frameTicker++;
        if (frameTicker % 5 === 0) {
            playerFrame = (playerFrame + 1) % 4;
            player.texture.frame = new PIXI.Rectangle(playerFrame*FRAME_WIDTH,0,FRAME_WIDTH,FRAME_HEIGHT);
        }
    } else {
        playerFrame = 0;
        player.texture.frame = new PIXI.Rectangle(0,0,FRAME_WIDTH,FRAME_HEIGHT);
    }

    // ====== Camera Follow (bounded) ======
    mapContainer.x = Math.min(0, Math.max(app.view.width - mapWidth, app.view.width/2 - player.x));
    mapContainer.y = Math.min(0, Math.max(app.view.height - mapHeight, app.view.height/2 - player.y));

    // ====== Pokémon Movement & Collection ======
    for (let i = wildPokemons.length - 1; i >= 0; i--) {
        const poke = wildPokemons[i];

        // Move Pokémon
        poke.x += poke.vx;
        poke.y += poke.vy;

        // Bounce inside map
        if (poke.x < 0 || poke.x > mapWidth) poke.vx *= -1;
        if (poke.y < 0 || poke.y > mapHeight) poke.vy *= -1;

        // Normalize speed
        const speed = Math.sqrt(poke.vx**2 + poke.vy**2);
        if (speed > POKEMON_SPEED) {
            poke.vx = (poke.vx / speed) * POKEMON_SPEED;
            poke.vy = (poke.vy / speed) * POKEMON_SPEED;
        }

        // ====== Collect Pokémon if player jumps on them ======
        const dx = player.x - poke.x;
        const dy = player.y - poke.y;
        if (Math.sqrt(dx*dx + dy*dy) < 32*TILE_SCALE) {
            collectPokemon(i);
        }
    }
}

// ====== Spawn Pokémon Near Player ======
function spawnPokemonNearPlayer() {
    const nearbyTiles = walkableTiles.filter(t =>
        Math.abs(t.x - player.x) < 100 && Math.abs(t.y - player.y) < 100
    );
    if (!nearbyTiles.length) return;

    const pos = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
    const poke = PIXI.Sprite.from(`assets/pokemon${Math.floor(Math.random()*3)+1}.png`);
    poke.anchor.set(0.5);
    poke.scale.set(TILE_SCALE/2);
    poke.x = pos.x + (TILE_SIZE*TILE_SCALE)/2;
    poke.y = pos.y + (TILE_SIZE*TILE_SCALE)/2;
    poke.vx = (Math.random() - 0.5) * POKEMON_SPEED;
    poke.vy = (Math.random() - 0.5) * POKEMON_SPEED;
    app.stage.addChild(poke);
    wildPokemons.push(poke);
}

// ====== Collect Pokémon ======
function collectPokemon(index) {
    const poke = wildPokemons[index];
    app.stage.removeChild(poke);
    wildPokemons.splice(index, 1);

    // Update counter
    collectedCount++;
    pokeCounter.text = "Pokémon: " + collectedCount;

    console.log("Pokémon collected! Total:", collectedCount);
}