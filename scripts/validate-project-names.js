const fs = require("fs");
const path = require("path");

const projectsDir = path.join(__dirname, "..", "projects");
const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validateProjectNames() {
  if (!fs.existsSync(projectsDir)) {
    console.log("Projects directory not found.");
    return;
  }

  const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const invalidFolders = folders.filter(folder => !kebabCaseRegex.test(folder));

  if (invalidFolders.length === 0) {
    console.log("All project folder names follow kebab-case convention.");
  } else {
    console.log(`Found ${invalidFolders.length} folders that do not follow kebab-case naming.`);
    console.log("This validation is intended for new contributions moving forward.");
  }
}

validateProjectNames();