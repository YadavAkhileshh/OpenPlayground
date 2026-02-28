function tokenize(input){
    const tokens = [];
    const regex = /\s*(=>|let|print|[A-Za-z_]\w*|\d+|\+|\-|\*|\/|\=|\(|\)|;)\s*/g;

    let match;
    while((match = regex.exec(input)) !== null){
        tokens.push(match[1]);
    }

    return tokens;
}


function parse(tokens){
    let position = 0;

    function peek(){
        return tokens[position];
    }

    function consume(){
        return tokens[position++];
    }

    function parseStatement(){
        if(peek() === "let"){
            consume(); // let
            const name = consume();
            consume(); // =
            const value = parseExpression();
            consume(); // ;
            return {type:"VariableDeclaration", name, value};
        }

        if(peek() === "print"){
            consume();
            consume(); // (
            const value = parseExpression();
            consume(); // )
            consume(); // ;
            return {type:"PrintStatement", value};
        }
    }

    function parseExpression(){
        let left = parseTerm();

        while(peek() === "+" || peek() === "-"){
            const operator = consume();
            const right = parseTerm();
            left = {type:"BinaryExpression", operator, left, right};
        }

        return left;
    }

    function parseTerm(){
        let left = parseFactor();

        while(peek() === "*" || peek() === "/"){
            const operator = consume();
            const right = parseFactor();
            left = {type:"BinaryExpression", operator, left, right};
        }

        return left;
    }

    function parseFactor(){
        const token = peek();

        if(!isNaN(token)){
            consume();
            return {type:"Literal", value:Number(token)};
        }

        if(token.match(/[A-Za-z_]\w*/)){
            consume();
            return {type:"Identifier", name:token};
        }

        if(token === "("){
            consume();
            const expr = parseExpression();
            consume(); // )
            return expr;
        }
    }

    const statements = [];
    while(position < tokens.length){
        statements.push(parseStatement());
    }

    return {type:"Program", body:statements};
}


function evaluate(node, env){
    switch(node.type){

        case "Program":
            node.body.forEach(stmt => evaluate(stmt, env));
            break;

        case "VariableDeclaration":
            env[node.name] = evaluate(node.value, env);
            break;

        case "PrintStatement":
            const val = evaluate(node.value, env);
            appendOutput(val);
            break;

        case "BinaryExpression":
            const left = evaluate(node.left, env);
            const right = evaluate(node.right, env);

            switch(node.operator){
                case "+": return left + right;
                case "-": return left - right;
                case "*": return left * right;
                case "/": return left / right;
            }
            break;

        case "Literal":
            return node.value;

        case "Identifier":
            if(node.name in env) return env[node.name];
            throw new Error("Undefined variable: " + node.name);
    }
}


const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");

function appendOutput(text){
    output.textContent += text + "\n";
}

runBtn.addEventListener("click", ()=>{
    output.textContent = "";

    try{
        const code = document.getElementById("code").value;
        const tokens = tokenize(code);
        const ast = parse(tokens);
        evaluate(ast, {});
    }catch(e){
        appendOutput("Error: " + e.message);
    }
});
