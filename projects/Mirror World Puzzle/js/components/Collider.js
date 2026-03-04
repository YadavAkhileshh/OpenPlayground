import Component from '../ecs/Component.js';

export default class Collider extends Component {
    constructor(width = 32, height = 32, isTrigger = false, tag = 'obstacle') {
        super();
        this.width = width;
        this.height = height;
        this.isTrigger = isTrigger;
        this.tag = tag; // 'player', 'wall', 'exit', 'hazard'
    }
}
