const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    category: "Arrays",
    difficulty: "Easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
    ],
    hint: "Use a hash map to store each number and its index. For each element, check if (target - element) already exists in the map.",
    starterCode:
`function twoSum(nums, target) {
  // Your solution here
  
}

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]`,
    testCases: [
      { fn: "twoSum([2,7,11,15], 9)", expected: "[0,1]" },
      { fn: "twoSum([3,2,4], 6)", expected: "[1,2]" },
      { fn: "twoSum([1,2,3,4], 7)", expected: "[2,3]" },
    ],
    solution: `function twoSum(nums, target) { const map = {}; for (let i = 0; i < nums.length; i++) { const comp = target - nums[i]; if (map[comp] !== undefined) return [map[comp], i]; map[nums[i]] = i; } }`,
  },
  {
    id: 2,
    title: "Palindrome Check",
    category: "Strings",
    difficulty: "Easy",
    description:
      "Write a function `isPalindrome(s)` that returns `true` if the given string is a palindrome (reads the same forwards and backwards), and `false` otherwise. Ignore case and non-alphanumeric characters.",
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
      { input: 's = "race a car"', output: "false" },
    ],
    hint: "Clean the string first — remove non-alphanumeric characters and convert to lowercase. Then use two pointers from both ends.",
    starterCode:
