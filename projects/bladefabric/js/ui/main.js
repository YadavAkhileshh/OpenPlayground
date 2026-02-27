// main.js
import { Engine } from '../core/engine.js';
import { Canvas } from '../core/canvas.js';
import { Camera } from '../core/camera.js';
import { Input } from '../core/input.js';
import { World } from '../physics/world.js';
import { UIManager } from './uiManager.js';
import { Renderer } from '../render/renderer.js';
import { ParticleSystem } from '../effects/particleSystem.js';
import { globalEvents } from '../core/eventBus.js';

// Physics components
import { AABBTree } from '../physics/collision/aabbTree.js';
import { CollisionDetector } from '../physics/collision/detector.js';
import { Solver } from '../physics/dynamics/solver.js';
import { Integrator } from '../physics/dynamics/integrator.js';
import { PositionSolver } from '../physics/dynamics/positionSolver.js';
import { SlicingAlgorithm } from '../physics/dynamics/slicingAlgorithm.js';
import { PolygonSplitter } from '../physics/dynamics/polygonSplitter.js';
import { TearingLogic } from '../physics/dynamics/tearing.js';

// Objects
import { Wall } from '../objects/wall.js';
import { Blade } from '../objects/blade.js';
import { ClothFactory } from '../objects/cloth.js';

// Math
import { Vec2 } from '../math/vec2.js';
import { Segment } from '../math/segment.js';
import { PolygonMath } from '../math/polygon.js';
import { PolygonShape } from '../physics/polygonShape.js';
import { Body, BodyType } from '../physics/body.js';
import { randomRange } from '../math/mathUtils.js';

class GameApp {
    constructor() {
        this.engine = new Engine();
        this.canvasSys = new Canvas('physics-canvas');
        this.camera = new Camera(this.canvasSys.canvas);
        this.input = new Input(this.canvasSys.canvas, this.camera);
        this.world = new World();
        this.particleSystem = new ParticleSystem();
        this.uiManager = new UIManager();
        this.renderer = new Renderer(this.canvasSys, this.camera, this.world, this.particleSystem, this.input);

        // Inject Physics Dependencies
        this.world.broadphase = new AABBTree();
        this.world.detector = new CollisionDetector();
        this.world.solver = new Solver();
        this.world.integrator = new Integrator();
        this.world.positionSolver = new PositionSolver();
        this.world.slicingAlgorithm = SlicingAlgorithm;
        this.world.tearingLogic = new TearingLogic();

        this.setupSystems();
        this.setupEvents();
        this.setupScene();

        globalEvents.emit('notify', 'BladeFabric Initialized');
        this.engine.start();
    }

    setupSystems() {
        // Main update loop
        this.engine.addSystem({
            updateFixed: (dt) => {
                this.world.updateFixed(dt);
                this.particleSystem.update(dt);

                // Keep blades spinning
                for (let b of this.world.bodies) {
                    if (b.isBlade) {
                        b.transform.setAngle(b.transform.angle + b.angularVelocity * dt);
                    }
                }

                // Track stats
                globalEvents.emit('stats_update', {
                    bodies: this.world.bodies.length,
                    contacts: this.world.contacts.length
                });
            }
        });

        // Rendering
        this.engine.addRenderSystem(this.renderer);
    }

    setupEvents() {
        globalEvents.on('reset_scene', () => this.setupScene());

        globalEvents.on('spawn_box', () => {
            const width = Math.random() * 50 + 50;
            const height = Math.random() * 50 + 50;
            const shape = new PolygonShape(PolygonMath.createBox(width, height));
            const body = new Body(shape, 0, 300, BodyType.DYNAMIC);
            body.color = '#fff';
            body.velocity.x = (Math.random() - 0.5) * 100;
            this.world.addBody(body);
        });

        globalEvents.on('spawn_poly', () => {
            const radius = Math.random() * 30 + 30;
            const sides = Math.floor(Math.random() * 3) + 5;
            const shape = new PolygonShape(PolygonMath.createRegularPolygon(sides, radius));
            const body = new Body(shape, 0, 300, BodyType.DYNAMIC);
            body.color = '#f4f4f5';
            this.world.addBody(body);
        });

        globalEvents.on('spawn_blade', () => {
            Blade.create(this.world, 0, 0, 80, 8, 30);
        });

        globalEvents.on('spawn_cloth', () => {
            ClothFactory.createBanner(this.world, 0, 200, 200, 150, 20);
        });

        globalEvents.on('slice_end', (data) => {
            this.handleSlicing(data.start, data.end);
        });

        globalEvents.on('mouse_right_down', (data) => {
            // Optional explosion at mouse
            for (let b of this.world.bodies) {
                if (b.type === BodyType.DYNAMIC || b.type === BodyType.SOFT) {
                    const v = Vec2.sub(b.position, data.pos);
                    const d = v.lengthSq();
                    if (d < 40000) {
                        v.normalize().mul(50000000 / (d + 1000));
                        b.applyForce(v);
                    }
                }
            }
            globalEvents.emit('spawn_sparks', { x: data.pos.x, y: data.pos.y, count: 20 });
        });
    }

    handleSlicing(start, end) {
        // Very fast movements could slice essentially everything
        const raySegment = new Segment(start, end);
        // Add a bit of thickness to the ray
        const bodiesToSlice = [...this.world.bodies];

        let sliced = false;
        for (const body of bodiesToSlice) {
            if (!body.isSlicable) continue;

            // Fast AABB check
            const aabb = body.getAABB();
            const minX = Math.min(start.x, end.x);
            const maxX = Math.max(start.x, end.x);
            const minY = Math.min(start.y, end.y);
            const maxY = Math.max(start.y, end.y);

            if (aabb.max.x < minX || aabb.min.x > maxX || aabb.max.y < minY || aabb.min.y > maxY) {
                continue;
            }

            const result = SlicingAlgorithm.sliceBody(body, raySegment);
            if (result) {
                if (PolygonSplitter.split(result, this.world)) {
                    sliced = true;
                    // Spawn sparks at cut points
                    globalEvents.emit('spawn_sparks', { x: result.intersections[0].point.x, y: result.intersections[0].point.y, count: 5 });
                    globalEvents.emit('spawn_sparks', { x: result.intersections[1].point.x, y: result.intersections[1].point.y, count: 5 });
                }
            }
        }
    }

    setupScene() {
        this.world.clear();

        // Ground
        Wall.create(this.world, 0, -350, 1200, 100);
        // Walls
        Wall.create(this.world, -600, 0, 100, 600);
        Wall.create(this.world, 600, 0, 100, 600);

        // Spawn some initial blades
        Blade.create(this.world, -300, -100, 80, 8, -60);
        Blade.create(this.world, 300, -100, 80, 8, 60);

        // Spawn initial cloth banner
        ClothFactory.createBanner(this.world, 0, 200, 300, 150, 18);

        // Setup Camera to see the whole arena
        this.camera.position.set(0, 0);
        this.camera.zoom = 1.0;
    }
}

// Bootstrap
window.onload = () => {
    window.gameApp = new GameApp();
};
