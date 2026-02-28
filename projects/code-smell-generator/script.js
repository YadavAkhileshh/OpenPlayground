/* =========================================================
   Code Smell Generator & Refactor Viewer
   ========================================================= */

const generateBtn = document.getElementById("generateBtn");
const toggleBtn = document.getElementById("toggleBtn");
const smellTypeSelect = document.getElementById("smellType");

const codeBlock = document.getElementById("codeBlock");
const codeTitle = document.getElementById("codeTitle");

const smellName = document.getElementById("smellName");
const complexityEl = document.getElementById("complexity");
const reasonList = document.getElementById("reasonList");

let showingRefactored = false;
let currentSmell = null;

/* ================= EVENT LISTENERS ================= */

generateBtn.addEventListener("click", generateCode);
toggleBtn.addEventListener("click", toggleCode);

/* ================= DATA ================= */

const smells = {
  "long-function": {
    name: "Long Function",
    complexity: 9,
    reasons: [
      "Hard to read and maintain",
      "Does too many things",
      "Difficult to test"
    ],
    smelly: `
function processOrder(order) {
  let total = 0;
  for (let i = 0; i < order.items.length; i++) {
    total += order.items[i].price;
  }
  if (order.discount) {
    total -= total * 0.1;
  }
  if (order.tax) {
    total += total * 0.18;
  }
  console.log("Total:", total);
}
    `,
    clean: `
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function applyDiscount(total) {
  return total * 0.9;
}

function applyTax(total) {
  return total * 1.18;
}

function processOrder(order) {
  let total = calculateTotal(order.items);
  if (order.discount) total = applyDiscount(total);
  if (order.tax) total = applyTax(total);
  console.log("Total:", total);
}
    `
  },

  "global-state": {
    name: "Global State Abuse",
    complexity: 8,
    reasons: [
      "Hidden dependencies",
      "Hard to debug",
      "Causes unexpected side effects"
    ],
    smelly: `
let count = 0;

function increment() {
  count++;
}

function print() {
  console.log(count);
}
    `,
    clean: `
function createCounter() {
  let count = 0;
  return {
    increment() {
      count++;
    },
    print() {
      console.log(count);
    }
  };
}

const counter = createCounter();
    `
  },

  "nested-conditions": {
    name: "Deep Nesting",
    complexity: 10,
    reasons: [
      "Reduces readability",
      "Hard to follow logic",
      "Increases cognitive load"
    ],
    smelly: `
function checkAccess(user) {
  if (user) {
    if (user.active) {
      if (user.role === "admin") {
        return true;
      }
    }
  }
  return false;
}
    `,
    clean: `
function checkAccess(user) {
  if (!user) return false;
  if (!user.active) return false;
  return user.role === "admin";
}
    `
  },

  "duplicate-code": {
    name: "Duplicate Code",
    complexity: 7,
    reasons: [
      "Harder to maintain",
      "Bug fixes must be repeated",
      "Violates DRY principle"
    ],
    smelly: `
function logSuccess() {
  console.log("Success!");
}

function logFailure() {
  console.log("Failure!");
}
    `,
    clean: `
function logMessage(message) {
  console.log(message);
}

logMessage("Success!");
logMessage("Failure!");
    `
  }
};

/* ================= FUNCTIONS ================= */

function generateCode() {
  const type = smellTypeSelect.value;
  currentSmell = smells[type];
  showingRefactored = false;

  renderSmelly();
}

function toggleCode() {
  if (!currentSmell) return;
  showingRefactored = !showingRefactored;
  showingRefactored ? renderClean() : renderSmelly();
}

function renderSmelly() {
  codeBlock.innerText = currentSmell.smelly.trim();
  codeTitle.innerText = "Smelly Code";
  smellName.innerText = currentSmell.name;
  complexityEl.innerText = currentSmell.complexity;
  renderReasons();
}

function renderClean() {
  codeBlock.innerText = currentSmell.clean.trim();
  codeTitle.innerText = "Refactored Code";
}

function renderReasons() {
  reasonList.innerHTML = "";
  currentSmell.reasons.forEach(reason => {
    const li = document.createElement("li");
    li.innerText = reason;
    reasonList.appendChild(li);
  });
}