`function isPalindrome(s) {
  // Your solution here
  
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false`,
    testCases: [
      { fn: 'isPalindrome("A man, a plan, a canal: Panama")', expected: "true" },
      { fn: 'isPalindrome("race a car")', expected: "false" },
      { fn: 'isPalindrome("Was it a car or a cat I saw?")', expected: "true" },
    ],
    solution: `function isPalindrome(s) { const clean = s.toLowerCase().replace(/[^a-z0-9]/g, ''); return clean === clean.split('').reverse().join(''); }`,
  },
  {
    id: 3,
    title: "FizzBuzz",
    category: "Logic",
    difficulty: "Easy",
    description:
      "Write a function `fizzBuzz(n)` that returns an array of strings for numbers 1 to n. For multiples of 3, use `\"Fizz\"`. For multiples of 5, use `\"Buzz\"`. For multiples of both, use `\"FizzBuzz\"`. Otherwise, use the number as a string.",
    examples: [
      { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' },
      { input: "n = 15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
    ],
    hint: "Use the modulo operator (%) to check divisibility. Check for FizzBuzz (divisible by both) first before individual checks.",
    starterCode:
`function fizzBuzz(n) {
  // Your solution here
  
}

console.log(fizzBuzz(5));  // ["1","2","Fizz","4","Buzz"]
console.log(fizzBuzz(15)); // ...FizzBuzz at end`,
    testCases: [
      { fn: "fizzBuzz(5)[2]", expected: '"Fizz"' },
      { fn: "fizzBuzz(5)[4]", expected: '"Buzz"' },
      { fn: "fizzBuzz(15)[14]", expected: '"FizzBuzz"' },
    ],
    solution: `function fizzBuzz(n) { return Array.from({length:n},(_,i)=>{ const x=i+1; return x%15===0?'FizzBuzz':x%3===0?'Fizz':x%5===0?'Buzz':String(x); }); }`,
  },
  {
    id: 4,
    title: "Valid Brackets",
    category: "Stacks",
    difficulty: "Medium",
    description:
      "Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. A string is valid if: every open bracket is closed by the same type of bracket, and open brackets are closed in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    hint: "Use a stack. Push opening brackets onto the stack. When you see a closing bracket, check if the top of the stack has the matching opening bracket.",
    starterCode:
`function isValid(s) {
  // Your solution here
  
}

console.log(isValid("()"));      // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false`,
    testCases: [
      { fn: 'isValid("()")', expected: "true" },
      { fn: 'isValid("()[]{}")', expected: "true" },
      { fn: 'isValid("(]")', expected: "false" },
    ],
    solution: `function isValid(s) { const stack=[],map={')':'(', ']':'[', '}':'{'}; for(const c of s){ if('({['.includes(c)) stack.push(c); else if(stack.pop()!==map[c]) return false; } return stack.length===0; }`,
  },
  {
    id: 5,
    title: "Binary Search",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a sorted array of integers `nums` and a target integer, implement binary search to return the index of `target` in the array. If `target` is not found, return `-1`. You must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
    ],
    hint: "Maintain two pointers: left and right. Calculate the mid point. If nums[mid] === target, return mid. If target is smaller, search the left half; otherwise search the right half.",
    starterCode:
`function search(nums, target) {
  // Your solution here
  
}

console.log(search([-1,0,3,5,9,12], 9));  // 4
console.log(search([-1,0,3,5,9,12], 2));  // -1`,
    testCases: [
      { fn: "search([-1,0,3,5,9,12], 9)", expected: "4" },
      { fn: "search([-1,0,3,5,9,12], 2)", expected: "-1" },
      { fn: "search([1,3,5,7,9], 7)", expected: "3" },
    ],
    solution: `function search(nums,target){let l=0,r=nums.length-1;while(l<=r){const m=l+r>>1;if(nums[m]===target)return m;nums[m]<target?l=m+1:r=m-1;}return -1;}`,
  },
  {
    id: 6,
    title: "Fibonacci Sequence",
    category: "Dynamic Programming",
    difficulty: "Medium",
    description:
      "Write a function `fib(n)` that returns the nth Fibonacci number. The Fibonacci sequence starts: 0, 1, 1, 2, 3, 5, 8, 13, ... Each number is the sum of the two preceding ones. Optimize for efficiency (avoid O(2^n) recursive approach).",
    examples: [
      { input: "n = 4", output: "3", explanation: "fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3" },
      { input: "n = 10", output: "55" },
    ],
    hint: "Use bottom-up dynamic programming or memoization. Store previously computed values so you don't recalculate them. You only need to keep track of the last two values.",
    starterCode:
`function fib(n) {
  // Your solution here
  
}

console.log(fib(4));  // 3
console.log(fib(10)); // 55`,
    testCases: [
      { fn: "fib(4)", expected: "3" },
      { fn: "fib(10)", expected: "55" },
      { fn: "fib(0)", expected: "0" },
    ],
    solution: `function fib(n){if(n<=1)return n;let a=0,b=1;for(let i=2;i<=n;i++){[a,b]=[b,a+b];}return b;}`,
  },
  {
    id: 7,
    title: "Reverse Linked List",
    category: "Linked Lists",
    difficulty: "Hard",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list's head. A linked list node has properties: `val` (number) and `next` (next node or null).",
    examples: [
      { input: "[1 → 2 → 3 → 4 → 5]", output: "[5 → 4 → 3 → 2 → 1]" },
      { input: "[1 → 2]", output: "[2 → 1]" },
    ],
    hint: "Iterate through the list maintaining three pointers: prev (starts null), curr (starts at head), and next. At each step: save next, point curr.next to prev, move prev to curr, move curr to next.",
    starterCode:
`class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  // Your solution here
  
}

// Helper to build list: [1,2,3,4,5]
function makeList(arr) {
  let head = null;
  for (let i = arr.length-1; i >= 0; i--)
    head = new ListNode(arr[i], head);
  return head;
}

function listToArr(head) {
  const res = [];
  while (head) { res.push(head.val); head = head.next; }
  return res;
}

console.log(listToArr(reverseList(makeList([1,2,3,4,5])))); // [5,4,3,2,1]`,
    testCases: [
      { fn: "listToArr(reverseList(makeList([1,2,3,4,5])))[0]", expected: "5" },
      { fn: "listToArr(reverseList(makeList([1,2,3,4,5])))[4]", expected: "1" },
      { fn: "listToArr(reverseList(makeList([1,2]))).join(',')", expected: '"2,1"' },
    ],
    solution: `function reverseList(head){let prev=null,curr=head;while(curr){const next=curr.next;curr.next=prev;prev=curr;curr=next;}return prev;}`,
  },
];

