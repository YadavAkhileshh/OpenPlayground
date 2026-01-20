// Command database for interactive terminal
const commandDB = {
    'help': 'Available commands: ls, cd, pwd, mkdir, cat, cp, mv, rm, man, clear, date, whoami, exit',
    
    'ls': 'file1.txt  file2.txt  directory1/  directory2/  README.md',
    
    'ls -l': `-rw-r--r-- 1 user user  1234 Dec 12 10:30 file1.txt
-rwxr-xr-x 1 user user  5678 Dec 12 11:15 script.sh
drwxr-xr-x 2 user user  4096 Dec 10 09:20 directory1/`,
    
    'cd': 'Usage: cd [directory] - Change current directory',
    
    'pwd': '/home/user/linux-guide',
    
    'mkdir': 'Usage: mkdir [directory_name] - Create new directory',
    
    'cat': 'Usage: cat [filename] - Display file contents',
    
    'cp': 'Usage: cp [source] [destination] - Copy files',
    
    'mv': 'Usage: mv [source] [destination] - Move or rename files',
    
    'rm': 'Usage: rm [file] - Remove file (use with caution!)',
    
    'rm -rf': 'WARNING: This will forcibly remove files and directories!',
    
    'man': 'Manual pages: Type "man [command]" for detailed info',
    
    'clear': 'clear',
    
    'date': () => new Date().toLocaleString(),
    
    'whoami': 'user',
    
    'exit': 'Closing terminal...',
    
    'uname': 'Linux linux-guide 5.15.0-76-generic #83-Ubuntu SMP',
    
    'uname -a': 'Linux linux-guide 5.15.0-76-generic #83-Ubuntu SMP x86_64 GNU/Linux',
    
    'df -h': `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   15G   33G  32% /
/dev/sdb1       100G   30G   65G  31% /home`,
    
    'free -h': `              total        used        free      shared  buff/cache   available
Mem:            16G        4.2G        8.1G        1.2G        3.7G         10G
Swap:          2.0G        512M        1.5G`,
    
    'top': `top - 03:14:07 up 14 days,  6:23,  1 user,  load average: 0.12, 0.08, 0.05
Tasks: 256 total,   1 running, 255 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  16041.3 total,   8145.2 free,   4290.1 used,   3606.0 buff/cache`,
    
    'find . -name "*.txt"': `./file1.txt
./file2.txt
./docs/readme.txt`,
    
    'grep -r "hello" .': `./file1.txt:1:hello world
./script.sh:5:# hello there`,
    
    'chmod': 'Usage: chmod [permissions] [file] - Change file permissions',
    
    'ps aux': `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169520 13104 ?        Ss   Dec12   0:12 /sbin/init
user      1234  0.2  1.2 245680 98760 pts/0    Ss   03:10   0:01 bash`,
    
    'ifconfig': `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.107  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)`,
    
    'ping -c 3 google.com': `PING google.com (142.250.185.78) 56(84) bytes of data.
64 bytes from 142.250.185.78: icmp_seq=1 ttl=117 time=15.3 ms
64 bytes from 142.250.185.78: icmp_seq=2 ttl=117 time=16.1 ms
64 bytes from 142.250.185.78: icmp_seq=3 ttl=117 time=14.9 ms

--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms
rtt min/avg/max/mdev = 14.932/15.433/16.122/0.518 ms`
};

// DOM Elements
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const commandSections = document.querySelectorAll('.command-section');
const navLinks = document.querySelectorAll('.command-nav a');
const helpModal = document.getElementById('help-modal');
const liveTime = document.getElementById('live-time');
const sysInfo = {
    hostname: document.getElementById('hostname'),
    kernel: document.getElementById('kernel'),
    uptime: document.getElementById('uptime')
};

// Initialize the application
function initApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up interactive terminal
    setupTerminal();
    
    // Update system info
    updateSystemInfo();
    
    // Update live time
    updateTime();
    setInterval(updateTime, 1000);
    
    // Set up help modal
    setupModal();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

// Set up section navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            commandSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Set up interactive terminal
function setupTerminal() {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            
            if (command) {
                // Add command to output
                addTerminalOutput(`<span class="prompt">user@linux-guide:~$</span> ${command}`);
                
                // Process command
                processCommand(command);
                
                // Clear input
                terminalInput.value = '';
            }
        }
    });
    
    // Focus input on terminal click
    document.querySelector('.interactive-terminal').addEventListener('click', () => {
        terminalInput.focus();
    });
}

