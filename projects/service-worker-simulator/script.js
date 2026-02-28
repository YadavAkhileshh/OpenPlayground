// STATE 
let swInstalled = false;
let swActivated = false;
let offline = false;

let cache = {};
let cacheVersion = 1;

//  ELEMENTS
const strategySelect = document.getElementById("strategy");
const latencyInput = document.getElementById("latency");

const installBtn = document.getElementById("installBtn");
const activateBtn = document.getElementById("activateBtn");
const fetchBtn = document.getElementById("fetchBtn");
const offlineBtn = document.getElementById("offlineBtn");

const cacheView = document.getElementById("cacheView");
const logEl = document.getElementById("log");

// HELPERS 
function log(message) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logEl.prepend(li);
}

function updateCacheView() {
  cacheView.textContent = JSON.stringify(
    {
      version: cacheVersion,
      entries: cache
    },
    null,
    2
  );
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//  LIFECYCLE 
async function installServiceWorker() {
  if (swInstalled) {
    log("⚠️ Service Worker already installed");
    return;
  }

  log("📥 Installing Service Worker...");
  await wait(800);

  swInstalled = true;
  cache = {};
  cacheVersion++;

  log("✅ Service Worker installed");
  updateCacheView();
}

async function activateServiceWorker() {
  if (!swInstalled) {
    log("❌ Install Service Worker first");
    return;
  }

  if (swActivated) {
    log("⚠️ Service Worker already active");
    return;
  }

  log("🚀 Activating Service Worker...");
  await wait(600);

  swActivated = true;
  cache = {}; // old cache cleanup
  log("🧹 Old caches cleared");
  log("✅ Service Worker activated");
  updateCacheView();
}

//  FETCH SIM 
async function fetchResource() {
  if (!swActivated) {
    log("❌ No active Service Worker");
    return;
  }

  const strategy = strategySelect.value;
  const resource = "/api/data";

  log(`➡️ Fetch event (${strategy})`);

  if (strategy === "cache-first") {
    if (cache[resource]) {
      log("📦 Served from cache");
      return;
    }

    log("🌐 Cache miss");
    await networkFetch(resource);
  }

  if (strategy === "network-first") {
    try {
      await networkFetch(resource);
    } catch {
      if (cache[resource]) {
        log("⚠️ Network failed, using cache");
      } else {
        log("❌ Network failed & no cache");
      }
    }
  }
}

async function networkFetch(resource) {
  if (offline) {
    log("❌ Offline: network unavailable");
    throw new Error("Offline");
  }

  const latency = Number(latencyInput.value);
  log(`🌐 Network request (${latency}ms)`);

  await wait(latency);

  const data = {
    value: Math.floor(Math.random() * 1000),
    fetchedAt: new Date().toISOString()
  };

  cache[resource] = data;
  log("✅ Network response cached");
  updateCacheView();
}

//  EVENTS 
installBtn.addEventListener("click", installServiceWorker);
activateBtn.addEventListener("click", activateServiceWorker);
fetchBtn.addEventListener("click", fetchResource);

offlineBtn.addEventListener("click", () => {
  offline = !offline;
  log(offline ? "📴 Offline mode enabled" : "📶 Online mode enabled");
});