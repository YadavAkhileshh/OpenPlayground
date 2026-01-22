// default mappings
const DEFAULTS = {
  KeyA: {type:'tone', opts:{freq:440}},
  KeyB: {type:'bg', opts:{}},
  KeyC: {type:'confetti', opts:{}},
  KeyD: {type:'alert', opts:{text:'Hey! You pressed D'}},
  KeyE: {type:'toggle', opts:{}}
};

let mappings = loadMappings();
const listEl = document.getElementById('mappingsList');
const status = document.getElementById('status');
const bgLabel = document.getElementById('bgLabel');
const soundLabel = document.getElementById('soundLabel');
const assignBtn = document.getElementById('assignBtn');
const assignState = {awaiting:false, action:null};
const currentAssign = document.getElementById('currentAssign');
const confettiCanvas = document.getElementById('confetti');

// WebAudio setup
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioCtx ? new AudioCtx() : null;

function loadMappings(){
  try{
    const s = localStorage.getItem('kb-mappings');
    return s?JSON.parse(s):structuredClone(DEFAULTS);
  }catch(e){return structuredClone(DEFAULTS)}
}

function saveMappings(){
  localStorage.setItem('kb-mappings', JSON.stringify(mappings));
}

function renderMappings(){
  listEl.innerHTML='';
  Object.entries(mappings).forEach(([code,desc])=>{
    const li = document.createElement('li'); 
    li.className='mapping';
    const left = document.createElement('div'); 
    left.style.display='flex'; 
    left.style.gap='8px'; 
    left.style.alignItems='center';
    const key = document.createElement('div'); 
    key.className='key'; 
    key.textContent=code.replace('Key','').replace('Digit','');
    const action = document.createElement('div'); 
    action.innerHTML=`<div class="action">${desc.type}${desc.opts && desc.opts.freq? ' — '+desc.opts.freq+'Hz' : ''}</div>`;
    left.appendChild(key); 
    left.appendChild(action);
    const right = document.createElement('div');
    const btnEdit = document.createElement('button'); 
    btnEdit.className='btn'; 
    btnEdit.textContent='Edit';
    btnEdit.onclick = ()=>editMapping(code);
    const btnDel = document.createElement('button'); 
    btnDel.className='btn'; 
    btnDel.textContent='Delete';
    btnDel.onclick = ()=>{delete mappings[code]; saveMappings(); renderMappings();}
    right.appendChild(btnEdit); 
    right.appendChild(btnDel);
    li.appendChild(left); 
    li.appendChild(right);
    listEl.appendChild(li);
  })
}

function editMapping(code){
  const m = mappings[code];
  const newType = prompt('Change action type (tone/bg/confetti/alert/toggle):', m.type);
  if(!newType) return;
  const newOpts = {...m.opts};
  if(newType === 'tone'){
    const f = prompt('Frequency in Hz:', m.opts.freq||440);
    newOpts.freq = Number(f)||440;
  } else if(newType === 'alert'){
    newOpts.text = prompt('Alert text:', m.opts.text||'Hello!');
  }
  mappings[code] = {type:newType, opts:newOpts}; 
  saveMappings(); 
  renderMappings();
}

function assignNewKey(actionType){
  assignState.awaiting = true; 
  assignState.action = actionType; 
  currentAssign.textContent='Press a key to assign...'; 
  assignBtn.classList.add('recording');
}

assignBtn.onclick = ()=>{
  const act = document.getElementById('actionSelect').value; 
  assignNewKey(act);
}

document.addEventListener('keydown', (e)=>{
  // if assign mode, capture and store mapping
  if(assignState.awaiting){
    e.preventDefault();
    const code = e.code;
    const type = assignState.action;
    const opts = (type==='tone')?{freq:440}:(type==='alert')?{text:'Custom alert'}:{};
    mappings[code]= {type, opts}; 
    saveMappings(); 
    renderMappings();
    assignState.awaiting=false; 
    currentAssign.textContent='Assigned '+code; 
    assignBtn.classList.remove('recording');
    setTimeout(()=>currentAssign.textContent='Press "Assign" then a key',1500);
    return;
  }

  // normal mode: run mapped action
  const code = e.code;
  if(mappings[code]){
    e.preventDefault(); 
    
    // Add visual feedback to the corresponding key element
    const keyElements = document.querySelectorAll('.key');
    keyElements.forEach(el => {
      if (el.textContent === code.replace('Key','').replace('Digit','')) {
        el.classList.add('active');
        setTimeout(() => {
          el.classList.remove('active');
        }, 300);
      }
    });
    
    runAction(mappings[code]);
  }
});

