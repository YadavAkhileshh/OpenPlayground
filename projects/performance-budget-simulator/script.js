const jsSize = document.getElementById("jsSize");
const cssSize = document.getElementById("cssSize");
const imgSize = document.getElementById("imgSize");

const jsValue = document.getElementById("jsValue");
const cssValue = document.getElementById("cssValue");
const imgValue = document.getElementById("imgValue");

const network = document.getElementById("network");
const simulateBtn = document.getElementById("simulateBtn");
const result = document.getElementById("result");

[jsSize, cssSize, imgSize].forEach(input => {
  input.addEventListener("input", updateValues);
});

function updateValues() {
  jsValue.textContent = jsSize.value;
  cssValue.textContent = cssSize.value;
  imgValue.textContent = imgSize.value;
}

simulateBtn.addEventListener("click", simulate);

function simulate() {
  const totalSize = 
    Number(jsSize.value) + 
    Number(cssSize.value) + 
    Number(imgSize.value);

  const speedMultiplier = getNetworkMultiplier(network.value);
  const loadTime = (totalSize / 100) * speedMultiplier;

  const grade = getGrade(loadTime);
  const feedback = getFeedback(grade);

  saveSimulation(totalSize, loadTime, grade);

  result.innerHTML = `
    <strong>Total Asset Size:</strong> ${totalSize} KB<br/>
    <strong>Estimated Load Time:</strong> ${loadTime.toFixed(2)}s<br/>
    <strong>Performance Grade:</strong> ${grade}<br/>
    <p>${feedback}</p>
  `;
  result.classList.remove("hidden");
}

function getNetworkMultiplier(type) {
  if (type === "fast") return 0.8;
  if (type === "3g") return 1.5;
  return 2.5;
}

function getGrade(time) {
  if (time < 2) return "Good 🚀";
  if (time < 4) return "Needs Improvement ⚠️";
  return "Poor 🐌";
}

function getFeedback(grade) {
  if (grade.includes("Good"))
    return "Nice work! Your users won’t rage quit.";
  if (grade.includes("Needs"))
    return "Some optimization needed. Consider code splitting or compression.";
  return "This page is heavy. Optimize images and reduce JS immediately.";
}

function saveSimulation(size, time, grade) {
  const history = JSON.parse(localStorage.getItem("perfHistory")) || [];
  history.push({
    size,
    time,
    grade,
    date: new Date().toISOString()
  });
  localStorage.setItem("perfHistory", JSON.stringify(history));
}