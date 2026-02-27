import Component from '../ecs/Component.js';

export default class Sprite extends Component {
    constructor(color = '#fff', width = 32, height = 32) {
        super();
        this.color = color;
        this.width = width;
        this.height = height;
        this.visible = true;
    }
}