function runAction(mapping){
  status.textContent = `Triggered: ${mapping.type}`;
  
  // Add visual feedback to the status indicator
  status.classList.add('active');
  setTimeout(() => {
    status.classList.remove('active');
  }, 1000);
  
  if(mapping.type === 'tone') playTone(mapping.opts.freq||440);
  if(mapping.type === 'bg') randomBackground();
  if(mapping.type === 'confetti') launchConfetti();
  if(mapping.type === 'alert') showToast(mapping.opts.text||'Hello!');
  if(mapping.type === 'toggle') document.body.classList.toggle('inverted');
  
  // Update preview labels with visual feedback
  const wasInverted = bgLabel.textContent !== (document.body.classList.contains('inverted') ? 'Inverted' : 'Default'); 
  bgLabel.textContent = document.body.classList.contains('inverted') ? 'Inverted' : 'Default';
  
  const wasSoundChanged = soundLabel.textContent !== (mapping.type==='tone' ? (mapping.opts.freq||440)+'Hz' : 'Silent');
  soundLabel.textContent = mapping.type==='tone' ? (mapping.opts.freq||440)+'Hz' : 'Silent';
  
  // Add visual feedback for changes
  if (wasInverted) {
    bgLabel.classList.add('changed');
    setTimeout(() => bgLabel.classList.remove('changed'), 1000);
  }
  
  if (wasSoundChanged) {
    soundLabel.classList.add('changed');
    setTimeout(() => soundLabel.classList.remove('changed'), 1000);
  }
  
  // Note: Visual feedback for keys is handled in the keydown listener
}

function playTone(freq){
  if(!audioCtx) return showToast('Audio not supported');
  const o = audioCtx.createOscillator(); 
  const g = audioCtx.createGain();
  o.type='sine'; 
  o.frequency.value = freq; 
  g.gain.value = 0.001;
  o.connect(g); 
  g.connect(audioCtx.destination);
  g.gain.setTargetAtTime(0.15, audioCtx.currentTime, 0.01);
  o.start();
  setTimeout(()=>{
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    setTimeout(()=>o.stop(),600);
  },120);
}

// simple random background
function randomBackground(){
  const h = Math.floor(Math.random()*360);
  document.body.style.background = `linear-gradient(180deg,hsl(${h} 70% 10%), hsl(${(h+20)%360} 60% 6%))`;
}

// toast implementation
let toastTimer = null;
function showToast(msg){
  clearTimeout(toastTimer);
  let t = document.querySelector('.toast');
  if(!t){ 
    t = document.createElement('div'); 
    t.className='toast'; 
    document.body.appendChild(t);
  } 
  t.textContent = msg; 
  t.style.opacity = 1;
  toastTimer = setTimeout(()=>{ 
    if(t) t.style.opacity = 0; 
  }, 1800);
}

// simple confetti
function launchConfetti(){
  const w = confettiCanvas.width = innerWidth; 
  const h = confettiCanvas.height = innerHeight; 
  const ctx = confettiCanvas.getContext('2d');
  const pieces = Array.from({length:80}).map(()=>({
    x:Math.random()*w,
    y:Math.random()*h- h, 
    vx:(Math.random()-0.5)*6, 
    vy:Math.random()*6+2, 
    r:Math.random()*6+4, 
    c:['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93'][Math.floor(Math.random()*5)] 
  }));
  let frame=0; 
  function draw(){ 
    ctx.clearRect(0,0,w,h); 
    pieces.forEach(p=>{ 
      p.x+=p.vx; 
      p.y+=p.vy; 
      p.vy+=0.12; 
      ctx.save(); 
      ctx.translate(p.x,p.y); 
      ctx.rotate(frame*0.02); 
      ctx.fillStyle=p.c; 
      ctx.fillRect(-p.r/2,-p.r/2,p.r, p.r*0.6); 
      ctx.restore(); 
    }); 
    frame++; 
    if(frame<200){ 
      requestAnimationFrame(draw);
    } 
  }
  draw();
}

// controls: reset and export
document.getElementById('resetBtn').onclick = ()=>{ 
  if(confirm('Reset mappings to defaults?')){ 
    mappings=structuredClone(DEFAULTS); 
    saveMappings(); 
    renderMappings(); 
    showToast('Reset'); 
  }
}

document.getElementById('exportBtn').onclick = ()=>{ 
  const data = JSON.stringify(mappings, null, 2); 
  const blob = new Blob([data], {type:'application/json'}); 
  const url = URL.createObjectURL(blob); 
  const a = document.createElement('a'); 
  a.href=url; 
  a.download='kb-mappings.json'; 
  a.click(); 
  URL.revokeObjectURL(url); 
}

// initial render
renderMappings();

// expose for console tinkering
window.kb = {mappings, saveMappings, loadMappings, runAction};