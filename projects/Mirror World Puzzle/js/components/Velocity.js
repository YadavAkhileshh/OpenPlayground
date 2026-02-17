import Component from '../ecs/Component.js';
import Vector2 from '../utils/Vector2.js';

export default class Velocity extends Component {
    constructor(x = 0, y = 0) {
        super();
        this.velocity = new Vector2(x, y);
    }
}
