const input = document.getElementById("decisionInput");
const list = document.getElementById("decisionList");
const addBtn = document.getElementById("addBtn");

let decisions = [];

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  decisions.push({ text, confidence: 50 });
  input.value = "";
  render();
});

function render() {
  list.innerHTML = "";

  decisions.sort((a, b) => b.confidence - a.confidence);

  decisions.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="decision-label">${index + 1}. ${item.text}</div>
      <input type="range" min="0" max="100" value="${item.confidence}" class="slider" />
      <div class="confidence ${getConfClass(item.confidence)}">${item.confidence}% confidence</div>
    `;

    const slider = li.querySelector(".slider");
    const confidenceText = li.querySelector(".confidence");

    slider.oninput = (e) => {
      item.confidence = e.target.value;
      confidenceText.textContent = `${item.confidence}% confidence`;
      confidenceText.className = `confidence ${getConfClass(item.confidence)}`;
      render();
    };

    list.appendChild(li);
  });
}

function getConfClass(val) {
  if (val > 70) return "high";
  if (val > 40) return "medium";
  return "low";
}
