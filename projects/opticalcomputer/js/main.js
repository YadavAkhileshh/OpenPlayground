import { Renderer } from './ui/renderer.js';
import { InputHandler } from './ui/input.js';
import { Toolbar } from './ui/toolbar.js';
import { Inspector } from './ui/inspector.js';
import { Raycaster } from './engine/raycaster.js';
import { Laser } from './components/laser.js';
import { Mirror } from './components/mirror.js';
import { Splitter } from './components/splitter.js';
import { Sensor } from './components/sensor.js';
import { LogicGate } from './components/gate.js';
import { Filter } from './components/filter.js';
import { Prism } from './components/prism.js';
import { Circuit } from './logic/circuit.js';
import { Store } from './engine/store.js';
import { ParticleSystem } from './engine/particles.js';

class App {
    constructor() {
        this.canvas = document.getElementById('simulation-canvas');
        this.scene = []; // List of components

        this.renderer = new Renderer(this.canvas);
        this.input = new InputHandler(this.canvas, this.scene);
        this.raycaster = new Raycaster(this.scene);
        this.circuit = new Circuit(this.scene);
        this.particles = new ParticleSystem();

        this.toolbar = new Toolbar('component-palette', this);
        this.inspector = new Inspector('properties-panel');

        this.lastTime = 0;

        if (!this.loadScene()) {
            this.initDemoScene();
        }

        this.setupControls();
        this.hookInput();

        requestAnimationFrame(this.loop.bind(this));
    }

    hookInput() {
        this.input.onSelectionChange = (comp) => {
            this.inspector.update(comp);
        };

        const originalAdd = this.input.addComponent.bind(this.input);
        this.input.addComponent = (type) => {
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            let comp;

            if (['AND', 'OR', 'NOT'].includes(type)) {
                comp = new LogicGate(cx, cy, type);
            } else if (type === 'filter') {
                comp = new Filter(cx, cy);
            } else if (type === 'prism') {
                comp = new Prism(cx, cy);
            }

            if (comp) {
                this.scene.push(comp);
                this.input.select(comp);
            } else {
                originalAdd(type);
            }
        };
    }

    setupControls() {
        document.getElementById('btn-clear').onclick = () => {
            this.scene.length = 0;
            this.input.select(null);
        };

        document.getElementById('btn-reset').onclick = () => {
            this.scene.length = 0;
            this.initDemoScene();
            this.input.select(null);
        };

        const headerCtrls = document.querySelector('.controls');
        if (!document.getElementById('btn-save')) {
            const saveBtn = document.createElement('button');
            saveBtn.id = 'btn-save';
            saveBtn.className = 'btn secondary';
            saveBtn.textContent = 'Save';
            saveBtn.onclick = () => Store.save(this.scene);

            headerCtrls.insertBefore(saveBtn, document.getElementById('btn-reset'));
        }
    }

    loadScene() {
        const data = Store.load();
        if (!data) return false;

        this.scene.length = 0;

        data.forEach(d => {
            let comp;
            switch (d.type) {
                case 'laser': comp = new Laser(d.x, d.y); comp.color = d.color; comp.isOn = d.isOn; break;
                case 'mirror': comp = new Mirror(d.x, d.y); break;
                case 'splitter': comp = new Splitter(d.x, d.y); if (d.ratio) comp.ratio = d.ratio; break;
                case 'sensor': comp = new Sensor(d.x, d.y); break;
                case 'gate': comp = new LogicGate(d.x, d.y, d.op); break;
                case 'filter': comp = new Filter(d.x, d.y); comp.color = d.color; break;
                case 'prism': comp = new Prism(d.x, d.y); if (d.ior) comp.ior = d.ior; break;
            }
            if (comp) {
                comp.rotate(d.rotation);
                this.scene.push(comp);
            }
        });
        return true;
    }

    initDemoScene() {
        const laser = new Laser(100, 300);
        const mirror = new Mirror(300, 300);
        mirror.rotate(Math.PI / 4);

        const laser2 = new Laser(100, 450);
        const laser3 = new Laser(100, 500);
        const gate = new LogicGate(300, 475, 'AND');

        const prism = new Prism(500, 300);

        this.scene.push(laser, mirror, laser2, laser3, gate, prism);
    }

    loop(timestamp) {
        this.scene.filter(c => c.type === 'gate').forEach(g => g.reset());
        this.scene.filter(c => c.type === 'sensor').forEach(s => s.reset());

        let allRays = [];

        // Pass 1: Lasers
        const lasers = this.scene.filter(c => c.type === 'laser');
        const rays1 = this.raycaster.trace(lasers);
        allRays = [...rays1];

        // Pass 2: Gates
        const gates = this.scene.filter(c => c.type === 'gate');
        const rays2 = this.raycaster.trace(gates);

        allRays = [...allRays, ...rays2];

        this.circuit.update();
        this.particles.update();

        allRays.forEach(ray => {
            if (Math.random() < 0.01) {
                this.particles.emit(ray.end.x, ray.end.y, ray.color, 1);
            }
        });

        this.renderer.render(this.scene, allRays);
        this.particles.draw(this.renderer.ctx);

        if (timestamp - this.lastTime > 500) {
            document.getElementById('debug-rays').textContent = allRays.length;
            document.getElementById('debug-tick').textContent = Math.floor(timestamp);
            document.getElementById('debug-fps').textContent = "60";
            this.lastTime = timestamp;
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
