const canvas = document.getElementById("threeCanvas");
const container = canvas.parentElement;

// Sizes
const sizes = {
  width: container.clientWidth,
  height: container.clientHeight
};

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e1a);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 1.5, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// Object
let currentObject;

function createNewObject() {
  if (currentObject) scene.remove(currentObject);

  const geometries = [
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.SphereGeometry(0.9, 32, 32),
    new THREE.TorusGeometry(0.8, 0.3, 16, 100),
    new THREE.ConeGeometry(0.8, 1.4, 32)
  ];

  const geometry = geometries[Math.floor(Math.random() * geometries.length)];

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    metalness: 0.4,
    roughness: 0.3
  });

  currentObject = new THREE.Mesh(geometry, material);
  scene.add(currentObject);
}

createNewObject();

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Button
document.getElementById("newProjectBtn").addEventListener("click", createNewObject);

// Resize
window.addEventListener("resize", () => {
  sizes.width = container.clientWidth;
  sizes.height = container.clientHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// Mobile sidebar
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
