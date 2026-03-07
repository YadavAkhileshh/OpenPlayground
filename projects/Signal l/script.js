const EMPTY = 'empty';
const STRAIGHT = 'straight';
const CORNER = 'corner';
const T_PIPE = 'tpipe';
const CROSS = 'cross';
const SOURCE = 'source';
const RECEIVER = 'receiver';

const DIRS = ['N','E','S','W'];
const OPPOSITE = { N:'S', S:'N', E:'W', W:'E' };
const DIR_DELTA = { N:[-1,0], S:[1,0], E:[0,1], W:[0,-1] };

function rotateConns(conns, rot) {
  return conns.map(d => DIRS[(DIRS.indexOf(d) + rot) % 4]);
}

const PIPE_CONNECTIONS = {
  [STRAIGHT]: (r) => rotateConns(['N','S'], r),
  [CORNER]:   (r) => rotateConns(['N','E'], r),
  [T_PIPE]:   (r) => rotateConns(['N','E','S'], r),
  [CROSS]:    ()  => ['N','E','S','W'],
  [SOURCE]:   ()  => ['N','E','S','W'],
  [RECEIVER]: ()  => ['N','E','S','W'],
  [EMPTY]:    ()  => [],
};

const LEVELS = [
  { size: 4, pipes: 5 },
  { size: 4, pipes: 7 },
  { size: 5, pipes: 8 },
  { size: 5, pipes: 10 },
  { size: 5, pipes: 12 },
  { size: 6, pipes: 13 },
  { size: 6, pipes: 15 },
  { size: 6, pipes: 18 },
  { size: 7, pipes: 20 },
  { size: 7, pipes: 24 },
];

let state = { level:0, grid:[], size:4, moves:0, solved:false, source:null, receiver:null };

const boardEl    = document.getElementById('board');
const boardWrap  = document.getElementById('boardWrap');
const levelNum   = document.getElementById('levelNum');
const movesDisp  = document.getElementById('movesDisplay');
const statusMsg  = document.getElementById('statusMsg');
const overlay    = document.getElementById('overlay');
const overlayG   = document.getElementById('overlayGlitch');
const overlaySub = document.getElementById('overlaySub');
const overlayBtn = document.getElementById('overlayBtn');
const sparkCanvas= document.getElementById('sparkCanvas');
const ctx        = sparkCanvas.getContext('2d');

function buildSVG(type, rotation) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox','0 0 56 56');
  svg.style.transform = `rotate(${rotation*90}deg)`;
  svg.style.transition = 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)';

  const G = '#00ff41', O = '#ff6a00', B = '#00cfff', DIM = '#1a3a20';
  const mid = 28;

  function ln(x1,y1,x2,y2,col,w=3.5) {
    const l = document.createElementNS(ns,'line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1);
    l.setAttribute('x2',x2); l.setAttribute('y2',y2);
    l.setAttribute('stroke',col); l.setAttribute('stroke-width',w);
    l.setAttribute('stroke-linecap','round');
    l.classList.add('pipe');
    svg.appendChild(l); return l;
  }
  function ci(cx,cy,r,col,fill='none',sw=2.5) {
    const c = document.createElementNS(ns,'circle');
    c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',r);
    c.setAttribute('stroke',col); c.setAttribute('stroke-width',sw);
    c.setAttribute('fill',fill);
    svg.appendChild(c); return c;
  }
  function rc(x,y,w,h,col,fill='none') {
    const r = document.createElementNS(ns,'rect');
    r.setAttribute('x',x); r.setAttribute('y',y);
    r.setAttribute('width',w); r.setAttribute('height',h);
    r.setAttribute('stroke',col); r.setAttribute('stroke-width',2.5);
    r.setAttribute('fill',fill); r.setAttribute('rx',3);
    svg.appendChild(r); return r;
  }

  if (type === STRAIGHT) {
    ln(mid,0,mid,56,G); ci(mid,mid,3.5,G,G);
  } else if (type === CORNER) {
    ln(mid,0,mid,mid,G); ln(mid,mid,56,mid,G); ci(mid,mid,5,G,'#021408');
  } else if (type === T_PIPE) {
    ln(mid,0,mid,56,G); ln(mid,mid,56,mid,G); ci(mid,mid,5,G,'#021408');
  } else if (type === CROSS) {
    ln(mid,0,mid,56,G); ln(0,mid,56,mid,G); ci(mid,mid,6,G,'#021408');
  } else if (type === SOURCE) {
    rc(13,13,30,30,O,'rgba(255,106,0,0.12)');
    const inn = document.createElementNS(ns,'rect');
    inn.setAttribute('x',21); inn.setAttribute('y',21);
    inn.setAttribute('width',14); inn.setAttribute('height',14);
    inn.setAttribute('fill',O); inn.setAttribute('rx',2);
    svg.appendChild(inn);
    ln(mid,0,mid,13,G); ln(mid,43,mid,56,G);
    ln(0,mid,13,mid,G); ln(43,mid,56,mid,G);
  } else if (type === RECEIVER) {
    ci(mid,mid,19,B); ci(mid,mid,11,B);
    ci(mid,mid,4,B,B);
    ln(mid,0,mid,9,G); ln(mid,47,mid,56,G);
    ln(0,mid,9,mid,G); ln(47,mid,56,mid,G);
  } else {
    const d = rc(17,17,22,22,DIM);
    d.setAttribute('stroke-dasharray','3 3');
  }
  return svg;
}

