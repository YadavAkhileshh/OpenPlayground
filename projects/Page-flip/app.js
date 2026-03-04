const pages = Array.from({ length: 10 }, (_, i) => `
  <h2>Page ${i}</h2>
  <p>A classic page turn effect using JS/CSS. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  <p>Click and drag a corner.</p>
  <div class="page-number">${i}</div>
`);

const state = {
  width: 0,      // book width
  height: 0,     // height
  pageWidth: 0,
  spineX: 0,
  diagonal: 0,   // Diagonal of a single page
  
  leftIndex: 0, 
  activeSide: null, 
  activeCorner: null, // [x, y]
  isDragging: false,
  
  cornerThreshold: 100, // Area to trigger drag
}

function handleResize() {
  const rect = book.getBoundingClientRect();
  state.width = rect.width;
  state.height = rect.height;
  state.pageWidth = rect.width / 2;
  state.spineX = state.pageWidth;
  state.diagonal = Math.sqrt(state.pageWidth ** 2 + state.height ** 2);
  
  if (!state.isDragging) renderPages();
}
const resizeObserver = new ResizeObserver(handleResize);
resizeObserver.observe(book);


function renderPages() {
  document.getElementById('left-front').innerHTML = pages[state.leftIndex] || "";
  document.getElementById('right-front').innerHTML = pages[state.leftIndex + 1] || "";
  
  document.getElementById('left-front').style.display = state.leftIndex < 0 ? 'none' : 'block';
  document.getElementById('right-front').style.display = state.leftIndex + 1 >= pages.length ? 'none' : 'block';
}
renderPages();

function clipPolygon(points, a, b, c, keepInside) {
  let result = [];
  for (let i = 0; i < points.length; i++) {
    let p1 = points[i], p2 = points[(i + 1) % points.length];
    let d1 = a * p1[0] + b * p1[1] + c;
    let d2 = a * p2[0] + b * p2[1] + c;
    let in1 = keepInside ? d1 <= 0 : d1 > 0;
    let in2 = keepInside ? d2 <= 0 : d2 > 0;

    if (in1) result.push(p1);
    if (in1 !== in2) {
      let t = d1 / (d1 - d2);
      result.push([p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]);
    }
  }
  return result;
}

function reflectPoint(p, a, b, c) {
  let d = (a * p[0] + b * p[1] + c) / (a * a + b * b);
  return [ p[0] - 2 * d * a, p[1] - 2 * d * b ];
}

function toClipPath(points) {
  if (points.length === 0) return 'polygon(0 0)';
  return 'polygon(' + points.map(p => `${p[0]}px ${p[1]}px`).join(', ') + ')';
}
function constrainPoint(mx, my) {
  const { pageWidth, height, spineX, diagonal } = state;

  for (let i = 0; i < 3; i++) {
    // Distance to adjacent spine corner
    let c1x = spineX;
    let c1y = state.activeCorner[1]; 
    let dx1 = mx - c1x;
    let dy1 = my - c1y;
    let dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    
    if (dist1 > pageWidth) {
      mx = c1x + (dx1 / dist1) * pageWidth;
      my = c1y + (dy1 / dist1) * pageWidth;
    }

    // Distance to OPPOSITE spine corner
    let c2x = spineX; 
    let c2y = state.activeCorner[1] === 0 ? height : 0; 
    let dx2 = mx - c2x;
    let dy2 = my - c2y;
    let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    if (dist2 > diagonal) {
      mx = c2x + (dx2 / dist2) * diagonal;
      my = c2y + (dy2 / dist2) * diagonal;
    }
  }
  return [mx, my];
}
function updateFold(X, Y) {
  if (X === state.activeCorner[0] && Y === state.activeCorner[1]) return;
  const { width, height, pageWidth, activeCorner } = state;

  let [mx, my] = constrainPoint(X, Y);

  const frontPage = document.getElementById(`${state.activeSide}-front`);
  
  let a = activeCorner[0] - mx;
  let b = activeCorner[1] - my;
  let midx = (activeCorner[0] + mx) / 2;
  let midy = (activeCorner[1] + my) / 2;
  let c = -(a * midx + b * midy);

  let basePage, p1_front, p2_front, shiftX;
  if (state.activeSide === 'right') {
    basePage = [[pageWidth, 0], [pageWidth, height], [width, height], [width, 0]];
    p1_front = [width, 0]; 
    p2_front = [pageWidth, 0]; 
    shiftX = pageWidth; 
  } else {
    basePage = [[0, 0], [0, height], [pageWidth, height], [pageWidth, 0]];
    p1_front = [pageWidth, 0]; 
    p2_front = [0, 0];   
    shiftX = 0;
  }

  // Clip Front Page
  let frontPoints = clipPolygon(basePage, a, b, c, true);
  let fpCSS = frontPoints.map(p => [p[0] - shiftX, p[1]]);
  frontPage.style.clipPath = toClipPath(fpCSS);

  // Generate Folded Flap
  let awayPoints = clipPolygon(basePage, a, b, c, false);
  let flapPoints = awayPoints.map(p => reflectPoint(p, a, b, c));
  flap.style.clipPath = toClipPath(flapPoints);

  // Map Back Page Content
  let p1_flap = reflectPoint(p1_front, a, b, c);
  let p2_flap = reflectPoint(p2_front, a, b, c);
  let transX = p1_flap[0];
  let transY = p1_flap[1];
  let angleRot = Math.atan2(p2_flap[1] - p1_flap[1], p2_flap[0] - p1_flap[0]);

  flapContent.style.transformOrigin = '0 0';
  flapContent.style.transform = `translate(${transX}px, ${transY}px) rotate(${angleRot}rad)`;

  // Align Lighting Gradient with the Fold Line
  let dxG = mx - activeCorner[0];
  let dyG = my - activeCorner[1];
  let angleG = Math.atan2(dyG, dxG); 
  foldGradient.style.transform = `translate(${midx}px, ${midy}px) rotate(${angleG}rad)`;

  // Calculate drag progress and apply sine wave opacity
  let progress = Math.abs(mx - activeCorner[0]) / (width);
  let opacity = Math.sin(progress * Math.PI); // 0 at edges, 1 in the middle
  foldGradient.style.opacity = opacity.toFixed(3);
}

