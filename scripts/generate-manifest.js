/**
 * Regenerate Project Manifest
 * Run: node scripts/generate-manifest.js
 * 
 * This script scans all project folders and creates project-manifest.json
 * which is used by app.js to dynamically load projects.
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = './projects';
const MANIFEST_FILE = './project-manifest.json';

console.log('📋 Scanning projects...\n');

const validProjects = fs.readdirSync(PROJECTS_DIR)
    .filter(f => {
        const folderPath = path.join(PROJECTS_DIR, f);
        const jsonPath = path.join(folderPath, 'project.json');
        const indexPath = path.join(folderPath, 'index.html');

        if (!fs.statSync(folderPath).isDirectory()) return false;
        if (!fs.existsSync(jsonPath)) {
            console.log(`⚠️ Missing project.json: ${f}`);
            return false;
        }
        if (!fs.existsSync(indexPath)) {
            console.log(`⚠️ Missing index.html: ${f}`);
            return false;
        }

        try {
            JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            return true;
        } catch (e) {
            console.log(`❌ Invalid JSON in ${f}/project.json`);
            return false;
        }
    });

const manifest = {
    version: '2.0',
    generated: new Date().toISOString(),
    count: validProjects.length,
    projects: validProjects.map(folder => ({
        folder: folder,
        path: `./projects/${folder}/project.json`,
        link: `./projects/${folder}/index.html`
    }))
};

fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

console.log(`\n✅ Generated ${MANIFEST_FILE}`);
console.log(`📦 Total valid projects: ${validProjects.length}`);
