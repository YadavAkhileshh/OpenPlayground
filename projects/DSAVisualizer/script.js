const container = document.getElementById("arrayContainer");
const newArrayBtn = document.getElementById("newArray");
const bubbleBtn = document.getElementById("bubbleSort");
const speedSlider = document.getElementById("speed");

let arr = [];
const SIZE = 30;

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Bubble Sort Visualization
async function bubbleSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {

      bars[j].style.background = "#f59e0b";
      bars[j + 1].style.background = "#f59e0b";

      await sleep(210 - speedSlider.value);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        bars[j].style.height = arr[j] + "px";
        bars[j + 1].style.height = arr[j + 1] + "px";
      }

      bars[j].style.background = "#38bdf8";
      bars[j + 1].style.background = "#38bdf8";
    }

    bars[arr.length - i - 1].style.background = "#22c55e";
  }
}

// Events
newArrayBtn.onclick = generateArray;
bubbleBtn.onclick = bubbleSort;

// Init
generateArray();