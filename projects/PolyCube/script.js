/* ================================================================
   CUBE·MIND — Full Rubik's Cube Simulator & LBL Solver
   Responsive rebuild — clean engine with improved visual layer
================================================================ */

// ── CONSTANTS ────────────────────────────────────────────────────
const F_U = 0,
  F_D = 1,
  F_F = 2,
  F_B = 3,
  F_L = 4,
  F_R = 5;
const FACE_NAMES = ["U", "D", "F", "B", "L", "R"];

// ── STATE ─────────────────────────────────────────────────────────
let cubeState = solvedState();
let moveHistory = []; // [{move, snapshot}]
let histPtr = -1;
let solution = []; // [{move, phase, desc}]
let solPtr = 0;
let totalMoves = 0;
let autoTimer = null;
let autoPlaying = false;
let isAnimating = false;
let moveSpeed = 450;
let activeTab = "controls";

// drag rotation state
let dragActive = false,
  dragX = 0,
  dragY = 0,
  rotX = -26,
  rotY = 34;

// ── CUBE STATE FUNCTIONS ──────────────────────────────────────────
function solvedState() {
  return ["W", "Y", "G", "B", "O", "R"].map((c) => Array(9).fill(c));
}
function copyState(s) {
  return s.map((f) => [...f]);
}
function isSolved(s) {
  return s.every((f) => f.every((c) => c === f[0]));
}

function rotateCW(f) {
  return [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]];
}
function rotateCCW(f) {
  return [f[2], f[5], f[8], f[1], f[4], f[7], f[0], f[3], f[6]];
}
function rotate180(f) {
  return [f[8], f[7], f[6], f[5], f[4], f[3], f[2], f[1], f[0]];
}

