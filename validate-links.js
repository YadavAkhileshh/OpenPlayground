const fs = require('fs');
const path = require('path');

const projectsJsonPath = path.join(__dirname, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));

let brokenLinks = [];

projects.forEach(project => {
    const link = project.link;
    if (link.startsWith('./projects/')) {
        const relativePath = link.substring(2); // remove ./
        const fullPath = path.join(__dirname, relativePath);
        if (!fs.existsSync(fullPath)) {
            brokenLinks.push({ title: project.title, link: link, path: fullPath });
        }
    }
});

if (brokenLinks.length > 0) {
    console.log('Broken links found:');
    brokenLinks.forEach(broken => {
        console.log(`${broken.title}: ${broken.link} -> ${broken.path}`);
    });
} else {
    console.log('All links are valid.');
}