function startDrag(side, corner, x, y) {
  state.activeSide = side;
  state.activeCorner = corner;
  state.isDragging = true;
  flap.style.display = 'block';

  console.log(state)

  if (side === 'right') {
    document.getElementById('right-under').innerHTML = pages[state.leftIndex + 3] || "";
    flapContent.innerHTML = pages[state.leftIndex + 2] || "";
    // The back of the right page will rest on the left
    flapContent.className = 'flap-content is-left'; 
  } else {
    document.getElementById('left-under').innerHTML = pages[state.leftIndex - 2] || "";
    flapContent.innerHTML = pages[state.leftIndex - 1] || "";
    // The back of the left page will rest on the right
    flapContent.className = 'flap-content is-right'; 
  }
  
  updateFold(x, y);
}

book.addEventListener('pointerdown', (e) => {
  let rect = book.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  const { width, height, cornerThreshold: TH, leftIndex } = state;

  console.log(x, width, TH, y, height, leftIndex, x > width - TH && y > height - TH && leftIndex + 1 < pages.length - 1)

  book.setPointerCapture(e.pointerId);

  if (x > width - TH && y < TH && leftIndex + 1 < pages.length - 1) 
    startDrag('right', [width, 0], x, y);
  else if (x > width - TH && y > height - TH && leftIndex + 1 < pages.length - 1) 
    startDrag('right', [width, height], x, y);
  else if (x < TH && y < TH && leftIndex > 0) 
    startDrag('left', [0, 0], x, y);
  else if (x < TH && y > height - TH && leftIndex > 0) 
    startDrag('left', [0, height], x, y);
});

book.addEventListener('pointermove', (e) => {
  if (!state.isDragging) return;
  let rect = book.getBoundingClientRect();
  updateFold(e.clientX - rect.left, e.clientY - rect.top);
});
book.addEventListener('pointerup', (e) => {
  if (!state.isDragging) return;
  state.isDragging = false;

  let rect = book.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  const { width, spineX, activeSide } = state;

  let isComplete = (state.activeSide === 'right' && x < width/2) || (state.activeSide === 'left' && x > width/2);
  
  // Target the exact opposite corner to gracefully flatten the angle
  let targetX = isComplete ? (activeSide === 'right' ? 0 : width) : state.activeCorner[0];
  let targetY = state.activeCorner[1]; 

  let startX = x, startY = y;
  let startTime = performance.now();
  
  function animate(time) {
    let progress = Math.min((time - startTime) / 300, 1);
    let ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    
    updateFold(startX + (targetX - startX) * ease, startY + (targetY - startY) * ease);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      flap.style.display = 'none';
      document.getElementById(`${state.activeSide}-front`).style.clipPath = 'none';
      
      if (isComplete) {
        state.leftIndex += state.activeSide === 'right' ? 2 : -2;
        renderPages();
      }
      state.activeSide = null;
    }
  }
  requestAnimationFrame(animate);
});