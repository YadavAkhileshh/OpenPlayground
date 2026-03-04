/**
 * Main application entry point.
 * Configures the canvas, initializes the simulation entities,
 * and manages the game loop.
 */

const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");

carCanvas.width = 600;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const GA = new GeneticAlgorithm(100);
const graph = new Graph("fitnessGraph");
const particles = new ParticleSystem();

let cars = GA.createNextGeneration(null, road);
let bestCar = cars[0];

// view offset for camera
let viewY = 0;

// Editor State management
let editorMode = false;
let cameraLocked = true;

const editor = new Editor(carCanvas, road);
carCanvas.addEventListener("editorClick", (e) => {
    if (editorMode) {
        // Convert screen coordinates to world coordinates
        // We know that in draw(), we translate by -viewY + height*0.7
        // So worldY = screenY + viewY - height*0.7
        const worldX = e.detail.x;
        const worldY = e.detail.y + viewY - carCanvas.height * 0.7;
        road.addPoint({ x: worldX, y: worldY });
    }
});

// Initialize Traffic
const traffic = [];
for (let i = 0; i < 30; i++) {
    traffic.push(
        new Car(
            road.getLaneCenter(Math.floor(Math.random() * 3)),
            -Math.random() * 2000 - 100, // Random Y ahead of start
            30,
            50,
            "DUMMY",
            2
        )
    );
}

// Start animation loop
animate();

/**
 * Saves the current best brain to LocalStorage.
 */
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    alert("Brain saved!");
}

/**
 * Clears the saved brain from LocalStorage.
 */
function discard() {
    localStorage.removeItem("bestBrain");
    alert("Brain discarded!");
}

/**
 * Resets the simulation state.
 */
function resetSim() {
    cars = GA.createNextGeneration(null, road);
    bestCar = cars[0];
    viewY = 0;
    // Respawn traffic
    traffic.forEach(t => {
        t.y = -Math.random() * 2000 - 100;
    });
}

/**
 * Main Animation Loop.
 * @param {number} time 
 */
function animate(time) {
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight * 0.4;

    // Update Traffic
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    // Update Cars (Simulation Step)
    if (!editorMode) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
        }
    }

    // Find best car (furthest up is smallest y)
    if (!editorMode && cars.length > 0) {
        bestCar = cars.find(
            c => c.y == Math.min(
                ...cars.map(c => c.y) // Min Y is max distance
            )
        );
        if (cameraLocked && bestCar) {
            // Smooth camera follow
            viewY = Utils.lerp(viewY, bestCar.y, 0.1);
        }
    }

    // Check collisions / Generation end
    if (!editorMode) {
        const allDead = cars.every(car => car.damaged);
        if (allDead) {
            // Auto-save fitnes data
            if (graph) {
                graph.addData(Math.abs(bestCar.y));
                graph.draw();
            }

            // Evolution Step
            cars = GA.createNextGeneration(cars, road);
            bestCar = cars[0];

            // Reset traffic relative to new start? Or just randomize
            traffic.forEach(t => {
                t.y = bestCar.y - Math.random() * 2000 - 300;
            });

            document.getElementById("generationCount").innerText = GA.generation;
        }
    }

    // Update Stats UI
    document.getElementById("aliveCount").innerText = cars.filter(c => !c.damaged).length;
    document.getElementById("bestFitness").innerText = Math.floor(Math.abs(bestCar ? bestCar.y : 0));

    // Draw World
    carCtx.save();

    // Apply Camera Transform
    carCtx.translate(0, -viewY + carCanvas.height * 0.7);

    road.draw(carCtx);

    particles.updateAndDraw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;
    if (bestCar) {
        bestCar.draw(carCtx, "blue", true);
    }

    carCtx.restore();

    // Draw Network
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    if (bestCar) Visualizer.drawNetwork(networkCtx, bestCar.brain);

    requestAnimationFrame(animate);
}

/**
 * Toggles between Editor Mode and Simulation Mode.
 * Exposed to window for HTML button access.
 */
window.toggleEditor = function () {
    editorMode = !editorMode;
    cameraLocked = !editorMode;
    editor.active = editorMode;

    const btn = document.getElementById("editBtn");
    btn.innerText = editorMode ? "▶ Start Sim" : "✏️ Edit Track";
    btn.style.background = editorMode ? "#2ea043" : ""; // Green start

    if (editorMode) {
        road.clear();
        cars.forEach(c => { c.x = 0; c.y = 0; c.speed = 0; c.damaged = false; });
        viewY = 0;
        alert("Editor Mode Active:\n- Click on canvas to place road points.\n- Define path from top to bottom/up.\n- Click 'Start Sim' when done.");

    } else {
        // Reset Simulation with new road
        resetSim();
    }
}
