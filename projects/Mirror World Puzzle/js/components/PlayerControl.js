import Component from '../ecs/Component.js';

export default class PlayerControl extends Component {
    constructor(playerIndex = 0) { // 0: Left/Main, 1: Right/Mirror
        super();
        this.playerIndex = playerIndex;
        this.speed = 200;
    }
}
