const levelEl = document.getElementById("level");
const chargingEl = document.getElementById("charging");
const chargingTimeEl = document.getElementById("chargingTime");
const dischargingTimeEl = document.getElementById("dischargingTime");
const supportEl = document.getElementById("support");

if (!navigator.getBattery) {
  supportEl.textContent =
    "Battery Status API is not supported in this browser.";
} else {
  navigator.getBattery().then(battery => {
    function updateBatteryInfo() {
      levelEl.textContent = Math.round(battery.level * 100) + "%";
      chargingEl.textContent = battery.charging ? "Charging" : "Not Charging";

      chargingTimeEl.textContent =
        battery.charging && battery.chargingTime !== Infinity
          ? formatTime(battery.chargingTime)
          : "N/A";

      dischargingTimeEl.textContent =
        !battery.charging && battery.dischargingTime !== Infinity
          ? formatTime(battery.dischargingTime)
          : "N/A";
    }

    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }

    updateBatteryInfo();

    battery.addEventListener("levelchange", updateBatteryInfo);
    battery.addEventListener("chargingchange", updateBatteryInfo);
    battery.addEventListener("chargingtimechange", updateBatteryInfo);
    battery.addEventListener("dischargingtimechange", updateBatteryInfo);
  });
}
