class FiniteAutomaton {
    constructor() {
        this.states = [];
        this.transitions = [];
        this.startState = null;
        this.currentState = null;
    }

    addState(x, y) {
        const id = this.states.length;
        this.states.push({
            id,
            x,
            y,
            isStart: false,
            isAccept: false
        });
        return id;
    }

    addTransition(from, to, symbol) {
        this.transitions.push({ from, to, symbol });
    }

    setStartState(stateId) {
        if (this.startState !== null) {
            this.states[this.startState].isStart = false;
        }
        this.states[stateId].isStart = true;
        this.startState = stateId;
    }

    setAcceptState(stateId) {
        this.states[stateId].isAccept = !this.states[stateId].isAccept;
    }

    simulate(inputString) {
        if (this.startState === null) return { accepted: false, steps: ['No start state defined'] };

        let currentState = this.startState;
        const steps = [`Started at state ${currentState}`];

        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const transition = this.transitions.find(t => t.from === currentState && t.symbol === symbol);

            if (!transition) {
                steps.push(`No transition for '${symbol}' from state ${currentState}`);
                return { accepted: false, steps };
            }

            currentState = transition.to;
            steps.push(`Transitioned to state ${currentState} on '${symbol}'`);
        }

        const accepted = this.states[currentState].isAccept;
        steps.push(accepted ? 'String accepted' : 'String rejected');
        return { accepted, steps };
    }

    clear() {
        this.states = [];
        this.transitions = [];
        this.startState = null;
        this.currentState = null;
    }
}

// Konva.js setup
const stage = new Konva.Stage({
    container: 'canvas',
    width: 800,
    height: 500,
});

const layer = new Konva.Layer();
stage.add(layer);

const fa = new FiniteAutomaton();
let mode = null;
let selectedStates = [];
let stateCounter = 0;

function drawState(state) {
    const circle = new Konva.Circle({
        x: state.x,
        y: state.y,
        radius: 30,
        fill: state.isAccept ? '#4CAF50' : '#2196F3',
        stroke: '#000',
        strokeWidth: state.isAccept ? 3 : 2,
        draggable: true,
    });

    const text = new Konva.Text({
        x: state.x - 10,
        y: state.y - 10,
        text: state.id.toString(),
        fontSize: 18,
        fill: 'white',
        align: 'center',
    });

    const group = new Konva.Group();
    group.add(circle);
    group.add(text);

    if (state.isStart) {
        const arrow = new Konva.Arrow({
            points: [state.x - 50, state.y, state.x - 30, state.y],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 2,
        });
        group.add(arrow);
    }

    circle.on('click', () => {
        if (mode === 'addTransition' && selectedStates.length < 2) {
            selectedStates.push(state.id);
            circle.fill('#FF9800');
            layer.draw();
            if (selectedStates.length === 2) {
                const symbol = prompt('Enter transition symbol:');
                if (symbol) {
                    fa.addTransition(selectedStates[0], selectedStates[1], symbol);
                    drawTransition(selectedStates[0], selectedStates[1], symbol);
                }
                selectedStates = [];
                mode = null;
                updateStateColors();
            }
        } else if (mode === 'setStart') {
            fa.setStartState(state.id);
            mode = null;
            redraw();
        } else if (mode === 'setAccept') {
            fa.setAcceptState(state.id);
            mode = null;
            redraw();
        }
    });

    circle.on('dragend', () => {
        state.x = circle.x();
        state.y = circle.y();
        text.x(state.x - 10);
        text.y(state.y - 10);
        redrawTransitions();
        layer.draw();
    });

    layer.add(group);
}

function drawTransition(from, to, symbol) {
    const fromState = fa.states[from];
    const toState = fa.states[to];

    const line = new Konva.Arrow({
        points: [fromState.x, fromState.y, toState.x, toState.y],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
    });

    const text = new Konva.Text({
        x: (fromState.x + toState.x) / 2 - 10,
        y: (fromState.y + toState.y) / 2 - 10,
        text: symbol,
        fontSize: 14,
        fill: 'black',
    });

    layer.add(line);
    layer.add(text);
}

function redraw() {
    layer.destroyChildren();
    fa.states.forEach(drawState);
    fa.transitions.forEach(t => drawTransition(t.from, t.to, t.symbol));
    layer.draw();
}

function redrawTransitions() {
    // Remove old transitions and redraw
    const children = layer.children.slice();
    children.forEach(child => {
        if (child instanceof Konva.Arrow || (child instanceof Konva.Text && child !== layer.children[0])) {
            child.destroy();
        }
    });
    fa.transitions.forEach(t => drawTransition(t.from, t.to, t.symbol));
}

function updateStateColors() {
    layer.children.forEach(child => {
        if (child instanceof Konva.Group) {
            const circle = child.children[0];
            const stateId = parseInt(child.children[1].text());
            const state = fa.states[stateId];
            circle.fill(state.isAccept ? '#4CAF50' : '#2196F3');
        }
    });
    layer.draw();
}

// Event listeners
document.getElementById('addState').addEventListener('click', () => {
    mode = 'addState';
    stage.on('click', (e) => {
        if (mode === 'addState' && e.target === stage) {
            const pos = stage.getPointerPosition();
            const id = fa.addState(pos.x, pos.y);
            drawState(fa.states[id]);
            layer.draw();
            mode = null;
        }
    });
});

document.getElementById('addTransition').addEventListener('click', () => {
    mode = 'addTransition';
    selectedStates = [];
    updateStateColors();
});

document.getElementById('setStart').addEventListener('click', () => {
    mode = 'setStart';
});

document.getElementById('setAccept').addEventListener('click', () => {
    mode = 'setAccept';
});

document.getElementById('clear').addEventListener('click', () => {
    fa.clear();
    layer.destroyChildren();
    layer.draw();
    document.getElementById('result').innerHTML = '';
    document.getElementById('simulationSteps').innerHTML = '';
});

document.getElementById('simulate').addEventListener('click', () => {
    const input = document.getElementById('inputString').value;
    const result = fa.simulate(input);
    document.getElementById('result').innerHTML = result.accepted ? 'Accepted' : 'Rejected';
    document.getElementById('result').className = result.accepted ? 'accepted' : 'rejected';

    const stepsDiv = document.getElementById('simulationSteps');
    stepsDiv.innerHTML = '';
    result.steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.textContent = step;
        stepsDiv.appendChild(stepDiv);
    });
});

// Initial draw
layer.draw();
