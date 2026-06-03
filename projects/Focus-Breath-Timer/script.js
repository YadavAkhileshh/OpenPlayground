const sc=document.getElementById('stars'),ctx=sc.getContext('2d');
let stars=[];
function initStars(){
  sc.width=window.innerWidth;sc.height=window.innerHeight;
  stars=Array.from({length:120},()=>({x:Math.random()*sc.width,y:Math.random()*sc.height,r:Math.random()*.9+.2,a:Math.random(),da:(Math.random()-.5)*.003}));
}
function drawStars(){
  ctx.clearRect(0,0,sc.width,sc.height);
  stars.forEach(s=>{
    s.a=Math.max(.05,Math.min(1,s.a+s.da));
    if(s.a<=.05||s.a>=1)s.da*=-1;
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(220,230,255,${s.a})`;ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
initStars();drawStars();
window.addEventListener('resize',initStars);

const PATTERNS={
  '478':{inhale:4,holdIn:7,exhale:8,holdOut:0},
  'box':{inhale:4,holdIn:4,exhale:4,holdOut:4},
  'calm':{inhale:4,holdIn:0,exhale:6,holdOut:2},
  'energize':{inhale:6,holdIn:0,exhale:2,holdOut:0},
  'custom':{inhale:4,holdIn:4,exhale:4,holdOut:4}
};
let currentPattern={...PATTERNS['478']};

function selectPattern(el,key){
  document.querySelectorAll('.pat-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const wrap=document.getElementById('custom-wrap');
  if(key==='custom'){wrap.classList.add('show');updateCustom();}
  else{wrap.classList.remove('show');currentPattern={...PATTERNS[key]};}
  if(running)resetSession();
}
function updateCustom(){
  const i=+document.getElementById('s-inhale').value;
  const hi=+document.getElementById('s-holdin').value;
  const e=+document.getElementById('s-exhale').value;
  const ho=+document.getElementById('s-holdout').value;
  document.getElementById('v-inhale').textContent=i;
  document.getElementById('v-holdin').textContent=hi;
  document.getElementById('v-exhale').textContent=e;
  document.getElementById('v-holdout').textContent=ho;
  currentPattern={inhale:i,holdIn:hi,exhale:e,holdOut:ho};
}

let running=false,raf=null,phaseIndex=0,phaseElapsed=0,cycleCount=0,totalElapsed=0,lastTs=null;
const PHASE_NAMES=['Inhale','Hold','Exhale','Hold'];
const PHASE_KEYS=['inhale','holdIn','exhale','holdOut'];
const orbEl=document.getElementById('orb');
const phaseEl=document.getElementById('phase-text');
const arcEl=document.getElementById('arc');
const cycleEl=document.getElementById('cycle-num');
const timeEl=document.getElementById('total-time');
const CIRC=2*Math.PI*105;
arcEl.style.strokeDasharray=CIRC;
arcEl.style.strokeDashoffset=CIRC;

function phaseDuration(idx){return(currentPattern[PHASE_KEYS[idx]]||0)*1000;}
function nextPhase(){
  let safety=4;
  do{phaseIndex=(phaseIndex+1)%4;if(phaseIndex===0)cycleCount++;safety--;}
  while(phaseDuration(phaseIndex)===0&&safety>0);
  phaseElapsed=0;
}
function applyOrbState(idx,progress){
  let scale;
  if(idx===0)scale=1+0.18*progress;
  else if(idx===1)scale=1.18;
  else if(idx===2)scale=1.18-0.18*progress;
  else scale=1.0;
  orbEl.style.transform=`scale(${scale})`;
  const isHold=idx===1||idx===3;
  arcEl.style.stroke=isHold?'var(--accent2)':'var(--accent)';
  orbEl.style.animation=isHold?'hold-pulse 2s ease-in-out infinite':'none';
}
function tick(ts){
  if(!running)return;
  if(lastTs===null)lastTs=ts;
  const dt=ts-lastTs;lastTs=ts;
  totalElapsed+=dt;phaseElapsed+=dt;
  const dur=phaseDuration(phaseIndex);
  const progress=Math.min(phaseElapsed/dur,1);
  arcEl.style.strokeDashoffset=CIRC*(1-progress);
  applyOrbState(phaseIndex,progress);
  phaseEl.textContent=PHASE_NAMES[phaseIndex];
  cycleEl.textContent=cycleCount;
  const sec=Math.floor(totalElapsed/1000);
  timeEl.textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  if(phaseElapsed>=dur)nextPhase();
  raf=requestAnimationFrame(tick);
}
function toggleSession(){
  if(running){
    running=false;lastTs=null;cancelAnimationFrame(raf);
    document.getElementById('btn-start').textContent='Resume';
    phaseEl.textContent='Paused';orbEl.style.animation='none';
  } else {
    running=true;
    document.getElementById('btn-start').textContent='Pause';
    raf=requestAnimationFrame(tick);
  }
}
function resetSession(){
  running=false;lastTs=null;cancelAnimationFrame(raf);
  phaseIndex=0;phaseElapsed=0;cycleCount=0;totalElapsed=0;
  orbEl.style.transform='scale(1)';orbEl.style.animation='none';
  arcEl.style.strokeDashoffset=CIRC;arcEl.style.stroke='var(--accent)';
  phaseEl.textContent='Ready';cycleEl.textContent='0';timeEl.textContent='0:00';
  document.getElementById('btn-start').textContent='Start';
}