// ── MOVE ENGINE ───────────────────────────────────────────────────
function applyMove(state, move) {
  const s = copyState(state);
  const base = move.replace(/[2']/g, "");
  const rev = move.includes("'");
  const dbl = move.includes("2");
  const n = dbl ? 2 : 1;

  for (let t = 0; t < n; t++) {
    // Rotate the face itself
    const rotateFace = (fi) => {
      s[fi] = rev ? rotateCCW(s[fi]) : rotateCW(s[fi]);
    };

    if (base === "U") {
      rotateFace(F_U);
      cycleRows(
        s,
        rev,
        [F_F, [0, 1, 2]],
        [F_R, [0, 1, 2]],
        [F_B, [0, 1, 2]],
        [F_L, [0, 1, 2]]
      );
    } else if (base === "D") {
      rotateFace(F_D);
      cycleRows(
        s,
        !rev,
        [F_F, [6, 7, 8]],
        [F_R, [6, 7, 8]],
        [F_B, [6, 7, 8]],
        [F_L, [6, 7, 8]]
      );
    } else if (base === "F") {
      rotateFace(F_F);
      const uRow = [s[F_U][6], s[F_U][7], s[F_U][8]];
      const rCol = [s[F_R][0], s[F_R][3], s[F_R][6]];
      const dRow = [s[F_D][0], s[F_D][1], s[F_D][2]];
      const lCol = [s[F_L][2], s[F_L][5], s[F_L][8]];
      if (!rev) {
        setArr(s[F_U], [6, 7, 8], [...lCol].reverse());
        setArr(s[F_R], [0, 3, 6], uRow);
        setArr(s[F_D], [0, 1, 2], [...rCol].reverse());
        setArr(s[F_L], [2, 5, 8], dRow);
      } else {
        setArr(s[F_U], [6, 7, 8], rCol);
        setArr(s[F_R], [0, 3, 6], [...dRow].reverse());
        setArr(s[F_D], [0, 1, 2], lCol);
        setArr(s[F_L], [2, 5, 8], [...uRow].reverse());
      }
    } else if (base === "B") {
      rotateFace(F_B);
      const uRow = [s[F_U][0], s[F_U][1], s[F_U][2]];
      const lCol = [s[F_L][0], s[F_L][3], s[F_L][6]];
      const dRow = [s[F_D][6], s[F_D][7], s[F_D][8]];
      const rCol = [s[F_R][2], s[F_R][5], s[F_R][8]];
      if (!rev) {
        setArr(s[F_U], [0, 1, 2], rCol);
        setArr(s[F_L], [0, 3, 6], [...uRow].reverse());
        setArr(s[F_D], [6, 7, 8], lCol);
        setArr(s[F_R], [2, 5, 8], [...dRow].reverse());
      } else {
        setArr(s[F_U], [0, 1, 2], [...lCol].reverse());
        setArr(s[F_L], [0, 3, 6], dRow);
        setArr(s[F_D], [6, 7, 8], [...rCol].reverse());
        setArr(s[F_R], [2, 5, 8], uRow);
      }
    } else if (base === "L") {
      rotateFace(F_L);
      const uCol = [s[F_U][0], s[F_U][3], s[F_U][6]];
      const fCol = [s[F_F][0], s[F_F][3], s[F_F][6]];
      const dCol = [s[F_D][0], s[F_D][3], s[F_D][6]];
      const bCol = [s[F_B][2], s[F_B][5], s[F_B][8]];
      if (!rev) {
        setArr(s[F_U], [0, 3, 6], [...bCol].reverse());
        setArr(s[F_F], [0, 3, 6], uCol);
        setArr(s[F_D], [0, 3, 6], fCol);
        setArr(s[F_B], [2, 5, 8], [...dCol].reverse());
      } else {
        setArr(s[F_U], [0, 3, 6], fCol);
        setArr(s[F_F], [0, 3, 6], dCol);
        setArr(s[F_D], [0, 3, 6], [...bCol].reverse());
        setArr(s[F_B], [2, 5, 8], [...uCol].reverse());
      }
    } else if (base === "R") {
      rotateFace(F_R);
      const uCol = [s[F_U][2], s[F_U][5], s[F_U][8]];
      const bCol = [s[F_B][0], s[F_B][3], s[F_B][6]];
      const dCol = [s[F_D][2], s[F_D][5], s[F_D][8]];
      const fCol = [s[F_F][2], s[F_F][5], s[F_F][8]];
      if (!rev) {
        setArr(s[F_U], [2, 5, 8], fCol);
        setArr(s[F_B], [0, 3, 6], [...uCol].reverse());
        setArr(s[F_D], [2, 5, 8], [...bCol].reverse());
        setArr(s[F_F], [2, 5, 8], dCol);
      } else {
        setArr(s[F_U], [2, 5, 8], [...bCol].reverse());
        setArr(s[F_B], [0, 3, 6], [...dCol].reverse());
        setArr(s[F_D], [2, 5, 8], fCol);
        setArr(s[F_F], [2, 5, 8], uCol);
      }
    } else if (base === "M") {
      applyMSlice(s, rev);
    }
  }
  return s;
}

function applyMSlice(s, rev) {
  const uCol = [s[F_U][1], s[F_U][4], s[F_U][7]];
  const fCol = [s[F_F][1], s[F_F][4], s[F_F][7]];
  const dCol = [s[F_D][1], s[F_D][4], s[F_D][7]];
  const bRev = [s[F_B][7], s[F_B][4], s[F_B][1]];
  if (!rev) {
    setArr(s[F_U], [1, 4, 7], bRev);
    setArr(s[F_F], [1, 4, 7], uCol);
    setArr(s[F_D], [1, 4, 7], fCol);
    setArr(s[F_B], [7, 4, 1], dCol);
  } else {
    setArr(s[F_U], [1, 4, 7], fCol);
    setArr(s[F_F], [1, 4, 7], dCol);
    setArr(s[F_D], [1, 4, 7], [...bRev].reverse());
    setArr(s[F_B], [7, 4, 1], [...uCol].reverse());
  }
}

function setArr(face, indices, values) {
  indices.forEach((i, k) => (face[i] = values[k]));
}

function cycleRows(s, rev, a, b, c, d) {
  const [fa, ia] = [a[0], a[1]],
    [fb, ib] = [b[0], b[1]],
    [fc, ic] = [c[0], c[1]],
    [fd, id] = [d[0], d[1]];
  const va = ia.map((i) => s[fa][i]),
    vb = ib.map((i) => s[fb][i]);
  const vc = ic.map((i) => s[fc][i]),
    vd = id.map((i) => s[fd][i]);
  if (!rev) {
    ia.forEach((i, k) => (s[fa][i] = vd[k]));
    ib.forEach((i, k) => (s[fb][i] = va[k]));
    ic.forEach((i, k) => (s[fc][i] = vb[k]));
    id.forEach((i, k) => (s[fd][i] = vc[k]));
  } else {
    ia.forEach((i, k) => (s[fa][i] = vb[k]));
    ib.forEach((i, k) => (s[fb][i] = vc[k]));
    ic.forEach((i, k) => (s[fc][i] = vd[k]));
    id.forEach((i, k) => (s[fd][i] = va[k]));
  }
}

function applyMoves(state, moves) {
  let s = copyState(state);
  moves.forEach((m) => {
    s = applyMove(s, m);
  });
  return s;
}

function inverseMove(m) {
  if (m.endsWith("2")) return m;
  return m.endsWith("'") ? m.slice(0, -1) : m + "'";
}

// ── LBL SOLVER ────────────────────────────────────────────────────
class LBLSolver {
  constructor(init) {
    this.st = copyState(init);
    this.sol = [];
  }

  add(move, phase, desc) {
    this.sol.push({ move, phase, desc });
    this.st = applyMove(this.st, move);
  }

  adds(moves, phase, desc) {
    moves.forEach((m) => this.add(m, phase, desc));
  }

  solve() {
    if (isSolved(this.st)) return [];
    this.phase1_cross();
    this.phase2_f2l();
    this.phase3_oll();
    this.phase4_pll();
    this.sol = optimizeSolution(this.sol);
    return this.sol;
  }

  // ── PHASE 1: WHITE CROSS ────────────────────────────────────────
  phase1_cross() {
    const targets = [
      { color: "G", face: F_F, uIdx: 7 },
      { color: "R", face: F_R, uIdx: 5 },
      { color: "B", face: F_B, uIdx: 1 },
      { color: "O", face: F_L, uIdx: 3 },
    ];
    for (let repeat = 0; repeat < 5; repeat++) {
      for (const t of targets) this.placeEdge(t.color, t.face, t.uIdx);
    }
  }

  findEdge(c1, c2) {
    const pairs = [
      [F_U, 1, F_B, 1],
      [F_U, 3, F_L, 1],
      [F_U, 5, F_R, 1],
      [F_U, 7, F_F, 1],
      [F_D, 1, F_F, 7],
      [F_D, 3, F_L, 7],
      [F_D, 5, F_R, 7],
      [F_D, 7, F_B, 7],
      [F_F, 3, F_L, 5],
      [F_F, 5, F_R, 3],
      [F_B, 3, F_R, 5],
      [F_B, 5, F_L, 3],
    ];
    for (const [f1, i1, f2, i2] of pairs) {
      const a = this.st[f1][i1],
        b = this.st[f2][i2];
      if ((a === c1 && b === c2) || (a === c2 && b === c1))
        return { f1, i1, f2, i2, a, b };
    }
    return null;
  }

  placeEdge(col, tFace, uIdx) {
    const s = this.st;
    if (s[F_U][uIdx] === "W" && s[tFace][1] === col) return;
    const e = this.findEdge("W", col);
    if (!e) return;
    const ph = "cross",
      desc = `Place white-${col} edge`;
    const fn = FACE_NAMES[tFace];
    const faceOrder = [F_F, F_R, F_B, F_L];
    const faceRot = ["U", "U'"];

    if (e.f1 === F_D || e.f2 === F_D) {
      const sideFace = e.f1 === F_D ? e.f2 : e.f1;
      const cur = faceOrder.indexOf(sideFace);
      const tar = faceOrder.indexOf(tFace);
      let diff = (tar - cur + 4) % 4;
      const dMoves =
        diff === 1 ? "D" : diff === 2 ? "D2" : diff === 3 ? "D'" : null;
      if (dMoves) this.adds(dMoves.split(" "), ph, desc);
      // insert
      const e2 = this.findEdge("W", col);
      if (e2) this.adds([fn, fn], ph, desc);
    } else if (e.f1 === F_U || e.f2 === F_U) {
      const sf = e.f1 === F_U ? e.f2 : e.f1;
      const sfn = FACE_NAMES[sf];
      this.adds([sfn, sfn], ph, desc);
      this.placeEdge(col, tFace, uIdx);
    } else {
      const sfn = FACE_NAMES[e.f1];
      this.add(sfn + "'", ph, desc);
      this.placeEdge(col, tFace, uIdx);
    }
  }

  // ── PHASE 2: F2L ────────────────────────────────────────────────
  phase2_f2l() {
    const pairs = [
      { a: "G", b: "R", fa: F_F, fb: F_R, fan: "F", fbn: "R", uCornerIdx: 8 },
      { a: "R", b: "B", fa: F_R, fb: F_B, fan: "R", fbn: "B", uCornerIdx: 2 },
      { a: "B", b: "O", fa: F_B, fb: F_L, fan: "B", fbn: "L", uCornerIdx: 0 },
      { a: "O", b: "G", fa: F_L, fb: F_F, fan: "L", fbn: "F", uCornerIdx: 6 },
    ];
    for (let p = 0; p < 4; p++) {
      for (let att = 0; att < 7; att++) {
        if (this.f2lSolved(p)) break;
        this.solveF2LPair(p, pairs[p]);
      }
    }
  }

  f2lSolved(p) {
    const s = this.st;
    const checks = [
      () =>
        s[F_F][2] === "G" &&
        s[F_R][0] === "R" &&
        s[F_U][8] === "W" &&
        s[F_F][5] === "G" &&
        s[F_R][3] === "R",
      () =>
        s[F_R][2] === "R" &&
        s[F_B][0] === "B" &&
        s[F_U][2] === "W" &&
        s[F_R][5] === "R" &&
        s[F_B][3] === "B",
      () =>
        s[F_B][2] === "B" &&
        s[F_L][0] === "O" &&
        s[F_U][0] === "W" &&
        s[F_B][5] === "B" &&
        s[F_L][3] === "O",
      () =>
        s[F_L][2] === "O" &&
        s[F_F][0] === "G" &&
        s[F_U][6] === "W" &&
        s[F_L][5] === "O" &&
        s[F_F][3] === "G",
    ];
    return checks[p]();
  }

  solveF2LPair(p, pair) {
    const ph = "f2l",
      desc = `F2L pair ${p + 1}`;
    const s = this.st,
      { fan, fbn, uCornerIdx } = pair;

    // Check if white corner is at correct U position for insertion
    if (s[F_U][uCornerIdx] === "W") {
      // Try standard insert
      const algs = [
        ["U", "R", "U'", "R'", "U'", "F'", "U", "F"],
        ["U", "B", "U'", "B'", "U'", "R'", "U", "R"],
        ["U", "L", "U'", "L'", "U'", "B'", "U", "B"],
        ["U", "F", "U'", "F'", "U'", "L'", "U", "L"],
      ];
      this.adds(algs[p], ph, desc);
    } else {
      // Extract and retry: kick corner out of slot
      this.adds([fan + "'", "U", fan], ph, desc);
    }
    // Try U rotations
    for (let u = 0; u < 4; u++) {
      if (this.f2lSolved(p)) return;
      if (u < 3) this.add("U", ph, desc);
    }
  }

  // ── PHASE 3: OLL ────────────────────────────────────────────────
  phase3_oll() {
    for (let att = 0; att < 10; att++) {
      if (this.ollDone()) return;
      this.stepOLL();
    }
  }

  ollDone() {
    return this.st[F_D].every((c) => c === "Y");
  }
  ollCross() {
    const s = this.st;
    return (
      s[F_D][1] === "Y" &&
      s[F_D][3] === "Y" &&
      s[F_D][5] === "Y" &&
      s[F_D][7] === "Y"
    );
  }

  stepOLL() {
    const s = this.st,
      ph = "oll",
      d = "OLL";
    if (!this.ollCross()) {
      const t = s[F_D][1] === "Y",
        r = s[F_D][5] === "Y",
        b = s[F_D][7] === "Y",
        l = s[F_D][3] === "Y";
      const n = [t, r, b, l].filter(Boolean).length;
      if (n === 0) {
        this.adds(["F", "R", "U", "R'", "U'", "F'"], ph, "OLL dot");
      } else if (n === 2) {
        if (l && r) {
          this.adds(["F", "R", "U", "R'", "U'", "F'"], ph, "OLL line");
        } else if (t && b) {
          this.add("U", ph, "OLL orient");
          this.adds(["F", "R", "U", "R'", "U'", "F'"], ph, "OLL line");
        } else {
          this.adds(["F", "U", "R", "U'", "R'", "F'"], ph, "OLL L");
        }
      }
    } else {
      // Corners
      const sc = [s[F_D][0], s[F_D][2], s[F_D][6], s[F_D][8]].filter(
        (c) => c === "Y"
      ).length;
      if (sc === 4) return;
      this.adds(["R", "U", "R'", "U", "R", "U2", "R'"], ph, "Sune");
      // Try a few U to find better angle
      for (let u = 0; u < 4 && !this.ollDone(); u++) {
        this.add("U", ph, "OLL align");
        this.adds(["R", "U", "R'", "U", "R", "U2", "R'"], ph, "Sune");
      }
    }
  }

  // ── PHASE 4: PLL ────────────────────────────────────────────────
  phase4_pll() {
    for (let att = 0; att < 8; att++) {
      if (isSolved(this.st)) return;
      this.stepPLL();
    }
    // Final U adjustment
    for (let u = 0; u < 4; u++) {
      if (isSolved(this.st)) return;
      this.add("U", "pll", "Final U");
    }
  }

  cornersDone() {
    const s = this.st;
    return (
      s[F_F][6] === s[F_F][8] &&
      s[F_R][6] === s[F_R][8] &&
      s[F_B][6] === s[F_B][8] &&
      s[F_L][6] === s[F_L][8]
    );
  }

  edgesDone() {
    const s = this.st;
    return [F_F, F_R, F_B, F_L].every(
      (f) => s[f][6] === s[f][7] && s[f][7] === s[f][8]
    );
  }

  stepPLL() {
    const ph = "pll";
    if (!this.cornersDone()) {
      for (let u = 0; u < 4; u++) {
        if (this.cornersDone()) return;
        this.add("U", ph, "PLL align");
      }
      this.adds(
        ["R'", "F", "R'", "B2", "R", "F'", "R'", "B2", "R2"],
        ph,
        "A-perm corners"
      );
    }
    if (!this.edgesDone()) {
      for (let u = 0; u < 4; u++) {
        if (this.edgesDone()) return;
        this.add("U", ph, "PLL align");
      }
      this.adds(["M2", "U", "M", "U2", "M'", "U", "M2"], ph, "U-perm edges");
    }
    for (let u = 0; u < 4; u++) {
      if (isSolved(this.st)) return;
      this.add("U", ph, "Final align");
    }
  }
}

// ── SOLUTION OPTIMIZATION ─────────────────────────────────────────
function optimizeSolution(steps) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i].move,
        b = steps[i + 1].move;
      const aB = a.replace(/[2']/g, ""),
        bB = b.replace(/[2']/g, "");
      if (aB !== bB) continue;
      if (a === b + "'" || b === a + "'") {
        steps.splice(i, 2);
        changed = true;
        break;
      }
      if (!a.includes("'") && !a.includes("2") && a === b) {
        steps[i] = { ...steps[i], move: aB + "2" };
        steps.splice(i + 1, 1);
        changed = true;
        break;
      }
    }
  }
  return steps;
}

// ── 3D CUBE RENDERER ─────────────────────────────────────────────
const POSITIONS = [];
for (let z = -1; z <= 1; z++)
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) POSITIONS.push([x, y, z]);

function getCubieIdx(x, y, z) {
  return POSITIONS.findIndex((p) => p[0] === x && p[1] === y && p[2] === z);
}

function buildCube() {
  const root = document.getElementById("cubeRoot");
  root.innerHTML = "";
  const sz =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--cubie-sz")
    ) || 96;
  const gap = 4;
  const step = sz + gap;
  const off = step;

  POSITIONS.forEach(([cx, cy, cz], idx) => {
    const el = document.createElement("div");
    el.className = "cubie";
    el.id = `cb-${idx}`;
    el.style.transform = `translate3d(${cx * step + off}px,${
      cy * step + off
    }px,${cz * step}px)`;
    ["U", "D", "F", "B", "L", "R"].forEach((fn) => {
      const face = document.createElement("div");
      face.className = `face face-${fn}`;
      const inner = document.createElement("div");
      inner.className = "face-inner X";
      inner.id = `cb-${idx}-${fn}`;
      face.appendChild(inner);
      el.appendChild(face);
    });
    root.appendChild(el);
  });
  colorCube();
}

