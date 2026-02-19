import System from '../ecs/System.js';

export default class RenderSystem extends System {
    constructor() {
        super();
        this.canvasLeft = document.getElementById('world-left');
        this.ctxLeft = this.canvasLeft.getContext('2d');
        this.canvasRight = document.getElementById('world-right');
        this.ctxRight = this.canvasRight.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Initial sizing, usually fixed resolution scaled up is better for pixel art games
        this.canvasLeft.width = 800;
        this.canvasLeft.height = 600;
        this.canvasRight.width = 800;
        this.canvasRight.height = 600;
    }

    render(alpha) {
        // Clear
        this.ctxLeft.fillStyle = '#16213e';
        this.ctxLeft.fillRect(0, 0, this.canvasLeft.width, this.canvasLeft.height);

        this.ctxRight.fillStyle = '#0f3460';
        this.ctxRight.fillRect(0, 0, this.canvasRight.width, this.canvasRight.height);

        const entities = this.world.getEntitiesWith(['Transform', 'Sprite', 'WorldLayer']);

        entities.forEach(entity => {
            const transform = entity.getComponent('Transform');
            const sprite = entity.getComponent('Sprite');
            const layer = entity.getComponent('WorldLayer').layer;

            const ctx = layer === 'left' ? this.ctxLeft : this.ctxRight;

            if (sprite.visible) {
                ctx.fillStyle = sprite.color;
                ctx.fillRect(
                    transform.position.x,
                    transform.position.y,
                    sprite.width * transform.scale.x,
                    sprite.height * transform.scale.y
                );
            }
        });
    }
}
