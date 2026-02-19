let interval;

function start() {
  clearInterval(interval);

  const str = document.getElementById("inputString").value;
  const problem = document.getElementById("problem").value;

  renderString(str);

  if (problem === "noRepeat")
    solveNoRepeat(str);

  if (problem === "minWindow")
    solveMinWindow(str);

  if (problem === "kDistinct")
    solveKDistinct(str);
}

function renderString(str) {
  const visual = document.getElementById("visual");
  visual.innerHTML = "";

  for (let i = 0; i < str.length; i++) {
    const span = document.createElement("span");
    span.className = "char";
    span.id = "char-" + i;
    span.textContent = str[i];
    visual.appendChild(span);
  }
}

function highlight(l, r) {
  document.querySelectorAll(".char").forEach(c =>
    c.classList.remove("active")
  );
  for (let i = l; i <= r; i++) {
    document.getElementById("char-" + i).classList.add("active");
  }
}

function markBest(l, r) {
  for (let i = l; i <= r; i++) {
    document.getElementById("char-" + i).classList.add("best");
  }
}

/* 1️⃣ Longest Substring Without Repeating */
function solveNoRepeat(str) {
  let map = new Map();
  let left = 0;
  let bestLen = 0;

  let right = 0;

  interval = setInterval(() => {

    if (right >= str.length) {
      clearInterval(interval);
      document.getElementById("result").textContent =
        "Max Length = " + bestLen;
      return;
    }

    const char = str[right];

    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }

    map.set(char, right);

    bestLen = Math.max(bestLen, right - left + 1);

    highlight(left, right);

    right++;

  }, 400);
}

/* 2️⃣ Minimum Window Substring */
function solveMinWindow(str) {
  const pattern = document.getElementById("pattern").value;
  if (!pattern) return alert("Enter pattern");

  let need = {};
  for (let c of pattern)
    need[c] = (need[c] || 0) + 1;

  let left = 0, count = 0;
  let minLen = Infinity, start = 0;

  interval = setInterval(() => {

    if (count === pattern.length) {
      clearInterval(interval);
      if (minLen !== Infinity)
        markBest(start, start + minLen - 1);

      document.getElementById("result").textContent =
        minLen === Infinity ? "No Window Found" :
        "Min Window Length = " + minLen;
      return;
    }

    if (left >= str.length) {
      clearInterval(interval);
      return;
    }

    const char = str[left];

    if (need[char] > 0)
      count++;

    need[char] = (need[char] || 0) - 1;

    highlight(0, left);

    if (count === pattern.length) {
      minLen = left + 1;
      start = 0;
    }

    left++;

  }, 400);
}

/* 3️⃣ Longest Substring With K Distinct */
function solveKDistinct(str) {
  const k = parseInt(document.getElementById("kValue").value);

  let map = new Map();
  let left = 0;
  let best = 0;
  let right = 0;

  interval = setInterval(() => {

    if (right >= str.length) {
      clearInterval(interval);
      document.getElementById("result").textContent =
        "Max Length = " + best;
      return;
    }

    map.set(str[right], (map.get(str[right]) || 0) + 1);

    while (map.size > k) {
      map.set(str[left], map.get(str[left]) - 1);
      if (map.get(str[left]) === 0)
        map.delete(str[left]);
      left++;
    }

    best = Math.max(best, right - left + 1);

    highlight(left, right);

    right++;

  }, 400);
}

function reset() {
  clearInterval(interval);
  document.getElementById("visual").innerHTML = "";
  document.getElementById("result").textContent = "";
}
