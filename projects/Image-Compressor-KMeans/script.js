/**
 * K-Means Image Compressor
 * Implements unsupervised learning to cluster pixels into K centroids.
 */

const fileInput = document.getElementById('file-input');
const canvasOrg = document.getElementById('canvas-original');
const ctxOrg = canvasOrg.getContext('2d');
const canvasRes = document.getElementById('canvas-result');
const ctxRes = canvasRes.getContext('2d');
const kSlider = document.getElementById('k-slider');
const kVal = document.getElementById('k-val');
const btnProcess = document.getElementById('btn-process');
const statusText = document.getElementById('status-text');
const progressFill = document.getElementById('progress-fill');
const paletteGrid = document.getElementById('palette-display');

// --- State ---
let img = new Image();
let K = 8;
let originalData = null; // Uint8ClampedArray
let MAX_ITERATIONS = 10;
let isProcessing = false;

// --- Initialization ---

kSlider.addEventListener('input', (e) => {
    K = parseInt(e.target.value);
    kVal.innerText = K;
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

img.onload = () => {
    // Resize for performance if too large
    const maxDim = 800;
    let w = img.width;
    let h = img.height;
    
    if (w > maxDim || h > maxDim) {
        const ratio = w / h;
        if (w > h) { w = maxDim; h = maxDim / ratio; }
        else { h = maxDim; w = maxDim * ratio; }
    }

    canvasOrg.width = w; canvasOrg.height = h;
    canvasRes.width = w; canvasRes.height = h;

    ctxOrg.drawImage(img, 0, 0, w, h);
    originalData = ctxOrg.getImageData(0, 0, w, h);
    
    statusText.innerText = "Image Loaded. Ready to Quantize.";
    progressFill.style.width = '0%';
};

btnProcess.addEventListener('click', () => {
    if (!originalData || isProcessing) return;
    runKMeans();
});

// --- K-Means Logic ---

async function runKMeans() {
    isProcessing = true;
    btnProcess.disabled = true;
    statusText.innerText = "Initializing Centroids...";
    
    // 1. Prepare Data
    // We flatten pixels to array of [r, g, b]
    // To speed up, we can train on a subset, but let's try full set with small iterations
    const pixels = [];
    const data = originalData.data;
    for (let i = 0; i < data.length; i += 4) {
        pixels.push([data[i], data[i+1], data[i+2]]);
    }

    // 2. Initialize Centroids (Random Pick)
    let centroids = [];
    for (let i = 0; i < K; i++) {
        const idx = Math.floor(Math.random() * pixels.length);
        centroids.push([...pixels[idx]]);
    }

    // 3. Iteration Loop
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        statusText.innerText = `Iteration ${iter + 1}/${MAX_ITERATIONS}...`;
        progressFill.style.width = `${((iter+1)/MAX_ITERATIONS)*80}%`;
        
        // Use setTimeout to allow UI update
        await new Promise(r => setTimeout(r, 10));

        const buckets = Array(K).fill().map(() => ({ r:0, g:0, b:0, count:0 }));

        // Assignment Step
        for (let p of pixels) {
            let minDist = Infinity;
            let bucketIdx = 0;

            // Find nearest centroid
            for (let c = 0; c < K; c++) {
                const cent = centroids[c];
                // Euclidean Distance Squared (faster than sqrt)
                const dist = (p[0]-cent[0])**2 + (p[1]-cent[1])**2 + (p[2]-cent[2])**2;
                if (dist < minDist) {
                    minDist = dist;
                    bucketIdx = c;
                }
            }

            // Add to bucket
            buckets[bucketIdx].r += p[0];
            buckets[bucketIdx].g += p[1];
            buckets[bucketIdx].b += p[2];
            buckets[bucketIdx].count++;
        }

        // Update Step (Recalculate means)
        let diff = 0;
        for (let c = 0; c < K; c++) {
            const b = buckets[c];
            if (b.count > 0) {
                const newR = b.r / b.count;
                const newG = b.g / b.count;
                const newB = b.b / b.count;
                
                // Track convergence (optional optimization)
                diff += Math.abs(centroids[c][0] - newR) + Math.abs(centroids[c][1] - newG);
                
                centroids[c] = [newR, newG, newB];
            } else {
                // Orphaned centroid - reinitialize randomly
                const idx = Math.floor(Math.random() * pixels.length);
                centroids[c] = [...pixels[idx]];
            }
        }
        
        // If converged early
        if (diff < 1) break;
    }

    // 4. Reconstruct Image
    statusText.innerText = "Repainting Image...";
    progressFill.style.width = '90%';
    await new Promise(r => setTimeout(r, 10));
    
    const outputImg = ctxRes.createImageData(originalData.width, originalData.height);
    const outData = outputImg.data;

    for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        let minDist = Infinity;
        let centroidIdx = 0;

        for (let c = 0; c < K; c++) {
            const cent = centroids[c];
            const dist = (p[0]-cent[0])**2 + (p[1]-cent[1])**2 + (p[2]-cent[2])**2;
            if (dist < minDist) {
                minDist = dist;
                centroidIdx = c;
            }
        }

        const finalColor = centroids[centroidIdx];
        const idx = i * 4;
        outData[idx] = finalColor[0];
        outData[idx+1] = finalColor[1];
        outData[idx+2] = finalColor[2];
        outData[idx+3] = 255;
    }

    ctxRes.putImageData(outputImg, 0, 0);
    
    // 5. Update Palette UI
    updatePaletteUI(centroids);

    statusText.innerText = "Compression Complete.";
    progressFill.style.width = '100%';
    btnProcess.disabled = false;
    isProcessing = false;
}

function updatePaletteUI(centroids) {
    paletteGrid.innerHTML = '';
    // Fix grid columns if K is small
    paletteGrid.style.gridTemplateColumns = `repeat(${Math.min(8, K)}, 1fr)`;
    
    centroids.forEach(c => {
        const div = document.createElement('div');
        div.className = 'swatch';
        div.style.backgroundColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        div.title = `RGB(${Math.floor(c[0])}, ${Math.floor(c[1])}, ${Math.floor(c[2])})`;
        paletteGrid.appendChild(div);
    });
}