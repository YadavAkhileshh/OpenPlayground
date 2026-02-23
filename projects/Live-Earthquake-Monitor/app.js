const svg = d3.select("#map");
const tooltip = document.getElementById("tooltip");

let width, height, projection, path;
let landGroup, quakeGroup;
let earthquakes = [];
let currentPeriod = "day";

function getMagColor(mag, depth) {
  if (depth < 70) return `rgba(200, 80, 80, ${0.5 + mag * 0.06})`;
  if (depth < 300) return `rgba(200, 160, 80, ${0.5 + mag * 0.06})`;
  return `rgba(80, 120, 200, ${0.5 + mag * 0.06})`;
}

function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  svg.attr("width", width).attr("height", height);

  projection = d3.geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2]);

  path = d3.geoPath().projection(projection);

  landGroup = svg.append("g");
  quakeGroup = svg.append("g");

  // Load world map
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
    const countries = topojson.feature(world, world.objects.countries);

    landGroup.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "land")
      .attr("d", path);

    fetchEarthquakes();
  });
}

async function fetchEarthquakes() {
  const urls = {
    day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
    week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson",
    month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
  };

  try {
    const response = await fetch(urls[currentPeriod]);
    const data = await response.json();

    earthquakes = data.features
      .map(f => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        depth: f.geometry.coordinates[2]
      }))
      .filter(q => q.mag >= 2.5);

    document.getElementById("count").textContent = earthquakes.length;
    const maxMag = Math.max(...earthquakes.map(q => q.mag));
    document.getElementById("max-mag").textContent = maxMag.toFixed(1);
    document.getElementById("updated").textContent = `Updated: ${new Date().toLocaleTimeString()}`;

    drawQuakes();
  } catch (err) {
    console.error("Failed to fetch earthquakes:", err);
    earthquakes = generateSampleData();
    drawQuakes();
  }
}

function generateSampleData() {
  const samples = [
    { lat: 35.6, lon: 139.7, mag: 4.2, place: "Near Tokyo, Japan", depth: 35 },
    { lat: 37.4, lon: -122.1, mag: 3.8, place: "San Francisco Bay Area", depth: 12 },
    { lat: -33.4, lon: -70.6, mag: 5.1, place: "Near Santiago, Chile", depth: 45 },
    { lat: 38.9, lon: 43.4, mag: 4.5, place: "Eastern Turkey", depth: 10 },
    { lat: -6.2, lon: 106.8, mag: 4.8, place: "Near Jakarta, Indonesia", depth: 55 },
    { lat: 19.4, lon: -99.1, mag: 3.9, place: "Near Mexico City", depth: 20 },
    { lat: 36.2, lon: 28.0, mag: 4.1, place: "Dodecanese Islands, Greece", depth: 15 },
    { lat: -4.6, lon: 122.5, mag: 5.5, place: "Sulawesi, Indonesia", depth: 100 },
    { lat: 51.5, lon: -178.5, mag: 4.7, place: "Andreanof Islands, Alaska", depth: 30 },
    { lat: -22.9, lon: -68.2, mag: 4.3, place: "Antofagasta, Chile", depth: 110 }
  ];

  return samples.map((s, i) => ({
    id: `sample-${i}`,
    ...s,
    time: Date.now() - Math.random() * 24 * 60 * 60 * 1000
  }));
}

function drawQuakes() {
  quakeGroup.selectAll("*").remove();

  // Sort by magnitude (draw smaller first)
  const sorted = [...earthquakes].sort((a, b) => a.mag - b.mag);

  sorted.forEach((quake, i) => {
    const pos = projection([quake.lon, quake.lat]);
    if (!pos) return;

    const baseRadius = Math.max(3, Math.pow(2, quake.mag) * 0.6);
    const color = getMagColor(quake.mag, quake.depth);
    const age = (Date.now() - quake.time) / (1000 * 60 * 60);

    // Pulsing ring for recent quakes
    if (age < 12) {
      const g = quakeGroup.append("g")
        .attr("transform", `translate(${pos[0]}, ${pos[1]})`);

      g.append("circle")
        .attr("r", baseRadius)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .style("animation", "pulse 2s ease-out infinite")
        .style("animation-delay", `${i * 0.1}s`);
    }

    // Main circle
    quakeGroup.append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", baseRadius)
      .attr("fill", color)
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1)
      .datum(quake)
      .on("mouseenter", function(event, d) {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
        showTooltip(event, d);
      })
      .on("mouseleave", function() {
        d3.select(this).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1);
        tooltip.style.opacity = "0";
      });

    // Magnitude label for large quakes
    if (quake.mag >= 5) {
      quakeGroup.append("text")
        .attr("x", pos[0])
        .attr("y", pos[1] + baseRadius + 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .attr("font-size", "9px")
        .text(quake.mag.toFixed(1));
    }
  });
}

function showTooltip(event, quake) {
  const timeAgo = Math.round((Date.now() - quake.time) / (1000 * 60 * 60));
  tooltip.innerHTML = `
    <h3>M${quake.mag.toFixed(1)} Earthquake</h3>
    <div class="row"><span>Location</span><span class="val">${quake.place}</span></div>
    <div class="row"><span>Depth</span><span class="val">${quake.depth.toFixed(0)} km</span></div>
    <div class="row"><span>Time</span><span class="val">${timeAgo}h ago</span></div>
    <div class="row"><span>Coordinates</span><span class="val">${quake.lat.toFixed(2)}, ${quake.lon.toFixed(2)}</span></div>
  `;
  tooltip.style.opacity = "1";
  tooltip.style.left = Math.min(event.pageX + 15, window.innerWidth - 200) + "px";
  tooltip.style.top = Math.min(event.pageY + 15, window.innerHeight - 150) + "px";
}

// Controls
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    currentPeriod = this.dataset.period;
    fetchEarthquakes();
  });
});

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;

  svg.attr("width", width).attr("height", height);
  projection.scale(width / 5.5).translate([width / 2, height / 2]);

  landGroup.selectAll("path").attr("d", path);
  drawQuakes();
});

init();

// Refresh data every 5 minutes
setInterval(fetchEarthquakes, 5 * 60 * 1000);