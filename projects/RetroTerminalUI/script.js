// Terminal commands and responses
const commands = {
    'help': `
Available commands:

<span class="highlight">help</span>       - Show this help message
<span class="highlight">scan</span>       - Perform network reconnaissance
<span class="highlight">decrypt</span>    - Access encrypted files
<span class="highlight">clear</span>      - Clear terminal screen
<span class="highlight">date</span>       - Show current date and time
<span class="highlight">users</span>      - Show active users
<span class="highlight">reboot</span>     - Reboot the system (simulated)
<span class="highlight">history</span>    - Show command history
<span class="highlight">whoami</span>     - Show current user identity
`,
    'scan': `
Initiating network reconnaissance...

Scanning subnet 192.168.1.0/24...
<span class="success">[+]</span> Found active host: 192.168.1.1 (Router)
<span class="success">[+]</span> Found active host: 192.168.1.15 (File Server)
<span class="success">[+]</span> Found active host: 192.168.1.23 (Workstation)
<span class="success">[+]</span> Found active host: 192.168.1.42 (Security Camera)

Port scanning 192.168.1.15...
<span class="warning">[!]</span> Port 22 (SSH) open
<span class="warning">[!]</span> Port 80 (HTTP) open
<span class="warning">[!]</span> Port 443 (HTTPS) open

Vulnerability assessment...
<span class="error">[!]</span> Potential vulnerability detected: CVE-2023-1234
<span class="success">[+]</span> Scan completed. 4 hosts found.
`,
    'decrypt': `
Accessing encrypted file system...

Decryption key: <span class="highlight">****************</span>
Validating key... <span class="success">[VALID]</span>

Decrypting file: <span class="highlight">project_nexus.tar.gz</span>
Progress: [████████████████████] 100%
<span class="success">[+]</span> Decryption successful!

Files extracted:
- blueprint.pdf
- financial_records.xlsx
- personnel_list.txt
- contingency_plan.md

<span class="warning">[!]</span> WARNING: Files are now accessible. Secure wipe recommended after use.
`,
    'date': `Current date and time: <span class="highlight">${new Date().toLocaleString()}</span>`,
    'users': `
Active users:
- root (pts/0) - 192.168.1.107
- daemon (system) - localhost
- admin (pts/1) - 192.168.1.42
- hacker (pts/2) - (hidden)

Total: 4 users
`,
    'reboot': `
Initiating system reboot...
Stopping services...
<span class="success">[+]</span> Network services stopped
<span class="success">[+]</span> Security module halted
<span class="success">[+]</span> Cryptography engine offline

System will reboot in 5 seconds...
<span class="warning">[!]</span> WARNING: All connections will be terminated.

<span class="error">[!]</span> Connection lost. Attempting to reconnect...
<span class="success">[+]</span> Reconnected successfully. System reboot simulated.
`,
    'history': `
Command history:
1. help
2. scan
3. decrypt
4. date
5. users
6. history
`,
    'whoami': `Current user: <span class="highlight">root</span> (UID: 0) | Access level: <span class="warning">MAXIMUM</span>`
};

// Text to be typed automatically
const autoTypedText = [
    "help",
    "scan",
    "decrypt",
    "whoami",
    "users",
    "date",
    "clear"
];

// DOM elements
const typedTextElement = document.getElementById('typed-text');
const cursorElement = document.getElementById('cursor');
const commandOutputElement = document.getElementById('command-output');
const clockElement = document.getElementById('clock');
const terminalBody = document.querySelector('.terminal-body');

// State variables
let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let isWaiting = false;
let commandHistory = [];
let currentCommand = '';

// Initialize the typing animation
function initTypingAnimation() {
    // Start with a delay to let the user see the initial screen
    setTimeout(() => {
        typeNextCharacter();
    }, 1500);
}

// Type the next character in the sequence
function typeNextCharacter() {
    const currentText = autoTypedText[currentTextIndex];
    
    // If we're deleting
    if (isDeleting) {
        // Remove a character
        typedTextElement.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
    } else {
        // Add a character
        typedTextElement.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
    }
    
    // Determine typing speed
    let typingSpeed = isDeleting ? 50 : 100;
    
    // If at the end of the word, pause before deleting
    if (!isDeleting && currentCharIndex === currentText.length) {
        typingSpeed = 1500; // Pause at the end
        isWaiting = true;
        
        // Execute the command after a pause
        setTimeout(() => {
            executeCommand(currentText);
            isDeleting = true;
            isWaiting = false;
            typeNextCharacter();
        }, 1000);
        return;
    }
    
    // If deletion is complete, move to next word
    if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex++;
        
        // Loop back to the beginning
        if (currentTextIndex === autoTypedText.length) {
            currentTextIndex = 0;
        }
        
        // Add a pause before starting the next word
        typingSpeed = 500;
    }
    
    // Schedule next character
    setTimeout(typeNextCharacter, typingSpeed);
}

