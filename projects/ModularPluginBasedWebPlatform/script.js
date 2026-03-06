const plugins = [];

window.registerPlugin = function(plugin){

plugins.push(plugin);

const list = document.getElementById("plugin-list");

const item = document.createElement("li");

item.textContent = plugin.name;

item.onclick = () => loadPlugin(plugin);

list.appendChild(item);

};

function loadPlugin(plugin){

const workspace = document.getElementById("workspace");

workspace.innerHTML = "";

plugin.render(workspace);

}