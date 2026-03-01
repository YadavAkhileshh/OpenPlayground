const piano = document.getElementById("piano");
const visualizer = document.getElementById("visualizer");

/* Notes + frequencies */
const notes = [
  {name:"C", freq:261.63, color:"#ef4444"},
  {name:"D", freq:293.66, color:"#f97316"},
  {name:"E", freq:329.63, color:"#eab308"},
  {name:"F", freq:349.23, color:"#22c55e"},
  {name:"G", freq:392.00, color:"#06b6d4"},
  {name:"A", freq:440.00, color:"#3b82f6"},
  {name:"B", freq:493.88, color:"#a855f7"}
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* Create piano keys */
notes.forEach(note=>{
  const key=document.createElement("div");
  key.className="key";
  key.textContent=note.name;

  key.addEventListener("mousedown",()=>playNote(note,key));
  piano.appendChild(key);
});

/* Play sound */
function playNote(note,key){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = note.freq;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.3,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + 0.6
  );

  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);

  key.classList.add("active");
  setTimeout(()=>key.classList.remove("active"),120);

  createColorBurst(note.color);
}

/* Color visualization */
function createColorBurst(color){
  const burst=document.createElement("div");
  burst.className="burst";
  burst.style.background=color;

  burst.style.left=Math.random()*window.innerWidth+"px";
  burst.style.top=Math.random()*window.innerHeight+"px";

  visualizer.appendChild(burst);

  setTimeout(()=>burst.remove(),1000);
}

/* Keyboard support */
document.addEventListener("keydown",e=>{
  const map={
    a:0,s:1,d:2,f:3,g:4,h:5,j:6
  };
  if(map[e.key]!==undefined){
    const index=map[e.key];
    playNote(notes[index],piano.children[index]);
  }
});