// Process terminal commands
function processCommand(command) {
    let response;
    
    // Check if command exists in database
    if (commandDB.hasOwnProperty(command)) {
        const cmdResponse = commandDB[command];
        
        // If response is a function, call it
        if (typeof cmdResponse === 'function') {
            response = cmdResponse();
        } else {
            response = cmdResponse;
        }
    } else if (command.startsWith('man ')) {
        const cmd = command.substring(4);
        response = getManualPage(cmd);
    } else {
        response = `Command not found: ${command}. Type 'help' for available commands.`;
    }
    
    // Handle clear command specially
    if (command === 'clear') {
        terminalOutput.innerHTML = '';
        return;
    }
    
    // Add response to output
    addTerminalOutput(response);
    
    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Add output to terminal
function addTerminalOutput(text) {
    const outputLine = document.createElement('div');
    outputLine.className = 'output-line';
    outputLine.innerHTML = text;
    terminalOutput.appendChild(outputLine);
}

// Get manual page for command
function getManualPage(command) {
    const manuals = {
        'ls': `<span class="highlight">LS(1)</span> - List directory contents
        
SYNOPSIS
    ls [OPTION]... [FILE]...
    
DESCRIPTION
    List information about the FILEs (the current directory by default).
    
OPTIONS
    -l     use a long listing format
    -a     do not ignore entries starting with .
    -h     with -l, print human readable sizes
    
EXAMPLES
    ls -la    Show all files with details
    ls -lh    Show files with human readable sizes`,
        
        'cd': `<span class="highlight">CD(1)</span> - Change directory
        
SYNOPSIS
    cd [DIRECTORY]
    
DESCRIPTION
    Change the current directory to DIRECTORY.
    
EXAMPLES
    cd /home/user   Change to /home/user directory
    cd ..           Move to parent directory
    cd ~            Change to home directory`,
        
        'grep': `<span class="highlight">GREP(1)</span> - Print lines matching a pattern
        
SYNOPSIS
    grep [OPTIONS] PATTERN [FILE...]
    
DESCRIPTION
    grep searches for PATTERN in each FILE.
    
OPTIONS
    -r      search recursively through directories
    -i      ignore case distinctions
    -n      print line numbers
    
EXAMPLES
    grep "error" log.txt    Find errors in log file
    grep -r "TODO" src/     Find all TODOs in source code`
    };
    
    return manuals[command] || `No manual entry for ${command}`;
}

// Update system info display
function updateSystemInfo() {
    // Simulate dynamic system info
    const hostnames = ['localhost', 'linux-guide', 'ubuntu-server', 'debian-box'];
    const kernels = [
        'Linux 5.15.0-76-generic',
        'Linux 6.2.0-26-generic', 
        'Linux 5.4.0-150-generic'
    ];
    
    sysInfo.hostname.textContent = hostnames[Math.floor(Math.random() * hostnames.length)];
    sysInfo.kernel.textContent = kernels[Math.floor(Math.random() * kernels.length)];
    
    // Update uptime periodically
    setInterval(() => {
        const days = Math.floor(Math.random() * 30);
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        sysInfo.uptime.textContent = `${days} days, ${hours}:${minutes.toString().padStart(2, '0')}`;
    }, 30000);
}

// Update live time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    liveTime.textContent = timeString;
}

// Set up help modal
function setupModal() {
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('help-modal');
    
    // Close modal when X is clicked
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // F1 for help
        if (e.key === 'F1') {
            e.preventDefault();
            helpModal.style.display = 'flex';
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            helpModal.style.display = 'none';
        }
        
        // Ctrl+L to clear terminal
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            terminalOutput.innerHTML = '';
        }
        
        // Focus terminal input when Tab is pressed (if not already focused)
        if (e.key === 'Tab' && document.activeElement !== terminalInput) {
            e.preventDefault();
            terminalInput.focus();
        }
    });
}

// Create matrix background effect
function createMatrixBackground() {
    const container = document.querySelector('.container');
    const matrixBg = document.createElement('div');
    matrixBg.className = 'matrix-bg';
    
    // Add multiple columns of falling characters
    for (let i = 0; i < 20; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.position = 'absolute';
        column.style.left = `${i * 5}%`;
        column.style.width = '1px';
        column.style.height = '100%';
        column.style.overflow = 'hidden';
        column.style.fontSize = '14px';
        column.style.color = '#00ff00';
        column.style.opacity = '0.1';
        
        // Fill column with random characters
        let content = '';
        for (let j = 0; j < 100; j++) {
            content += Math.random() > 0.5 ? '0' : '1';
            content += '<br>';
        }
        column.innerHTML = content;
        
        // Animate the column
        animateColumn(column);
        
        matrixBg.appendChild(column);
    }
    
    container.insertBefore(matrixBg, container.firstChild);
}

// Animate a matrix column
function animateColumn(column) {
    let position = 0;
    const speed = 0.5 + Math.random() * 2;
    
    function move() {
        position += speed;
        if (position > 100) position = -100;
        column.style.transform = `translateY(${position}px)`;
        requestAnimationFrame(move);
    }
    
    move();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    createMatrixBackground();
    
    // Add welcome message to terminal
    setTimeout(() => {
        addTerminalOutput('<span class="highlight">Welcome to Linux Command Reference Guide</span>');
        addTerminalOutput('Type <span class="highlight">help</span> to see available commands');
        addTerminalOutput('Type <span class="highlight">man [command]</span> for detailed manual pages');
    }, 500);
});