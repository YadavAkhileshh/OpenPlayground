const folderTree = document.getElementById("folderTree");
const fileList = document.getElementById("fileList");
const currentPath = document.getElementById("currentPath");

// Fake file system data
const fileSystem = {
  Root: {
    Documents: {
      "Resume.pdf": "file",
      "Notes.txt": "file"
    },
    Images: {
      "photo1.png": "file",
      "photo2.jpg": "file"
    },
    Projects: {
      "index.html": "file",
      "style.css": "file",
      "script.js": "file"
    }
  }
};

// Render folder tree
function renderTree(obj, parent, path = "Root") {
  parent.innerHTML = "";

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object") {
      const li = document.createElement("li");
      li.textContent = "📁 " + key;
      li.onclick = () => openFolder(obj[key], path + "/" + key);
      parent.appendChild(li);
    }
  });
}

// Open folder
function openFolder(folder, path) {
  currentPath.textContent = path;
  fileList.innerHTML = "";

  Object.keys(folder).forEach(name => {
    const item = document.createElement("div");
    item.className = "file-item";

    const isFolder = typeof folder[name] === "object";

    item.innerHTML = `
      <span class="icon">${isFolder ? "📁" : "📄"}</span>
      ${name}
    `;

    item.onclick = () => {
      if (isFolder) openFolder(folder[name], path + "/" + name);
      else alert("Opening file: " + name);
    };

    fileList.appendChild(item);
  });
}

// Init
renderTree(fileSystem.Root, folderTree);
openFolder(fileSystem.Root, "Root");