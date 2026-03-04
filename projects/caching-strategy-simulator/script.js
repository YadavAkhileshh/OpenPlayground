//  STATE 
let cache = null;
let cacheTimestamp = null;

let hits = 0;
let misses = 0;
let networkCalls = 0;

// ELEMENTS 
const strategySelect = document.getElementById("strategy");
const latencyInput = document.getElementById("latency");
const ttlInput = document.getElementById("ttl");

const requestBtn = document.getElementById("requestBtn");
const invalidateBtn = document.getElementById("invalidateBtn");

const cacheView = document.getElementById("cacheView");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const networkCallsEl = document.getElementById("networkCalls");
const logEl = document.getElementById("log");

//  HELPERS 
function log(message) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logEl.prepend(li);
}

function updateMetrics() {
  hitsEl.textContent = hits;
  missesEl.textContent = misses;
  networkCallsEl.textContent = networkCalls;
}

function updateCacheView() {
  if (!cache) {
    cacheView.textContent = "Cache empty";
    return;
  }

  cacheView.textContent = JSON.stringify({
    data: cache,
    cachedAt: cacheTimestamp,
    expiresIn: Math.max(
      0,
      Number(ttlInput.value) -
        Math.floor((Date.now() - cacheTimestamp) / 1000)
    ) + "s"
  }, null, 2);
}

function isCacheValid() {
  if (!cache || !cacheTimestamp) return false;
  const age = (Date.now() - cacheTimestamp) / 1000;
  return age < Number(ttlInput.value);
}

//  NETWORK SIM 
function fakeNetworkRequest() {
  networkCalls++;
  updateMetrics();

  const latency = Number(latencyInput.value);
  log(`🌐 Network request started (${latency}ms)`);

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        value: Math.floor(Math.random() * 1000),
        fetchedAt: new Date().toISOString()
      });
    }, latency);
  });
}

//  STRATEGIES 
async function cacheFirst() {
  if (isCacheValid()) {
    hits++;
    log("✅ Cache hit (Cache-First)");
    updateMetrics();
    return cache;
  }

  misses++;
  log("❌ Cache miss (Cache-First)");
  updateMetrics();

  const data = await fakeNetworkRequest();
  cache = data;
  cacheTimestamp = Date.now();
  updateCacheView();
  return data;
}

async function networkFirst() {
  try {
    const data = await fakeNetworkRequest();
    cache = data;
    cacheTimestamp = Date.now();
    updateCacheView();
    log("✅ Network success (Network-First)");
    return data;
  } catch {
    if (isCacheValid()) {
      hits++;
      log("⚠️ Network failed, serving cache");
      updateMetrics();
      return cache;
    }

    misses++;
    log("❌ Network failed and no cache");
    updateMetrics();
    return null;
  }
}

async function staleWhileRevalidate() {
  if (cache) {
    hits++;
    log("⚡ Serving stale cache immediately");
    updateMetrics();
    revalidateInBackground();
    return cache;
  }

  misses++;
  log("❌ No cache, fetching from network");
  updateMetrics();

  const data = await fakeNetworkRequest();
  cache = data;
  cacheTimestamp = Date.now();
  updateCacheView();
  return data;
}

async function revalidateInBackground() {
  const data = await fakeNetworkRequest();
  cache = data;
  cacheTimestamp = Date.now();
  updateCacheView();
  log("🔄 Cache revalidated in background");
}

// EVENTS 
requestBtn.addEventListener("click", async () => {
  const strategy = strategySelect.value;
  log(`➡️ Request using ${strategy} strategy`);

  let result;

  if (strategy === "cache-first") {
    result = await cacheFirst();
  }

  if (strategy === "network-first") {
    result = await networkFirst();
  }

  if (strategy === "stale-while-revalidate") {
    result = await staleWhileRevalidate();
  }

  log(`📦 Response: ${JSON.stringify(result)}`);
});

invalidateBtn.addEventListener("click", () => {
  cache = null;
  cacheTimestamp = null;
  log("🧹 Cache invalidated manually");
  updateCacheView();
});