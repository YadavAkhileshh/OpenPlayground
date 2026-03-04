const preview = document.getElementById("preview");
const consoleBox = document.getElementById("console");

function runCode() {
  const html = document.getElementById("htmlCode").value;
  const css = document.getElementById("cssCode").value;
  const js = document.getElementById("jsCode").value;

  const output = `
    <html>
    <style>${css}</style>
    <body>
      ${html}
      <script>
        const log = console.log;
        console.log = function(msg){
          parent.addConsole(msg);
          log(msg);
        }
        try {
          ${js}
        } catch(e){
          parent.addConsole("Error: " + e.message);
        }
      <\/script>
    </body>
    </html>
  `;

  preview.srcdoc = output;
  addConsole("Code executed...");
}

function addConsole(message) {
  const line = document.createElement("div");
  line.textContent = "> " + message;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function clearConsole() {
  consoleBox.innerHTML = "";
}

function copyCode(id) {
  const text = document.getElementById(id);
  text.select();
  document.execCommand("copy");
  addConsole(id + " copied!");
}