function getCubieStep() {
  const sz =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--cubie-sz")
    ) || 96;
  return sz + 4;
}

function colorCube() {
  const s = cubeState;
  const step = getCubieStep();
  const off = step;

  const mapFace = (fi, faceName, posFn) => {
    for (let i = 0; i < 9; i++) {
      const [x, y, z] = posFn(i);
      const idx = getCubieIdx(x, y, z);
      if (idx < 0) return;
      const el = document.getElementById(`cb-${idx}-${faceName}`);
      if (el) el.className = `face-inner ${s[fi][i]}`;
    }
  };
  mapFace(F_U, "U", (i) => [(i % 3) - 1, -1, Math.floor(i / 3) - 1]);
  mapFace(F_D, "D", (i) => [(i % 3) - 1, 1, Math.floor(i / 3) - 1]);
  mapFace(F_F, "F", (i) => [(i % 3) - 1, Math.floor(i / 3) - 1, 1]);
  mapFace(F_B, "B", (i) => [1 - (i % 3), Math.floor(i / 3) - 1, -1]);
  mapFace(F_L, "L", (i) => [-1, Math.floor(i / 3) - 1, 1 - (i % 3)]);
  mapFace(F_R, "R", (i) => [1, Math.floor(i / 3) - 1, (i % 3) - 1]);
}

