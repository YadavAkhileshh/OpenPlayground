const CHALLENGES = {
  solo: [
    { emoji:"🎮", title:"Speed Run", desc:"Play any mobile game and try to beat your highest score in 10 minutes." },
    { emoji:"📸", title:"Photo Hunt", desc:"Find 5 interesting things in your room and photograph them creatively." },
    { emoji:"🎵", title:"DJ for 5", desc:"Make a 5-song playlist that perfectly describes your mood right now." },
    { emoji:"🍳", title:"Midnight Chef", desc:"Make a snack using only 3 ingredients you have right now." },
    { emoji:"🧩", title:"Memory Test", desc:"Write down 10 things you did last week without looking at your phone." },
    { emoji:"✍️", title:"6-Word Story", desc:"Write a complete story in exactly 6 words. Make it emotional." },
    { emoji:"🎨", title:"Blind Draw", desc:"Draw your favorite animal with your eyes closed. Share it with someone." },
    { emoji:"🎭", title:"Mirror Actor", desc:"Re-enact your favorite movie scene alone in the mirror. Full drama." },
    { emoji:"📖", title:"Random Wiki", desc:"Open Wikipedia, click Random Article, and learn everything on that page." },
    { emoji:"🌅", title:"Sky Watch", desc:"Go outside and stare at the sky for 3 full minutes. No phone." },
  ],
  social: [
    { emoji:"📞", title:"Surprise Call", desc:"Call someone you haven't spoken to in over 6 months. Just check in." },
    { emoji:"💌", title:"Compliment Bomb", desc:"Send genuine compliments to 3 different people right now. Be specific." },
    { emoji:"🤝", title:"Ask a Stranger", desc:"Ask someone nearby for their favorite book or movie recommendation." },
    { emoji:"🎤", title:"Voice Note", desc:"Send a 30-second voice note to your best friend singing their name." },
    { emoji:"🙌", title:"Thank Someone", desc:"Thank someone who helped you recently in a detailed and heartfelt message." },
    { emoji:"😂", title:"Meme War", desc:"Start a meme-sending competition with someone. 5 memes each. No repeats." },
    { emoji:"👀", title:"People Watch", desc:"Sit in a public spot for 10 minutes and make up stories about strangers." },
    { emoji:"🤳", title:"Group Photo", desc:"Organize a spontaneous photo with at least 2 other people right now." },
  ],
  creative: [
    { emoji:"🎨", title:"Color Palette", desc:"Pick 5 colors that represent your personality and explain why each one." },
    { emoji:"✏️", title:"Doodle Map", desc:"Draw a map of your ideal dream city with at least 8 locations labeled." },
    { emoji:"🎼", title:"Hum a Tune", desc:"Compose a 10-second melody in your head and hum it to someone." },
    { emoji:"📝", title:"Alter Ego", desc:"Write a full bio for your alter ego. Name, job, personality, and backstory." },
    { emoji:"🖼", title:"Abstract Art", desc:"Fill a page with random shapes and colors. Give it a poetic title." },
    { emoji:"🎬", title:"Pitch It", desc:"Invent a movie idea and pitch it in under 60 seconds to someone nearby." },
    { emoji:"🌍", title:"World Build", desc:"Invent a fictional country — flag, language, food, and national holiday." },
    { emoji:"🔤", title:"Acrostic Poem", desc:"Write an acrostic poem using your full name. Every line must rhyme." },
  ],
  physical: [
    { emoji:"🏃", title:"Lap Sprint", desc:"Sprint as fast as you can for 30 seconds. Rest. Repeat 3 times." },
    { emoji:"🧘", title:"Instant Stretch", desc:"Hold a full body stretch for 60 seconds without moving. Feel every muscle." },
    { emoji:"💃", title:"Dance Break", desc:"Put on your hype song and dance like nobody is watching for the full duration." },
    { emoji:"🤸", title:"30 Challenge", desc:"Do 10 pushups, 10 squats, and 10 jumping jacks. Right now. No skipping." },
    { emoji:"🚶", title:"Power Walk", desc:"Walk as fast as you can for 5 minutes. Count your steps without a phone." },
    { emoji:"🧗", title:"Balance Test", desc:"Stand on one foot with eyes closed for 30 seconds. Both sides." },
    { emoji:"🤼", title:"Thumb War", desc:"Challenge someone to a best-of-5 thumb war tournament. Trash talk allowed." },
    { emoji:"👐", title:"Clap Rhythm", desc:"Create a 4-beat hand clap rhythm and teach it to someone else." },
  ],
  mental: [
    { emoji:"🧮", title:"Mental Math", desc:"Calculate your age in days, hours, and minutes without a calculator." },
    { emoji:"🔁", title:"Word Chain", desc:"Create a 20-word chain where each word starts with the last letter of the previous." },
    { emoji:"🧠", title:"Memory Palace", desc:"Memorize 10 random objects in 1 minute. Recall them 10 minutes later." },
    { emoji:"🎯", title:"Brain Teaser", desc:"If you have 3 apples and take away 2, how many do you have? Think deeper." },
    { emoji:"📚", title:"Teach It", desc:"Explain quantum physics in 3 sentences a 10-year-old would understand." },
    { emoji:"🔍", title:"Spot the Pattern", desc:"Look around your room and find 3 patterns in unexpected places." },
    { emoji:"🌐", title:"Rapid Fire Facts", desc:"Say 10 facts you know about any country in under 60 seconds." },
    { emoji:"🎲", title:"Story Dice", desc:"Pick 5 random nouns around you and build a coherent story using all 5." },
  ]
};

