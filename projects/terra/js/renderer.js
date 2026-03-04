/**
 * Renderer and Camera System
 * Handles Three.js setup, rendering, and camera controls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Renderer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.planet = null;
        this.water = null;
        this.atmosphere = null;
        this.lights = {
            directional: null,
            ambient: null
        };

        this.initialize();
    }

    // Initialize Three.js scene
    initialize() {
        console.log('  📐 Creating scene...');
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1a);

        console.log('  📷 Creating camera...');
        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 30);

        console.log('  🖼️ Creating renderer...');
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: window.devicePixelRatio < 2, // Only use antialiasing on lower DPI screens
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
        this.renderer.shadowMap.enabled = false; // Disable for performance
        this.container.appendChild(this.renderer.domElement);

        console.log('  🎮 Creating controls...');
        // Create orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 100;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // Add lights
        console.log('  💡 Setting up lights...');
        this.setupLights();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('  ✅ Renderer initialized');
    }

    // Setup scene lighting
    setupLights() {
        // Directional light (sun)
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.5);
        this.lights.directional.position.set(50, 50, 50);
        this.lights.directional.castShadow = false; // Disable shadows for better performance
        this.lights.directional.shadow.mapSize.width = 1024;
        this.lights.directional.shadow.mapSize.height = 1024;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 500;
        this.scene.add(this.lights.directional);

        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.lights.ambient);

        // Add a subtle hemisphere light for atmospheric scattering
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x0a0e1a, 0.3);
        this.scene.add(hemiLight);
    }

    // Create planet mesh
    createPlanet(geometry, showWater = true, showAtmosphere = true) {
        // Remove existing planet if any
        if (this.planet) {
            this.scene.remove(this.planet);
            this.planet.geometry.dispose();
            this.planet.material.dispose();
        }

        if (this.water) {
            this.scene.remove(this.water);
            this.water.geometry.dispose();
            this.water.material.dispose();
        }

        if (this.atmosphere) {
            this.scene.remove(this.atmosphere);
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }

        // Create planet material
        const planetMaterial = new THREE.MeshPhongMaterial({
            vertexColors: true,
            flatShading: false,
            shininess: 5
        });

        this.planet = new THREE.Mesh(geometry, planetMaterial);
        this.planet.castShadow = false;
        this.planet.receiveShadow = false;
        this.scene.add(this.planet);

        // Create water sphere
        if (showWater) {
            const waterGeometry = new THREE.SphereGeometry(10.1, 32, 32);
            const waterMaterial = new THREE.MeshPhongMaterial({
                color: 0x1155aa,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0x666666
            });
            this.water = new THREE.Mesh(waterGeometry, waterMaterial);
            this.scene.add(this.water);
        }

        // Create atmosphere glow
        if (showAtmosphere) {
            const atmosphereGeometry = new THREE.SphereGeometry(12, 32, 32);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x4a9eff,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            });
            this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            this.scene.add(this.atmosphere);
        }
    }

    // Update planet geometry
    updatePlanetGeometry(geometry) {
        if (this.planet) {
            this.planet.geometry.dispose();
            this.planet.geometry = geometry;
        }
    }

    // Toggle wireframe mode
    setWireframe(enabled) {
        if (this.planet) {
            this.planet.material.wireframe = enabled;
        }
    }

    // Toggle water visibility
    setWaterVisible(visible) {
        if (this.water) {
            this.water.visible = visible;
        }
    }

    // Toggle atmosphere visibility
    setAtmosphereVisible(visible) {
        if (this.atmosphere) {
            this.atmosphere.visible = visible;
        }
    }

    // Render scene
    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Handle window resize
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Get scene for external access
    getScene() {
        return this.scene;
    }

    // Get camera for external access
    getCamera() {
        return this.camera;
    }

    // Get lights for external access
    getLights() {
        return this.lights;
    }

    // Get atmosphere for external access
    getAtmosphere() {
        return this.atmosphere;
    }

    // Set auto-rotate
    setAutoRotate(enabled) {
        this.controls.autoRotate = enabled;
    }

    // Cleanup
    dispose() {
        this.renderer.dispose();
        this.controls.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }
}

export default Renderer;