function repositionCubies() {
  const step = getCubieStep(),
    off = step;
  POSITIONS.forEach(([cx, cy, cz], idx) => {
    const el = document.getElementById(`cb-${idx}`);
    if (el) {
      el.style.transition = "none";
      el.style.transform = `translate3d(${cx * step + off}px,${
        cy * step + off
      }px,${cz * step}px)`;
    }
  });
}

// ── ANIMATED MOVE ─────────────────────────────────────────────────
function getMoveLayer(move) {
  const base = move.replace(/[2']/g, "");
  const rev = move.includes("'");
  const dbl = move.includes("2");
  const mult = dbl ? 2 : rev ? -1 : 1;
  const map = {
    U: { axis: "Y", ang: -90, filter: ([x, y, z]) => y === -1 },
    D: { axis: "Y", ang: 90, filter: ([x, y, z]) => y === 1 },
    F: { axis: "Z", ang: -90, filter: ([x, y, z]) => z === 1 },
    B: { axis: "Z", ang: 90, filter: ([x, y, z]) => z === -1 },
    L: { axis: "X", ang: 90, filter: ([x, y, z]) => x === -1 },
    R: { axis: "X", ang: -90, filter: ([x, y, z]) => x === 1 },
    M: { axis: "X", ang: 90, filter: ([x, y, z]) => x === 0 },
  };
  const { axis, ang, filter } = map[base] || map["U"];
  const ids = POSITIONS.map((p, i) => (filter(p) ? i : -1)).filter(
    (i) => i >= 0
  );
  return { ids, axis, angle: ang * mult };
}

function executeMove(move, cb) {
  if (isAnimating) {
    cb && cb();
    return;
  }
  isAnimating = true;
  cubeState = applyMove(cubeState, move);
  const { ids, axis, angle } = getMoveLayer(move);
  const root = document.getElementById("cubeRoot");
  const grp = document.createElement("div");
  grp.style.cssText =
    "position:absolute;width:0;height:0;transform-style:preserve-3d;";
  root.appendChild(grp);
  ids.forEach((idx) => {
    const el = document.getElementById(`cb-${idx}`);
    if (el) grp.appendChild(el);
  });
  const dur = Math.min(moveSpeed, 600);
  grp.style.transition = `transform ${dur}ms cubic-bezier(0.34,0.2,0.2,1)`;
  grp.style.transform = `rotate${axis}(0deg)`;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      grp.style.transform = `rotate${axis}(${angle}deg)`;
      setTimeout(() => {
        ids.forEach((idx) => {
          const el = document.getElementById(`cb-${idx}`);
          if (el) root.appendChild(el);
        });
        if (root.contains(grp)) root.removeChild(grp);
        colorCube();
        repositionCubies();
        isAnimating = false;
        updateUI();
        cb && cb();
      }, dur + 25);
    })
  );
}

