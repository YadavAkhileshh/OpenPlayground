const newFileBtn = document.getElementById("newFileBtn");
const fileList = document.getElementById("fileList");
const tabs = document.getElementById("tabs");
const editor = document.getElementById("editor");
const consoleOutput = document.getElementById("consoleOutput");
const runBtn = document.getElementById("runBtn");
const saveBtn = document.getElementById("saveBtn");
const lineNumbers = document.getElementById("lineNumbers");
const themeToggle = document.getElementById("themeToggle");

let files = JSON.parse(localStorage.getItem("devstudio-files")) || {};
let currentFile = null;

function createFile(name){
    files[name] = "// Start coding...\n";
    currentFile = name;
    saveFiles();
    renderFiles();
    openFile(name);
}

function saveFiles(){
    localStorage.setItem("devstudio-files", JSON.stringify(files));
}

function renderFiles(){
    fileList.innerHTML = "";
    tabs.innerHTML = "";

    Object.keys(files).forEach(name=>{
        const li = document.createElement("li");
        li.textContent = name;
        li.onclick = ()=>openFile(name);
        fileList.appendChild(li);

        const tab = document.createElement("div");
        tab.className = "tab";
        tab.textContent = name;
        if(name === currentFile) tab.classList.add("active");
        tab.onclick = ()=>openFile(name);
        tabs.appendChild(tab);
    });
}

function openFile(name){
    currentFile = name;
    editor.value = files[name];
    updateLineNumbers();
    renderFiles();
}

editor.addEventListener("input",()=>{
    if(currentFile){
        files[currentFile] = editor.value;
        updateLineNumbers();
    }
});

function updateLineNumbers(){
    const lines = editor.value.split("\n").length;
    lineNumbers.innerHTML = "";
    for(let i=1;i<=lines;i++){
        lineNumbers.innerHTML += i + "<br>";
    }
}

function runCode(){
    consoleOutput.textContent = "";

    const originalLog = console.log;

    console.log = function(...args){
        consoleOutput.textContent += args.join(" ") + "\n";
    };

    try{
        new Function(editor.value)();
    }catch(e){
        consoleOutput.textContent += "Error: " + e.message;
    }

    console.log = originalLog;
}

runBtn.addEventListener("click",runCode);

saveBtn.addEventListener("click",()=>{
    saveFiles();
    alert("File Saved!");
});

newFileBtn.addEventListener("click",()=>{
    const name = prompt("Enter file name (e.g. app.js)");
    if(name) createFile(name);
});

document.addEventListener("keydown",(e)=>{
    if(e.ctrlKey && e.key === "s"){
        e.preventDefault();
        saveFiles();
        alert("File Saved!");
    }
    if(e.ctrlKey && e.key === "Enter"){
        runCode();
    }
});

themeToggle.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
});

if(Object.keys(files).length === 0){
    createFile("main.js");
}else{
    currentFile = Object.keys(files)[0];
    renderFiles();
    openFile(currentFile);
}
