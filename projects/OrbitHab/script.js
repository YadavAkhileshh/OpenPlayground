let oxygen = 98.2;
const oxDisplay = document.getElementById("ox-val");
const lockdownBtn = document.getElementById("lockdown");

setInterval(() => {
  oxygen -= 0.01;
  oxDisplay.innerText = oxygen.toFixed(2) + "%";

  if (oxygen < 95) {
    document.getElementById("alerts").innerText =
      "LOW OXYGEN WARNING: CHECK SCRUBBERS";
    document.getElementById("alerts").style.background = "rgba(255,0,0,0.4)";
  }
}, 5000);

lockdownBtn.addEventListener("click", () => {
  alert("CRITICAL: Airlocks sealing in 3... 2... 1...");
  lockdownBtn.innerText = "HABITAT SEALED";
  lockdownBtn.style.background = "#555";
});
