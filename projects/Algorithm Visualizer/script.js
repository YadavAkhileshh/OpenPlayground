// ===== DOM Elements =====
const arrayContainer = document.getElementById("arrayContainer");
const generateArrayBtn = document.getElementById("generateArrayBtn");
const startBtn = document.getElementById("startBtn");
const algorithmSelect = document.getElementById("algorithmSelect");
const arraySizeInput = document.getElementById("arraySize");
const searchValueInput = document.getElementById("searchValue");

let array = [];
let delay = 300;

// Show search input for search algorithms
algorithmSelect.addEventListener("change", () => {
  if (algorithmSelect.value === "linearSearch" || algorithmSelect.value === "binarySearch") {
    searchValueInput.style.display = "inline-block";
  } else {
    searchValueInput.style.display = "none";
  }
});

// ===== Generate Random Array =====
function generateArray() {
  let size = parseInt(arraySizeInput.value) || 20;
  array = [];
  arrayContainer.innerHTML = "";
  for (let i = 0; i < size; i++) {
    let value = Math.floor(Math.random() * 100) + 5;
    array.push(value);
    const bar = document.createElement("div");
    bar.classList.add("array-bar");
    bar.style.height = `${value * 3}px`;
    arrayContainer.appendChild(bar);
  }
}

// ===== Helper Functions =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateArrayBars(highlightIndices = [], swapIndices = []) {
  const bars = document.querySelectorAll(".array-bar");
  bars.forEach((bar, idx) => {
    bar.style.height = `${array[idx] * 3}px`;
    bar.classList.remove("active", "swap");
    if (highlightIndices.includes(idx)) bar.classList.add("active");
    if (swapIndices.includes(idx)) bar.classList.add("swap");
  });
}

// ===== Algorithms =====
async function bubbleSort() {
  let n = array.length;
  for (let i = 0; i < n-1; i++) {
    for (let j = 0; j < n-i-1; j++) {
      updateArrayBars([j, j+1]);
      await sleep(delay);
      if (array[j] > array[j+1]) {
        [array[j], array[j+1]] = [array[j+1], array[j]];
        updateArrayBars([], [j, j+1]);
        await sleep(delay);
      }
    }
  }
  updateArrayBars();
}

async function selectionSort() {
  let n = array.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i+1; j < n; j++) {
      updateArrayBars([minIdx, j]);
      await sleep(delay);
      if (array[j] < array[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      updateArrayBars([], [i, minIdx]);
      await sleep(delay);
    }
  }
  updateArrayBars();
}

async function insertionSort() {
  let n = array.length;
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j+1] = array[j];
      updateArrayBars([j, j+1]);
      await sleep(delay);
      j--;
    }
    array[j+1] = key;
    updateArrayBars([], [j+1]);
    await sleep(delay);
  }
  updateArrayBars();
}

async function linearSearch() {
  let value = parseInt(searchValueInput.value);
  if (isNaN(value)) return alert("Enter a search value!");
  for (let i = 0; i < array.length; i++) {
    updateArrayBars([i]);
    await sleep(delay);
    if (array[i] === value) {
      alert(`Value found at index ${i}`);
      return;
    }
  }
  alert("Value not found!");
}

async function binarySearch() {
  let value = parseInt(searchValueInput.value);
  if (isNaN(value)) return alert("Enter a search value!");
  array.sort((a,b)=>a-b);
  updateArrayBars();
  await sleep(delay);
  let left = 0, right = array.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right)/2);
    updateArrayBars([mid]);
    await sleep(delay);
    if (array[mid] === value) return alert(`Value found at index ${mid}`);
    else if (array[mid] < value) left = mid + 1;
    else right = mid - 1;
  }
  alert("Value not found!");
}

// ===== Event Listeners =====
generateArrayBtn.addEventListener("click", generateArray);
startBtn.addEventListener("click", async () => {
  const algo = algorithmSelect.value;
  switch(algo){
    case "bubbleSort": await bubbleSort(); break;
    case "selectionSort": await selectionSort(); break;
    case "insertionSort": await insertionSort(); break;
    case "linearSearch": await linearSearch(); break;
    case "binarySearch": await binarySearch(); break;
  }
});

// Generate initial array
generateArray();
