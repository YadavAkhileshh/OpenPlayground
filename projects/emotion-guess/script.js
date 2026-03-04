const emotions = [
  {emoji:"😊", type:"happy"},
  {emoji:"😢", type:"sad"},
  {emoji:"😡", type:"angry"},
  {emoji:"😲", type:"surprise"},
  {emoji:"😁", type:"happy"},
  {emoji:"😭", type:"sad"},
  {emoji:"🤬", type:"angry"},
  {emoji:"😮", type:"surprise"}
];

let currentEmotion;
let score = 0;

function newEmoji(){
  const random = emotions[Math.floor(Math.random()*emotions.length)];
  document.getElementById("emoji").innerText = random.emoji;
  currentEmotion = random.type;
  document.getElementById("result").innerText = "";
}

function guess(choice){
  if(choice === currentEmotion){
    document.getElementById("result").innerText = "✅ Correct!";
    score++;
  } else {
    document.getElementById("result").innerText = "❌ Wrong!";
  }
  document.getElementById("score").innerText = "Score: " + score;

  setTimeout(newEmoji, 800);
}

newEmoji();