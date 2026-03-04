let scene, camera, renderer;
let objects = [];
let bladeTrail = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let score = 0;
let combo = 1;
let lastSliceTime = 0;

init();
animate();
setInterval(spawnObject, 900);

// ---------- INIT ----------
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("game"),
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onResize);
}

// ---------- SPAWN ----------
function spawnObject() {
  const isBomb = Math.random() < 0.2;

  const geometry = new THREE.SphereGeometry(0.45, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: isBomb ? 0x000000 : new THREE.Color(`hsl(${Math.random()*360},80%,60%)`)
  });

  const obj = new THREE.Mesh(geometry, material);
  obj.position.set((Math.random() - 0.5) * 6, -4, 0);

  obj.userData = {
    velocityY: Math.random() * 0.08 + 0.12,
    velocityX: (Math.random() - 0.5) * 0.03,
    gravity: 0.003,
    isBomb
  };

  scene.add(obj);
  objects.push(obj);
}

// ---------- MOUSE ----------
function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  bladeTrail.push(new THREE.Vector3(mouse.x * 5, mouse.y * 3, 0));
  if (bladeTrail.length > 12) bladeTrail.shift();

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(objects);

  hits.forEach(hit => slice(hit.object));
}

// ---------- SLICE ----------
function slice(obj) {
  if (!obj.parent) return;

  const now = Date.now();
  combo = now - lastSliceTime < 300 ? combo + 1 : 1;
  lastSliceTime = now;

  if (obj.userData.isBomb) {
    alert("💣 BOOM! Game Over\nScore: " + score);
    location.reload();
    return;
  }

  score += combo;
  updateHUD();

  splitFruit(obj);
  scene.remove(obj);
  objects = objects.filter(o => o !== obj);
}

// ---------- SPLIT EFFECT ----------
function splitFruit(fruit) {
  for (let i = 0; i < 2; i++) {
    const half = fruit.clone();
    half.scale.set(0.6, 0.6, 0.6);
    half.position.x += i === 0 ? -0.2 : 0.2;
    half.userData = {
      velocityY: Math.random() * 0.08,
      velocityX: (Math.random() - 0.5) * 0.1,
      gravity: 0.004,
      debris: true
    };
    scene.add(half);
    objects.push(half);
  }
}

// ---------- HUD ----------
function updateHUD() {
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("combo").innerText = `Combo: x${combo}`;
}

// ---------- ANIMATE ----------
function animate() {
  requestAnimationFrame(animate);

  objects.forEach(obj => {
    obj.position.y += obj.userData.velocityY;
    obj.position.x += obj.userData.velocityX;
    obj.userData.velocityY -= obj.userData.gravity;
    obj.rotation.x += 0.03;
    obj.rotation.y += 0.03;

    if (obj.position.y < -6) {
      scene.remove(obj);
      objects = objects.filter(o => o !== obj);
    }
  });

  drawBladeTrail();
  renderer.render(scene, camera);
}

// ---------- BLADE TRAIL ----------
function drawBladeTrail() {
  scene.children
    .filter(c => c.name === "trail")
    .forEach(c => scene.remove(c));

  bladeTrail.forEach((p, i) => {
    const geo = new THREE.SphereGeometry(0.05, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: i / bladeTrail.length
    });
    const dot = new THREE.Mesh(geo, mat);
    dot.name = "trail";
    dot.position.copy(p);
    scene.add(dot);
  });
}

// ---------- RESIZE ----------
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
