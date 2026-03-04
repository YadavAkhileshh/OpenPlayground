// Zen Garden Main Controller
let garden;

// DOM Elements
const canvas = document.getElementById("gardenCanvas");
const canvasOverlay = document.getElementById("canvasOverlay");
const toolButtons = document.querySelectorAll(".tool-btn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const harmonyFill = document.getElementById("harmonyFill");
const harmonyValue = document.getElementById("harmonyValue");
const elementCount = document.getElementById("elementCount");
const rockCount = document.getElementById("rockCount");
const plantCount = document.getElementById("plantCount");
const wisdomText = document.getElementById("wisdomText");

// Initialize garden
function init() {
  garden = new ZenGarden(canvas);
  setupEventListeners();
  updateUI();

  // Hide overlay after first interaction
  setTimeout(() => {
    canvasOverlay.classList.add("hidden");
  }, 2000);
}

function setupEventListeners() {
  // Tool selection
  toolButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toolButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      garden.currentTool = btn.dataset.tool;

      // Update wisdom on tool change
      wisdomText.textContent = garden.getRandomWisdom();
    });
  });

  // Clear button
  clearBtn.addEventListener("click", () => {
    if (confirm("Clear your zen garden? This cannot be undone.")) {
      garden.clear();
      updateUI();
      wisdomText.textContent = garden.getRandomWisdom();
    }
  });

  // Save button
  saveBtn.addEventListener("click", () => {
    saveGardenImage();
  });

  // Canvas interactions
  canvas.addEventListener("click", () => {
    setTimeout(updateUI, 10);
  });
}

function updateUI() {
  // Update harmony meter
  const harmony = Math.round(garden.harmony);
  harmonyFill.style.width = harmony + "%";
  harmonyValue.textContent = harmony + "%";

  // Update element counts
  const totalElements = garden.elements.length;
  elementCount.textContent = totalElements;
  rockCount.textContent = garden.counts.rocks;

  const totalPlants =
    garden.counts.plants + garden.counts.trees + garden.counts.flowers;
  plantCount.textContent = totalPlants;

  // Show harmony achievement
  if (harmony >= 80 && !garden.highHarmonyShown) {
    showHarmonyAchievement();
    garden.highHarmonyShown = true;
  }
}

function showHarmonyAchievement() {
  const achievement = document.createElement("div");
  achievement.className = "harmony-achieved";
  achievement.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    color: var(--bamboo-green); font-size: 2rem; font-weight: bold; text-align: center;">
            ☯<br>
            <span style="font-size: 1.2rem;">High Harmony Achieved</span>
        </div>
    `;
  document.body.appendChild(achievement);

  setTimeout(() => achievement.remove(), 2000);
}

function saveGardenImage() {
  // Create a download link for the canvas
  const link = document.createElement("a");
  link.download = "zen-garden-" + Date.now() + ".png";
  link.href = canvas.toDataURL();
  link.click();

  // Show feedback
  showNotification("Garden saved! 📸");
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(74, 124, 89, 0.95);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.2rem;
        z-index: 1000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: fade-in-out 2s ease-in-out forwards;
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 2000);
}

// Add fade animation
const style = document.createElement("style");
style.textContent = `
    @keyframes fade-in-out {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        10%, 90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

// Handle window resize
window.addEventListener("resize", () => {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Scale elements
  const scaleX = canvas.width / oldWidth;
  const scaleY = canvas.height / oldHeight;

  garden.elements.forEach((element) => {
    element.x *= scaleX;
    element.y *= scaleY;
  });

  garden.rakeLines.forEach((line) => {
    line.x *= scaleX;
    line.y *= scaleY;
  });

  garden.render();
});

// Periodic wisdom updates
setInterval(() => {
  if (Math.random() > 0.7) {
    wisdomText.style.opacity = "0";
    setTimeout(() => {
      wisdomText.textContent = garden.getRandomWisdom();
      wisdomText.style.opacity = "1";
    }, 500);
  }
}, 30000);

wisdomText.style.transition = "opacity 0.5s ease";

// Initialize on load
window.addEventListener("load", init);
