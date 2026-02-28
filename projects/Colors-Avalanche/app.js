// Setup Matter.js
const Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite,
	Events = Matter.Events,
	Mouse = Matter.Mouse,
	MouseConstraint = Matter.MouseConstraint,
	Common = Matter.Common;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: window.innerWidth,
		height: window.innerHeight,
		wireframes: false,
		background: "transparent"
	}
});

Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Data Source
const colorListItems = document.querySelectorAll("#color-source li");
const colors = Array.from(colorListItems).map((li) => li.textContent.trim());

const sceneContainer = document.getElementById("scene-container");
const bodiesDOM = [];

// Sound Synthesis
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCollisionSound(velocity) {
	if (audioCtx.state === "suspended") audioCtx.resume();

	// Volume based on impact velocity
	const intensity = Math.max(0, Math.min(velocity / 15, 1)); // Normalized 0-1
	if (intensity < 0.1) return; // Ignore soft bumps

	const osc = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();

	osc.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	// Organic "clacking" sound
	// Randomize pitch slightly for variety
	const baseFreq = 300 + Math.random() * 200;
	osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
	osc.type = "sine";

	// Short envelope
	const now = audioCtx.currentTime;
	gainNode.gain.setValueAtTime(0, now);
	gainNode.gain.linearRampToValueAtTime(intensity * 0.3, now + 0.01); // Attack
	gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Decay

	osc.start(now);
	osc.stop(now + 0.15);
}

Events.on(engine, "collisionStart", (event) => {
	const pairs = event.pairs;
	// Limit sounds per frame
	if (pairs.length > 8) return;

	for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i];
		// Estimate impact
		const speedA = pair.bodyA.velocity
			? Math.hypot(pair.bodyA.velocity.x, pair.bodyA.velocity.y)
			: 0;
		const speedB = pair.bodyB.velocity
			? Math.hypot(pair.bodyB.velocity.x, pair.bodyB.velocity.y)
			: 0;
		const impact = speedA + speedB;

		playCollisionSound(impact);
	}
});

// Wall creation wrapper
function createWalls() {
	const thickness = 100;
	const width = window.innerWidth;
	const height = window.innerHeight;
	const spawnHeight = 4000; // Extra height for the funnel

	// Remove existing walls first if any (for resize)
	const existing = Composite.allBodies(world).filter(
		(b) => b.label === "wall" || b.label === "floor"
	);
	Composite.remove(world, existing);

	const walls = [
		// Floor: Top edge at exactly window height
		Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, {
			isStatic: true,
			label: "floor",
			friction: 0.5
		}),

		// Left Wall: Extends way up
		Bodies.rectangle(
			0 - thickness / 2,
			height - (height + spawnHeight) / 2,
			thickness,
			height + spawnHeight,
			{
				isStatic: true,
				label: "wall",
				friction: 0
			}
		),

		// Right Wall
		Bodies.rectangle(
			width + thickness / 2,
			height - (height + spawnHeight) / 2,
			thickness,
			height + spawnHeight,
			{
				isStatic: true,
				label: "wall",
				friction: 0
			}
		)
	];

	Composite.add(world, walls);
}

// Spawning the Colors (Limited Selection)
function spawnColors() {
	const width = window.innerWidth;
	const padding = 50;

	// Shuffle and pick 50 colors randomly to avoid clutter
	const shuffled = colors.sort(() => 0.5 - Math.random());
	const selectedColors = shuffled.slice(0, 50);

	selectedColors.forEach((colorName, index) => {
		// Random position, strictly within screen width
		const x = Math.random() * (width - padding * 2) + padding;
		const y = -Math.random() * 2000 - 200; // Adjusted height for fewer items

		const charWidth = 9;
		const boxPad = 34;
		const boxWidth = colorName.length * charWidth + boxPad;
		const boxHeight = 40;

		// Physics Body
		const body = Bodies.rectangle(x, y, boxWidth, boxHeight, {
			angle: Math.random() * 0.5 - 0.25,
			restitution: 0.5,
			friction: 0.05,
			label: colorName
		});

		// DOM Element
		const elem = document.createElement("div");
		elem.classList.add("color-body");
		elem.textContent = colorName;
		elem.style.width = `${boxWidth}px`;
		elem.style.height = `${boxHeight}px`;
		elem.style.backgroundColor = colorName;

		sceneContainer.appendChild(elem);

		// Contrast Check
		requestAnimationFrame(() => {
			const computedColor = window.getComputedStyle(elem).backgroundColor;
			const rgb = computedColor.match(/\d+/g);
			if (rgb) {
				const brightness = Math.round(
					(parseInt(rgb[0]) * 299 +
						parseInt(rgb[1]) * 587 +
						parseInt(rgb[2]) * 114) /
						1000
				);
				if (brightness > 140) {
					elem.style.color = "#1a1a1a";
					elem.style.textShadow = "none";
					elem.style.border = "1px solid rgba(0,0,0,0.1)";
				} else {
					elem.style.color = "#ffffff";
				}
			}
		});

		bodiesDOM.push({ body, elem });
		Composite.add(world, body);
	});
}

// Sync Loop
function updateLoop() {
	bodiesDOM.forEach((pair) => {
		const { body, elem } = pair;
		const { position, angle } = body;

		// Optimization: Don't render if way off screen (optional, but good)
		// For now, render all to ensure we see them falling
		elem.style.transform = `translate(${position.x - elem.offsetWidth / 2}px, ${
			position.y - elem.offsetHeight / 2
		}px) rotate(${angle}rad)`;
	});

	requestAnimationFrame(updateLoop);
}

// Mouse Control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: { visible: false }
	}
});

render.canvas.style.zIndex = 5;

Composite.add(world, mouseConstraint);

// Init
createWalls();
spawnColors();
updateLoop();

// Resize
window.addEventListener("resize", () => {
	render.canvas.width = window.innerWidth;
	render.canvas.height = window.innerHeight;
	createWalls();
});

// Controls
const btnGravity = document.getElementById("btn-gravity");
const btnExplode = document.getElementById("btn-explode");

let gravityOn = true;
btnGravity.addEventListener("click", () => {
	gravityOn = !gravityOn;
	engine.gravity.y = gravityOn ? 1 : 0;
	btnGravity.textContent = gravityOn ? "Zero Gravity" : "Restore Gravity";

	if (!gravityOn) {
		bodiesDOM.forEach(({ body }) => {
			Matter.Body.applyForce(body, body.position, {
				x: (Math.random() - 0.5) * 0.005,
				y: (Math.random() - 0.5) * 0.005
			});
		});
	}
});

btnExplode.addEventListener("click", () => {
	// Add audio feedback for explosion
	if (audioCtx.state === "suspended") audioCtx.resume();
	const osc = audioCtx.createOscillator();
	const g = audioCtx.createGain();
	osc.connect(g);
	g.connect(audioCtx.destination);
	osc.frequency.setValueAtTime(100, audioCtx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
	g.gain.setValueAtTime(0.5, audioCtx.currentTime);
	g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
	osc.start();
	osc.stop(audioCtx.currentTime + 0.5);

	bodiesDOM.forEach(({ body }) => {
		const forceMagnitude = 0.05 * body.mass;
		const angle = Math.random() * Math.PI * 2;
		Matter.Body.applyForce(body, body.position, {
			x: Math.cos(angle) * forceMagnitude,
			y: Math.sin(angle) * forceMagnitude
		});
	});
});
