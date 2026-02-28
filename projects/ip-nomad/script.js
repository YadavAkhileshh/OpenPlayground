const input = document.querySelector(".rounded-input");
const arrow = document.querySelector(".arrow");
const infoEls = document.querySelectorAll(".info");

// setting up the map
const map = L.map("map").setView([28.6448, 77.2167], 13);
// L.tileLayer(
//   "https://api.maptiler.com/maps/topo-v2-dark/{z}/{x}/{y}.png?key=ZgRtdXQAOqmqIIucoNwZ",
//   {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   }
// ).addTo(map);

let marker = null;

// Map-styles
const mapStyles = [
  {
    name: "Dark",
    url: "https://api.maptiler.com/maps/topo-v2-dark/{z}/{x}/{y}.png?key=ZgRtdXQAOqmqIIucoNwZ",
  },
  {
    name: "Streets",
    url: "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=ZgRtdXQAOqmqIIucoNwZ",
  },
  {
    name: "Satellite",
    url: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=ZgRtdXQAOqmqIIucoNwZ",
  },
  {
    name: "Vector",
    url: "https://api.maptiler.com/maps/toner-v2/{z}/{x}/{y}.png?key=ZgRtdXQAOqmqIIucoNwZ",
  },
];

// Initial map-style
let currentStyleIndex = 0;

let tileLayer = L.tileLayer(mapStyles[currentStyleIndex].url, {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);


// Style toggle button
const styleBtn = document.querySelector(".style-btn");

const styleLabel = document.createElement("div");
styleLabel.className = "style-label";
document.body.appendChild(styleLabel);

styleBtn.addEventListener("click", () => {
  currentStyleIndex = (currentStyleIndex + 1) % mapStyles.length;
  map.removeLayer(tileLayer);
  tileLayer = L.tileLayer(mapStyles[currentStyleIndex].url, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // text-pop-up
  styleLabel.textContent = mapStyles[currentStyleIndex].name;
  styleLabel.classList.add("show");
  
  // fade-out
  clearTimeout(styleLabel._timeout);
  styleLabel._timeout = setTimeout(() => {
    styleLabel.classList.remove("show");
  }, 50000);

});


// Map-Recenter button 
const recenterBtn = document.querySelector(".recenter-btn");
recenterBtn.addEventListener("click", () => {
  if (marker) {
    const pos = marker.getLatLng();
    map.flyTo(pos, 15);
  } else {
    alert("No location marker available yet!");
  }
});


// getting data from geo.ipfy api
async function fetchIPData(query = "") {
  const apiKey = ""; // IPify API key 

  // Decides which parameter to use (IP or domain)
  let param = "";
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(query)) {
    param = `ipAddress=${encodeURIComponent(query)}`;
  } else if (query) {
    param = `domain=${encodeURIComponent(query)}`;
  }

  const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&${param}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200 || data.code === 422 || data.messages) {
      alert("Invalid IP or domain entered.");
      return;
    }

    updateInfo(data);
  } catch {
    alert("Failed to fetch IP data. Check your connection or API key.");
  }
}

// updating page and map
function updateInfo(data) {
  infoEls[0].innerText = data.ip;
  infoEls[1].innerText = `${data.location.city}, ${data.location.region}, ${data.location.country}`;
  infoEls[2].innerText = `UTC ${data.location.timezone}`;
  infoEls[3].innerText = data.isp;

  const { lat, lng } = data.location;
  map.flyTo([lat, lng], 13);

  if (marker) map.removeLayer(marker);

  //custom map-pin
  const customIcon = L.icon({
    iconUrl: "assets/map-pin2.png", // image path
    iconSize: [50, 50], // width, height in pixels
    iconAnchor: [25, 50], // point of the icon which will be at marker's location
    popupAnchor: [0, -50], // where the popup should open relative to the icon
  });
  //

  marker = L.marker([lat, lng],{icon:customIcon})
    .addTo(map)
    .bindPopup(`${data.location.city}, ${data.location.region}, ${data.location.country}`)
    .openPopup();
}

// handling search actions
function handleSearch() {
  const ip = input.value.trim();
  fetchIPData(ip);
}

arrow.addEventListener("click", handleSearch);
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

//loading user's IP on startup
fetchIPData();
