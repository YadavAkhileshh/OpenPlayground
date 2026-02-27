class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char])
        node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
  }

  searchPrefix(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char])
        return [];
      node = node.children[char];
    }

    let results = [];
    this.collectWords(node, prefix, results);
    return results;
  }

  collectWords(node, prefix, results) {
    if (node.isEnd)
      results.push(prefix);

    for (let char in node.children) {
      this.collectWords(
        node.children[char],
        prefix + char,
        results
      );
    }
  }
}

const trie = new Trie();

// Preload some words
["apple", "app", "application", "apt", "bat", "batch", "banana"]
  .forEach(word => trie.insert(word));

function addWord() {
  const input = document.getElementById("wordInput");
  const word = input.value.trim().toLowerCase();

  if (!word) return;

  trie.insert(word);
  input.value = "";
  alert("Word added!");
}

function searchPrefix() {
  const input = document.getElementById("searchInput");
  const prefix = input.value.trim().toLowerCase();

  const suggestionsDiv = document.getElementById("suggestions");
  suggestionsDiv.innerHTML = "";

  if (!prefix) return;

  const results = trie.searchPrefix(prefix);

  if (results.length === 0) {
    suggestionsDiv.innerHTML = "<p>No suggestions found</p>";
    return;
  }

  results.forEach(word => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = word;
    suggestionsDiv.appendChild(div);
  });
}
