let bars;
let arr = [];
let isSorting = false;

const arrayContainer = document.getElementById("array");

/* ------------------ ARRAY GENERATION ------------------ */
function generateArray(size = 15) {
  if (isSorting) return;

  arrayContainer.innerHTML = "";
  arr = [];

  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 200) + 20;
    arr.push(value);

    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}px`;
    arrayContainer.appendChild(bar);
  }

  bars = document.querySelectorAll(".bar");
}

/* ------------------ HELPERS ------------------ */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetBars() {
  bars.forEach(bar => {
    bar.classList.remove("active", "pivot", "sorted");
  });
}

function markSorted() {
  bars.forEach(bar => bar.classList.add("sorted"));
}

/* ------------------ BUBBLE SORT ------------------ */
async function bubbleSort() {
  if (isSorting) return;
  isSorting = true;

  resetBars();

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      bars[j].classList.add("active");
      bars[j + 1].classList.add("active");

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        bars[j].style.height = `${arr[j]}px`;
        bars[j + 1].style.height = `${arr[j + 1]}px`;
      }

      await delay(200);
      bars[j].classList.remove("active");
      bars[j + 1].classList.remove("active");
    }
    bars[arr.length - i - 1].classList.add("sorted");
  }

  isSorting = false;
}

/* ------------------ SELECTION SORT ------------------ */
async function selectionSort() {
  if (isSorting) return;
  isSorting = true;

  resetBars();

  for (let i = 0; i < arr.length; i++) {
    let min = i;
    bars[min].classList.add("active");

    for (let j = i + 1; j < arr.length; j++) {
      bars[j].classList.add("active");
      await delay(150);

      if (arr[j] < arr[min]) {
        bars[min].classList.remove("active");
        min = j;
        bars[min].classList.add("active");
      } else {
        bars[j].classList.remove("active");
      }
    }

    [arr[i], arr[min]] = [arr[min], arr[i]];
    bars[i].style.height = `${arr[i]}px`;
    bars[min].style.height = `${arr[min]}px`;

    bars[min].classList.remove("active");
    bars[i].classList.add("sorted");
  }

  isSorting = false;
}

/* ------------------ INSERTION SORT ------------------ */
async function insertionSort() {
  if (isSorting) return;
  isSorting = true;

  resetBars();

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;

    bars[i].classList.add("active");
    await delay(250);

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      bars[j + 1].style.height = `${arr[j]}px`;
      j--;
      await delay(150);
    }

    arr[j + 1] = key;
    bars[j + 1].style.height = `${key}px`;

    bars[i].classList.remove("active");
  }

  markSorted();
  isSorting = false;
}

/* ------------------ QUICK SORT ------------------ */
async function quickSortStart() {
  if (isSorting) return;
  isSorting = true;

  resetBars();
  await quickSort(0, arr.length - 1);
  markSorted();

  isSorting = false;
}

async function quickSort(low, high) {
  if (low < high) {
    let pi = await partition(low, high);
    await quickSort(low, pi - 1);
    await quickSort(pi + 1, high);
  }
}

async function partition(low, high) {
  let pivot = arr[high];
  bars[high].classList.add("pivot");

  let i = low - 1;

  for (let j = low; j < high; j++) {
    bars[j].classList.add("active");
    await delay(150);

    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      bars[i].style.height = `${arr[i]}px`;
      bars[j].style.height = `${arr[j]}px`;
    }

    bars[j].classList.remove("active");
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  bars[i + 1].style.height = `${arr[i + 1]}px`;
  bars[high].style.height = `${arr[high]}px`;

  bars[high].classList.remove("pivot");
  return i + 1;
}

generateArray();
