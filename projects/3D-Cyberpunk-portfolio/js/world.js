import * as THREE from 'three';

export class World {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.projects = [];
        this.projectRaycaster = new THREE.Raycaster();

        // Container Group (for easy cleanup)
        this.container = new THREE.Group();
        this.scene.add(this.container);

        this._initLights();
        this._initFloor();
        this._initWalls();
        this._initProjects();
    }

    _initLights() {
        const { primary, secondary } = this.config.theme;

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0x001133, 0.5);
        this.container.add(ambientLight);

        // Point Light
        const pointLight = new THREE.PointLight(new THREE.Color(secondary), 1, 100);
        pointLight.position.set(0, 5, 0);
        this.container.add(pointLight);
    }

    _initFloor() {
        const { floor, primary } = this.config.theme;

        if (floor === 'grid') {
            const gridHelper = new THREE.GridHelper(100, 100, new THREE.Color(primary), 0x111111);
            this.container.add(gridHelper);
        } else if (floor === 'hex') {
            // Placeholder: Could be a custom hex grid texture
            const gridHelper = new THREE.GridHelper(100, 20, new THREE.Color(primary), 0x000000);
            this.container.add(gridHelper);
        }

        // Reflective Plane
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 90,
            transparent: true,
            opacity: 0.8
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.1;
        this.container.add(plane);
    }

    _initWalls() {
        const { primary } = this.config.theme;
        const wallMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(primary), wireframe: true, transparent: true, opacity: 0.1 });
        const wallGeo = new THREE.BoxGeometry(40, 10, 40);
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.y = 5;
        this.container.add(walls);
    }

    _initProjects() {
        // Distribute projects in a circle
        const radius = 15;
        const count = this.config.projects.length;

        this.config.projects.forEach((data, i) => {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Pedestal
            const geo = new THREE.BoxGeometry(2, 3, 2);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                emissive: new THREE.Color(data.color),
                emissiveIntensity: 0.2,
                roughness: 0.1,
                metalness: 0.8
            });
            const pedestal = new THREE.Mesh(geo, mat);
            pedestal.position.set(x, 1.5, z);
            pedestal.lookAt(0, 1.5, 0); // Face center

            // Hologram
            const holoGeo = new THREE.IcosahedronGeometry(0.8);
            const holoMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(data.color), wireframe: true, transparent: true, opacity: 0.8 });
            const hologram = new THREE.Mesh(holoGeo, holoMat);
            hologram.position.set(x, 3.5, z);

            hologram.userData = {
                isProject: true,
                name: data.name,
                desc: data.desc
            };

            this.container.add(pedestal);
            this.container.add(hologram);
            this.projects.push(hologram);
        });
    }

    animate(time) {
        this.projects.forEach((proj, i) => {
            proj.rotation.x = time * 0.001 + i;
            proj.rotation.y = time * 0.002;
        });
    }

    checkIntersection(camera) {
        this.projectRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = this.projectRaycaster.intersectObjects(this.projects);

        if (intersects.length > 0) {
            return intersects[0].object;
        }
        return null;
    }
}