// ——— STATE ———
const state = {
  currentCategory: "All",
  solved: JSON.parse(localStorage.getItem("ps_solved") || "[]"),
  score: parseInt(localStorage.getItem("ps_score") || "0"),
  streak: parseInt(localStorage.getItem("ps_streak") || "0"),
  activeProblem: null,
  hintVisible: false,
};

// ——— ELEMENTS ———
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ——— INIT ———
document.addEventListener("DOMContentLoaded", () => {
  updateScoreDisplay();
  renderProblemList();
  bindCategoryTabs();
  setupModal();
  updateProgress();
});

// ——— SCORE ———
function updateScoreDisplay() {
  $("score-val").textContent = state.score;
  $("streak-val").textContent = state.streak;
  $("solved-val").textContent = state.solved.length;
}

function saveState() {
  localStorage.setItem("ps_solved", JSON.stringify(state.solved));
  localStorage.setItem("ps_score", state.score);
  localStorage.setItem("ps_streak", state.streak);
}

// ——— PROGRESS ———
function updateProgress() {
  const pct = Math.round((state.solved.length / PROBLEMS.length) * 100);
  $("progress-fill").style.width = pct + "%";
  $("progress-label").textContent = `${state.solved.length} / ${PROBLEMS.length} solved (${pct}%)`;
}

// ——— CATEGORIES ———
const CATEGORIES = ["All", ...new Set(PROBLEMS.map(p => p.category))];

function bindCategoryTabs() {
  const container = $("category-tabs");
  container.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === state.currentCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      state.currentCategory = cat;
      $$(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProblemList();
    });
    container.appendChild(btn);
  });
}

