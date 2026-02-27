const container = document.getElementById("arrayContainer");
const resultText = document.getElementById("resultText");
const speedSlider = document.getElementById("speed");

let arr = [];
const SIZE = 25;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Generate sorted array
function generateArray() {
  arr = [];
  container.innerHTML = "";

  for (let i = 0; i < SIZE; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }

  arr.sort((a, b) => a - b);

  arr.forEach(v => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (v * 2 + 20) + "px";
    bar.textContent = v;
    container.appendChild(bar);
  });

  resultText.textContent = "";
}

function getBars() {
  return document.querySelectorAll(".bar");
}

// ---------- LINEAR SEARCH ----------
async function linearSearch() {
  const target = Number(document.getElementById("target").value);
  const bars = getBars();

  for (let i = 0; i < arr.length; i++) {
    bars[i].classList.add("active");
    await sleep(210 - speedSlider.value);

    if (arr[i] === target) {
      bars[i].classList.remove("active");
      bars[i].classList.add("found");
      resultText.textContent = `Found at index ${i}`;
      return;
    }

    bars[i].classList.remove("active");
  }

  resultText.textContent = "Not Found";
}

// ---------- BINARY SEARCH ----------
async function binarySearch() {
  const target = Number(document.getElementById("target").value);
  const bars = getBars();

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    bars[mid].classList.add("active");
    await sleep(210 - speedSlider.value);

    if (arr[mid] === target) {
      bars[mid].classList.remove("active");
      bars[mid].classList.add("found");
      resultText.textContent = `Found at index ${mid}`;
      return;
    }

    if (arr[mid] < target) {
      for (let i = left; i <= mid; i++) {
        bars[i].classList.add("discarded");
      }
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) {
        bars[i].classList.add("discarded");
      }
      right = mid - 1;
    }

    bars[mid].classList.remove("active");
  }

  resultText.textContent = "Not Found";
}

// Events
document.getElementById("newArray").onclick = generateArray;
document.getElementById("linearBtn").onclick = linearSearch;
document.getElementById("binaryBtn").onclick = binarySearch;

// Init
generateArray();