function executeMoveInstant(move) {
  cubeState = applyMove(cubeState, move);
}

// ── DRAG ROTATE ───────────────────────────────────────────────────
const scene = document.getElementById("scene");
const cubeRoot = document.getElementById("cubeRoot");

function applyRotation() {
  cubeRoot.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

// Mouse
scene.addEventListener("mousedown", (e) => {
  dragActive = true;
  dragX = e.clientX;
  dragY = e.clientY;
  e.preventDefault();
});
document.addEventListener("mousemove", (e) => {
  if (!dragActive) return;
  const dx = e.clientX - dragX,
    dy = e.clientY - dragY;
  dragX = e.clientX;
  dragY = e.clientY;
  rotY += dx * 0.45;
  rotX = Math.max(-80, Math.min(80, rotX - dy * 0.45));
  applyRotation();
});
document.addEventListener("mouseup", () => (dragActive = false));

// Touch
let touchStartX = 0,
  touchStartY = 0,
  pinchStart = 0;
scene.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 1) {
      dragActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      pinchStart = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
    e.preventDefault();
  },
  { passive: false }
);
scene.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 1 && dragActive) {
      const dx = e.touches[0].clientX - touchStartX,
        dy = e.touches[0].clientY - touchStartY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      rotY += dx * 0.45;
      rotX = Math.max(-80, Math.min(80, rotX - dy * 0.45));
      applyRotation();
    }
    e.preventDefault();
  },
  { passive: false }
);
scene.addEventListener("touchend", () => (dragActive = false));

// ── NET VIEW ──────────────────────────────────────────────────────
function updateNet() {
  const net = document.getElementById("netView");
  net.innerHTML = "";
  const cells = Array(9)
    .fill(null)
    .map(() => Array(12).fill(null));
  const place = (fi, sr, sc) => {
    for (let i = 0; i < 9; i++)
      cells[sr + Math.floor(i / 3)][sc + (i % 3)] = cubeState[fi][i];
  };
  place(F_U, 0, 3);
  place(F_L, 3, 0);
  place(F_F, 3, 3);
  place(F_R, 3, 6);
  place(F_B, 3, 9);
  place(F_D, 6, 3);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 12; c++) {
      const d = document.createElement("div");
      d.className = cells[r][c] ? `net-cell ${cells[r][c]}` : "net-cell empty";
      net.appendChild(d);
    }
}

// ── HISTORY ───────────────────────────────────────────────────────
function pushHistory(move) {
  moveHistory = moveHistory.slice(0, histPtr + 1);
  moveHistory.push({ move, snap: copyState(cubeState) });
  histPtr = moveHistory.length - 1;
  renderHistory();
}

