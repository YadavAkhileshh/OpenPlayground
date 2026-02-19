class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();

    this.head = new Node(null, null);
    this.tail = new Node(null, null);

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  insertAtFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;

    const node = this.map.get(key);
    this.remove(node);
    this.insertAtFront(node);

    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.remove(node);
      this.insertAtFront(node);
    } else {
      if (this.map.size >= this.capacity) {
        const lru = this.tail.prev;
        this.remove(lru);
        this.map.delete(lru.key);
      }

      const newNode = new Node(key, value);
      this.insertAtFront(newNode);
      this.map.set(key, newNode);
    }
  }

  getCacheState() {
    const result = [];
    let current = this.head.next;
    while (current !== this.tail) {
      result.push(current);
      current = current.next;
    }
    return result;
  }
}

let cache = null;

function initCache() {
  const cap = parseInt(document.getElementById("capacity").value);
  cache = new LRUCache(cap);
  document.getElementById("result").textContent = "Cache Initialized";
  renderCache();
}

function putValue() {
  const key = document.getElementById("keyInput").value;
  const value = document.getElementById("valueInput").value;

  if (!cache) return alert("Initialize cache first!");

  cache.put(key, value);
  document.getElementById("result").textContent = `Put(${key}, ${value})`;
  renderCache();
}

function getValue() {
  const key = document.getElementById("getKeyInput").value;

  if (!cache) return alert("Initialize cache first!");

  const val = cache.get(key);
  document.getElementById("result").textContent =
    val === -1 ? `Key ${key} not found` : `Get(${key}) = ${val}`;

  renderCache();
}

function renderCache() {
  const container = document.getElementById("cacheContainer");
  container.innerHTML = "";

  if (!cache) return;

  const state = cache.getCacheState();

  state.forEach((node, index) => {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = `${node.key}:${node.value}`;

    if (index === 0) div.classList.add("mru");
    if (index === state.length - 1) div.classList.add("lru");

    container.appendChild(div);
  });
}
