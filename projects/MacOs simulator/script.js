/* --- CLOCK FUNCTIONALITY --- */
function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    document.getElementById('clock').innerText = now.toLocaleString('en-US', options).replace(',', '');
}
setInterval(updateClock, 1000);
updateClock();

/* --- WINDOW MANAGEMENT --- */
let zIndexCounter = 100;
const windows = ['finder', 'terminal', 'safari', 'notes'];

function bringToFront(appId) {
    const win = document.getElementById('window-' + appId);
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
}

function openWindow(appId) {
    const win = document.getElementById('window-' + appId);
    const dockIcon = document.getElementById('dock-' + appId);
    
    // Bring to front
    bringToFront(appId);

    win.classList.remove('minimized');
    win.classList.add('open');
    if(dockIcon) dockIcon.classList.add('active');
    
    // Specific focus for terminal
    if (appId === 'terminal') {
        setTimeout(() => document.getElementById('term-input').focus(), 300);
    }
}

function closeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    const dockIcon = document.getElementById('dock-' + appId);
    
    win.classList.remove('open');
    if(dockIcon) dockIcon.classList.remove('active');
}

function minimizeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    win.classList.add('minimized');
    win.classList.remove('open');
}

function maximizeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    if (win.style.width === "100%") {
        // Restore
        win.style.width = "600px";
        win.style.height = "400px";
        win.style.top = "100px";
        win.style.left = "100px";
        win.style.borderRadius = "10px";
    } else {
        // Maximize
        win.style.width = "100%";
        win.style.height = "calc(100vh - 30px)"; // Minus menubar
        win.style.top = "30px";
        win.style.left = "0";
        win.style.borderRadius = "0";
    }
}

/* --- APPLE MENU --- */
function toggleAppleMenu() {
    const menu = document.getElementById('apple-dropdown');
    menu.classList.toggle('show');
}
// Close menu when clicking elsewhere
window.onclick = function(event) {
    if (!event.target.matches('.apple-logo')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

/* --- TERMINAL LOGIC --- */
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('terminal-output');

termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim();
        const historyLine = document.createElement('p');
        historyLine.innerHTML = `user@macbook ~ % ${command}`;
        termOutput.appendChild(historyLine);

        let response = "";
        
        switch(command.toLowerCase()) {
            case 'help':
                response = "Available commands: help, date, clear, ls, whoami";
                break;
            case 'date':
                response = new Date().toString();
                break;
            case 'clear':
                termOutput.innerHTML = "";
                this.value = '';
                return; // Skip appending response
            case 'ls':
                response = "Desktop  Documents  Downloads  Music  Pictures";
                break;
            case 'whoami':
                response = "user";
                break;
            case '':
                response = "";
                break;
            default:
                response = `zsh: command not found: ${command}`;
        }

        if (response) {
            const responseLine = document.createElement('p');
            responseLine.innerText = response;
            responseLine.style.color = '#ccc';
            termOutput.appendChild(responseLine);
        }

        this.value = '';
        // Scroll to bottom
        document.querySelector('.window-content.app-terminal').scrollTop = termOutput.scrollHeight;
    }
});

/* --- DRAGGABLE WINDOWS & ICONS --- */
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // If handle is provided, use it. Otherwise, the element itself is the handle.
    const dragHandle = handle || element;
    dragHandle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        // Bring to front
        if(element.classList.contains('window')) {
            zIndexCounter++;
            element.style.zIndex = zIndexCounter;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Initialize Draggables (Windows)
makeDraggable(document.getElementById("window-finder"), document.getElementById("header-finder"));
makeDraggable(document.getElementById("window-terminal"), document.getElementById("header-terminal"));
makeDraggable(document.getElementById("window-safari"), document.getElementById("header-safari"));
makeDraggable(document.getElementById("window-notes"), document.getElementById("header-notes"));

// Initialize Draggables (Desktop Icons)
document.querySelectorAll('.icon.draggable').forEach(icon => {
    // Icons need absolute positioning for drag to work nicely on grid
    icon.style.position = 'absolute'; 
    makeDraggable(icon);
});