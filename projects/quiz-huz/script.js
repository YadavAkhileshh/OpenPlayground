const questions = [
  {question:"What does JS stand for?",answers:["Java Source","JavaScript","Just Script","Json Style"],correct:1},
  {question:"Which is not a programming language?",answers:["Python","HTML","C++","Java"],correct:1},
  {question:"CSS is used for?",answers:["Logic","Structure","Styling","Database"],correct:2}
];

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const qNum = document.getElementById("qNum");
const timerRing = document.getElementById("timerRing");
const timeText = document.getElementById("timeText");
const resultScreen = document.getElementById("resultScreen");
const finalScore = document.getElementById("finalScore");
const highScoreEl = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");

let current = 0;
let score = 0;
let timeLeft = 15;
let timer;
const circumference = 220;

function loadQuestion() {
  const q = questions[current];
  qNum.textContent = `${current+1}/${questions.length}`;
  questionEl.textContent = q.question;
  questionEl.classList.add("show");
  answersEl.innerHTML = "";
  nextBtn.style.display="none";
  timeLeft = 15;
  updateRing();

  q.answers.forEach((ans,i)=>{
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = ()=>selectAnswer(i,btn);
    answersEl.appendChild(btn);
  });

  progress.style.width = (current/questions.length)*100+"%";
  startTimer();
}

function startTimer(){
  clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--;
    timeText.textContent = timeLeft;
    updateRing();
    if(timeLeft<=0){
      clearInterval(timer);
      showAnswer();
    }
  },1000);
}

function updateRing(){
  const offset = circumference - (timeLeft/15)*circumference;
  timerRing.style.strokeDashoffset = offset;
}

function selectAnswer(i,btn){
  clearInterval(timer);
  const correct = questions[current].correct;

  Array.from(answersEl.children).forEach((b,index)=>{
    if(index===correct) b.classList.add("correct");
    if(index===i && i!==correct) b.classList.add("wrong");
    b.disabled=true;
  });

  if(i===correct){
    score++;
    playSound(700);
  } else playSound(200);

  nextBtn.style.display="block";
}

function showAnswer(){
  const correct = questions[current].correct;
  answersEl.children[correct].classList.add("correct");
  nextBtn.style.display="block";
}

nextBtn.onclick=()=>{
  current++;
  if(current<questions.length) loadQuestion();
  else finishQuiz();
};

function finishQuiz(){
  document.getElementById("quizWrapper").style.display="none";
  resultScreen.style.display="block";
  finalScore.textContent = `${score}/${questions.length}`;

  let high = localStorage.getItem("quizHigh") || 0;
  if(score>high){
    localStorage.setItem("quizHigh",score);
    launchConfetti();
  }
  highScoreEl.textContent = localStorage.getItem("quizHigh");
}

restartBtn.onclick=()=>{
  current=0;
  score=0;
  document.getElementById("quizWrapper").style.display="block";
  resultScreen.style.display="none";
  loadQuestion();
};

function playSound(freq){
  const ctx=new AudioContext();
  const osc=ctx.createOscillator();
  osc.frequency.value=freq;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime+0.2);
}

function launchConfetti(){
  const canvas=document.getElementById("confetti");
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  const pieces=Array.from({length:150},()=>({
    x:Math.random()*canvas.width,
    y:-20,
    size:Math.random()*6+4,
    speed:Math.random()*3+2
  }));

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`;
      ctx.fillRect(p.x,p.y,p.size,p.size);
      p.y+=p.speed;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

loadQuestion();