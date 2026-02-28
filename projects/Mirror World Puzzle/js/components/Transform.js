import Component from '../ecs/Component.js';
import Vector2 from '../utils/Vector2.js';

export default class Transform extends Component {
    constructor(x = 0, y = 0) {
        super();
        this.position = new Vector2(x, y);
        this.scale = new Vector2(1, 1);
        this.rotation = 0;
    }
}
