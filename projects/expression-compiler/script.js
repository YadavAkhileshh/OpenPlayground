//  TOKENIZER 
function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char)) {
      let num = "";
      while (/\d/.test(input[i])) {
        num += input[i++];
      }
      tokens.push({ type: "NUMBER", value: Number(num) });
      continue;
    }

    if ("+-*/()".includes(char)) {
      tokens.push({ type: char, value: char });
      i++;
      continue;
    }

    throw new Error("Unexpected character: " + char);
  }

  return tokens;
}

//  PARSER 
function parse(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume(type) {
    const token = tokens[pos];
    if (!token || token.type !== type) {
      throw new Error(`Expected ${type}`);
    }
    pos++;
    return token;
  }

  function parseExpression() {
    let node = parseTerm();
    while (peek() && (peek().type === "+" || peek().type === "-")) {
      const operator = consume(peek().type);
      node = {
        type: "BinaryExpression",
        operator: operator.value,
        left: node,
        right: parseTerm()
      };
    }
    return node;
  }

  function parseTerm() {
    let node = parseFactor();
    while (peek() && (peek().type === "*" || peek().type === "/")) {
      const operator = consume(peek().type);
      node = {
        type: "BinaryExpression",
        operator: operator.value,
        left: node,
        right: parseFactor()
      };
    }
    return node;
  }

  function parseFactor() {
    const token = peek();

    if (token.type === "NUMBER") {
      consume("NUMBER");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "(") {
      consume("(");
      const expr = parseExpression();
      consume(")");
      return expr;
    }

    throw new Error("Unexpected token");
  }

  return parseExpression();
}

//  EVALUATOR 
function evaluate(node, steps) {
  if (node.type === "Literal") {
    steps.push(`Return ${node.value}`);
    return node.value;
  }

  const left = evaluate(node.left, steps);
  const right = evaluate(node.right, steps);

  let result;
  switch (node.operator) {
    case "+": result = left + right; break;
    case "-": result = left - right; break;
    case "*": result = left * right; break;
    case "/": result = left / right; break;
  }

  steps.push(`${left} ${node.operator} ${right} = ${result}`);
  return result;
}

//  UI 
const inputEl = document.getElementById("expressionInput");
const runBtn = document.getElementById("runBtn");

const tokensEl = document.getElementById("tokens");
const astEl = document.getElementById("ast");
const stepsEl = document.getElementById("steps");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");

runBtn.onclick = () => {
  errorEl.textContent = "";
  stepsEl.innerHTML = "";

  try {
    const tokens = tokenize(inputEl.value);
    tokensEl.textContent = JSON.stringify(tokens, null, 2);

    const ast = parse(tokens);
    astEl.textContent = JSON.stringify(ast, null, 2);

    const steps = [];
    const result = evaluate(ast, steps);

    steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      stepsEl.appendChild(li);
    });

    resultEl.textContent = result;
  } catch (err) {
    errorEl.textContent = err.message;
    tokensEl.textContent = "";
    astEl.textContent = "";
    resultEl.textContent = "—";
  }
};