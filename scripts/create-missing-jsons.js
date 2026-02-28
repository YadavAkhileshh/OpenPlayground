const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = './projects';

// Category detection
const categoryKeywords = {
    puzzle: ['puzzle', 'sliding', 'flip', 'scramble', 'twist', 'portal', 'pattern', 'number', 'match-3', 'sudoku', 'minesweeper', '2048'],
    game: ['game', 'play', 'arcade', 'chess', 'snake', 'invaders', 'dice', 'hangman', 'memory', 'tic-tac', 'maze', 'quest', 'whack', 'simon', 'runner', 'basketball', 'flapping', 'horse', 'space', 'reflex', 'reaction', 'breakout', 'shooter', 'platformer', 'jump', 'bird', 'ball', 'physics-world', 'tower-defense', 'fight', 'racing', 'poker', 'clicker'],
    communication: ['chat', 'message', 'messenger', 'forum', 'mail', 'email', 'social', 'community', 'connect', 'talk', 'video-call', 'voice', 'connect-four'],
    productivity: ['todo', 'note', 'planner', 'dashboard', 'tracker', 'kanban', 'diary', 'journal', 'expense', 'habit', 'pomodoro', 'subscription', 'study', 'focus', 'reminder', 'medicine', 'organizer', 'resume', 'cv', 'editor', 'spreadsheet', 'markdown'],
    educational: ['quiz', 'learn', 'education', 'periodic', 'visualizer', 'simulation', 'algorithm', 'sorting', 'pathfinding', 'cpu', 'stack', 'queue', 'regex', 'sql', 'network', 'system', 'physics', 'gravity', 'pendulum', 'tower', 'hanoi', 'road', 'safety', 'traffic', 'typing', 'cheat-sheet', 'tutorial'],
    fun: ['fun', 'joke', 'meme', 'emoji', 'random', 'charade', 'truth', 'dare', 'quote', 'affirmation', 'excuse', 'drum', 'piano', 'color', 'gradient', 'particle', 'bubble', 'balloon', 'coin', 'spinner', 'mood', 'relax', 'paint', 'draw', 'drawing', 'canvas-art', 'etch', 'sketch'],
    utility: ['calculator', 'converter', 'generator', 'checker', 'tracker', 'timer', 'clock', 'calendar', 'finder', 'tester', 'validator', 'detector', 'uploader', 'preview', 'reader', 'shortener', 'captcha', 'password', 'otp', 'barcode', 'qr', 'unit', 'percentage', 'tip', 'bmi', 'age', 'currency', 'dictionary', 'weather', 'speed', 'internet', 'translator', 'ip-address', 'password-manager']
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

/**
 * Find index.html recursively within a folder
 */
function findIndexHtml(dir) {
    const files = fs.readdirSync(dir);
    if (files.includes('index.html')) return 'index.html';

    const commonDirs = ['public', 'frontend', 'dist', 'src'];
    for (const d of commonDirs) {
        const subPath = path.join(dir, d);
        if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
            if (fs.existsSync(path.join(subPath, 'index.html'))) {
                return path.join(d, 'index.html');
            }
        }
    }
    return null;
}

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

console.log('🔍 Scanning projects...\n');

const folders = fs.readdirSync(PROJECTS_DIR).filter(f => {
    const fullPath = path.join(PROJECTS_DIR, f);
    return fs.statSync(fullPath).isDirectory();
});

let created = 0;
let updated = 0;
let skipped = 0;

folders.forEach(folder => {
    const folderPath = path.join(PROJECTS_DIR, folder);
    const jsonPath = path.join(folderPath, 'project.json');
    const indexRelativePath = findIndexHtml(folderPath);

    if (!indexRelativePath) {
        skipped++;
        return;
    }

    let existingData = null;
    if (fs.existsSync(jsonPath)) {
        try {
            existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch (e) { }
    }

    const newCategory = detectCategory(folder);

    if (!existingData) {
        const projectData = {
            title: formatTitle(folder),
            category: newCategory,
            difficulty: 'Beginner',
            description: `A ${newCategory} project built with HTML, CSS, and JavaScript.`,
            tech: ['HTML', 'CSS', 'JavaScript'],
            icon: categoryIcons[newCategory] || 'ri-code-s-slash-line',
            coverStyle: categoryStyles[newCategory] || categoryStyles.utility
        };
        fs.writeFileSync(jsonPath, JSON.stringify(projectData, null, 2));
        console.log(`✅ Created: ${folder}/project.json`);
        created++;
    } else {
        const currentCat = existingData.category?.toLowerCase() || 'utility';
        if (currentCat !== newCategory) {
            existingData.category = newCategory;
            existingData.icon = categoryIcons[newCategory] || existingData.icon;
            existingData.coverStyle = categoryStyles[newCategory] || existingData.coverStyle;

            fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
            console.log(`🔄 Updated: ${folder} (${currentCat} -> ${newCategory})`);
            updated++;
        }
    }
});

console.log(`\n🎉 Done!`);
console.log(`   Created: ${created} files`);
console.log(`   Updated: ${updated} files`);
console.log(`   Skipped: ${skipped} folders`);