function undoMove() {
  if (histPtr < 0) return;
  const { snap } = moveHistory[histPtr];
  cubeState = copyState(snap);
  histPtr--;
  totalMoves = Math.max(0, totalMoves - 1);
  colorCube();
  updateNet();
  updateUI();
  renderHistory();
}

function redoMove() {
  if (histPtr >= moveHistory.length - 1) return;
  histPtr++;
  cubeState = applyMove(cubeState, moveHistory[histPtr].move);
  totalMoves++;
  colorCube();
  updateNet();
  updateUI();
  renderHistory();
}

function clearHistory() {
  moveHistory = [];
  histPtr = -1;
  renderHistory();
  updateUI();
}

function jumpHistory(idx) {
  while (histPtr < idx) redoMove();
  while (histPtr > idx) undoMove();
}

function renderHistory() {
  const wrap = document.getElementById("historyWrap");
  wrap.innerHTML = "";
  moveHistory.forEach((h, i) => {
    const chip = document.createElement("div");
    chip.className =
      "hist-chip" + (i === histPtr ? " current" : i > histPtr ? " future" : "");
    chip.textContent = h.move;
    chip.title = `Jump to move ${i + 1}`;
    chip.onclick = () => jumpHistory(i);
    wrap.appendChild(chip);
  });
  wrap.scrollTop = wrap.scrollHeight;
  const cnt = document.getElementById("histCount");
  if (cnt) cnt.textContent = `${Math.max(0, histPtr + 1)} moves`;
  document.getElementById("undoBtn").disabled = histPtr < 0;
  document.getElementById("redoBtn").disabled =
    histPtr >= moveHistory.length - 1;
  updateUI();
}

// ── MANUAL MOVES ─────────────────────────────────────────────────
function buildMoveGrid() {
  const grid = document.getElementById("moveGrid");
  grid.innerHTML = "";
  const moves = [
    "U",
    "U'",
    "U2",
    "D",
    "D'",
    "D2",
    "F",
    "F'",
    "F2",
    "B",
    "B'",
    "B2",
    "L",
    "L'",
    "L2",
    "R",
    "R'",
    "R2",
  ];
  moves.forEach((m) => {
    const btn = document.createElement("button");
    const isPrime = m.endsWith("'"),
      isDbl = m.endsWith("2");
    btn.className = "move-btn" + (isPrime ? " prime" : isDbl ? " double" : "");
    btn.textContent = m;
    btn.setAttribute("aria-label", `Move ${m}`);
    btn.onclick = () => doManualMove(m);
    grid.appendChild(btn);
  });
}

function doManualMove(move) {
  if (isAnimating) return;
  pushHistory(move);
  totalMoves++;
  executeMove(move, () => {
    updateNet();
    updateUI();
    renderHistory();
    if (isSolved(cubeState)) celebrate();
  });
}

// ── SCRAMBLE ──────────────────────────────────────────────────────
const ALL_MOVES = [
  "U",
  "U'",
  "U2",
  "D",
  "D'",
  "D2",
  "F",
  "F'",
  "F2",
  "B",
  "B'",
  "B2",
  "L",
  "L'",
  "L2",
  "R",
  "R'",
  "R2",
];
let lastScramble = [];

