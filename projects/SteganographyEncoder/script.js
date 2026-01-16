// --- DOM Elements ---
const encodeDropZone = document.getElementById('encode-drop-zone');
const encodeFile = document.getElementById('encode-file');
const encodePreview = document.getElementById('encode-preview');
const encodePreviewContainer = document.getElementById('encode-preview-container');
const encodeFileInfo = document.getElementById('encode-file-info');
const secretText = document.getElementById('secret-text');
const btnEncode = document.getElementById('btn-encode');
const capacityUsage = document.getElementById('capacity-usage');

const decodeDropZone = document.getElementById('decode-drop-zone');
const decodeFile = document.getElementById('decode-file');
const decodePreview = document.getElementById('decode-preview');
const decodePreviewContainer = document.getElementById('decode-preview-container');
const btnDecode = document.getElementById('btn-decode');
const decodedOutput = document.getElementById('decoded-output');

const canvas = document.getElementById('stego-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// --- State ---
let encodeImageLoaded = false;
let decodeImageLoaded = false;

// --- Tab Switching ---
function switchTab(tabName) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tabName}-section`).classList.add('active');
    // Find button containing text and set active
    const buttons = document.querySelectorAll('.tab-btn');
    if(tabName === 'encode') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// --- Drag and Drop Utilities ---
function setupDragDrop(zone, input) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
    });

    zone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        input.files = files;
        input.dispatchEvent(new Event('change'));
    });
}

setupDragDrop(encodeDropZone, encodeFile);
setupDragDrop(decodeDropZone, decodeFile);

// --- Image Handling ---

// Encode Image Preview
encodeFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                encodePreview.src = event.target.result;
                encodePreviewContainer.classList.remove('hidden');
                encodeFileInfo.textContent = `${file.name} (${img.width}x${img.height}px)`;
                encodeImageLoaded = true;
                updateCapacity();
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Decode Image Preview
decodeFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            decodePreview.src = event.target.result;
            decodePreviewContainer.classList.remove('hidden');
            decodeImageLoaded = true;
            decodedOutput.innerHTML = '<span class="placeholder-text">Click "Reveal Message" to decode...</span>';
        }
        reader.readAsDataURL(file);
    }
});

// Calculate Capacity
secretText.addEventListener('input', updateCapacity);

function updateCapacity() {
    if (!encodeImageLoaded) return;
    
    // Total pixels * 3 channels (RGB) available for storage
    // We use R, G, B channels. Alpha is risky due to browser compositing.
    const img = encodePreview;
    const totalBitsAvailable = (img.width * img.height) * 3;
    
    // Calculate message bits
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(secretText.value);
    // +4 bytes for length prefix (32 bits) to tell decoder how long the message is
    const totalMessageBits = (messageBytes.length + 4) * 8; 

    const percentage = (totalMessageBits / totalBitsAvailable) * 100;
    capacityUsage.textContent = percentage.toFixed(2) + '%';
    
    if (percentage > 100) {
        capacityUsage.style.color = 'var(--danger)';
        btnEncode.disabled = true;
        btnEncode.textContent = "Message too long for image";
    } else {
        capacityUsage.style.color = 'var(--text-muted)';
        btnEncode.disabled = false;
        btnEncode.textContent = "Encode & Download Image";
    }
}

// --- CORE STEGANOGRAPHY LOGIC ---

// Helper: Convert integer to binary string padded to 8 bits
function byteToBin(byte) {
    return byte.toString(2).padStart(8, '0');
}

// Helper: Convert binary string to integer
function binToByte(bin) {
    return parseInt(bin, 2);
}

// 1. ENCODE FUNCTION
btnEncode.addEventListener('click', () => {
    if (!encodeImageLoaded || !secretText.value) {
        alert("Please upload an image and enter text.");
        return;
    }

    const img = encodePreview;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // The pixel array [r,g,b,a, r,g,b,a...]

    // Prepare Message
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(secretText.value);
    
    // We will prepend the 32-bit length of the message so we know when to stop decoding
    const lengthVal = messageBytes.length;
    const lengthBin = lengthVal.toString(2).padStart(32, '0'); // 32 bits for length

    // Convert message bytes to binary string
    let messageBin = "";
    for (let byte of messageBytes) {
        messageBin += byte.toString(2).padStart(8, '0');
    }

    const totalBin = lengthBin + messageBin;
    
    // Embed Bits
    let dataIndex = 0;
    for (let i = 0; i < totalBin.length; i++) {
        // Skip Alpha channel (every 4th byte: 0, 1, 2, [3], 4...)
        if ((dataIndex + 1) % 4 === 0) {
            dataIndex++;
        }

        // Get current byte value
        let val = data[dataIndex];
        
        // Clear LSB (val & 254) and add our bit
        let bit = parseInt(totalBin[i]);
        data[dataIndex] = (val & 0xFE) | bit;

        dataIndex++;
    }

    // Put modified data back
    ctx.putImageData(imageData, 0, 0);

    // Download
    const downloadLink = document.createElement('a');
    downloadLink.download = 'encoded_image.png';
    downloadLink.href = canvas.toDataURL('image/png'); // MUST be PNG
    downloadLink.click();
});

// 2. DECODE FUNCTION
btnDecode.addEventListener('click', () => {
    if (!decodeImageLoaded) {
        alert("Please upload an image to decode.");
        return;
    }

    const img = decodePreview;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let binaryString = "";
    let dataIndex = 0;

    // 1. Read first 32 bits to get message length
    let lengthBin = "";
    while (lengthBin.length < 32) {
        if ((dataIndex + 1) % 4 === 0) dataIndex++; // Skip Alpha
        
        // Get LSB
        lengthBin += (data[dataIndex] & 1).toString();
        dataIndex++;
    }

    const messageLength = parseInt(lengthBin, 2);
    
    if (messageLength <= 0 || messageLength > (data.length * 3)) {
        decodedOutput.textContent = "No valid hidden message found or file corrupted.";
        decodedOutput.style.color = "var(--danger)";
        return;
    }

    // 2. Read the actual message bits
    const totalMessageBits = messageLength * 8;
    let messageBin = "";
    
    while (messageBin.length < totalMessageBits) {
        if ((dataIndex + 1) % 4 === 0) dataIndex++; // Skip Alpha
        
        messageBin += (data[dataIndex] & 1).toString();
        dataIndex++;
    }

    // 3. Convert Binary to Bytes
    const bytes = new Uint8Array(messageLength);
    for (let i = 0; i < messageLength; i++) {
        const byteBin = messageBin.substr(i * 8, 8);
        bytes[i] = parseInt(byteBin, 2);
    }

    // 4. Decode Text
    const decoder = new TextDecoder();
    const decodedText = decoder.decode(bytes);

    // Sanitize output for HTML display
    const safeText = decodedText.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });

    decodedOutput.innerHTML = safeText;
    decodedOutput.style.color = "var(--text-main)";
});