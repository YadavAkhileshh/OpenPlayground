export default class System {
    constructor() {
        this.world = null;
    }

    init(world) {
        this.world = world;
    }

    update(dt) {
        // Override
    }

    render(alpha) {
        // Override
    }
}
