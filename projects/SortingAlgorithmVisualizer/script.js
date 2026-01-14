document.addEventListener('DOMContentLoaded', function() {
    // Global state variables
    const state = {
        array: [],
        arraySize: 50,
        sortSpeed: 50,
        isSorting: false,
        isPaused: false,
        selectedAlgorithm: null,
        comparisons: 0,
        swaps: 0,
        speedDelay: 50,
        animationQueue: [],
        currentAnimation: null,
        timeoutIds: []
    };

    // DOM elements
    const arrayVisual = document.getElementById('arrayVisual');
    const arraySizeSlider = document.getElementById('arraySize');
    const arraySizeValue = document.getElementById('arraySizeValue');
    const sortSpeedSlider = document.getElementById('sortSpeed');
    const speedValue = document.getElementById('speedValue');
    const generateArrayBtn = document.getElementById('generateArrayBtn');
    const shuffleArrayBtn = document.getElementById('shuffleArrayBtn');
    const algorithmButtons = document.querySelectorAll('.algorithm-btn');
    const startSortBtn = document.getElementById('startSortBtn');
    const pauseSortBtn = document.getElementById('pauseSortBtn');
    const resetSortBtn = document.getElementById('resetSortBtn');
    const currentAlgoElement = document.getElementById('currentAlgo');
    const timeComplexityElement = document.getElementById('timeComplexity');
    const comparisonCountElement = document.getElementById('comparisonCount');
    const swapCountElement = document.getElementById('swapCount');
    const sortStatusElement = document.getElementById('sortStatus');

    // Algorithm information
    const algorithmInfo = {
        bubble: {
            name: "Bubble Sort",
            timeComplexity: "O(n²)",
            description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."
        },
        selection: {
            name: "Selection Sort",
            timeComplexity: "O(n²)",
            description: "Repeatedly finds the minimum element from unsorted part and puts it at the beginning."
        },
        insertion: {
            name: "Insertion Sort",
            timeComplexity: "O(n²)",
            description: "Builds the final sorted array one item at a time by comparisons."
        },
        merge: {
            name: "Merge Sort",
            timeComplexity: "O(n log n)",
            description: "Divides the array into halves, recursively sorts them, and then merges the sorted halves."
        },
        quick: {
            name: "Quick Sort",
            timeComplexity: "O(n log n)",
            description: "Picks an element as pivot and partitions the array around the pivot."
        },
        heap: {
            name: "Heap Sort",
            timeComplexity: "O(n log n)",
            description: "Builds a max heap from the array and repeatedly extracts the maximum element."
        }
    };

    // Initialize the application
    init();

    // Event listeners
    arraySizeSlider.addEventListener('input', updateArraySize);
    sortSpeedSlider.addEventListener('input', updateSortSpeed);
    generateArrayBtn.addEventListener('click', generateNewArray);
    shuffleArrayBtn.addEventListener('click', shuffleArray);
    startSortBtn.addEventListener('click', startSorting);
    pauseSortBtn.addEventListener('click', togglePause);
    resetSortBtn.addEventListener('click', resetVisualization);

    algorithmButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (state.isSorting) return;
            selectAlgorithm(this.dataset.algo);
        });
    });

    // Initialize the application
    function init() {
        updateArraySize();
        updateSortSpeed();
        generateNewArray();
    }

    // Generate a new random array
    function generateNewArray() {
        if (state.isSorting) return;
        
        state.array = [];
        const min = 10;
        const max = 350;
        
        for (let i = 0; i < state.arraySize; i++) {
            state.array.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        renderArray();
        resetCounters();
        updateStatus('Idle', 'status-idle');
    }

    // Shuffle the current array
    function shuffleArray() {
        if (state.isSorting) return;
        
        for (let i = state.array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
        }
        
        renderArray();
        resetCounters();
        updateStatus('Idle', 'status-idle');
    }

    // Update array size based on slider
    function updateArraySize() {
        if (state.isSorting) return;
        
        state.arraySize = parseInt(arraySizeSlider.value);
        arraySizeValue.textContent = state.arraySize;
        generateNewArray();
    }

    // Update sorting speed based on slider
    function updateSortSpeed() {
        state.sortSpeed = parseInt(sortSpeedSlider.value);
        
        // Map speed value to delay (1-100 maps to 100ms to 1ms)
        state.speedDelay = Math.max(1, Math.floor(101 - state.sortSpeed));
        
        // Update speed label
        let speedText = 'Fast';
        if (state.sortSpeed <= 33) speedText = 'Slow';
        else if (state.sortSpeed <= 66) speedText = 'Medium';
        
        speedValue.textContent = speedText;
    }

    // Select a sorting algorithm
    function selectAlgorithm(algo) {
        if (state.isSorting) return;
        
        // Remove active class from all buttons
        algorithmButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        const selectedBtn = document.querySelector(`.algorithm-btn[data-algo="${algo}"]`);
        selectedBtn.classList.add('active');
        
        // Update state and UI
        state.selectedAlgorithm = algo;
        currentAlgoElement.textContent = algorithmInfo[algo].name;
        timeComplexityElement.textContent = algorithmInfo[algo].timeComplexity;
        
        // Enable start button
        startSortBtn.disabled = false;
        startSortBtn.classList.remove('disabled');
    }

    // Start the sorting visualization
    function startSorting() {
        if (state.isSorting || !state.selectedAlgorithm) return;
        
        state.isSorting = true;
        state.isPaused = false;
        state.animationQueue = [];
        
        // Update UI
        startSortBtn.disabled = true;
        startSortBtn.classList.add('disabled');
        pauseSortBtn.disabled = false;
        pauseSortBtn.classList.remove('disabled');
        updateStatus('Sorting...', 'status-sorting');
        
        // Reset counters
        state.comparisons = 0;
        state.swaps = 0;
        updateCounters();
        
        // Generate animations based on selected algorithm
        generateAnimations();
        
        // Start playing animations
        playNextAnimation();
    }

    // Generate animations for the selected algorithm
    function generateAnimations() {
        // Create a copy of the array for sorting
        const arrayCopy = [...state.array];
        
        switch(state.selectedAlgorithm) {
            case 'bubble':
                generateBubbleSortAnimations(arrayCopy);
                break;
            case 'selection':
                generateSelectionSortAnimations(arrayCopy);
                break;
            case 'insertion':
                generateInsertionSortAnimations(arrayCopy);
                break;
            case 'merge':
                generateMergeSortAnimations(arrayCopy);
                break;
            case 'quick':
                generateQuickSortAnimations(arrayCopy);
                break;
            case 'heap':
                generateHeapSortAnimations(arrayCopy);
                break;
        }
    }

    // Bubble Sort animation generator
    function generateBubbleSortAnimations(arr) {
        const n = arr.length;
        const animations = [];
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Compare
                animations.push({ type: 'compare', indices: [j, j + 1] });
                state.comparisons++;
                
                if (arr[j] > arr[j + 1]) {
                    // Swap
                    animations.push({ type: 'swap', indices: [j, j + 1] });
                    state.swaps++;
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
                
                // Reset comparison
                animations.push({ type: 'reset', indices: [j, j + 1] });
            }
            // Mark as sorted
            animations.push({ type: 'sorted', index: n - i - 1 });
        }
        // Mark first element as sorted
        animations.push({ type: 'sorted', index: 0 });
        
        state.animationQueue = animations;
    }

    // Selection Sort animation generator
    function generateSelectionSortAnimations(arr) {
        const n = arr.length;
        const animations = [];
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            // Mark current minimum
            animations.push({ type: 'pivot', index: minIdx });
            
            for (let j = i + 1; j < n; j++) {
                // Compare
                animations.push({ type: 'compare', indices: [minIdx, j] });
                state.comparisons++;
                
                if (arr[j] < arr[minIdx]) {
                    // Reset old minimum
                    animations.push({ type: 'reset', indices: [minIdx] });
                    minIdx = j;
                    // Mark new minimum
                    animations.push({ type: 'pivot', index: minIdx });
                } else {
                    // Reset comparison
                    animations.push({ type: 'reset', indices: [j] });
                }
            }
            
            // Swap if needed
            if (minIdx !== i) {
                animations.push({ type: 'swap', indices: [i, minIdx] });
                state.swaps++;
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            }
            
            // Mark as sorted
            animations.push({ type: 'sorted', index: i });
            animations.push({ type: 'reset', indices: [minIdx] });
        }
        // Mark last element as sorted
        animations.push({ type: 'sorted', index: n - 1 });
        
        state.animationQueue = animations;
    }

    // Insertion Sort animation generator
    function generateInsertionSortAnimations(arr) {
        const n = arr.length;
        const animations = [];
        
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            
            // Mark current element
            animations.push({ type: 'pivot', index: i });
            
            while (j >= 0 && arr[j] > key) {
                // Compare
                animations.push({ type: 'compare', indices: [j, j + 1] });
                state.comparisons++;
                
                // Shift element
                animations.push({ type: 'swap', indices: [j, j + 1] });
                state.swaps++;
                arr[j + 1] = arr[j];
                
                // Reset comparison
                animations.push({ type: 'reset', indices: [j, j + 1] });
                
                j--;
            }
            
            // Place key at correct position
            arr[j + 1] = key;
            animations.push({ type: 'sorted', index: j + 1 });
            animations.push({ type: 'reset', indices: [i] });
        }
        
        // Mark all as sorted at the end
        for (let i = 0; i < n; i++) {
            animations.push({ type: 'sorted', index: i });
        }
        
        state.animationQueue = animations;
    }

    // Merge Sort animation generator (simplified for visualization)
    function generateMergeSortAnimations(arr) {
        const animations = [];
        const arrCopy = [...arr];
        
        function mergeSort(start, end) {
            if (start >= end) return;
            
            const mid = Math.floor((start + end) / 2);
            mergeSort(start, mid);
            mergeSort(mid + 1, end);
            merge(start, mid, end);
        }
        
        function merge(start, mid, end) {
            const temp = [];
            let i = start, j = mid + 1;
            
            while (i <= mid && j <= end) {
                // Compare
                animations.push({ type: 'compare', indices: [i, j] });
                state.comparisons++;
                
                if (arrCopy[i] <= arrCopy[j]) {
                    temp.push(arrCopy[i]);
                    i++;
                } else {
                    temp.push(arrCopy[j]);
                    j++;
                }
                
                animations.push({ type: 'reset', indices: [i - 1, j - 1] });
            }
            
            while (i <= mid) {
                temp.push(arrCopy[i]);
                i++;
            }
            
            while (j <= end) {
                temp.push(arrCopy[j]);
                j++;
            }
            
            // Copy back to original array with animations
            for (let k = start; k <= end; k++) {
                arrCopy[k] = temp[k - start];
                animations.push({ type: 'swap', indices: [k], value: arrCopy[k] });
                state.swaps++;
                
                if (k === end) {
                    animations.push({ type: 'sorted', index: k });
                }
            }
        }
        
        mergeSort(0, arrCopy.length - 1);
        
        // Mark all as sorted at the end
        for (let i = 0; i < arrCopy.length; i++) {
            animations.push({ type: 'sorted', index: i });
        }
        
        // Update original array
        state.array = arrCopy;
        state.animationQueue = animations;
    }

    // Quick Sort animation generator
    function generateQuickSortAnimations(arr) {
        const animations = [];
        const arrCopy = [...arr];
        
        function quickSort(start, end) {
            if (start >= end) return;
            
            const pivotIndex = partition(start, end);
            quickSort(start, pivotIndex - 1);
            quickSort(pivotIndex + 1, end);
        }
        
        function partition(start, end) {
            const pivot = arrCopy[end];
            let i = start - 1;
            
            // Mark pivot
            animations.push({ type: 'pivot', index: end });
            
            for (let j = start; j < end; j++) {
                // Compare with pivot
                animations.push({ type: 'compare', indices: [j, end] });
                state.comparisons++;
                
                if (arrCopy[j] < pivot) {
                    i++;
                    
                    if (i !== j) {
                        // Swap
                        animations.push({ type: 'swap', indices: [i, j] });
                        state.swaps++;
                        [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
                    }
                }
                
                animations.push({ type: 'reset', indices: [j] });
            }
            
            // Place pivot in correct position
            if (i + 1 !== end) {
                animations.push({ type: 'swap', indices: [i + 1, end] });
                state.swaps++;
                [arrCopy[i + 1], arrCopy[end]] = [arrCopy[end], arrCopy[i + 1]];
            }
            
            // Mark pivot position as sorted
            animations.push({ type: 'sorted', index: i + 1 });
            animations.push({ type: 'reset', indices: [end] });
            
            return i + 1;
        }
        
        quickSort(0, arrCopy.length - 1);
        
        // Mark all as sorted at the end
        for (let i = 0; i < arrCopy.length; i++) {
            animations.push({ type: 'sorted', index: i });
        }
        
        // Update original array
        state.array = arrCopy;
        state.animationQueue = animations;
    }

    // Heap Sort animation generator
    function generateHeapSortAnimations(arr) {
        const animations = [];
        const arrCopy = [...arr];
        const n = arrCopy.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            // Move current root to end
            animations.push({ type: 'swap', indices: [0, i] });
            state.swaps++;
            [arrCopy[0], arrCopy[i]] = [arrCopy[i], arrCopy[0]];
            
            // Mark as sorted
            animations.push({ type: 'sorted', index: i });
            
            // Heapify reduced heap
            heapify(i, 0);
        }
        
        // Mark first element as sorted
        animations.push({ type: 'sorted', index: 0 });
        
        function heapify(n, i) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            
            // Compare with left child
            if (left < n) {
                animations.push({ type: 'compare', indices: [largest, left] });
                state.comparisons++;
                
                if (arrCopy[left] > arrCopy[largest]) {
                    largest = left;
                }
                
                animations.push({ type: 'reset', indices: [left] });
            }
            
            // Compare with right child
            if (right < n) {
                animations.push({ type: 'compare', indices: [largest, right] });
                state.comparisons++;
                
                if (arrCopy[right] > arrCopy[largest]) {
                    largest = right;
                }
                
                animations.push({ type: 'reset', indices: [right] });
            }
            
            // If largest is not root
            if (largest !== i) {
                animations.push({ type: 'swap', indices: [i, largest] });
                state.swaps++;
                [arrCopy[i], arrCopy[largest]] = [arrCopy[largest], arrCopy[i]];
                
                // Recursively heapify affected sub-tree
                heapify(n, largest);
            }
        }
        
        // Update original array
        state.array = arrCopy;
        state.animationQueue = animations;
    }

    // Play next animation in the queue
    function playNextAnimation() {
        if (state.isPaused || !state.isSorting) return;
        
        if (state.animationQueue.length === 0) {
            finishSorting();
            return;
        }
        
        const animation = state.animationQueue.shift();
        state.currentAnimation = animation;
        
        // Apply the animation
        applyAnimation(animation);
        
        // Update counters if needed
        updateCounters();
        
        // Schedule next animation
        const timeoutId = setTimeout(() => {
            playNextAnimation();
        }, state.speedDelay);
        
        state.timeoutIds.push(timeoutId);
    }

    // Apply a single animation to the visualization
    function applyAnimation(animation) {
        const bars = document.querySelectorAll('.array-bar');
        
        switch(animation.type) {
            case 'compare':
                animation.indices.forEach(idx => {
                    bars[idx].classList.add('comparing');
                });
                break;
                
            case 'swap':
                if (animation.value !== undefined) {
                    // For merge sort - update value
                    const idx = animation.indices[0];
                    bars[idx].style.height = `${animation.value}px`;
                    bars[idx].classList.add('swapping');
                    
                    // Update array value
                    state.array[idx] = animation.value;
                    
                    // Remove swapping class after animation
                    setTimeout(() => {
                        bars[idx].classList.remove('swapping');
                    }, state.speedDelay / 2);
                } else {
                    // Normal swap - swap heights
                    const [i, j] = animation.indices;
                    const tempHeight = bars[i].style.height;
                    bars[i].style.height = bars[j].style.height;
                    bars[j].style.height = tempHeight;
                    
                    // Add swapping class
                    bars[i].classList.add('swapping');
                    bars[j].classList.add('swapping');
                    
                    // Update array values
                    [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
                    
                    // Remove swapping class after animation
                    setTimeout(() => {
                        bars[i].classList.remove('swapping');
                        bars[j].classList.remove('swapping');
                    }, state.speedDelay / 2);
                }
                break;
                
            case 'pivot':
                animation.indices.forEach(idx => {
                    bars[idx].classList.add('pivot');
                });
                break;
                
            case 'sorted':
                bars[animation.index].classList.add('sorted');
                break;
                
            case 'reset':
                animation.indices.forEach(idx => {
                    bars[idx].className = 'array-bar';
                });
                break;
        }
    }

    // Toggle pause/resume
    function togglePause() {
        if (!state.isSorting) return;
        
        state.isPaused = !state.isPaused;
        
        if (state.isPaused) {
            // Pause all timeouts
            state.timeoutIds.forEach(id => clearTimeout(id));
            state.timeoutIds = [];
            updateStatus('Paused', 'status-paused');
            pauseSortBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            // Resume
            updateStatus('Sorting...', 'status-sorting');
            pauseSortBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playNextAnimation();
        }
    }

    // Finish sorting
    function finishSorting() {
        state.isSorting = false;
        state.isPaused = false;
        
        // Update UI
        startSortBtn.disabled = true;
        startSortBtn.classList.add('disabled');
        pauseSortBtn.disabled = true;
        pauseSortBtn.classList.add('disabled');
        pauseSortBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        updateStatus('Completed!', 'status-completed');
        
        // Mark all bars as sorted
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => {
            bar.className = 'array-bar sorted';
        });
    }

    // Reset the visualization
    function resetVisualization() {
        // Clear all timeouts
        state.timeoutIds.forEach(id => clearTimeout(id));
        state.timeoutIds = [];
        
        // Reset state
        state.isSorting = false;
        state.isPaused = false;
        state.animationQueue = [];
        state.currentAnimation = null;
        
        // Reset UI
        startSortBtn.disabled = false;
        startSortBtn.classList.remove('disabled');
        pauseSortBtn.disabled = true;
        pauseSortBtn.classList.add('disabled');
        pauseSortBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Reset array visualization
        renderArray();
        resetCounters();
        updateStatus('Idle', 'status-idle');
    }

    // Render the array as bars
    function renderArray() {
        arrayVisual.innerHTML = '';
        
        const maxHeight = 350;
        const maxArrayValue = Math.max(...state.array);
        
        state.array.forEach(value => {
            const barHeight = (value / maxArrayValue) * maxHeight;
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${barHeight}px`;
            // Use flex-grow to let bars fill the space evenly
            bar.style.flex = '1';
            arrayVisual.appendChild(bar);
        });
    }

    // Reset counters
    function resetCounters() {
        state.comparisons = 0;
        state.swaps = 0;
        updateCounters();
    }

    // Update counters display
    function updateCounters() {
        comparisonCountElement.textContent = state.comparisons;
        swapCountElement.textContent = state.swaps;
    }

    // Update status display
    function updateStatus(text, className) {
        sortStatusElement.textContent = text;
        sortStatusElement.className = className;
    }
});