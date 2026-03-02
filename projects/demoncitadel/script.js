// --- Game State ---
let inventory = [];
let state = {
    deskSearched: false,
    rugMoved: false,
    safeUnlocked: false,
    posterRevealed: false
};

const SECRET_CODE = "7319";
let currentInput = "";

// --- DOM Elements ---
const msgText = document.getElementById('messageText');
const invList = document.getElementById('inventoryList');

const objDoor = document.getElementById('obj-door');
const objPoster = document.getElementById('obj-poster');
const objSafe = document.getElementById('obj-safe');
const objDesk = document.getElementById('obj-desk');
const objRug = document.getElementById('obj-rug');
const posterClue = document.getElementById('poster-clue');

const keypadModal = document.getElementById('keypadModal');
const keypadDisplay = document.getElementById('keypadDisplay');
const winScreen = document.getElementById('winScreen');

// --- Helper Functions ---
function showMessage(text) {
    msgText.innerText = text;
}

function addToInventory(item) {
    if (!inventory.includes(item)) {
        inventory.push(item);
        updateInventoryUI();
    }
}

function hasItem(item) {
    return inventory.includes(item);
}

function updateInventoryUI() {
    invList.innerHTML = '';
    if (inventory.length === 0) {
        invList.innerHTML = '<li class="empty-inv">Empty</li>';
        return;
    }
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        invList.appendChild(li);
    });
}

// --- Interactions ---

objDesk.addEventListener('click', () => {
    if (!state.deskSearched) {
        showMessage("You search the desk drawers... You found a [UV Flashlight]!");
        addToInventory("UV Flashlight");
        state.deskSearched = true;
    } else {
        showMessage("Just empty drawers and some old paper clips.");
    }
});

objRug.addEventListener('click', () => {
    if (!state.rugMoved) {
        showMessage("You lift the heavy rug... There is a [Small Rusty Key] hidden underneath!");
        addToInventory("Small Rusty Key");
        state.rugMoved = true;
        objRug.style.transform = "scaleY(0.5) translateX(30px)"; // Visually move it
    } else {
        showMessage("Just a dusty floor under here.");
    }
});

objPoster.addEventListener('click', () => {
    if (state.posterRevealed) {
        showMessage("The glowing numbers read: 7 3 _ _");
    } else if (hasItem("UV Flashlight")) {
        showMessage("You shine the UV Flashlight on the blank poster. Hidden ink begins to glow!");
        posterClue.classList.remove('hidden');
        state.posterRevealed = true;
    } else {
        showMessage("It's a completely blank poster. It looks oddly suspicious.");
    }
});

objSafe.addEventListener('click', () => {
    if (state.safeUnlocked) {
        showMessage("The safe is already open. The numbers inside say: _ _ 1 9");
    } else if (hasItem("Small Rusty Key")) {
        showMessage("You insert the Rusty Key. The safe clicks open! Inside is a note: _ _ 1 9");
        state.safeUnlocked = true;
        objSafe.style.background = "#222"; // Visually open it
        objSafe.innerText = "OPEN SAFE";
    } else {
        showMessage("A heavy steel safe. It requires a physical key.");
    }
});

objDoor.addEventListener('click', () => {
    showMessage("The main door is sealed shut by an electronic keypad.");
    currentInput = "";
    updateKeypadDisplay();
    keypadModal.classList.remove('hidden');
});

// --- Keypad Logic ---

document.getElementById('closeKeypad').addEventListener('click', () => {
    keypadModal.classList.add('hidden');
});

document.querySelectorAll('.kp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const val = e.target.innerText;
        
        if (val === 'C') {
            currentInput = "";
        } else if (val === 'E') {
            checkCode();
        } else {
            if (currentInput.length < 4) {
                currentInput += val;
            }
        }
        updateKeypadDisplay();
    });
});

function updateKeypadDisplay() {
    let displayStr = currentInput.padEnd(4, '-');
    keypadDisplay.innerText = displayStr;
}

function checkCode() {
    if (currentInput === SECRET_CODE) {
        keypadModal.classList.add('hidden');
        winScreen.classList.remove('hidden');
    } else {
        keypadDisplay.innerText = "ERR";
        keypadDisplay.style.color = "red";
        setTimeout(() => {
            currentInput = "";
            updateKeypadDisplay();
            keypadDisplay.style.color = "#ff003c";
        }, 1000);
    }
}

document.getElementById('btnRestart').addEventListener('click', () => {
    // Reset Game
    inventory = [];
    state = { deskSearched: false, rugMoved: false, safeUnlocked: false, posterRevealed: false };
    updateInventoryUI();
    winScreen.classList.add('hidden');
    posterClue.classList.add('hidden');
    objRug.style.transform = "scaleY(0.5)";
    objSafe.style.background = "#444";
    objSafe.innerText = "LOCKED SAFE";
    showMessage("You wake up in a locked room. Again.");
});