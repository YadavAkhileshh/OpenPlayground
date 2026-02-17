import Component from '../ecs/Component.js';

export default class MirrorMovement extends Component {
    constructor(invertX = true, invertY = false) {
        super();
        this.invertX = invertX;
        this.invertY = invertY;
    }
}
