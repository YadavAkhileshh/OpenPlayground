const canvas = document.getElementById("solarCanvas");
const ctx = canvas.getContext("2d");

const infoBox = document.getElementById("planet-info");
const infoName = document.getElementById("planet-name");
const infoDetails = document.getElementById("planet-details");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const center = () => ({
  x: canvas.width / 2,
  y: canvas.height / 2,
});

const planets = [
  {
    name: "Mercury",
    radius: 4,
    orbit: 60,
    speed: 0.04,
    color: "#9ca3af",
    angle: Math.random(),
    info: "Distance: 57.9 million km\nOrbital period: 88 days",
  },
  {
    name: "Venus",
    radius: 6,
    orbit: 90,
    speed: 0.03,
    color: "#fbbf24",
    angle: Math.random(),
    info: "Distance: 108.2 million km\nOrbital period: 225 days",
  },
  {
    name: "Earth",
    radius: 7,
    orbit: 130,
    speed: 0.02,
    color: "#60a5fa",
    angle: Math.random(),
    info: "Distance: 149.6 million km\nOrbital period: 365 days",
  },
  {
    name: "Mars",
    radius: 5,
    orbit: 170,
    speed: 0.018,
    color: "#f87171",
    angle: Math.random(),
    info: "Distance: 227.9 million km\nOrbital period: 687 days",
  },
  {
    name: "Jupiter",
    radius: 12,
    orbit: 230,
    speed: 0.01,
    color: "#fde68a",
    angle: Math.random(),
    info: "Gas giant\nOrbital period: 12 years",
  },
  {
    name: "Saturn",
    radius: 10,
    orbit: 290,
    speed: 0.008,
    color: "#fcd34d",
    angle: Math.random(),
    info: "Famous rings\nOrbital period: 29 years",
  },
  {
    name: "Uranus",
    radius: 8,
    orbit: 340,
    speed: 0.006,
    color: "#67e8f9",
    angle: Math.random(),
    info: "Ice giant\nOrbital period: 84 years",
  },
  {
    name: "Neptune",
    radius: 8,
    orbit: 390,
    speed: 0.005,
    color: "#38bdf8",
    angle: Math.random(),
    info: "Strong winds\nOrbital period: 165 years",
  },
];

function drawSun() {
  const { x, y } = center();
  const gradient = ctx.createRadialGradient(x, y, 10, x, y, 40);
  gradient.addColorStop(0, "#fde68a");
  gradient.addColorStop(1, "#f59e0b");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbits() {
  const { x, y } = center();
  ctx.strokeStyle = "rgba(148,163,184,0.2)";
  planets.forEach(p => {
    ctx.beginPath();
    ctx.arc(x, y, p.orbit, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawPlanets() {
  const { x, y } = center();
  planets.forEach(p => {
    const px = x + p.orbit * Math.cos(p.angle);
    const py = y + p.orbit * Math.sin(p.angle);

    p.screenX = px;
    p.screenY = py;

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(px, py, p.radius, 0, Math.PI * 2);
    ctx.fill();

    p.angle += p.speed;
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSun();
  drawOrbits();
  drawPlanets();
  requestAnimationFrame(animate);
}
animate();

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

canvas.addEventListener("mousemove", (e) => {
  let found = false;
  planets.forEach(p => {
    if (distance(e.clientX, e.clientY, p.screenX, p.screenY) < p.radius + 6) {
      infoName.textContent = p.name;
      infoDetails.textContent = p.info;
      infoBox.classList.remove("hidden");
      found = true;
    }
  });
  if (!found) infoBox.classList.add("hidden");
});

canvas.addEventListener("click", (e) => {
  planets.forEach(p => {
    if (distance(e.clientX, e.clientY, p.screenX, p.screenY) < p.radius + 6) {
      alert(`${p.name}\n\n${p.info}`);
    }
  });
});
