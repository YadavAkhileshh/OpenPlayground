/* =========================================================
   UI State Explosion Simulator
   ========================================================= */

/* ================= STATE ================= */

const state = {
  loading: false,
  success: false,
  error: false,
  disabled: false,
  empty: false
};

/* ================= DOM ================= */

const checkboxes = {
  loading: document.getElementById("loading"),
  success: document.getElementById("success"),
  error: document.getElementById("error"),
  disabled: document.getElementById("disabled"),
  empty: document.getElementById("empty")
};

const stateOutput = document.getElementById("stateOutput");
const validationMessage = document.getElementById("validationMessage");

/* ================= INIT ================= */

Object.keys(checkboxes).forEach(key => {
  checkboxes[key].addEventListener("change", () => {
    state[key] = checkboxes[key].checked;
    updateUI();
  });
});

/* ================= UI ================= */

function updateUI() {
  stateOutput.innerText = JSON.stringify(state, null, 2);
  validateState();
}

/* ================= VALIDATION ================= */

function validateState() {
  const issues = [];

  if (state.loading && state.success) {
    issues.push("Cannot be loading and success at the same time.");
  }

  if (state.loading && state.error) {
    issues.push("Cannot be loading and error at the same time.");
  }

  if (state.success && state.error) {
    issues.push("Success and error are mutually exclusive.");
  }

  if (state.empty && state.success) {
    issues.push("Empty state cannot be successful.");
  }

  if (state.disabled && state.loading) {
    issues.push("Disabled UI should not load.");
  }

  if (issues.length === 0) {
    validationMessage.innerText = "✅ State is valid.";
    validationMessage.style.color = "#86efac";
  } else {
    validationMessage.innerText = "❌ Invalid state:\n" + issues.join("\n");
    validationMessage.style.color = "#fb7185";
  }
}

/* ================= RESET ================= */

updateUI();