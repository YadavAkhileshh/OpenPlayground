function generatePRD() {
  const productName = document.getElementById("productName").value;
  const problem = document.getElementById("problem").value;
  const solution = document.getElementById("solution").value;
  const users = document.getElementById("users").value;
  const features = document.getElementById("features").value.split(",");
  const success = document.getElementById("success").value;

  if (!productName || !problem || !solution) {
    alert("Please fill required fields");
    return;
  }

  const output = `
    <h2>${productName}</h2>

    <h3>Problem Statement</h3>
    <p>${problem}</p>

    <h3>Proposed Solution</h3>
    <p>${solution}</p>

    <h3>Target Users</h3>
    <p>${users}</p>

    <h3>Key Features</h3>
    <ul>
      ${features.map(f => `<li>${f.trim()}</li>`).join("")}
    </ul>

    <h3>Success Metrics</h3>
    <p>${success}</p>
  `;

  document.getElementById("prdOutput").innerHTML = output;
}
