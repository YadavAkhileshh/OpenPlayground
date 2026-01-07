const container = document.getElementById('visualizer-container');
const algoSelect = document.getElementById('algo-select');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');
const resetBtn = document.getElementById('reset-btn');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');

let array = [];
let isSorting = false;
let abortController = null; // To stop sorting

// --- Config ---
// Delay mapping: 1 (fastest) -> 100 (slowest)
// We'll invert this for the UX: 100 (fastest) -> 1 (slowest)
const getDelay = () => {
    // 100 -> 5ms
    // 1 -> 500ms
    const val = 101 - parseInt(speedSlider.value);
    return val * 5;
};

// --- Sound Effects (Optional - simple Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playNote(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;

    // Very short beep
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
    osc.stop(audioCtx.currentTime + 0.05);
}

// --- Helpers ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkAbort() {
    if (!isSorting) throw new Error('Stopped');
    await sleep(getDelay());
}

function generateArray() {
    if (isSorting) {
        // Can't reset while sorting unless we implement cancel. 
        // For now, let's just force stop.
        isSorting = false;
    }

    const size = parseInt(sizeSlider.value);
    container.innerHTML = '';
    array = [];

    for (let i = 0; i < size; i++) {
        // Random height between 5 and 100
        const value = Math.floor(Math.random() * 95) + 5;
        array.push(value);

        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}%`;
        // Dynamic width based on size
        bar.style.width = `${Math.floor(800 / size)}px`;
        bar.innerText = value; // Show number
        container.appendChild(bar);
    }
    statusText.innerText = `Generated new array of size ${size}`;
}

async function markCompare(idx1, idx2) {
    const bars = document.getElementsByClassName('bar');
    bars[idx1].classList.add('compare');
    bars[idx2].classList.add('compare');

    // Optional: Play sound based on value
    // playNote(200 + array[idx1] * 5); 

    await checkAbort();

    bars[idx1].classList.remove('compare');
    bars[idx2].classList.remove('compare');
}

async function markSwap(idx1, idx2) {
    const bars = document.getElementsByClassName('bar');
    bars[idx1].classList.add('swap');
    bars[idx2].classList.add('swap');

    // Swap heights in DOM
    const tempHeight = bars[idx1].style.height;
    bars[idx1].style.height = bars[idx2].style.height;
    bars[idx2].style.height = tempHeight;

    // Play swap sound
    // playNote(600); 

    await checkAbort();

    bars[idx1].classList.remove('swap');
    bars[idx2].classList.remove('swap');
}

async function markOverwrite(idx, newVal) {
    // For Merge Sort: overwrite a single bar
    const bars = document.getElementsByClassName('bar');
    bars[idx].classList.add('swap');
    bars[idx].style.height = `${newVal}%`;
    await checkAbort();
    bars[idx].classList.remove('swap');
}

async function markSorted() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add('sorted');
        await sleep(10);
    }
    statusText.innerText = `Sorting Complete!`;
    isSorting = false;
    enableControls();
}

function disableControls() {
    startBtn.disabled = true;
    resetBtn.disabled = true;
    sizeSlider.disabled = true;
    algoSelect.disabled = true;
}

function enableControls() {
    startBtn.disabled = false;
    resetBtn.disabled = false;
    sizeSlider.disabled = false;
    algoSelect.disabled = false;
}

// --- Algorithms ---

// 1. Bubble Sort
// O(n^2) - Swaps adjacent elements
async function bubbleSort() {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            await markCompare(j, j + 1);
            if (array[j] > array[j + 1]) {
                await markSwap(j, j + 1);
                // Swap in memory
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }
}

// 2. Selection Sort
// O(n^2) - Finds min, swaps to front
async function selectionSort() {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        let minIdx = i;
        for (let j = i + 1; j < len; j++) {
            await markCompare(minIdx, j);
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            await markSwap(i, minIdx);
            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;
        }
    }
}

// 3. Insertion Sort
// O(n^2) - Builds sorted array one item at a time
async function insertionSort() {
    const len = array.length;
    for (let i = 1; i < len; i++) {
        let key = array[i];
        let j = i - 1;

        // Visual: highlight key
        const bars = document.getElementsByClassName('bar');
        bars[i].style.background = '#f59e0b'; // orange for key

        while (j >= 0 && array[j] > key) {
            await markCompare(j, j + 1); // visually checking

            // Shift
            await markOverwrite(j + 1, array[j]);
            array[j + 1] = array[j];
            j = j - 1;
        }

        // Place key
        array[j + 1] = key;
        await markOverwrite(j + 1, key);

        // Reset color
        bars[i].style.background = '';
    }
}

// 4. Merge Sort
// O(n log n) - Recursive divide and conquer
async function mergeSort(start = 0, end = array.length - 1) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);
    await mergeSort(start, mid);
    await mergeSort(mid + 1, end);
    await merge(start, mid, end);
}

async function merge(start, mid, end) {
    let leftArr = array.slice(start, mid + 1);
    let rightArr = array.slice(mid + 1, end + 1);

    let i = 0, j = 0, k = start;

    while (i < leftArr.length && j < rightArr.length) {
        // Highlight what we are comparing
        // Since we are creating a new array, mapping back to original DOM indices is tricky visually
        // We'll just highlight index k

        const bars = document.getElementsByClassName('bar');
        bars[k].classList.add('compare');
        await checkAbort();

        if (leftArr[i] <= rightArr[j]) {
            array[k] = leftArr[i];
            await markOverwrite(k, array[k]);
            i++;
        } else {
            array[k] = rightArr[j];
            await markOverwrite(k, array[k]);
            j++;
        }
        bars[k].classList.remove('compare');
        k++;
    }

    while (i < leftArr.length) {
        array[k] = leftArr[i];
        await markOverwrite(k, array[k]);
        i++;
        k++;
    }

    while (j < rightArr.length) {
        array[k] = rightArr[j];
        await markOverwrite(k, array[k]);
        j++;
        k++;
    }
}

// 5. Quick Sort
// O(n log n) - Pivot based partitioning
async function quickSort(start = 0, end = array.length - 1) {
    if (start < end) {
        const pivotIdx = await partition(start, end);
        await quickSort(start, pivotIdx - 1);
        await quickSort(pivotIdx + 1, end);
    }
}

async function partition(start, end) {
    const pivotValue = array[end];
    let pivotIndex = start;

    // Highlight pivot
    const bars = document.getElementsByClassName('bar');
    bars[end].style.background = '#f59e0b'; // orange

    for (let i = start; i < end; i++) {
        await markCompare(i, end); // Compare with pivot

        if (array[i] < pivotValue) {
            await markSwap(i, pivotIndex);
            [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
            pivotIndex++;
        }
    }

    await markSwap(pivotIndex, end);
    [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];

    bars[end].style.background = '';
    return pivotIndex;
}

// 6. Heap Sort
// O(n log n) - Binary heap structure
async function heapSort() {
    let n = array.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i);
    }

    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
        await markSwap(0, i);
        [array[0], array[i]] = [array[i], array[0]];

        // Visual tweak: mark i as sorted temporarily or just keep it moving
        // We'll let markSorted() handle final cleanup

        await heapify(i, 0);
    }
}

async function heapify(n, i) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < n) {
        await markCompare(left, largest);
        if (array[left] > array[largest]) largest = left;
    }

    if (right < n) {
        await markCompare(right, largest);
        if (array[right] > array[largest]) largest = right;
    }

    if (largest !== i) {
        await markSwap(i, largest);
        [array[i], array[largest]] = [array[largest], array[i]];

        await heapify(n, largest);
    }
}

// --- Main Listener ---

startBtn.addEventListener('click', async () => {
    isSorting = true;
    disableControls();
    statusText.innerText = `Running ${algoSelect.options[algoSelect.selectedIndex].text}...`;

    const algo = algoSelect.value;

    try {
        if (algo === 'bubble') await bubbleSort();
        else if (algo === 'selection') await selectionSort();
        else if (algo === 'insertion') await insertionSort();
        else if (algo === 'merge') await mergeSort();
        else if (algo === 'quick') await quickSort();
        else if (algo === 'heap') await heapSort();

        await markSorted();
    } catch (e) {
        if (e.message === 'Stopped') {
            statusText.innerText = 'Stopped';
            enableControls();
        } else {
            console.error(e);
        }
    }
});

resetBtn.addEventListener('click', generateArray);

// Update array on size change
sizeSlider.addEventListener('input', generateArray);

// Init
generateArray();
