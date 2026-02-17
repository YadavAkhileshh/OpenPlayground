const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let points = [];
let isDrawing = false;
let drawMode = false;
let startX, startY, endX, endY;
let selectedPoints = [];

canvas.addEventListener("click", (e) => {
    if (!drawMode) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });
        draw();
    }
});

canvas.addEventListener("mousedown", (e) => {
    if (drawMode) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        endX = e.clientX - rect.left;
        endY = e.clientY - rect.top;
        draw();
        drawRectangle();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing) {
        isDrawing = false;
        performRangeQuery();
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = selectedPoints.includes(p) ? "lime" : "white";
        ctx.fill();
    });
}

function drawRectangle() {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(
        startX,
        startY,
        endX - startX,
        endY - startY
    );
}

function performRangeQuery() {
    selectedPoints = [];

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    points.forEach(p => {
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
            selectedPoints.push(p);
        }
    });

    draw();

    document.getElementById("output").innerText =
        `Points in Range: ${selectedPoints.length}`;
}

function generateRandomPoints() {
    points = [];
    selectedPoints = [];

    for (let i = 0; i < 50; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    draw();
    document.getElementById("output").innerText =
        "50 Random Points Generated";
}

function clearCanvas() {
    points = [];
    selectedPoints = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("output").innerText =
        "Canvas Cleared";
}

function toggleDrawMode() {
    drawMode = !drawMode;
    document.getElementById("output").innerText =
        drawMode
            ? "Draw rectangle to query range"
            : "Click to add points";
}