function generateLevel(lvl) {
  const cfg = LEVELS[Math.min(lvl, LEVELS.length-1)];
  const size = cfg.size;

  const grid = Array.from({length:size}, () =>
    Array.from({length:size}, () => ({type:EMPTY, rotation:0, powered:false, solutionRotation:0}))
  );

  function valid(r,c) { return r>=0&&r<size&&c>=0&&c<size; }
  function neighbors(r,c) {
    return DIRS.map(d => {
      const [dr,dc] = DIR_DELTA[d];
      return {r:r+dr, c:c+dc, dir:d};
    }).filter(n => valid(n.r,n.c));
  }

  let path=[], visited=new Set();
  let sr = Math.floor(Math.random()*size), sc=0;
  path.push([sr,sc]); visited.add(`${sr},${sc}`);
  let att=0;

  while (path.length < Math.min(cfg.pipes, size*size-1) && att<1000) {
    att++;
    const [cr,cc] = path[path.length-1];
    const nb = neighbors(cr,cc).filter(n=>!visited.has(`${n.r},${n.c}`));
    if (!nb.length) { if(path.length>1) path.pop(); continue; }
    const nx = nb[Math.floor(Math.random()*nb.length)];
    path.push([nx.r,nx.c]); visited.add(`${nx.r},${nx.c}`);
  }

  if (path.length < 3) return generateLevel(lvl);

  const source   = path[0];
  const receiver = path[path.length-1];

  for (let i=0; i<path.length; i++) {
    const [r,c] = path[i];
    const prev = i>0 ? path[i-1] : null;
    const next = i<path.length-1 ? path[i+1] : null;

    let conns = [];
    if (prev) {
      const [dr,dc] = [prev[0]-r, prev[1]-c];
      conns.push(dr===-1?'N': dr===1?'S': dc===-1?'W':'E');
    }
    if (next) {
      const [dr,dc] = [next[0]-r, next[1]-c];
      conns.push(dr===-1?'N': dr===1?'S': dc===-1?'W':'E');
    }

    let type=EMPTY, rotation=0;
    if (i===0) { type=SOURCE; }
    else if (i===path.length-1) { type=RECEIVER; }
    else {
      const s = new Set(conns);
      if ((s.has('N')&&s.has('S'))||(s.has('E')&&s.has('W'))) {
        type=STRAIGHT; rotation=s.has('E')?1:0;
      } else {
        type=CORNER;
        if      (s.has('N')&&s.has('E')) rotation=0;
        else if (s.has('E')&&s.has('S')) rotation=1;
        else if (s.has('S')&&s.has('W')) rotation=2;
        else                              rotation=3;
      }
    }
    grid[r][c] = {type, rotation, powered:false, solutionRotation:rotation};
  }

  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    const cell = grid[r][c];
    if (cell.type!==EMPTY && cell.type!==SOURCE && cell.type!==RECEIVER) {
      const add = Math.floor(Math.random()*3)+1;
      cell.rotation = (cell.rotation + add) % 4;
    }
  }

  return {grid, size, source, receiver};
}

function checkConnected(grid, size, source, receiver) {
  const powered = new Set();
  const queue = [`${source[0]},${source[1]}`];
  powered.add(queue[0]);

  while (queue.length) {
    const [r,c] = queue.shift().split(',').map(Number);
    const conns = PIPE_CONNECTIONS[grid[r][c].type](grid[r][c].rotation);
    for (const dir of conns) {
      const [dr,dc] = DIR_DELTA[dir];
      const nr=r+dr, nc=c+dc;
      if (nr<0||nr>=size||nc<0||nc>=size) continue;
      const nkey = `${nr},${nc}`;
      if (powered.has(nkey)) continue;
      const nconns = PIPE_CONNECTIONS[grid[nr][nc].type](grid[nr][nc].rotation);
      if (nconns.includes(OPPOSITE[dir])) { powered.add(nkey); queue.push(nkey); }
    }
  }
  return { powered, solved: powered.has(`${receiver[0]},${receiver[1]}`) };
}

function getTileSize() {
  const avail = Math.min(
    window.innerWidth  * 0.92,
    window.innerHeight * 0.62
  );
  return Math.floor(Math.min(78, avail / state.size));
}

