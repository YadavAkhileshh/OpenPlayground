class Spawner {
    constructor(game) {
        this.game = game;
        this.queue = [];
        this.bag = [];
        this.refillBag();
    }

    refillBag() {
        const shapes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        // Shuffle
        for (let i = shapes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
        }
        this.bag = shapes;
    }

    getNext() {
        if (this.bag.length === 0) this.refillBag();
        return this.bag.pop();
    }

    spawn() {
        const type = this.getNext();
        // Center x: Grid is 400 wide. 10 cols.
        // Start roughly at col 4 (160px).
        // Start y: -80 (above screen).

        const body = TetrominoFactory.create(type, 160, -80, 40);
        this.game.physics.addBody(body);
        this.game.currentBody = body;

        // Update UI preview (Next Piece) - TODO
    }
}
