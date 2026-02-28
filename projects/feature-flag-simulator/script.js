const featureNameInput = document.getElementById("featureName");
const addFeatureBtn = document.getElementById("addFeatureBtn");
const featureList = document.getElementById("featureList");

const userTypeSelect = document.getElementById("userType");
const simulateBtn = document.getElementById("simulateBtn");
const userResult = document.getElementById("userResult");

let features = [];

addFeatureBtn.addEventListener("click", () => {
  const name = featureNameInput.value.trim();
  if (!name) {
    alert("Enter feature name");
    return;
  }

  features.push({
    name,
    enabled: false,
    rollout: 0
  });

  featureNameInput.value = "";
  renderFeatures();
});

function renderFeatures() {
  featureList.innerHTML = "";

  features.forEach((feature, index) => {
    const div = document.createElement("div");
    div.className = "feature-item";

    div.innerHTML = `
      <strong>${feature.name}</strong>

      <label>
        <input type="checkbox" ${feature.enabled ? "checked" : ""} />
        Enabled
      </label>

      <label>
        Rollout: ${feature.rollout}%
        <input type="range" min="0" max="100" value="${feature.rollout}" class="range" />
      </label>
    `;

    const checkbox = div.querySelector("input[type=checkbox]");
    const range = div.querySelector("input[type=range]");

    checkbox.addEventListener("change", () => {
      feature.enabled = checkbox.checked;
    });

    range.addEventListener("input", () => {
      feature.rollout = Number(range.value);
      renderFeatures();
    });

    featureList.appendChild(div);
  });
}

simulateBtn.addEventListener("click", () => {
  const userType = userTypeSelect.value;
  const visibleFeatures = [];

  features.forEach(feature => {
    if (!feature.enabled) return;

    if (userType === "beta") {
      visibleFeatures.push(feature.name);
    } else {
      const random = Math.random() * 100;
      if (random <= feature.rollout) {
        visibleFeatures.push(feature.name);
      }
    }
  });

  if (visibleFeatures.length === 0) {
    userResult.textContent = "No features visible for this user ❌";
  } else {
    userResult.textContent =
      "Visible features: " + visibleFeatures.join(", ");
  }
});