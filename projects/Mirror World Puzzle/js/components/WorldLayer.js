import Component from '../ecs/Component.js';

export default class WorldLayer extends Component {
    constructor(layer = 'left') { // 'left' or 'right'
        super();
        this.layer = layer;
    }
}
