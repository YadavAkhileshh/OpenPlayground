// Initialize map
const map = L.map('map').setView([20, 0], 2);

// OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Cities with lat/lng
const cities = [
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Dubai", lat: 25.276987, lng: 55.296249 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", lat: 37.5665, lng: 126.9780 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
  { name: "Auckland", lat: -36.8485, lng: 174.7633 },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  { name: "Sao Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456 },
  { name: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
  { name: "Doha", lat: 25.2854, lng: 51.5310 },
  { name: "Riyadh", lat: 24.7136, lng: 46.6753 },
  { name: "Tehran", lat: 35.6892, lng: 51.3890 },
  { name: "Baghdad", lat: 33.3152, lng: 44.3661 },
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", lat: 31.5204, lng: 74.3587 },
  { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Manila", lat: 14.5995, lng: 120.9842 },
  { name: "Hanoi", lat: 21.0278, lng: 105.8342 },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393 },
  { name: "Oslo", lat: 59.9139, lng: 10.7522 },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
  { name: "Copenhagen", lat: 55.6761, lng: 12.5683 },
  { name: "Warsaw", lat: 52.2297, lng: 21.0122 },
  { name: "Helsinki", lat: 60.1695, lng: 24.9354 },
  { name: "Montreal", lat: 45.5017, lng: -73.5673 },
];


// Variables to track selections
let selectedCities = [];
let notes = {};
let routeLine;

// DOM elements
const cityList = document.getElementById("cityList");
const noteInput = document.getElementById("noteInput");
const imageInput = document.getElementById("imageInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const totalDistanceEl = document.getElementById("totalDistance");

// Add markers
cities.forEach(city => {
  const marker = L.marker([city.lat, city.lng]).addTo(map)
    .bindPopup(city.name);

  marker.on('click', () => {
    selectedCities.push(city);
    updateRoute();
    updateCityList();
  });
});

// Update polyline route and distance
function updateRoute() {
  if(routeLine) map.removeLayer(routeLine);

  const latlngs = selectedCities.map(c => [c.lat, c.lng]);
  routeLine = L.polyline(latlngs, { color: 'blue' }).addTo(map);

  // Zoom map to fit route
  if(latlngs.length > 0) map.fitBounds(routeLine.getBounds(), { padding: [50,50] });

  // Calculate distance
  let totalDist = 0;
  for(let i=0; i<selectedCities.length-1; i++){
    totalDist += haversine(selectedCities[i], selectedCities[i+1]);
  }
  totalDistanceEl.textContent = totalDist.toFixed(1);
}

// Update city list with notes
function updateCityList() {
  cityList.innerHTML = "";
  selectedCities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city.name;
    if(notes[city.name]) li.textContent += ` - ${notes[city.name].note}`;
    cityList.appendChild(li);
  });
}

// Add notes/images
addNoteBtn.addEventListener("click", () => {
  if(selectedCities.length === 0){
    alert("Select a city first!");
    return;
  }
  const lastCity = selectedCities[selectedCities.length-1];
  const note = noteInput.value;
  const imgFile = imageInput.files[0];

  notes[lastCity.name] = { note, image: imgFile ? URL.createObjectURL(imgFile) : null };
  noteInput.value = "";
  imageInput.value = "";
  updateCityList();
});

// Haversine formula to calculate real-world distance
function haversine(a, b){
  const R = 6371; // km
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const lat1 = a.lat * Math.PI/180;
  const lat2 = b.lat * Math.PI/180;

  const x = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return R * y;
}