const COLORS = {
  solo:     "#f9c74f",
  social:   "#43d98c",
  creative: "#f85c8a",
  physical: "#ff9f43",
  mental:   "#5c6ef8",
};

const SEGMENTS = [
  { cat:"solo",     label:"🎮 Solo" },
  { cat:"creative", label:"🎨 Create" },
  { cat:"physical", label:"💪 Move" },
  { cat:"social",   label:"🤝 Social" },
  { cat:"mental",   label:"🧠 Think" },
  { cat:"solo",     label:"🎮 Solo" },
  { cat:"creative", label:"🎨 Create" },
  { cat:"physical", label:"💪 Move" },
  { cat:"social",   label:"🤝 Social" },
  { cat:"mental",   label:"🧠 Think" },
];

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const R = 190;

let rotation = 0;
let spinning = false;
let activeFilter = "all";
let stats = JSON.parse(localStorage.getItem("vc_stats") || '{"accepted":0,"skipped":0,"spins":0}');
let history = JSON.parse(localStorage.getItem("vc_history") || "[]");
let currentChallenge = null;

function drawWheel(rot) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const n = SEGMENTS.length;
  const angle = (Math.PI * 2) / n;

  SEGMENTS.forEach((seg, i) => {
    const start = rot + i * angle;
    const end = start + angle;
    const color = COLORS[seg.cat];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = color + (i % 2 === 0 ? "cc" : "99");
    ctx.fill();
    ctx.strokeStyle = "#08080f";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Syne, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(seg.label, R - 14, 5);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#08080f";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 14px Space Mono";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GO", cx, cy);
}

drawWheel(0);

function getCategories() {
  if (activeFilter === "all") return Object.keys(CHALLENGES);
  return [activeFilter];
}

function getRandomChallenge() {
  const cats = getCategories();
  const cat = cats[Math.floor(Math.random() * cats.length)];
  const list = CHALLENGES[cat];
  const ch = list[Math.floor(Math.random() * list.length)];
  return { ...ch, cat };
}

function spin() {
  if (spinning) return;
  spinning = true;

  const spinBtn = document.getElementById("spinBtn");
  spinBtn.classList.add("spinning");

  const extraSpins = (5 + Math.floor(Math.random() * 5)) * Math.PI * 2;
  const targetRot = rotation + extraSpins + Math.random() * Math.PI * 2;
  const duration = 3000 + Math.random() * 1000;
  const start = performance.now();
  const startRot = rotation;

  function ease(t) {
    return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  }

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    rotation = startRot + (targetRot - startRot) * ease(progress);
    drawWheel(rotation);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      spinning = false;
      spinBtn.classList.remove("spinning");
      stats.spins++;
      saveStats();
      showResult();
    }
  }

  requestAnimationFrame(frame);
}

