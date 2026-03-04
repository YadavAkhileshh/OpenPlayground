const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");
const codeEditor = document.getElementById("codeEditor");
const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");

runBtn.addEventListener("click", () => {
  try {
    const userCode = codeEditor.value;

    // Dynamically create function
    const runner = new Function(userCode + "; return run;");
    const run = runner();

    const result = run(inputBox.value);

    outputBox.value = result;
  } catch (err) {
    outputBox.value = "Error: " + err.message;
  }
});

clearBtn.addEventListener("click", () => {
  outputBox.value = "";
});