/**
 * Terminal Hacker Engine
 * Simulates a File System and CLI Command Parser.
 */

const input = document.getElementById('cmd-input');
const output = document.getElementById('output');
const promptLabel = document.querySelector('.prompt');

// --- Game State ---
let currentPath = '/home/guest';
let inventory = ['sword.sh'];
let hp = 100;
let level = 1;

// Virtual File System
// Directories are objects, Files are strings (content) or objects (enemies)
const fileSystem = {
    '/': {
        'type': 'dir',
        'content': {
            'home': {
                'type': 'dir',
                'content': {
                    'guest': {
                        'type': 'dir',
                        'content': {
                            'notes.txt': 'Welcome to the dungeon. Use "ls" to look around.',
                            'todo.txt': '- Kill the Goblin process\n- Find the root key'
                        }
                    }
                }
            },
            'etc': {
                'type': 'dir',
                'content': {
                    'passwd': 'root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000::/home/guest:/bin/bash'
                }
            },
            'dungeon': {
                'type': 'dir',
                'content': {
                    'level1': {
                        'type': 'dir',
                        'content': {
                            'chest': { 'type': 'item', 'item': 'shield.pkg', 'desc': 'A sturdy firewall shield.' },
                            'goblin_proc': { 
                                'type': 'enemy', 
                                'hp': 50, 
                                'desc': 'A malicious background process. It growls.',
                                'drop': 'key_frag_1.dat'
                            }
                        }
                    },
                    'boss_room': {
                        'type': 'dir',
                        'locked': true,
                        'content': {
                            'dragon_daemon': { 'type': 'enemy', 'hp': 200, 'desc': 'A massive Daemon consuming 99% CPU.' }
                        }
                    }
                }
            }
        }
    }
};

// --- Command Parser ---

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
            printLine(`${currentPath}$ ${cmd}`, 'prompt-history');
            processCommand(cmd);
        }
        input.value = '';
        // Scroll to bottom
        document.querySelector('.screen').scrollTop = document.querySelector('.screen').scrollHeight;
    }
});

function processCommand(raw) {
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const commands = {
        'help': showHelp,
        'ls': listDir,
        'cd': changeDir,
        'cat': readFile,
        'pwd': () => printLine(currentPath),
        'clear': clearScreen,
        'inv': showInventory,
        'status': showStatus,
        './attack': () => attack(args),
        'chmod': () => printLine('Permission denied. You are not root.', 'error') // Flavor text
    };

    if (commands[cmd]) {
        commands[cmd](args);
    } else {
        printLine(`bash: ${cmd}: command not found`, 'error');
    }
}

// --- Logic ---

function showHelp() {
    printLine('Available commands:', 'system');
    printLine('  ls          - List directory content');
    printLine('  cd [dir]    - Change directory');
    printLine('  cat [file]  - Read file');
    printLine('  inv         - Check inventory');
    printLine('  status      - Check HP and Level');
    printLine('  ./attack [target] - Execute attack script');
    printLine('  clear       - Clear screen');
}

function listDir() {
    const dir = resolvePath(currentPath);
    if (dir && dir.type === 'dir') {
        const items = Object.keys(dir.content).map(name => {
            const node = dir.content[name];
            if (node.type === 'dir') return `<span style="color:#3b82f6">${name}/</span>`;
            if (node.type === 'enemy') return `<span style="color:#ef4444">${name}*</span>`;
            if (node.type === 'item') return `<span style="color:#facc15">${name}</span>`;
            return name;
        });
        printLine(items.join('  '));
    } else {
        printLine('Error: Current path is invalid.', 'error');
    }
}

function changeDir(args) {
    if (!args[0]) return;
    let target = args[0];
    
    // Handle '..'
    if (target === '..') {
        if (currentPath === '/') return;
        const parts = currentPath.split('/');
        parts.pop();
        currentPath = parts.join('/') || '/';
        promptLabel.innerText = `guest@dungeon:${currentPath}$`;
        return;
    }

    // Check if child exists
    const currentObj = resolvePath(currentPath);
    if (currentObj.content[target]) {
        if (currentObj.content[target].type === 'dir') {
            if (currentObj.content[target].locked) {
                printLine('Access Denied: Directory is locked.', 'error');
                return;
            }
            currentPath = (currentPath === '/' ? '' : currentPath) + '/' + target;
            promptLabel.innerText = `guest@dungeon:${currentPath}$`;
        } else {
            printLine(`bash: cd: ${target}: Not a directory`, 'error');
        }
    } else {
        printLine(`bash: cd: ${target}: No such file or directory`, 'error');
    }
}

function readFile(args) {
    if (!args[0]) return printLine('Usage: cat [filename]');
    const name = args[0];
    const dir = resolvePath(currentPath);
    const node = dir.content[name];

    if (node) {
        if (typeof node === 'string') printLine(node);
        else if (node.type === 'enemy') printLine(`Binary file (process ${name}) matches`, 'system');
        else if (node.type === 'item') {
            printLine(`Found item: ${node.item}`, 'success');
            printLine(node.desc);
            inventory.push(node.item);
            delete dir.content[name]; // Remove from world
        }
        else printLine(`cat: ${name}: Is a directory`);
    } else {
        printLine(`cat: ${name}: No such file`, 'error');
    }
}

function attack(args) {
    if (!args[0]) return printLine('Usage: ./attack [target_process]');
    const targetName = args[0];
    const dir = resolvePath(currentPath);
    const target = dir.content[targetName];

    if (target && target.type === 'enemy') {
        // Combat Logic
        const dmg = Math.floor(Math.random() * 20) + 10;
        target.hp -= dmg;
        printLine(`Executing attack script on PID ${targetName}...`, 'system');
        printLine(`> Hit for ${dmg} damage. Target HP: ${target.hp}`);

        if (target.hp <= 0) {
            printLine(`Process ${targetName} terminated successfully.`, 'success');
            if (target.drop) {
                printLine(`Dump file created: ${target.drop}`, 'success');
                inventory.push(target.drop);
            }
            delete dir.content[targetName];
        } else {
            // Enemy Retaliation
            const enemyDmg = Math.floor(Math.random() * 15) + 5;
            hp -= enemyDmg;
            printLine(`Warning! Process ${targetName} returned exception: ${enemyDmg} dmg`, 'error');
            if (hp <= 0) {
                printLine('CRITICAL ERROR: SYSTEM CRASH (HP: 0)', 'error');
                printLine('Rebooting...', 'system');
                setTimeout(() => location.reload(), 3000);
            }
        }
    } else {
        printLine(`./attack: target '${targetName}' not found or valid.`, 'error');
    }
}

function showInventory() {
    printLine('Loaded Modules (Inventory):', 'system');
    inventory.forEach(i => printLine(` - ${i}`));
}

function showStatus() {
    printLine(`User: guest [PID: $$]`, 'system');
    printLine(`Integrity (HP): ${hp}%`);
    printLine(`Privilege Level: ${level}`);
}

function clearScreen() {
    output.innerHTML = '';
}

// --- Helpers ---

function resolvePath(path) {
    // Navigate object tree based on path string
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];
    for (let p of parts) {
        if (current.content && current.content[p]) {
            current = current.content[p];
        } else {
            return null;
        }
    }
    return current;
}

function printLine(text, type = '') {
    const div = document.createElement('div');
    div.className = `line ${type}`;
    div.innerHTML = text; // Allow HTML for colors
    output.appendChild(div);
}

// Click anywhere to focus input
document.body.addEventListener('click', () => input.focus());