const localBox = document.getElementById("localData");
const sessionBox = document.getElementById("sessionData");

// Load storage data
function loadStorage() {
  displayStorage(localStorage, localBox, "localStorage");
  displayStorage(sessionStorage, sessionBox, "sessionStorage");
}

// Display data
function displayStorage(storage, container, name) {
  container.innerHTML = "";

  if (storage.length === 0) {
    container.innerHTML = `<p class="empty">${name} is empty</p>`;
    return;
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);

    const div = document.createElement("div");
    div.className = "item";
    div.textContent = `${key} : ${value}`;

    container.appendChild(div);
  }
}

// Add demo data
function addSample() {
  localStorage.setItem("username", "Riya");
  localStorage.setItem("theme", "dark");

  sessionStorage.setItem("sessionId", "12345");
  sessionStorage.setItem("loginTime", new Date().toLocaleTimeString());

  loadStorage();
}

// Clear all storage
function clearStorage() {
  if (confirm("Clear all localStorage and sessionStorage?")) {
    localStorage.clear();
    sessionStorage.clear();
    loadStorage();
  }
}

// Auto refresh on storage change
window.addEventListener("storage", loadStorage);

// Load on start
loadStorage();