function scrambleCube() {
  stopAuto();
  clearHistory();
  solution = [];
  solPtr = 0;
  totalMoves = 0;
  cubeState = solvedState();

  const sc = [],
    len = 20;
  let lastBase = "";
  while (sc.length < len) {
    const m = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
    if (m.replace(/[2']/g, "") !== lastBase) {
      sc.push(m);
      lastBase = m.replace(/[2']/g, "");
    }
  }
  lastScramble = sc;
  sc.forEach((m) => {
    cubeState = applyMove(cubeState, m);
  });

  const box = document.getElementById("scrambleBox");
  box.innerHTML = sc
    .map((m) => {
      const cls = m.endsWith("'") ? " prime" : m.endsWith("2") ? " double" : "";
      return `<span class="move-token${cls}">${m}</span>`;
    })
    .join(" ");

  setStatus("SCRAMBLED", "");
  colorCube();
  updateNet();
  updateSolutionUI([]);
  updateUI();
  document.getElementById("stepBtn").disabled = true;
  document.getElementById("autoBtn").disabled = true;
  if (document.getElementById("autoBtn2"))
    document.getElementById("autoBtn2").disabled = true;
  hideBanner();
}

// ── SOLVER ────────────────────────────────────────────────────────
function solveCube() {
  if (isSolved(cubeState)) {
    setStatus("SOLVED!", "solved");
    return;
  }
  stopAuto();
  solPtr = 0;
  solution = [];

  const overlay = document.getElementById("thinkingOverlay");
  overlay.classList.add("show");
  setStatus("SOLVING...", "solving");

  const phases = ["cross", "f2l", "oll", "pll"];
  const msgs = [
    "Solving white cross...",
    "F2L insertion...",
    "Orienting last layer...",
    "Permuting last layer...",
  ];
  let pi = 0;

  // Animate phase indicators
  function animatePhase(p) {
    if (p >= 4) return;
    const pip = document.getElementById(`pip-${phases[p]}`);
    if (pip) {
      pip.classList.add("active");
      pip.querySelector(".phase-pip-dot").classList.add("active");
    }
    if (p > 0) {
      const con = document.getElementById(`con-${p}`);
      if (con) con.classList.add("done");
      const prev = document.getElementById(`pip-${phases[p - 1]}`);
      if (prev) {
        prev.classList.remove("active");
        prev.classList.add("done");
        prev.querySelector(".phase-pip-dot").classList.remove("active");
        prev.querySelector(".phase-pip-dot").classList.add("done");
      }
    }
    document.getElementById("thinkSub").textContent = msgs[p];
  }

  let phaseTimer = setInterval(() => {
    animatePhase(pi);
    pi = (pi + 1) % 4;
  }, 350);

  setTimeout(() => {
    try {
      const solver = new LBLSolver(cubeState);
      const steps = solver.solve();
      clearInterval(phaseTimer);
      overlay.classList.remove("show");
      resetPhaseIndicators();
      solution = steps;
      solPtr = 0;
      updateSolutionUI(solution);
      setStatus(`${solution.length} MOVES`, "solving");
      document.getElementById("stepBtn").disabled = false;
      document.getElementById("autoBtn").disabled = false;
      if (document.getElementById("autoBtn2"))
        document.getElementById("autoBtn2").disabled = false;
      updateUI();
      // Auto-switch to solution tab on mobile
      if (window.innerWidth <= 900) switchTabByName("solution");
    } catch (e) {
      clearInterval(phaseTimer);
      overlay.classList.remove("show");
      console.error("Solver error:", e);
      setStatus("ERROR", "");
    }
  }, 1500);
}

function stepSolve() {
  if (solPtr >= solution.length || isAnimating) return;
  const step = solution[solPtr];
  highlightStep(solPtr);
  solPtr++;
  executeMove(step.move, () => {
    updateNet();
    updateUI();
    if (isSolved(cubeState)) {
      setStatus("SOLVED!", "solved");
      document.getElementById("stepBtn").disabled = true;
      document.getElementById("autoBtn").disabled = true;
      if (document.getElementById("autoBtn2"))
        document.getElementById("autoBtn2").disabled = true;
      stopAuto();
      celebrate();
    }
  });
}

function autoPlay() {
  if (autoPlaying || solPtr >= solution.length) return;
  autoPlaying = true;
  document.getElementById("autoBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("stepBtn").disabled = true;
  if (document.getElementById("autoBtn2"))
    document.getElementById("autoBtn2").disabled = true;
  runAuto();
}

function runAuto() {
  if (!autoPlaying || solPtr >= solution.length) {
    stopAuto();
    return;
  }
  stepSolve();
  autoTimer = setTimeout(runAuto, moveSpeed + 80);
}

function stopAuto() {
  autoPlaying = false;
  clearTimeout(autoTimer);
  const hasMore = solution.length > 0 && solPtr < solution.length;
  document.getElementById("autoBtn").disabled = !hasMore;
  document.getElementById("stopBtn").disabled = true;
  document.getElementById("stepBtn").disabled = !hasMore;
  if (document.getElementById("autoBtn2"))
    document.getElementById("autoBtn2").disabled = !hasMore;
}

function setSpeed(v) {
  moveSpeed = parseInt(v);
  document.getElementById("speedLabel").textContent = v + "ms";
}

// ── SOLUTION UI ───────────────────────────────────────────────────
const PHASE_MAP = { cross: "CROSS", f2l: "F2L", oll: "OLL", pll: "PLL" };

function updateSolutionUI(steps) {
  const list = document.getElementById("solutionList");
  if (!steps || steps.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-icon">🧩</div><div>Press SOLVE to compute the solution</div></div>';
    return;
  }
  list.innerHTML = "";
  steps.forEach((step, i) => {
    const el = document.createElement("div");
    el.className = "sol-step fade-up" + (i === 0 ? " current" : "");
    el.id = `ss-${i}`;
    el.style.animationDelay = `${Math.min(i * 0.02, 0.3)}s`;
    el.onclick = () => {};
    const phase = step.phase || "cross";
    el.innerHTML = `
      <span class="sol-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="sol-move">${step.move}</span>
      <span class="sol-desc">${step.desc || ""}</span>
      <span class="sol-phase ${phase}">${PHASE_MAP[phase] || phase}</span>
    `;
    list.appendChild(el);
  });
}

function highlightStep(idx) {
  document.querySelectorAll(".sol-step").forEach((el, i) => {
    el.classList.remove("current");
    if (i < idx) el.classList.add("done");
    if (i === idx) {
      el.classList.add("current", "flash");
    }
  });
  const el = document.getElementById(`ss-${idx}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── COPY SOLUTION ─────────────────────────────────────────────────
function copySolution() {
  if (!solution || solution.length === 0) return;
  const text = solution.map((s) => s.move).join(" ");
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const btn = document.getElementById("copyBtn");
      if (btn) {
        const t = btn.textContent;
        btn.textContent = "✓ COPIED!";
        setTimeout(() => (btn.textContent = t), 2000);
      }
    })
    .catch(() => {
      // Fallback for iOS
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
}

// ── RESET ─────────────────────────────────────────────────────────
function resetCube() {
  stopAuto();
  clearHistory();
  cubeState = solvedState();
  solution = [];
  solPtr = 0;
  totalMoves = 0;
  document.getElementById("scrambleBox").textContent =
    "Press SCRAMBLE to generate a sequence";
  setStatus("READY", "");
  colorCube();
  updateNet();
  updateSolutionUI([]);
  updateUI();
  hideBanner();
}

// ── UI UPDATE ─────────────────────────────────────────────────────
function updateUI() {
  const solved = isSolved(cubeState);
  document.getElementById("statMoves").textContent = totalMoves;
  document.getElementById("statSolLen").textContent = solution.length || "—";
  document.getElementById("statStep").textContent =
    solution.length > 0 ? `${solPtr}/${solution.length}` : "—";

  const statusEl = document.getElementById("statStatus");
  if (solved) {
    statusEl.textContent = "SOLVED";
    statusEl.style.color = "var(--green)";
  } else {
    statusEl.textContent = "UNSOLVED";
    statusEl.style.color = "var(--text-dim)";
  }

  const pct = solution.length > 0 ? (solPtr / solution.length) * 100 : 0;
  document.getElementById("progressFill").style.width = pct + "%";

  document.getElementById("undoBtn").disabled = histPtr < 0;
  document.getElementById("redoBtn").disabled =
    histPtr >= moveHistory.length - 1;
}

function setStatus(text, type) {
  const badge = document.getElementById("statusBadge");
  badge.textContent = text;
  badge.className = "badge status" + (type ? " " + type : "");
}

function resetPhaseIndicators() {
  ["cross", "f2l", "oll", "pll"].forEach((p) => {
    const pip = document.getElementById(`pip-${p}`);
    if (!pip) return;
    pip.classList.remove("active", "done");
    pip.querySelector(".phase-pip-dot").classList.remove("active", "done");
  });
  [1, 2, 3].forEach((i) => {
    const c = document.getElementById(`con-${i}`);
    if (c) c.classList.remove("done");
  });
}

// ── CELEBRATION ───────────────────────────────────────────────────
function celebrate() {
  const banner = document.getElementById("solvedBanner");
  const sub = document.getElementById("solvedSub");
  sub.textContent = `${solution.length} MOVES · ${totalMoves} TOTAL`;
  banner.classList.add("show");
  setTimeout(() => banner.classList.remove("show"), 4000);
  launchConfetti();
}

function hideBanner() {
  document.getElementById("solvedBanner").classList.remove("show");
}

function launchConfetti() {
  const colors = [
    "#00e5ff",
    "#2dff7a",
    "#ff7b1a",
    "#ff2060",
    "#ffe040",
    "#9d50ff",
  ];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random() * 100}vw;
      top:-10px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      transform:rotate(${Math.random() * 360}deg);
      animation-duration:${1.5 + Math.random() * 1.5}s;
      animation-delay:${Math.random() * 0.5}s;
    `;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

// ── TAB SWITCHING ─────────────────────────────────────────────────
function switchTab(tab, btn) {
  activeTab = tab;
  document
    .querySelectorAll(".cp-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".cp-pane")
    .forEach((p) => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const pane = document.getElementById(`pane-${tab}`);
  if (pane) pane.classList.add("active");
}

function switchTabByName(tab) {
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) switchTab(tab, btn);
}

// ── KEYBOARD ─────────────────────────────────────────────────────
const KEY_MAP = {
  KeyU: "U",
  KeyI: "U'",
  KeyD: "D",
  KeyE: "D'",
  KeyF: "F",
  KeyV: "F'",
  KeyB: "B",
  KeyN: "B'",
  KeyL: "L",
  KeyK: "L'",
  KeyR: "R",
  KeyT: "R'",
};

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.code === "Space") {
    e.preventDefault();
    autoPlaying ? stopAuto() : autoPlay();
    return;
  }
  if (e.code === "ArrowRight") {
    e.preventDefault();
    stepSolve();
    return;
  }
  if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    undoMove();
    return;
  }
  if (e.code === "KeyY" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    redoMove();
    return;
  }
  const move = KEY_MAP[e.code];
  if (move) doManualMove(move);
});

// ── RESIZE HANDLER ────────────────────────────────────────────────
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildCube();
    updateNet();
  }, 200);
});

