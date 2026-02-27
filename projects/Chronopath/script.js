const slider = document.getElementById("yearSlider");
const yearOut = document.getElementById("yearDisplay");
const riskOut = document.getElementById("risk");

slider.oninput = function () {
  yearOut.innerText = this.value + (this.value < 2026 ? " BC" : " AD");
  const diff = Math.abs(2026 - this.value);
  const risk = (diff * 0.043).toFixed(3);
  riskOut.innerText = risk + "%";
};
