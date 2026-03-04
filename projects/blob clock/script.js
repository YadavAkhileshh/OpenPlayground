const blobsEl = document.getElementById("blobs");
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildBlobPath(cx, cy, r, seed) {
  const pts = 8;
  const angles = Array.from({ length: pts }, (_, i) => (i / pts) * Math.PI * 2);
  const rand = (i) => {
    let x = Math.sin(seed * 9301 + i * 49297) * 100003;
    return x - Math.floor(x);
  };
  const radii = angles.map((_, i) => r * (0.65 + rand(i) * 0.55));
  const coords = angles.map((a, i) => [
    cx + Math.cos(a) * radii[i],
    cy + Math.sin(a) * radii[i],
  ]);
  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 1; i <= pts; i++) {
    const p = coords[i % pts];
    const prev = coords[(i - 1 + pts) % pts];
    const next = coords[(i + 1) % pts];
    const cp1x = prev[0] + (p[0] - coords[(i - 2 + pts) % pts][0]) * 0.25;
    const cp1y = prev[1] + (p[1] - coords[(i - 2 + pts) % pts][1]) * 0.25;
    const cp2x = p[0] - (next[0] - prev[0]) * 0.25;
    const cp2y = p[1] - (next[1] - prev[1]) * 0.25;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p[0]} ${p[1]}`;
  }
  return d + " Z";
}

const blobConfigs = [
  { id: "b0", cx: 200, cy: 200, r: 110, color: "rgba(100,255,200,0.3)" },
  { id: "b1", cx: 185, cy: 195, r: 80, color: "rgba(50,180,255,0.35)" },
  { id: "b2", cx: 215, cy: 205, r: 55, color: "rgba(200,100,255,0.4)" },
];

blobConfigs.forEach(({ id, color }) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("fill", color);
  el.id = id;
  blobsEl.appendChild(el);
});

let prevSecond = -1;

function tick() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const pad = (n) => String(n).padStart(2, "0");

  document.getElementById("hms").textContent =
    `${pad(h % 12 || 12)}:${pad(m)}:${pad(s)}`;
  document.getElementById("ampm").textContent = h >= 12 ? "PM" : "AM";
  document.getElementById("date-str").textContent =
    `${DAYS[now.getDay()]} · ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  blobConfigs.forEach(({ id, cx, cy, r }, i) => {
    const el = document.getElementById(id);
    const timeSeed = (Date.now() / 1000) * (0.1 + i * 0.07) + i * 100;
    el.setAttribute("d", buildBlobPath(cx, cy, r, timeSeed));
  });

  if (s !== prevSecond) {
    prevSecond = s;
    emitParticle();
  }

  requestAnimationFrame(tick);
}

function emitParticle() {
  const container = document.getElementById("particles");
  const el = document.createElement("div");
  el.className = "particle";
  const size = 3 + Math.random() * 5;
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${150 + Math.random() * 100}px;
    top: ${150 + Math.random() * 100}px;
    animation-delay: ${Math.random() * 0.5}s;
    animation-duration: ${2 + Math.random()}s;
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

tick();
