const container = document.getElementById("arrayContainer");
const speedSlider = document.getElementById("speed");

let arr = [];
const SIZE = 35;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate array
function generateArray() {
  arr = [];
  container.innerHTML = "";

  for (let i = 0; i < SIZE; i++) {
    const val = Math.floor(Math.random() * 250) + 20;
    arr.push(val);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = val + "px";
    container.appendChild(bar);
  }
}

// Update bars
function updateBars() {
  const bars = document.querySelectorAll(".bar");
  bars.forEach((bar, i) => {
    bar.style.height = arr[i] + "px";
  });
}

// ---------- Bubble Sort ----------
async function bubbleSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {

      bars[j].style.background = "#f59e0b";
      bars[j+1].style.background = "#f59e0b";

      await sleep(210 - speedSlider.value);

      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        updateBars();
      }

      bars[j].style.background = "#38bdf8";
      bars[j+1].style.background = "#38bdf8";
    }
    bars[arr.length-i-1].style.background = "#22c55e";
  }
}

// ---------- Selection Sort ----------
async function selectionSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < arr.length; i++) {
    let min = i;
    bars[min].style.background = "#ef4444";

    for (let j = i+1; j < arr.length; j++) {
      bars[j].style.background = "#f59e0b";
      await sleep(210 - speedSlider.value);

      if (arr[j] < arr[min]) {
        bars[min].style.background = "#38bdf8";
        min = j;
        bars[min].style.background = "#ef4444";
      } else {
        bars[j].style.background = "#38bdf8";
      }
    }

    [arr[i], arr[min]] = [arr[min], arr[i]];
    updateBars();

    bars[min].style.background = "#38bdf8";
    bars[i].style.background = "#22c55e";
  }
}

// ---------- Insertion Sort ----------
async function insertionSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;

    bars[i].style.background = "#ef4444";
    await sleep(210 - speedSlider.value);

    while (j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      j--;
      updateBars();
      await sleep(210 - speedSlider.value);
    }

    arr[j+1] = key;
    updateBars();

    for (let k = 0; k <= i; k++) {
      bars[k].style.background = "#22c55e";
    }
  }
}

// Events
document.getElementById("newArray").onclick = generateArray;
document.getElementById("bubble").onclick = bubbleSort;
document.getElementById("selection").onclick = selectionSort;
document.getElementById("insertion").onclick = insertionSort;

// Init
generateArray();