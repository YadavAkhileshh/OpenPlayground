//  STATE 
let state = {
  items: ["Item 1", "Item 2", "Item 3"]
};

let oldTree = null;

//  VDOM 
function createVNode(type, props, children) {
  return { type, props: props || {}, children };
}

function renderVDOM(state) {
  return createVNode(
    "div",
    {},
    state.items.map(item =>
      createVNode("div", { key: item }, item)
    )
  );
}

//  DIFF 
function diff(oldNode, newNode, patches = [], index = 0) {
  if (!oldNode) {
    patches.push({ type: "ADD", node: newNode, index });
    return patches;
  }

  if (!newNode) {
    patches.push({ type: "REMOVE", index });
    return patches;
  }

  if (changed(oldNode, newNode)) {
    patches.push({ type: "REPLACE", node: newNode, index });
    return patches;
  }

  if (newNode.type) {
    const childLength = Math.max(
      oldNode.children.length,
      newNode.children.length
    );

    for (let i = 0; i < childLength; i++) {
      diff(
        oldNode.children[i],
        newNode.children[i],
        patches,
        index + i + 1
      );
    }
  }

  return patches;
}

function changed(node1, node2) {
  return (
    typeof node1 !== typeof node2 ||
    (typeof node1 === "string" && node1 !== node2) ||
    node1.type !== node2.type
  );
}

//  PATCH 
function applyPatches(domNode, patches) {
  patches.forEach(patch => {
    if (patch.type === "ADD") {
      const el = createRealDOM(patch.node);
      domNode.appendChild(el);
    }

    if (patch.type === "REMOVE") {
      if (domNode.childNodes[patch.index]) {
        domNode.removeChild(domNode.childNodes[patch.index]);
      }
    }

    if (patch.type === "REPLACE") {
      const el = createRealDOM(patch.node);
      domNode.replaceChild(el, domNode.childNodes[patch.index]);
    }
  });
}

// REAL DOM 
function createRealDOM(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  vnode.children.forEach(child => {
    el.appendChild(createRealDOM(child));
  });

  return el;
}

// UI 
const oldVDOMEl = document.getElementById("oldVDOM");
const newVDOMEl = document.getElementById("newVDOM");
const patchesEl = document.getElementById("patches");
const realDOMEl = document.getElementById("realDOM");

function update() {
  const newTree = renderVDOM(state);

  oldVDOMEl.textContent = JSON.stringify(oldTree, null, 2);
  newVDOMEl.textContent = JSON.stringify(newTree, null, 2);

  const patches = diff(oldTree, newTree);
  patchesEl.innerHTML = "";

  patches.forEach(p => {
    const li = document.createElement("li");
    li.textContent = JSON.stringify(p);
    patchesEl.appendChild(li);
  });

  applyPatches(realDOMEl, patches);
  oldTree = newTree;
}

//  EVENTS 
document.getElementById("addItem").onclick = () => {
  state.items.push("Item " + (state.items.length + 1));
  update();
};

document.getElementById("removeItem").onclick = () => {
  state.items.pop();
  update();
};

document.getElementById("shuffleItems").onclick = () => {
  state.items.sort(() => Math.random() - 0.5);
  update();
};

// Initial render
oldTree = renderVDOM(state);
realDOMEl.appendChild(createRealDOM(oldTree));