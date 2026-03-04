const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = './projects';
const MANIFEST_FILE = './project-manifest.json';

console.log('📋 Scanning projects...\n');

/**
 * Find index.html recursively within a folder
 */
function findIndexHtml(dir) {
    const files = fs.readdirSync(dir);

    // Check root first
    if (files.includes('index.html')) {
        return 'index.html';
    }

    // Common subdirectories
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

const folders = fs.readdirSync(PROJECTS_DIR);
const manifestProjects = [];

folders.forEach(f => {
    const folderPath = path.join(PROJECTS_DIR, f);
    if (!fs.statSync(folderPath).isDirectory()) return;

    const jsonPath = path.join(folderPath, 'project.json');
    const indexRelativePath = findIndexHtml(folderPath);

    if (!fs.existsSync(jsonPath)) {
        console.log(`⚠️ Missing project.json: ${f}`);
        return;
    }

    if (!indexRelativePath) {
        console.log(`⚠️ Missing index.html: ${f}`);
        return;
    }

    try {
        JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        manifestProjects.push({
            folder: f,
            path: `./projects/${f}/project.json`,
            link: `./projects/${f}/${indexRelativePath.replace(/\\/g, '/')}`
        });
    } catch (e) {
        console.log(`❌ Invalid JSON in ${f}/project.json`);
    }
});

const manifest = {
    version: '2.1',
    generated: new Date().toISOString(),
    count: manifestProjects.length,
    projects: manifestProjects
};

fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

console.log(`\n✅ Generated ${MANIFEST_FILE}`);
console.log(`📦 Total valid projects: ${manifestProjects.length}`);
