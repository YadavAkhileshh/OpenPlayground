// Select game elements
const block = document.querySelector(".block");
const paddle = document.querySelector(".paddle");
const scoreEl = document.querySelector(".score");
const container = document.querySelector(".game-container");

// Game settings
let containerWidth = container.clientWidth;
let containerHeight = container.clientHeight;
let paddleWidth = paddle.offsetWidth;
let blockSize = block.offsetWidth;
let paddleX = (containerWidth - paddleWidth) / 2; // starting paddle position
let blockX = Math.random() * (containerWidth - blockSize); // random starting block X
let blockY = 0; // starting Y
let speed = 2; // falling speed
let score = 0;

// Apply initial positions
paddle.style.left = `${paddleX}px`;
block.style.left = `${blockX}px`;

// --- Paddle movement with mouse ---
container.addEventListener("mousemove", (e) => {
	let rect = container.getBoundingClientRect();
	paddleX = e.clientX - rect.left - paddleWidth / 2;
	// Keep paddle inside container
	paddleX = Math.max(0, Math.min(containerWidth - paddleWidth, paddleX));
	paddle.style.left = `${paddleX}px`;
});

// --- Main game loop ---
function gameLoop() {
	// Move block down
	blockY += speed;
	block.style.top = blockY + "px";

	// --- Collision detection ---
	if (
		blockY + blockSize >= containerHeight - 20 && // near paddle vertically
		blockX + blockSize > paddleX && // overlapping horizontally
		blockX < paddleX + paddleWidth
	) {
		score++;
		scoreEl.textContent = `Score: ${score}`;
		resetBlock();
	}

	// --- Block missed ---
	if (blockY > containerHeight) {
		score = 0; // reset score
		scoreEl.textContent = `Score: ${score}`;
		resetBlock();
	}

	requestAnimationFrame(gameLoop);
}

// --- Reset block to top with random X ---
function resetBlock() {
	blockY = 0;
	blockX = Math.random() * (containerWidth - blockSize);
	block.style.left = `${blockX}px`;
}

// Start the game
gameLoop();