// Execute a typed command
function executeCommand(cmd) {
    // Add command to history
    commandHistory.push(cmd);
    
    // Create a new output line for the command
    const commandLine = document.createElement('div');
    commandLine.className = 'line';
    commandLine.innerHTML = `<span class="prompt">hacker@root:~$</span> ${cmd}`;
    commandOutputElement.parentNode.insertBefore(commandLine, commandOutputElement);
    
    // Show command output
    const outputLine = document.createElement('div');
    outputLine.className = 'line';
    
    if (commands[cmd]) {
        outputLine.innerHTML = commands[cmd];
    } else if (cmd === 'clear') {
        // Clear the terminal
        const outputContainer = document.querySelector('.output');
        const inputLine = document.querySelector('.input-line');
        const allLines = outputContainer.querySelectorAll('.line');
        
        // Remove all lines except the input line
        allLines.forEach(line => {
            if (!line.classList.contains('input-line')) {
                line.remove();
            }
        });
        
        // Also clear the command output container
        commandOutputElement.innerHTML = '';
        return;
    } else {
        outputLine.innerHTML = `<span class="error">Command not found: ${cmd}</span>. Type 'help' for available commands.`;
    }
    
    commandOutputElement.appendChild(outputLine);
    
    // Scroll to the bottom of the terminal
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Update the clock in real time
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clockElement.textContent = timeString;
}

// Handle manual typing (for user interaction)
function setupManualTyping() {
    document.addEventListener('keydown', (e) => {
        // Ignore if we're in the middle of auto-typing animation
        if (currentCharIndex > 0 && !isWaiting) return;
        
        // Only process if key is a character, backspace, or enter
        if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
            currentCommand += e.key;
            typedTextElement.textContent = currentCommand;
        } else if (e.key === 'Backspace') {
            currentCommand = currentCommand.slice(0, -1);
            typedTextElement.textContent = currentCommand;
        } else if (e.key === 'Enter') {
            if (currentCommand.trim() !== '') {
                executeCommand(currentCommand.trim());
                currentCommand = '';
                typedTextElement.textContent = '';
            }
        }
    });
}

// Add some matrix-like falling characters effect in the background
function createMatrixEffect() {
    const container = document.querySelector('.container');
    
    // Create 5 columns of falling characters
    for (let i = 0; i < 5; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.position = 'absolute';
        column.style.top = '-100px';
        column.style.left = `${20 + i * 20}%`;
        column.style.color = 'rgba(0, 255, 0, 0.1)';
        column.style.fontSize = '18px';
        column.style.zIndex = '-1';
        column.style.whiteSpace = 'nowrap';
        column.style.overflow = 'hidden';
        column.style.width = '1px';
        
        // Add random characters
        let chars = '01';
        for (let j = 0; j < 30; j++) {
            chars += Math.random() > 0.5 ? '0' : '1';
        }
        
        column.textContent = chars;
        container.appendChild(column);
        
        // Animate the column
        animateMatrixColumn(column);
    }
}

// Animate a single matrix column
function animateMatrixColumn(column) {
    let position = -100;
    const speed = 2 + Math.random() * 3;
    
    function move() {
        position += speed;
        column.style.top = `${position}px`;
        
        // If column has moved off screen, reset it
        if (position > window.innerHeight) {
            position = -500;
            // Change some characters randomly
            let newText = '';
            for (let i = 0; i < column.textContent.length; i++) {
                newText += Math.random() > 0.1 ? column.textContent[i] : (Math.random() > 0.5 ? '0' : '1');
            }
            column.textContent = newText;
        }
        
        requestAnimationFrame(move);
    }
    
    move();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize typing animation
    initTypingAnimation();
    
    // Set up manual typing
    setupManualTyping();
    
    // Update clock every second
    updateClock();
    setInterval(updateClock, 1000);
    
    // Create matrix effect
    createMatrixEffect();
    
    // Add click-to-focus instruction
    const helpText = document.querySelector('.help-text p');
    helpText.innerHTML += ' | <strong>Click on the terminal, then type to override auto-typing</strong>';
    
    // Focus the terminal when clicked
    terminalBody.addEventListener('click', () => {
        // Reset auto-typing if user wants to type manually
        currentCharIndex = 0;
        typedTextElement.textContent = '';
    });
});