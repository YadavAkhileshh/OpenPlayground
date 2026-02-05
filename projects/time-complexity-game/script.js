const codeEl = document.getElementById("code");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const currentEl = document.getElementById("current");
const restartBtn = document.getElementById("restart");

let score = 0;
let currentQuestion = 0;
let questions = [];

// Pool of 15+ questions
const questionPool = [
  { code: "int x = 10;", answer: "O(1)" },
  { code: "for(int i=0;i<n;i++) {}", answer: "O(n)" },
  { code: "for(int i=0;i<n;i++)\n for(int j=0;j<n;j++) {}", answer: "O(n²)" },
  { code: "while(n>1){ n/=2; }", answer: "O(log n)" },
  { code: "mergeSort(arr)", answer: "O(n log n)" },
  { code: "binarySearch(arr)", answer: "O(log n)" },
  { code: "for(int i=0;i<n;i++)\n for(int j=0;j<i;j++) {}", answer: "O(n²)" },
  { code: "HashMap.get(key)", answer: "O(1)" },
  { code: "for(int i=1;i<n;i*=2) {}", answer: "O(log n)" },
  { code: "for(int i=0;i<n;i++)\n for(int j=0;j<n;j++)\n  for(int k=0;k<n;k++) {}", answer: "O(n³)" },
  { code: "print(arr[0])", answer: "O(1)" },
  { code: "for(int i=0;i<n;i++)\n print(i)", answer: "O(n)" },
  { code: "quickSort(arr) // avg", answer: "O(n log n)" },
  { code: "for(int i=0;i<n;i++)\n for(int j=0;j<10;j++) {}", answer: "O(n)" },
  { code: "recursive(n-1)", answer: "O(n)" }
];

const options = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)"];

function startGame() {
  score = 0;
  currentQuestion = 0;
  scoreEl.textContent = score;
  restartBtn.classList.add("hidden");

  questions = shuffle([...questionPool]).slice(0, 5);
  loadQuestion();
}

function loadQuestion() {
  feedbackEl.textContent = "";
  optionsEl.innerHTML = "";

  if (currentQuestion >= questions.length) {
    codeEl.textContent = "Game Over 🎉";
    feedbackEl.textContent = `Final Score: ${score}/5`;
    restartBtn.classList.remove("hidden");
    return;
  }

  const q = questions[currentQuestion];
  codeEl.textContent = q.code;
  currentEl.textContent = currentQuestion + 1;

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, q.answer);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    score++;
    scoreEl.textContent = score;
    feedbackEl.textContent = "Correct ✅";
    feedbackEl.className = "correct";
  } else {
    feedbackEl.textContent = `Wrong ❌ Correct: ${correct}`;
    feedbackEl.className = "wrong";
  }

  currentQuestion++;
  setTimeout(loadQuestion, 800);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Start game on load
startGame();
