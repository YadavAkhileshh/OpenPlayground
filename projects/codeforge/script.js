const canvas = document.getElementById("astCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let tokens = [];
let position = 0;

function tokenize(input) {
    const regex = /\s*(let|[a-zA-Z_]\w*|\d+|\+|\=|;)\s*/g;
    let match;
    tokens = [];

    while ((match = regex.exec(input)) !== null) {
        tokens.push(match[1]);
    }
}

function peek() {
    return tokens[position];
}

function consume(expected) {
    if (tokens[position] === expected) {
        position++;
    } else {
        throw new Error(`Expected ${expected}, found ${tokens[position]}`);
    }
}

function parseProgram() {
    const body = [];
    while (position < tokens.length) {
        body.push(parseStatement());
    }
    return { type: "Program", body };
}

function parseStatement() {
    if (peek() === "let") {
        consume("let");
        const identifier = tokens[position++];
        consume("=");
        const expression = parseExpression();
        consume(";");
        return {
            type: "VariableDeclaration",
            name: identifier,
            value: expression
        };
    }
}

function parseExpression() {
    let left = parseTerm();

    while (peek() === "+") {
        consume("+");
        const right = parseTerm();
        left = {
            type: "BinaryExpression",
            operator: "+",
            left,
            right
        };
    }

    return left;
}

function parseTerm() {
    const token = tokens[position++];

    if (!isNaN(token)) {
        return { type: "Literal", value: Number(token) };
    }

    return { type: "Identifier", name: token };
}

function compile() {
    const input = document.getElementById("codeInput").value;
    const consoleBox = document.getElementById("console");

    try {
        tokenize(input);
        position = 0;
        const ast = parseProgram();
        consoleBox.textContent = "Compilation Successful!";
        drawAST(ast);
    } catch (error) {
        consoleBox.textContent = "Error: " + error.message;
    }
}

function drawAST(ast) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNode(ast, 450, 50);
}

function drawNode(node, x, y) {
    ctx.fillStyle = "#58a6ff";
    ctx.fillRect(x - 50, y - 20, 100, 40);
    ctx.fillStyle = "black";
    ctx.fillText(node.type, x - 30, y + 5);

    if (node.body) {
        node.body.forEach((child, index) => {
            const childX = x - 200 + index * 400;
            const childY = y + 100;
            drawEdge(x, y, childX, childY);
            drawNode(child, childX, childY);
        });
    }

    if (node.value && node.value.type) {
        const childY = y + 100;
        drawEdge(x, y, x, childY);
        drawNode(node.value, x, childY);
    }

    if (node.left) {
        drawEdge(x, y, x - 100, y + 100);
        drawNode(node.left, x - 100, y + 100);
    }

    if (node.right) {
        drawEdge(x, y, x + 100, y + 100);
        drawNode(node.right, x + 100, y + 100);
    }
}

function drawEdge(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#c9d1d9";
    ctx.stroke();
}