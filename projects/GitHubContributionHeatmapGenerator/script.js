function generateHeatmap() {
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  const today = new Date();
  const days = 365;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const day = document.createElement("div");
    day.classList.add("day");

    // Random contribution intensity (0-4)
    const level = Math.floor(Math.random() * 5);

    if (level > 0) {
      day.classList.add(`level-${level}`);
    }

    day.title = `${date.toDateString()} - ${level} contributions`;

    heatmap.appendChild(day);
  }
}

// Generate automatically on load
generateHeatmap();
