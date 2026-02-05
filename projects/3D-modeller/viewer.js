import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/EXRLoader.js";
import { RoomEnvironment } from "https://unpkg.com/three@0.160.0/examples/jsm/environments/RoomEnvironment.js";

// DOM ELEMENTS
const canvas = document.getElementById("three-canvas");
const loadingOverlay = document.getElementById("loadingOverlay");
const progressBar = document.getElementById("progressBar");
const loadingStatus = document.getElementById("loadingStatus");
const emptyState = document.getElementById("emptyState");
const modelSelect = document.getElementById("modelSelect");

// Controls
const exposureSlider = document.getElementById("exposureSlider");
const bgToggle = document.getElementById("bgToggle");
const colorPicker = document.getElementById("colorPicker");
const metalnessSlider = document.getElementById("metalnessSlider");
const roughnessSlider = document.getElementById("roughnessSlider");

// Buttons & Selects
const wireframeBtn = document.getElementById("wireframeBtn");
const normalsBtn = document.getElementById("normalsBtn");
const autoRotateBtn = document.getElementById("autoRotateBtn");
const resetCameraBtn = document.getElementById("resetCameraBtn");
const screenshotBtn = document.getElementById("screenshotBtn");
const fileUpload = document.getElementById("fileUpload");

const animSection = document.getElementById("animSection");
const animSelect = document.getElementById("animSelect");
const playPauseBtn = document.getElementById("playPauseBtn");

// Stats
const polyCount = document.getElementById("polyCount");
const meshCount = document.getElementById("meshCount");

// STATE
let scene, camera, renderer, controls, clock;
let currentModel = null;
let mixer = null;
let materials = [];
let actions = {};
let activeAction = null;
let environmentTexture = null;

let state = {
  wireframe: false,
  normals: false,
  autoRotate: false,
  isPlaying: true
};

/* =========================
   INITIALIZATION
========================= */
function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 5);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true // For screenshots
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // High-fidelity rendering settings
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add room environment as fallback
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  loadEnvironment("./assets/studio.exr");

  window.addEventListener("resize", onWindowResize);
  setupEvents();
  animate();

  // Load initial model if exists
  loadGLB("./models/sample.glb");
}

/* =========================
   CORE FUNCTIONS
========================= */
function loadEnvironment(url) {
  new EXRLoader().load(url, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    environmentTexture = texture;
    scene.environment = texture;
    if (bgToggle.checked) scene.background = texture;
  }, undefined, (err) => {
    console.warn("Failed to load HDR, using default environment");
  });
}

function loadGLB(url) {
  showLoading(true);
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    url,
    (gltf) => {
      clearCurrentModel();

      currentModel = gltf.scene;

      // Handle Shadows & Materials
      materials = [];
      let triangles = 0;
      let meshes = 0;

      currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          meshes++;
          triangles += child.geometry.attributes.position.count / 3;

          if (child.material) {
            if (Array.isArray(child.material)) {
              materials.push(...child.material);
            } else {
              materials.push(child.material);
            }
          }
        }
      });

      // Update Stats
      polyCount.textContent = `Triangles: ${Math.round(triangles).toLocaleString()}`;
      meshCount.textContent = `Meshes: ${meshes}`;

      // Animations
      setupAnimations(gltf);

      // Fit to view
      fitToView();

      scene.add(currentModel);
      showLoading(false);
      emptyState.classList.add("hidden");
    },
    (xhr) => {
      const progress = (xhr.loaded / xhr.total) * 100;
      progressBar.style.width = progress + "%";
      loadingStatus.textContent = `Downloading: ${Math.round(progress)}%`;
    },
    (error) => {
      console.error(error);
      loadingStatus.textContent = "Error loading model!";
      setTimeout(() => showLoading(false), 2000);
    }
  );
}

function clearCurrentModel() {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  mixer = null;
  actions = {};
  animSection.classList.add("hidden");
}

function setupAnimations(gltf) {
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(currentModel);
    animSelect.innerHTML = "";

    gltf.animations.forEach((clip, index) => {
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;

      const option = document.createElement("option");
      option.value = clip.name;
      option.textContent = clip.name || `Animation ${index + 1}`;
      animSelect.appendChild(option);
    });

    // Play first animation by default
    const firstAnim = gltf.animations[0].name;
    fadeToAction(firstAnim);
    animSection.classList.remove("hidden");
  }
}

function fadeToAction(name) {
  const nextAction = actions[name];
  if (activeAction !== nextAction) {
    if (activeAction) activeAction.fadeOut(0.5);
    nextAction.reset().fadeIn(0.5).play();
    activeAction = nextAction;
  }
}

function fitToView() {
  const box = new THREE.Box3().setFromObject(currentModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  cameraZ *= 1.5; // Zoom out a bit
  camera.position.set(center.x + cameraZ, center.y + cameraZ / 2, center.z + cameraZ);

  controls.target.copy(center);
  controls.update();
}

/* =========================
   UI EVENTS
========================= */
function setupEvents() {
  // Environment
  exposureSlider.oninput = (e) => {
    renderer.toneMappingExposure = +e.target.value;
  };

  bgToggle.onchange = (e) => {
    scene.background = e.target.checked ? environmentTexture : null;
  };

  // Materials
  colorPicker.oninput = (e) => {
    materials.forEach(m => {
      if (m.color) m.color.set(e.target.value);
    });
  };

  metalnessSlider.oninput = (e) => {
    materials.forEach(m => {
      if ('metalness' in m) m.metalness = +e.target.value;
    });
  };

  roughnessSlider.oninput = (e) => {
    materials.forEach(m => {
      if ('roughness' in m) m.roughness = +e.target.value;
    });
  };

  // Tools
  wireframeBtn.onclick = () => {
    state.wireframe = !state.wireframe;
    wireframeBtn.classList.toggle("active");
    materials.forEach(m => m.wireframe = state.wireframe);
  };

  normalsBtn.onclick = () => {
    // Basic Normal view toggle - simplified
    state.normals = !state.normals;
    normalsBtn.classList.toggle("active");
    // This is complex for indexed materials, we'll just toggle a simple override if needed
    // For now let's just use it as a placeholder for material features
  };

  autoRotateBtn.onclick = () => {
    state.autoRotate = !state.autoRotate;
    autoRotateBtn.classList.toggle("active");
    controls.autoRotate = state.autoRotate;
  };

  resetCameraBtn.onclick = fitToView;

  screenshotBtn.onclick = () => {
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "aura-3d-capture.png";
    link.href = dataURL;
    link.click();
  };

  // Animations
  animSelect.onchange = (e) => fadeToAction(e.target.value);

  playPauseBtn.onclick = () => {
    state.isPlaying = !state.isPlaying;
    playPauseBtn.innerHTML = state.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (activeAction) activeAction.paused = !state.isPlaying;
  };

  // File Upload
  fileUpload.onchange = (e) => {
    const file = e.target.files[0];
    if (file) loadGLB(URL.createObjectURL(file));
  };

  // Model Selection
  modelSelect.onchange = (e) => {
    loadGLB(`./models/${e.target.value}`);
  };

  // Drag & Drop
  const dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".glb") || file.name.endsWith(".gltf"))) {
      loadGLB(URL.createObjectURL(file));
    }
  });
}

function showLoading(show) {
  loadingOverlay.classList.toggle("hidden", !show);
  if (show) progressBar.style.width = "0%";
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

// Start
init();
