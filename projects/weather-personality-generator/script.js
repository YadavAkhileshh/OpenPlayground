const weatherTypes = [
  "Soft drizzle 🌦️ — calm but emotional",
  "Clear sky ☀️ — peaceful and balanced",
  "Thunderstorm ⚡ — intense energy",
  "Foggy morning 🌫️ — thoughtful and quiet"
];

function check() {
  document.getElementById("result").innerText =
    weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}