// ── INIT ──────────────────────────────────────────────────────────
function init() {
  buildCube();
  buildMoveGrid();
  updateNet();
  updateUI();
  renderHistory();

  // On desktop: show all panes (controlled by visibility)
  if (window.innerWidth > 900) {
    document
      .querySelectorAll(".cp-pane")
      .forEach((p) => p.classList.add("active"));
    document
      .querySelectorAll(".cp-pane")
      .forEach((p) => (p.style.display = "block"));
  }

  // Hint text cycle
  const hints = [
    "⟷ DRAG TO ROTATE · PINCH TO ZOOM",
    "⌨ SPACE = AUTO-PLAY · → = STEP",
    "⌨ CTRL+Z = UNDO · CTRL+Y = REDO",
  ];
  let hintIdx = 0;
  setInterval(() => {
    hintIdx = (hintIdx + 1) % hints.length;
    const el = document.getElementById("dragHint");
    if (el) {
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = hints[hintIdx];
        el.style.opacity = "1";
        el.style.transition = "opacity 0.4s";
      }, 300);
    }
  }, 4000);

  console.log(
    "%c CUBE·MIND v2.0 ",
    "background:#00e5ff;color:#04060e;font-weight:bold;font-size:13px;padding:3px 8px;border-radius:3px;"
  );
}

// On desktop, override tab system to show all sections
const mq = window.matchMedia("(min-width:901px)");
function handleDesktop(e) {
  if (e.matches) {
    document.querySelectorAll(".cp-pane").forEach((p) => {
      p.classList.add("active");
      p.style.display = "block";
    });
  } else {
    document.querySelectorAll(".cp-pane").forEach((p, i) => {
      p.style.display = "";
      if (i > 0) p.classList.remove("active");
    });
    document.querySelectorAll(".cp-tab").forEach((t, i) => {
      if (i > 0) t.classList.remove("active");
    });
    document.querySelectorAll(".cp-tab")[0]?.classList.add("active");
    document.querySelector(".cp-pane")?.classList.add("active");
  }
}
mq.addEventListener("change", handleDesktop);

window.addEventListener("load", () => {
  init();
  handleDesktop(mq);
});
