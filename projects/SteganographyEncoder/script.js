// --- DOM Elements ---
const encodeDropZone = document.getElementById('encode-drop-zone');
const encodeFile = document.getElementById('encode-file');
const encodePreview = document.getElementById('encode-preview');
const encodePreviewContainer = document.getElementById('encode-preview-container');
const encodeFileInfo = document.getElementById('encode-file-info');
const secretText = document.getElementById('secret-text');
const encodePassword = document.getElementById('encode-password');
const btnEncode = document.getElementById('btn-encode');
const capacityUsage = document.getElementById('capacity-usage');

const decodeDropZone = document.getElementById('decode-drop-zone');
const decodeFile = document.getElementById('decode-file');
const decodePreview = document.getElementById('decode-preview');
const decodePreviewContainer = document.getElementById('decode-preview-container');
const decodePassword = document.getElementById('decode-password');
const btnDecode = document.getElementById('btn-decode');
const decodedOutput = document.getElementById('decoded-output');
const btnCopy = document.getElementById('btn-copy');

const compareSection = document.getElementById('compare-section');
const compareContainer = document.getElementById('compare-container');
const compareOverlay = document.getElementById('compare-overlay-div');
const compareHandle = document.getElementById('compare-handle');

const themeCheckbox = document.getElementById('checkbox');
const canvas = document.getElementById('stego-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// --- State ---
let encodeImageLoaded = false;
let decodeImageLoaded = false;

// --- Theme Toggler ---
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') themeCheckbox.checked = true;
}

