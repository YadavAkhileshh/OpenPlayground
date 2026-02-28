/* =========================================================
   Internet Lag Experience Simulator
   ========================================================= */

/* ================= GLOBAL STATE ================= */

const networkModeSelect = document.getElementById("networkMode");
const networkStatus = document.getElementById("networkStatus");

const fetchBtn = document.getElementById("fetchBtn");
const submitBtn = document.getElementById("submitBtn");
const imageBtn = document.getElementById("imageBtn");

const loader = document.getElementById("loader");
const message = document.getElementById("message");
const contentBox = document.getElementById("contentBox");

/* Network profiles */
const networkProfiles = {
  fast: { delay: 300, failure: 0.05 },
  "4g": { delay: 800, failure: 0.1 },
  "3g": { delay: 2000, failure: 0.2 },
  "2g": { delay: 4000, failure: 0.35 },
  offline: { delay: 0, failure: 1 }
};

let currentNetwork = "fast";

/* ================= EVENT LISTENERS ================= */

networkModeSelect.addEventListener("change", changeNetwork);

fetchBtn.addEventListener("click", () =>
  simulateRequest("Fetching data...", "Data loaded successfully.")
);

submitBtn.addEventListener("click", () =>
  simulateRequest("Submitting form...", "Form submitted.")
);

imageBtn.addEventListener("click", () =>
  simulateRequest("Loading image...", "Image loaded.")
);

/* ================= NETWORK HANDLING ================= */

function changeNetwork() {
  currentNetwork = networkModeSelect.value;
  networkStatus.innerText = `Current network: ${currentNetwork.toUpperCase()}`;
}

/* ================= SIMULATION ================= */

function simulateRequest(startMsg, successMsg) {
  resetUI();

  const profile = networkProfiles[currentNetwork];

  if (profile.failure === 1) {
    message.innerText = "❌ You are offline.";
    return;
  }

  showLoader();
  message.innerText = startMsg;

  const delay = profile.delay + Math.random() * 500;

  setTimeout(() => {
    hideLoader();

    if (Math.random() < profile.failure) {
      message.innerText = "⚠️ Request failed due to network issue.";
      showRetry(startMsg, successMsg);
    } else {
      message.innerText = successMsg;
      contentBox.innerText =
        "Lorem ipsum dolor sit amet, slow networks make UX harder.";
    }
  }, delay);
}

/* ================= RETRY ================= */

function showRetry(startMsg, successMsg) {
  const retryBtn = document.createElement("button");
  retryBtn.innerText = "Retry";
  retryBtn.style.marginTop = "10px";

  retryBtn.onclick = () => {
    retryBtn.remove();
    simulateRequest(startMsg, successMsg);
  };

  contentBox.appendChild(retryBtn);
}

/* ================= UI HELPERS ================= */

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function resetUI() {
  message.innerText = "";
  contentBox.innerHTML = "";
}