const trackArea = document.getElementById("trackArea");
const analyzeBtn = document.getElementById("analyzeBtn");
const insights = document.getElementById("insights");

let interactions = JSON.parse(localStorage.getItem("attentionData")) || [];

trackArea.addEventListener("click", (e) => {
  const rect = trackArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  interactions.push({ x, y });
  localStorage.setItem("attentionData", JSON.stringify(interactions));

  drawHeatPoint(x, y);
});

function drawHeatPoint(x, y) {
  const point = document.createElement("div");
  point.className = "heat-point";
  point.style.left = `${x - 10}px`;
  point.style.top = `${y - 10}px`;
  trackArea.appendChild(point);
}

analyzeBtn.addEventListener("click", () => {
  if (interactions.length === 0) {
    insights.textContent = "No interaction data available.";
    insights.classList.remove("hidden");
    return;
  }

  const topClicks = interactions.filter(i => i.y < 200).length;
  const bottomClicks = interactions.length - topClicks;

  let message = "Balanced attention across page.";

  if (topClicks > bottomClicks * 2)
    message = "Users focus heavily on the top section.";
  else if (bottomClicks > topClicks * 2)
    message = "Lower content receives more attention than expected.";

  insights.innerHTML = `
    <strong>Total Interactions:</strong> ${interactions.length}<br/>
    <strong>Top Area Clicks:</strong> ${topClicks}<br/>
    <strong>Lower Area Clicks:</strong> ${bottomClicks}<br/>
    <p>${message}</p>
  `;
  insights.classList.remove("hidden");
});