function renderBoard() {
  const {grid, size} = state;
  const ts = getTileSize();

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${size},${ts}px)`;

  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    const cell = grid[r][c];
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.width  = ts+'px';
    tile.style.height = ts+'px';
    if (cell.type===SOURCE)   tile.classList.add('source');
    if (cell.type===RECEIVER) tile.classList.add('receiver');
    if (cell.powered)         tile.classList.add('powered');

    const flow = document.createElement('div');
    flow.className='power-flow'; tile.appendChild(flow);

    const svg = buildSVG(cell.type, cell.rotation);
    svg.style.width  = (ts-12)+'px';
    svg.style.height = (ts-12)+'px';
    tile.appendChild(svg);

    if (cell.type!==SOURCE && cell.type!==RECEIVER && cell.type!==EMPTY) {
      tile.addEventListener('click', ()=>rotateTile(r,c));
    }
    boardEl.appendChild(tile);
  }

  requestAnimationFrame(() => {
    sparkCanvas.width  = boardEl.offsetWidth;
    sparkCanvas.height = boardEl.offsetHeight;
  });
}

function rotateTile(r,c) {
  if (state.solved) return;
  const cell = state.grid[r][c];
  cell.rotation = (cell.rotation+1)%4;
  state.moves++;
  movesDisp.textContent = state.moves;

  const tile = boardEl.children[r*state.size+c];
  const svg  = tile.querySelector('svg');
  if (svg) svg.style.transform = `rotate(${cell.rotation*90}deg)`;

  updatePower();
}

function updatePower() {
  const {grid, size, source, receiver} = state;
  const {powered, solved} = checkConnected(grid, size, source, receiver);

  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    const key=`${r},${c}`;
    grid[r][c].powered = powered.has(key);
    const tile = boardEl.children[r*size+c];
    if (tile) tile.classList.toggle('powered', grid[r][c].powered);
  }

  if (solved && !state.solved) {
    state.solved = true;
    spawnSparks();
    setTimeout(showWin, 900);
  }
}

function showWin() {
  const isLast = state.level >= LEVELS.length-1;
  overlayG.textContent   = isLast ? 'ALL CLEAR' : 'SIGNAL LOCKED';
  overlaySub.textContent = isLast
    ? `All ${LEVELS.length} levels cleared in ${state.moves} moves!`
    : `Path connected in ${state.moves} moves`;
  overlayBtn.textContent = isLast ? '↺ PLAY AGAIN' : 'NEXT LEVEL →';
  overlay.classList.add('show');
}

function spawnSparks() {
  const rr=state.receiver[0], rc=state.receiver[1];
  const ts = sparkCanvas.width / state.size;
  const cx = rc*ts + ts/2;
  const cy = rr*ts + ts/2;

  const sparks = Array.from({length:40}, ()=>({
    x:cx, y:cy,
    vx:(Math.random()-0.5)*10,
    vy:(Math.random()-0.5)*10,
    life:1+Math.random()*0.3,
    sz:Math.random()*3+1,
    col:Math.random()>0.5?'#00ff41':'#00cfff',
  }));

  function frame() {
    ctx.clearRect(0,0,sparkCanvas.width,sparkCanvas.height);
    let any=false;
    for (const s of sparks) {
      if (s.life<=0) continue;
      any=true;
      s.x+=s.vx; s.y+=s.vy; s.vy+=0.2; s.life-=0.025;
      ctx.globalAlpha = Math.max(0,s.life);
      ctx.fillStyle   = s.col;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = s.col;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.sz,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1; ctx.shadowBlur=0;
    if (any) requestAnimationFrame(frame);
    else ctx.clearRect(0,0,sparkCanvas.width,sparkCanvas.height);
  }
  frame();
}

function loadLevel(lvl) {
  state.level  = lvl;
  state.moves  = 0;
  state.solved = false;
  movesDisp.textContent = '0';
  levelNum.textContent  = String(lvl+1).padStart(2,'0');
  statusMsg.textContent = 'ROUTE THE SIGNAL TO THE RECEIVER';

  const {grid,size,source,receiver} = generateLevel(lvl);
  state.grid=grid; state.size=size;
  state.source=source; state.receiver=receiver;

  renderBoard();
  updatePower();
  ctx.clearRect(0,0,sparkCanvas.width,sparkCanvas.height);
}

document.getElementById('btnReset').addEventListener('click', ()=>{
  overlay.classList.remove('show');
  loadLevel(state.level);
});

document.getElementById('btnHint').addEventListener('click', ()=>{
  const {grid,size} = state;
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    const cell=grid[r][c];
    if (!cell.powered && cell.type!==EMPTY && cell.type!==SOURCE && cell.type!==RECEIVER) {
      if (cell.rotation !== cell.solutionRotation) {
        const tile = boardEl.children[r*size+c];
        tile.classList.add('hint-flash');
        setTimeout(()=>tile.classList.remove('hint-flash'),500);
        statusMsg.textContent='MISALIGNED TILE HIGHLIGHTED';
        return;
      }
    }
  }
  statusMsg.textContent='ALL VISIBLE TILES LOOK ALIGNED';
});

overlayBtn.addEventListener('click', ()=>{
  overlay.classList.remove('show');
  loadLevel(state.level >= LEVELS.length-1 ? 0 : state.level+1);
});

window.addEventListener('resize', ()=>{ renderBoard(); updatePower(); });

loadLevel(0);
