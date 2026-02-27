// ---------- DATA ----------
const topics = {
  array: {
    title: "Arrays",
    desc: "Arrays store elements in contiguous memory and allow O(1) access by index.",
    code: "let arr = [1,2,3];\nconsole.log(arr[0]);",
    quiz: {
      q: "What is time complexity of array index access?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      ans: 2
    }
  },
  sorting: {
    title: "Sorting",
    desc: "Sorting arranges elements in ascending or descending order.",
    code: "arr.sort((a,b)=>a-b);",
    quiz: {
      q: "Bubble Sort worst-case complexity?",
      options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      ans: 1
    }
  },
  searching: {
    title: "Searching",
    desc: "Searching finds an element inside a data structure.",
    code: "arr.find(x => x === target);",
    quiz: {
      q: "Binary Search works on?",
      options: ["Unsorted arrays", "Sorted arrays", "Linked list only", "Trees only"],
      ans: 1
    }
  },
  recursion: {
    title: "Recursion",
    desc: "Recursion is when a function calls itself until a base condition is met.",
    code: "function fact(n){ return n<=1 ? 1 : n*fact(n-1); }",
    quiz: {
      q: "Recursion must always have?",
      options: ["Loop", "Array", "Base case", "Class"],
      ans: 2
    }
  }
};

// ---------- LOAD TOPIC ----------
function loadTopic(key) {
  const t = topics[key];
  document.getElementById("topicTitle").textContent = t.title;
  document.getElementById("topicDesc").textContent = t.desc;
  document.getElementById("codeBlock").textContent = t.code;

  loadQuiz(t.quiz);
  markProgress(key);
}

// ---------- QUIZ ----------
function loadQuiz(quiz) {
  document.getElementById("question").textContent = quiz.q;
  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  document.getElementById("quizResult").textContent = "";

  quiz.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      document.getElementById("quizResult").textContent =
        i === quiz.ans ? "✔ Correct!" : "❌ Wrong!";
    };
    optionsEl.appendChild(btn);
  });
}

// ---------- PROGRESS ----------
function markProgress(topic) {
  let done = JSON.parse(localStorage.getItem("dsaProgress")) || [];
  if (!done.includes(topic)) done.push(topic);

  localStorage.setItem("dsaProgress", JSON.stringify(done));

  const percent = Math.floor((done.length / Object.keys(topics).length) * 100);
  document.getElementById("progressText").textContent =
    `${percent}% completed`;
}

// ---------- SORTING DEMO ----------
const barsEl = document.getElementById("bars");
let arr = [];

function sleep(ms){
  return new Promise(r=>setTimeout(r, ms));
}

function generateArray(){
  arr = [];
  barsEl.innerHTML = "";

  for(let i=0;i<20;i++){
    const v = Math.floor(Math.random()*180)+20;
    arr.push(v);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = v+"px";
    barsEl.appendChild(bar);
  }
}

async function bubbleSort(){
  const bars = document.querySelectorAll(".bar");

  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-i-1;j++){

      bars[j].classList.add("active");
      bars[j+1].classList.add("active");

      await sleep(120);

      if(arr[j] > arr[j+1]){
        [arr[j],arr[j+1]] = [arr[j+1],arr[j]];
        bars[j].style.height = arr[j]+"px";
        bars[j+1].style.height = arr[j+1]+"px";
      }

      bars[j].classList.remove("active");
      bars[j+1].classList.remove("active");
    }

    bars[arr.length-i-1].classList.add("done");
  }
}

// init
generateArray();