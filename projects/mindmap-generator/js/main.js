import { createNode, clearNodes } from './nodeManager.js';
import { saveMap, loadMap } from './storage.js';

document.getElementById("addNode")
    .addEventListener("click", createNode);

document.getElementById("clearMap")
    .addEventListener("click", clearNodes);

document.getElementById("saveMap")
    .addEventListener("click", saveMap);

document.getElementById("loadMap")
    .addEventListener("click", loadMap);