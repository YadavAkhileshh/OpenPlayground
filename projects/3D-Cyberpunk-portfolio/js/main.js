import * as THREE from 'three';
import { FPSControls } from './controls.js';
import { World } from './world.js';
import { editor } from './editor.js';

let camera, scene, renderer;
let controls;
let world;
let animateId;

let prevTime = performance.now();

// DOM elements
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const interactPrompt = document.getElementById('interaction-prompt');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const closeBtn = document.getElementById('close-modal');
const startBtn = document.getElementById('enter-btn');
const customizeBtn = document.getElementById('customize-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const authOverlay = document.getElementById('auth-overlay');
const authForm = document.getElementById('auth-form');
const authMsg = document.getElementById('auth-msg');

let currentFocus = null; // The object we are looking at

// Auth State
let currentUser = null;

init();

function init() {
    // 1. Initialize Auth System
    auth.init({
        onAuthSuccess: (user) => {
            currentUser = user;
            authOverlay.classList.add('hidden');
            userDisplay.textContent = `USER: ${user.username.toUpperCase()}`;
            userDisplay.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            customizeBtn.classList.remove('hidden');

            // Load user-specific config if we implement cloud saving later
            // For now, load local config
            loadWorld();
        },
        onAuthRequired: () => {
            authOverlay.classList.remove('hidden');
            customizeBtn.classList.add('hidden');
            logoutBtn.classList.add('hidden');
        },
        onLogout: () => {
            currentUser = null;
            userDisplay.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            customizeBtn.classList.add('hidden');
            authOverlay.classList.remove('hidden');
            // Reset to default view
            document.exitPointerLock();
        }
    });

    setupAuthUI();
    setup3D();
}

function setupAuthUI() {
    // Toggle Login/Signup
    const loginBtn = document.getElementById('show-login');
    const signupBtn = document.getElementById('show-signup');

    loginBtn.onclick = () => {
        authForm.dataset.mode = 'login';
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
        authMsg.textContent = '';
    };

    signupBtn.onclick = () => {
        authForm.dataset.mode = 'signup';
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
        authMsg.textContent = '';
    };

    authForm.onsubmit = (e) => {
        e.preventDefault();
        const mode = authForm.dataset.mode;
        const user = authForm['auth-username'].value;
        const pass = authForm['auth-password'].value;

        if (mode === 'login') {
            const res = auth.login(user, pass);
            if (!res.success) authMsg.textContent = res.message;
        } else {
            const res = auth.signup(user, pass);
            if (!res.success) authMsg.textContent = res.message;
        }
    };

    logoutBtn.onclick = () => auth.logout();
}

function setup3D() {
    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Average eye height

    // Initialize Editor & Load Config
    editor.init((newConfig) => {
        // Callback: Rebuild World on Save
        if (world) {
            scene.remove(world.container); // Remove old world group
        }
        world = new World(scene, newConfig);
    });

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1';
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new FPSControls(camera, document.body);

    // Event Listeners
    startBtn.addEventListener('click', () => {
        controls.lock();
        checkMobile();
    });

    closeBtn.addEventListener('click', closeModal);

    controls.controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        if (isMobile) document.getElementById('touch-controls').style.display = 'flex';
    });

    controls.controls.addEventListener('unlock', () => {
        // Only show main menu if we aren't viewing a modal or auth overlay
        if (!modal.classList.contains('visible') && authOverlay.classList.contains('hidden')) {
            blocker.style.display = 'flex';
            instructions.style.display = 'block';
        }
        document.getElementById('touch-controls').style.display = 'none';
    });

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onInteract);

    // Touch Bindings for D-Pad
    bindTouchControls();

    animate();
}

function loadWorld() {
    // Determine which config to load (Default vs User specific)
    // For now we just reload the editor config which pulls from localstorage
    editor.loadConfig();
    if (world) scene.remove(world.container);
    world = new World(scene, editor.config);
}

function bindTouchControls() {
    const pads = document.querySelectorAll('.pad-btn');
    if (pads.length > 0) {
        pads.forEach(btn => {
            const action = btn.dataset.action;
            const start = (e) => { e.preventDefault(); controls.handleTouchStart(action); };
            const end = (e) => { e.preventDefault(); controls.handleTouchEnd(action); };

            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
        });
    }

    // Touch Binding for Interact
    const interactBtn = document.getElementById('mobile-interact-btn');
    if (interactBtn) {
        const triggerInteract = (e) => {
            e.preventDefault();
            if (currentFocus) openModal(currentFocus.userData);
        };
        interactBtn.addEventListener('touchstart', triggerInteract);
        interactBtn.addEventListener('click', triggerInteract);
    }
}

let isMobile = false;
function checkMobile() {
    isMobile = window.innerWidth <= 768;
    if (isMobile) {
        document.getElementById('touch-controls').classList.remove('hidden');
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onInteract(event) {
    // Check for keyboard 'E' or virtual button press
    if (event.code === 'KeyE') {
        if (controls.isLocked && currentFocus) {
            openModal(currentFocus.userData);
        }
    }
}

function openModal(data) {
    modalTitle.textContent = data.name;
    modalDesc.textContent = data.desc;
    modal.classList.add('visible');
    controls.unlock(); // Unlocks pointer so user can click 'Close'
}

function closeModal() {
    modal.classList.remove('visible');
    controls.lock();
}

function animate() {
    animateId = requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    if (controls.isLocked) {
        controls.update(delta);

        // Raycasting
        const intersected = world.checkIntersection(camera);

        if (intersected) {
            currentFocus = intersected;
            interactPrompt.classList.add('visible');
            interactPrompt.innerHTML = `PRESS [E] TO INSPECT <span style="color:var(--neon-pink)">${intersected.userData.name}</span>`;

            // Spin effect when looking at it
            intersected.rotation.y += 2 * delta;
        } else {
            currentFocus = null;
            interactPrompt.classList.remove('visible');
        }
    }

    world.animate(time);
    renderer.render(scene, camera);
}