function showResult() {
  currentChallenge = getRandomChallenge();
  const cat = currentChallenge.cat;

  document.getElementById("resultPlaceholder").classList.add("hidden");
  const content = document.getElementById("resultContent");
  content.classList.remove("hidden");

  document.getElementById("resultCategory").textContent = cat.toUpperCase() + " CHALLENGE";
  document.getElementById("resultCategory").style.color = COLORS[cat];
  document.getElementById("resultEmoji").textContent = currentChallenge.emoji;
  document.getElementById("resultTitle").textContent = currentChallenge.title;
  document.getElementById("resultDesc").textContent = currentChallenge.desc;

  const box = document.getElementById("resultBox");
  box.style.borderColor = COLORS[cat];

  document.getElementById("resultEmoji").style.animation = "none";
  requestAnimationFrame(() => {
    document.getElementById("resultEmoji").style.animation = "popIn .4s cubic-bezier(.34,1.56,.64,1) both";
  });

  updateStats();
}

document.getElementById("spinBtn").addEventListener("click", spin);
canvas.addEventListener("click", spin);

document.getElementById("acceptBtn").addEventListener("click", () => {
  if (!currentChallenge) return;
  stats.accepted++;
  addToHistory(currentChallenge, "accepted");
  saveStats();
  updateStats();
  launchConfetti();
  currentChallenge = null;
  spin();
});

document.getElementById("skipBtn").addEventListener("click", () => {
  if (!currentChallenge) return;
  stats.skipped++;
  addToHistory(currentChallenge, "skipped");
  saveStats();
  updateStats();
  currentChallenge = null;
  spin();
});

function addToHistory(ch, status) {
  history.unshift({ title: ch.title, cat: ch.cat, status });
  if (history.length > 8) history.pop();
  localStorage.setItem("vc_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  if (history.length === 0) {
    list.innerHTML = `<div style="color:var(--muted);font-size:13px;font-style:italic;padding:8px 0">No challenges yet. Spin!</div>`;
    return;
  }
  history.forEach(h => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-dot" style="background:${COLORS[h.cat]}"></div>
      <div class="history-text">${h.title}</div>
      <div class="history-status ${h.status}">${h.status === "accepted" ? "✓" : "✕"}</div>
    `;
    list.appendChild(item);
  });
}

function saveStats() {
  localStorage.setItem("vc_stats", JSON.stringify(stats));
}

function updateStats() {
  document.getElementById("acceptCount").textContent = stats.accepted;
  document.getElementById("skipCount").textContent = stats.skipped;
  document.getElementById("spinCount").textContent = stats.spins;
}

function launchConfetti() {
  const wrap = document.getElementById("confettiWrap");
  const colors = ["#f85c8a","#5c6ef8","#f9c74f","#43d98c","#ff9f43","#c77dff"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.cssText = `
      left:${Math.random() * 100}vw;
      top:${-10 + Math.random() * -20}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${6 + Math.random() * 8}px;
      height:${6 + Math.random() * 8}px;
      animation-duration:${1.5 + Math.random() * 1.5}s;
      animation-delay:${Math.random() * .5}s;
      transform:rotate(${Math.random() * 360}deg);
    `;
    wrap.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.cat;
  });
});

updateStats();
renderHistory();