// ——— PROBLEM LIST ———
function renderProblemList() {
  const container = $("problem-list");
  const filtered = state.currentCategory === "All"
    ? PROBLEMS
    : PROBLEMS.filter(p => p.category === state.currentCategory);

  container.innerHTML = "";
  filtered.forEach((prob, i) => {
    const isSolved = state.solved.includes(prob.id);
    const card = document.createElement("div");
    card.className = "prob-item" + (isSolved ? " solved" : "");
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <h3>${prob.title}</h3>
      <p>${prob.description.slice(0, 90)}...</p>
      <div class="prob-item-meta">
        <span class="badge badge-diff-${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
        <span class="badge badge-cat">${prob.category}</span>
      </div>`;
    card.addEventListener("click", () => openProblem(prob));
    container.appendChild(card);
  });
}

// ——— MODAL ———
function setupModal() {
  $("modal-close").addEventListener("click", closeModal);
  $("modal-backdrop").addEventListener("click", e => {
    if (e.target === $("modal-backdrop")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

function openProblem(prob) {
  state.activeProblem = prob;
  state.hintVisible = false;

  // Populate modal
  $("modal-title").textContent = prob.title;
  $("modal-diff").className = `badge badge-diff-${prob.difficulty.toLowerCase()}`;
  $("modal-diff").textContent = prob.difficulty;
  $("modal-cat").textContent = prob.category;
  $("modal-desc").textContent = prob.description;

  // Examples
  const exContainer = $("modal-examples");
  exContainer.innerHTML = prob.examples.map(ex => `
    <div class="example-block">
      <div><strong style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em">Input:</strong>  <span>${escapeHtml(ex.input)}</span></div>
      <div><strong style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em">Output:</strong> <span>${escapeHtml(ex.output)}</span></div>
      ${ex.explanation ? `<div style="color:var(--text-muted);font-size:0.78rem;margin-top:4px">// ${escapeHtml(ex.explanation)}</div>` : ""}
    </div>`).join("");

  // Code editor
  $("code-input").value = prob.starterCode;

  // Output hidden
  const outPanel = $("output-panel");
  outPanel.classList.remove("visible");

  // Hint
  $("hint-text").classList.remove("visible");
  $("hint-text").textContent = prob.hint;

  // Open modal
  $("modal-backdrop").classList.add("open");
  document.body.style.overflow = "hidden";

  // Bind buttons
  $("run-btn").onclick = () => runCode();
  $("hint-btn").onclick = () => toggleHint();
  $("reset-btn").onclick = () => { $("code-input").value = prob.starterCode; outPanel.classList.remove("visible"); };
  $("solution-btn").onclick = () => revealSolution();
}

function closeModal() {
  $("modal-backdrop").classList.remove("open");
  document.body.style.overflow = "";
  state.activeProblem = null;
}

// ——— HINT ———
function toggleHint() {
  state.hintVisible = !state.hintVisible;
  $("hint-text").classList.toggle("visible", state.hintVisible);
  $("hint-btn").textContent = state.hintVisible ? "▲ Hide Hint" : "💡 Show Hint";
}

// ——— RUN CODE ———
function runCode() {
  const prob = state.activeProblem;
  const userCode = $("code-input").value;
  const outPanel = $("output-panel");
  const testContainer = $("test-results");
  const summary = $("result-summary");
  const statusDot = $("output-status");

  let passed = 0;
  const results = [];

  prob.testCases.forEach(tc => {
    try {
      const wrappedCode = `
        ${userCode}
        ${prob.id === 7 ? `
          class ListNode { constructor(v,n=null){this.val=v;this.next=n;} }
          function makeList(arr){let h=null;for(let i=arr.length-1;i>=0;i--)h=new ListNode(arr[i],h);return h;}
          function listToArr(h){const r=[];while(h){r.push(h.val);h=h.next;}return r;}
        ` : ""}
        JSON.stringify(${tc.fn});
      `;
      const result = Function(`"use strict"; return (${wrappedCode})`)();
      const expected = tc.expected;
      const ok = result === expected;
      if (ok) passed++;
      results.push({ fn: tc.fn, expected, got: result, ok });
    } catch (err) {
      results.push({ fn: tc.fn, expected: tc.expected, got: `Error: ${err.message}`, ok: false });
    }
  });

  // Render results
  testContainer.innerHTML = results.map(r => `
    <div class="test-case ${r.ok ? "pass" : "fail"}">
      <span class="test-icon">${r.ok ? "✓" : "✗"}</span>
      <div class="test-detail">
        <strong>${escapeHtml(r.fn)}</strong>
        <span>Expected: ${escapeHtml(r.expected)} — Got: ${escapeHtml(String(r.got))}</span>
      </div>
    </div>`).join("");

  const allPass = passed === results.length;
  summary.className = `result-summary ${allPass ? "pass" : "fail"}`;
  summary.innerHTML = allPass
    ? `✓ All ${passed} tests passed!`
    : `✗ ${passed} / ${results.length} tests passed`;
  statusDot.className = `output-status ${allPass ? "pass" : "fail"}`;
  outPanel.classList.add("visible");

  // Award points
  if (allPass && !state.solved.includes(prob.id)) {
    const points = prob.difficulty === "Easy" ? 10 : prob.difficulty === "Medium" ? 20 : 35;
    state.solved.push(prob.id);
    state.score += points;
    state.streak++;
    saveState();
    updateScoreDisplay();
    updateProgress();
    renderProblemList();
    showToast(`+${points} points! Problem solved! 🎉`);
  }
}

// ——— REVEAL SOLUTION ———
function revealSolution() {
  const prob = state.activeProblem;
  if (!confirm("View the solution? (You won't earn points for this problem)")) return;
  $("code-input").value = prob.solution;
  // Deduct from solved count if needed
  if (state.solved.includes(prob.id)) {
    state.solved = state.solved.filter(id => id !== prob.id);
    saveState();
    updateScoreDisplay();
    updateProgress();
    renderProblemList();
  }
}

// ——— TOAST ———
function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
    Object.assign(toast.style, {
      position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%) translateY(80px)",
      background: "var(--accent3)", color: "#0a0a0f", padding: "12px 24px",
      borderRadius: "40px", fontFamily: "'Syne',sans-serif", fontWeight: "700",
      fontSize: "0.85rem", zIndex: "999", transition: "transform 0.3s ease",
      whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
    });
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => { toast.style.transform = "translateX(-50%) translateY(80px)"; }, 2800);
  });
}

// ——— UTILS ———
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
