const toggle = document.getElementById("toggleFeature");
const saveBtn = document.getElementById("saveBtn");
const username = document.getElementById("username");
const statusText = document.getElementById("statusText");

// Load saved data
chrome.storage.sync.get(["enabled", "user"], (data) => {
  toggle.checked = data.enabled || false;
  username.value = data.user || "";
});

// Toggle feature
toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
  statusText.textContent =
    "Status: Feature " + (toggle.checked ? "Enabled" : "Disabled");
});

// Save username
saveBtn.addEventListener("click", () => {
  chrome.storage.sync.set({ user: username.value });
  statusText.textContent = "Status: Username Saved!";
});