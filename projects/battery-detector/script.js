const levelText = document.getElementById("levelText");
const statusText = document.getElementById("statusText");
const chargingTimeText = document.getElementById("chargingTime");
const dischargingTimeText = document.getElementById("dischargingTime");
const batteryLevelBar = document.getElementById("batteryLevel");

function formatTime(seconds) {
  if (seconds === Infinity) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function updateBatteryInfo(battery) {
  const levelPercent = Math.round(battery.level * 100);
  levelText.textContent = `${levelPercent}%`;
  batteryLevelBar.style.height = `${levelPercent}%`;

  if (levelPercent <= 20) {
    batteryLevelBar.style.background = "linear-gradient(180deg, #ef4444, #dc2626)";
  } else if (levelPercent <= 50) {
    batteryLevelBar.style.background = "linear-gradient(180deg, #f59e0b, #d97706)";
  } else {
    batteryLevelBar.style.background = "linear-gradient(180deg, #22c55e, #16a34a)";
  }

  statusText.textContent = battery.charging ? "Charging ⚡" : "Not Charging";

  chargingTimeText.textContent = battery.charging
    ? formatTime(battery.chargingTime)
    : "N/A";

  dischargingTimeText.textContent = !battery.charging
    ? formatTime(battery.dischargingTime)
    : "N/A";
}

if ("getBattery" in navigator) {
  navigator.getBattery().then((battery) => {
    updateBatteryInfo(battery);

    battery.addEventListener("levelchange", () => updateBatteryInfo(battery));
    battery.addEventListener("chargingchange", () => updateBatteryInfo(battery));
    battery.addEventListener("chargingtimechange", () => updateBatteryInfo(battery));
    battery.addEventListener("dischargingtimechange", () => updateBatteryInfo(battery));
  });
} else {
  alert("Battery Status API is not supported on this browser.");
}
