/**
 * Create missing project.json files for projects without them
 * Run: node scripts/create-missing-jsons.js
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = './projects';

// Category detection
const categoryKeywords = {
    game: ['game', 'puzzle', 'play', 'arcade', 'chess', 'snake', 'invaders', 'dice', 'hangman', 'memory', 'tic-tac', 'maze', 'quest', 'whack', 'simon', 'minesweeper', 'sudoku', 'runner', 'basketball', 'flapping', 'horse', 'space', 'reflex', 'reaction'],
    utility: ['calculator', 'converter', 'generator', 'checker', 'tracker', 'timer', 'clock', 'calendar', 'editor', 'finder', 'tester', 'validator', 'detector', 'uploader', 'preview', 'reader', 'shortener', 'captcha', 'password', 'otp', 'barcode', 'qr', 'unit', 'percentage', 'tip', 'bmi', 'age', 'currency', 'dictionary', 'weather', 'speed', 'internet'],
    productivity: ['todo', 'note', 'planner', 'dashboard', 'tracker', 'kanban', 'diary', 'journal', 'expense', 'habit', 'pomodoro', 'subscription', 'study', 'focus', 'reminder', 'medicine', 'organizer'],
    fun: ['fun', 'joke', 'meme', 'emoji', 'random', 'charade', 'truth', 'dare', 'quote', 'affirmation', 'excuse', 'drum', 'piano', 'color', 'gradient', 'particle', 'bubble', 'balloon', 'coin', 'spinner', 'mood', 'relax'],
    educational: ['quiz', 'learn', 'education', 'periodic', 'visualizer', 'simulation', 'algorithm', 'sorting', 'pathfinding', 'cpu', 'stack', 'queue', 'regex', 'sql', 'network', 'system', 'physics', 'gravity', 'pendulum', 'tower', 'hanoi', 'road', 'safety', 'traffic', 'typing'],
    puzzle: ['puzzle', 'sliding', 'flip', 'scramble', 'twist', 'portal', 'pattern', 'number']
};

const categoryIcons = {
    game: 'ri-gamepad-line',
    utility: 'ri-tools-line',
    productivity: 'ri-task-line',
    fun: 'ri-magic-line',
    educational: 'ri-book-open-line',
    puzzle: 'ri-puzzle-line',
    communication: 'ri-chat-3-line'
};

const categoryStyles = {
    game: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
    utility: 'background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;',
    productivity: 'background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); color: white;',
    fun: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;',
    educational: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;',
    puzzle: 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;',
    communication: 'background: linear-gradient(135deg, #5ee7df 0%, #b490ca 100%); color: white;'
};

function detectCategory(folderName) {
    const name = folderName.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (name.includes(keyword)) return category;
        }
    }
    return 'utility';
}

function formatTitle(folderName) {
    return folderName
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

console.log('🔍 Scanning for projects without project.json...\n');

const folders = fs.readdirSync(PROJECTS_DIR).filter(f => {
    const fullPath = path.join(PROJECTS_DIR, f);
    return fs.statSync(fullPath).isDirectory();
});

let created = 0;
let skipped = 0;

folders.forEach(folder => {
    const folderPath = path.join(PROJECTS_DIR, folder);
    const jsonPath = path.join(folderPath, 'project.json');
    const indexPath = path.join(folderPath, 'index.html');

    // Skip if no index.html
    if (!fs.existsSync(indexPath)) {
        skipped++;
        return;
    }

    // Skip if project.json already exists and is valid
    if (fs.existsSync(jsonPath)) {
        try {
            JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            return; // Valid JSON exists
        } catch {
            // Invalid JSON, recreate it
        }
    }

    const category = detectCategory(folder);
    const projectData = {
        title: formatTitle(folder),
        category: category,
        difficulty: 'Beginner',
        description: `A ${category} project built with HTML, CSS, and JavaScript.`,
        tech: ['HTML', 'CSS', 'JavaScript'],
        icon: categoryIcons[category] || 'ri-code-s-slash-line',
        coverStyle: categoryStyles[category] || categoryStyles.utility
    };

    fs.writeFileSync(jsonPath, JSON.stringify(projectData, null, 2));
    console.log(`✅ Created: ${folder}/project.json`);
    created++;
});

console.log(`\n🎉 Done!`);
console.log(`   Created: ${created} project.json files`);
console.log(`   Skipped: ${skipped} folders (no index.html)`);
