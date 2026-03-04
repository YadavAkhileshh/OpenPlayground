const locationEl = document.getElementById("location");
const cameraEl = document.getElementById("camera");
const micEl = document.getElementById("microphone");
const noteEl = document.getElementById("note");

async function checkPermissions() {

  if (!navigator.permissions) {
    noteEl.textContent =
      "Permissions API is not supported in this browser.";
    return;
  }

  checkPermission("geolocation", locationEl);
  checkPermission("camera", cameraEl);
  checkPermission("microphone", micEl);
}

async function checkPermission(name, element) {
  try {
    const result = await navigator.permissions.query({ name });

    element.textContent = formatState(result.state);
    element.style.color = getColor(result.state);

    // Listen for future changes
    result.onchange = () => {
      element.textContent = formatState(result.state);
      element.style.color = getColor(result.state);
    };

  } catch (err) {
    element.textContent = "Not supported";
    element.style.color = "#facc15";
  }
}

function formatState(state) {
  if (state === "granted") return "Granted ✅";
  if (state === "denied") return "Denied ❌";
  return "Prompt ⚠️";
}

function getColor(state) {
  if (state === "granted") return "#22c55e";
  if (state === "denied") return "#ef4444";
  return "#facc15";
}
