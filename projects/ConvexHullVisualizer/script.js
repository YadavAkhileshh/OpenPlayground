const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let points = [];
let hull = [];

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    });

    // Draw hull
    if (hull.length > 1) {
        ctx.beginPath();
        ctx.moveTo(hull[0].x, hull[0].y);
        for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i].x, hull[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function generateRandomPoints() {
    points = [];
    hull = [];

    for (let i = 0; i < 40; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    draw();
    document.getElementById("output").innerText = "Random points generated.";
}

function clearCanvas() {
    points = [];
    hull = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("output").innerText = "Canvas cleared.";
}

function computeHull() {
    if (points.length < 3) {
        document.getElementById("output").innerText = "Need at least 3 points.";
        return;
    }

    hull = grahamScan(points);
    draw();
    document.getElementById("output").innerText =
        `Convex Hull computed. Hull size: ${hull.length}`;
}

// Graham Scan Algorithm
function grahamScan(points) {
    let sorted = [...points].sort((a, b) =>
        a.y === b.y ? a.x - b.x : a.y - b.y
    );

    let cross = (o, a, b) =>
        (a.x - o.x) * (b.y - o.y) -
        (a.y - o.y) * (b.x - o.x);

    let lower = [];
    for (let p of sorted) {
        while (lower.length >= 2 &&
            cross(lower[lower.length - 2],
                  lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    let upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        let p = sorted[i];
        while (upper.length >= 2 &&
            cross(upper[upper.length - 2],
                  upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    upper.pop();
    lower.pop();

    return lower.concat(upper);
}