themeCheckbox.addEventListener('change', function(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// --- Tab Switching ---
window.switchTab = function(tabName) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabName}-section`).classList.add('active');
    const buttons = document.querySelectorAll('.tab-btn');
    if(tabName === 'encode') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// --- Drag & Drop Setup ---
function setupDragDrop(zone, input) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    zone.addEventListener('dragover', () => zone.classList.add('dragover'));
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        zone.classList.remove('dragover');
        if(e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}
setupDragDrop(encodeDropZone, encodeFile);
setupDragDrop(decodeDropZone, decodeFile);

// --- Image Loading ---
encodeFile.addEventListener('change', handleImageUpload);
decodeFile.addEventListener('change', handleImageUpload);

function handleImageUpload(e) {
    const file = e.target.files[0];
    const isEncode = e.target.id === 'encode-file';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            if (isEncode) {
                encodePreview.src = event.target.result;
                encodePreviewContainer.classList.remove('hidden');
                encodeFileInfo.textContent = `${file.name} (${img.width}x${img.height}px)`;
                // Setup Compare Originals
                document.getElementById('compare-original').src = event.target.result;
                encodeImageLoaded = true;
                updateCapacity();
                compareSection.classList.add('hidden'); // Hide compare until new generation
            } else {
                decodePreview.src = event.target.result;
                decodePreviewContainer.classList.remove('hidden');
                decodeImageLoaded = true;
                decodedOutput.innerHTML = '<span class="placeholder-text">Image loaded. Click Decrypt.</span>';
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// --- Capacity Calculation ---
secretText.addEventListener('input', updateCapacity);
encodePassword.addEventListener('input', updateCapacity);

function updateCapacity() {
    if (!encodeImageLoaded) return;
    const img = encodePreview;
    const totalPixels = img.width * img.height;
    // 3 channels * 1 bit per channel = 3 bits per pixel
    const totalBitsAvailable = totalPixels * 3; 

    // Calculate Payload Size
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(secretText.value);
    
    // Header Overhead: 32 bits (Length) + 96 bits (IV) = 128 bits (16 bytes)
    // Encryption Tag (Auth): 128 bits (16 bytes) added by AES-GCM usually
    // We estimate roughly: Text Length + 16 (IV) + 16 (Tag) + 4 (Length Header)
    const estimatedByteLength = textBytes.length + 36; 
    const totalBitsNeeded = estimatedByteLength * 8;

    const percentage = (totalBitsNeeded / totalBitsAvailable) * 100;
    capacityUsage.textContent = percentage.toFixed(2) + '%';
    
    if (percentage > 100) {
        capacityUsage.style.color = 'var(--danger)';
        btnEncode.disabled = true;
        btnEncode.textContent = "Message too long";
    } else {
        capacityUsage.style.color = 'var(--text-muted)';
        btnEncode.disabled = false;
        btnEncode.textContent = "Encrypt & Download Image";
    }
}

// --- CRYPTO FUNCTIONS (AES-GCM) ---

async function generateKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// --- ENCODE LOGIC ---
btnEncode.addEventListener('click', async () => {
    if (!encodeImageLoaded) return;
    const text = secretText.value;
    if (!text) { alert("Please enter a message."); return; }

    btnEncode.disabled = true;
    btnEncode.textContent = "Processing...";

    // 1. Prepare Data
    const encoder = new TextEncoder();
    let dataBytes = encoder.encode(text);
    const password = encodePassword.value;
    let finalBytes;

    if (password) {
        // Encrypt Mode
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await generateKey(password, salt);
        
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv }, key, dataBytes
        );
        
        // Structure: [Salt (16)] + [IV (12)] + [Encrypted Data]
        const encryptedBytes = new Uint8Array(encryptedContent);
        finalBytes = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
        finalBytes.set(salt, 0);
        finalBytes.set(iv, 16);
        finalBytes.set(encryptedBytes, 28);
    } else {
        // Plain Text Mode (Still binary)
        // Mark with specific empty IV/Salt equivalent or just raw? 
        // To keep logic simple: We treat NO password as "Raw bytes".
        // But to distinguish in Decoder, we'll append a flag byte? 
        // Let's stick to: If password field is empty, just encode text.
        // But decoder needs to know. 
        // Better: We ALWAYS use a protocol: [Flag(1)] + [Data]
        // Flag 0 = Plain, Flag 1 = Encrypted.
        
        const flag = new Uint8Array([0]); // 0 = Plain
        finalBytes = new Uint8Array(flag.length + dataBytes.length);
        finalBytes.set(flag, 0);
        finalBytes.set(dataBytes, 1);
        
        if (password) {
            // Re-do for encryption with Flag 1
            const flag = new Uint8Array([1]); // 1 = Encrypted
            // ... (Crypto logic from above)
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const key = await generateKey(password, salt);
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv }, key, dataBytes
            );
            const encryptedBytes = new Uint8Array(encryptedContent);
            finalBytes = new Uint8Array(1 + 16 + 12 + encryptedBytes.length);
            finalBytes.set(flag, 0);
            finalBytes.set(salt, 1);
            finalBytes.set(iv, 17);
            finalBytes.set(encryptedBytes, 29);
        }
    }

    // 2. Add Length Header (32 bits)
    const lengthVal = finalBytes.length;
    const lengthBin = lengthVal.toString(2).padStart(32, '0');

    // 3. Convert Data to Binary String
    let bitStream = lengthBin;
    for (let b of finalBytes) {
        bitStream += b.toString(2).padStart(8, '0');
    }

    // 4. Embed in Image
    const img = encodePreview;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let dataIndex = 0;
    for (let i = 0; i < bitStream.length; i++) {
        if ((dataIndex + 1) % 4 === 0) dataIndex++; // Skip Alpha
        if (dataIndex >= pixels.length) break;

        const bit = parseInt(bitStream[i]);
        pixels[dataIndex] = (pixels[dataIndex] & 0xFE) | bit;
        dataIndex++;
    }

    ctx.putImageData(imageData, 0, 0);

    // 5. Download & UI Update
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'secure_image.png';
    link.href = dataUrl;
    link.click();

    // Show Compare
    document.getElementById('compare-encoded').src = dataUrl;
    compareSection.classList.remove('hidden');
    
    btnEncode.textContent = "Encrypt & Download Image";
    btnEncode.disabled = false;
});

// --- DECODE LOGIC ---
btnDecode.addEventListener('click', async () => {
    if (!decodeImageLoaded) return;
    
    decodedOutput.innerHTML = '<span class="placeholder-text">Processing...</span>';
    const pwd = decodePassword.value;

    const img = decodePreview;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // 1. Extract Length (First 32 bits)
    let lengthBin = "";
    let idx = 0;
    while(lengthBin.length < 32) {
        if((idx+1)%4===0) idx++;
        lengthBin += (pixels[idx] & 1).toString();
        idx++;
    }
    const dataLen = parseInt(lengthBin, 2);

    if (dataLen <= 0 || dataLen > pixels.length) {
        decodedOutput.textContent = "Error: No data found or file corrupted.";
        decodedOutput.style.color = "var(--danger)";
        return;
    }

    // 2. Extract Data Bits
    let dataBin = "";
    const totalBits = dataLen * 8;
    while(dataBin.length < totalBits) {
        if((idx+1)%4===0) idx++;
        dataBin += (pixels[idx] & 1).toString();
        idx++;
    }

    // 3. Binary to Bytes
    const extractedBytes = new Uint8Array(dataLen);
    for (let i = 0; i < dataLen; i++) {
        extractedBytes[i] = parseInt(dataBin.substr(i*8, 8), 2);
    }

    // 4. Parse Flag
    const flag = extractedBytes[0];
    const payload = extractedBytes.slice(1);
    
    try {
        let resultText = "";
        const decoder = new TextDecoder();

        if (flag === 0) {
            // Plaintext
            resultText = decoder.decode(payload);
        } else if (flag === 1) {
            // Encrypted
            if (!pwd) throw new Error("Password required.");
            
            const salt = payload.slice(0, 16);
            const iv = payload.slice(16, 28);
            const ciphertext = payload.slice(28);
            
            const key = await generateKey(pwd, salt);
            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv }, key, ciphertext
            );
            resultText = decoder.decode(decryptedContent);
        } else {
            throw new Error("Unknown data format.");
        }

        // Display
        decodedOutput.textContent = resultText;
        decodedOutput.style.color = "var(--text-main)";
        btnCopy.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        decodedOutput.textContent = "Decryption Failed. Wrong password or corrupted data.";
        decodedOutput.style.color = "var(--danger)";
        btnCopy.classList.add('hidden');
    }
});

// --- UTILS ---
btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(decodedOutput.textContent);
    const originalText = btnCopy.textContent;
    btnCopy.textContent = "Copied!";
    setTimeout(() => btnCopy.textContent = originalText, 2000);
});

// Comparison Slider Logic
compareContainer.addEventListener('mousemove', (e) => {
    const rect = compareContainer.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    
    compareOverlay.style.width = x + 'px';
    compareHandle.style.left = x + 'px';
});